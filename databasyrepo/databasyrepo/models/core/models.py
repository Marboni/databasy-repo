from flask import current_app
from databasyrepo.config import config_by_mode
from databasyrepo.mg import mg
from databasyrepo.mg.engine import connect
from databasyrepo.models.core.commands import *
from databasyrepo.models.core.datatypes import DataType
from databasyrepo.models.core.elements import Table
from databasyrepo.models.core.errors import IllegalClientModelVersion, Conflict
from databasyrepo.models.core.events import Event
from databasyrepo.models.core.nodes import Node
from databasyrepo.models.core.serializing import Serializable
from databasyrepo.models.core.checkers import Error, UniqueTableNameChecker
from databasyrepo.models.core.reprs import Canvas
from databasyrepo.utils import commons

__author__ = 'Marboni'

class Model(Node):
    class Meta:
        # Possibility to create this model on Production.
        creatable = False

    STATIC = {
        'dbms_type': 'Default',
        'dbms_version': 'default'
    }

    def __init__(self, id=None):
        super(Model, self).__init__(id)
        self._nodes_register = {}

    def fields(self):
        fields = super(Model, self).fields()
        fields.update({
            'model_id': long,

            'dbms_type': basestring,
            'dbms_version': basestring,

            'parent_model_id': basestring,
            'parent_version': int,

            'creation_time': long,
            'creator_uid': long,
            'modification_time': long,
            'modifier_uid': long,

            'nodes': [Node],
            'canvases': [Canvas],
            'tables': [Table],
            'errors': [Error],
            'datatypes': [DataType],

            'revision_stack': RevisionStack,
        })
        return fields

    def server_only_fields(self):
        return [
            'creation_time',
            'creator_uid',
            'modification_time',
            'modifier_uid',
            'revision_stack'
        ]

    def checkers(self):
        return [
            UniqueTableNameChecker
        ]

    def datatype_handlers(self):
        return []

    def commands(self):
        return [
            Undo,
            Redo,

            CreateTable,
            RenameTable,
            DeleteTable,

            CreateColumn,
            DeleteColumn,

            CreateTableRepr,
            MoveTableRepr,
            DeleteTableRepr,
        ]

    @staticmethod
    def model_codes():
        """ Returns all model types.
        """
        from databasyrepo.models.register import register
        return [model_class.serial_code() for model_class in register.get_by_type(Model) if model_class.Meta.creatable]

    @staticmethod
    def model_codes_info():
        """ Returns iterable of all available models types and relevant DBMS types/versions as tuples:
        (model_type, dbms_type, dbms_version).
        """
        from databasyrepo.models.register import register
        for model_class in register.get_by_type(Model):
            if model_class.Meta.creatable:
                model_code = model_class.serial_code()
                static_fields = model_class.STATIC
                yield model_code, static_fields['dbms_type'], static_fields['dbms_version']

    @classmethod
    def create(cls, model_id, user_id):
        model = cls()

        model.set('model_id', model_id)
        current_time = commons.current_time_ms()
        model.set('creation_time', current_time)
        model.set('modification_time', current_time)
        model.set('creator_uid', user_id)
        model.set('modifier_uid', user_id)

        canvas = Canvas()
        canvas.set('name', 'Default')
        model.register(canvas)
        model.append_item('canvases', canvas.ref())

        for datatype_handler in model.datatype_handlers():
            datatype = datatype_handler.create()
            model.register(datatype)
            model.append_item('datatypes', datatype.ref())

        model.set('revision_stack', RevisionStack())

        model._save()
        return model

    def set_nodes(self, nodes_list):
        for node in nodes_list:
            self.register(node)

    def _add_node(self, node):
        if self._nodes_register.has_key(node.id):
            raise ValueError('Node with ID "%s" already exists.' % node.id)
        self._nodes_register[node.id] = node
        self.val('nodes').append(node)

    def _remove_node(self, id):
        if not self._nodes_register.has_key(id):
            raise ValueError('Node with ID "%s" not exists.' % id)
        node = self._nodes_register.pop(id)
        self.val('nodes').remove(node)
        return node

    def register(self, node):
        self._add_node(node)

    def unregister(self, uid):
        return self._remove_node(uid)

    def execute_command(self, command, user_id):
        events = command.execute(self)

        self.set('modification_time', commons.current_time_ms())
        self.set('modifier_uid', user_id)

        regular = not isinstance(command, Undo) and not isinstance(command, Redo)
        self.val('revision_stack').add(user_id, events, regular)
        self._save()

        return [event.do_action() for event in events]

    NO_DIFF = 'NO_DIFF'
    DIFF = 'DIFF'
    RELOAD = 'RELOAD'

    def diff(self, from_version):
        if from_version == self.version:
            return self.version, self.NO_DIFF, None
        elif from_version < self.version:
            actions = self['revision_stack'].diff(from_version)
            if actions:
                return self.version, self.DIFF, actions
            else:
                return self.version, self.RELOAD, self.serialize_for_client()
        else:
            raise IllegalClientModelVersion()

    def check_conflicts(self, source_version, node_id=None, f_name=None):
        conflict_changes = self.revision_stack.changed_from(source_version, node_id, f_name)
        if conflict_changes is None:
            raise Conflict('Client version is outdated.')
        if conflict_changes:
            raise Conflict('Concurrent changed detected for field "%s" of node %s.' % (f_name, node_id))

    @property
    def revision_stack(self):
        return self.val('revision_stack')

    @property
    def version(self):
        return self.revision_stack.version

    def node(self, id, clazz=None):
        try:
            node = self._nodes_register[id]
            if clazz and not isinstance(node, clazz):
                raise ValueError('Node with ID "%s" is not an instance of class %s.' % (id, clazz))
            return node
        except KeyError:
            raise ValueError('Node with ID "%s" not registered in the model.' % id)

    def exists(self, id):
        return self._nodes_register.has_key(id)

    def _save(self):
        try:
            # Regular mode, application context exists.
            #noinspection PyStatementEffect
            current_app.config
            conn = mg()
        except RuntimeError:
            # Working outside of application context (manual model tests).
            config = config_by_mode('testing')
            conn = connect(config.MONGO_URI, config.MONGO_DATABASE_NAME)
        conn.models.save(self)

    def serialize_for_client(self):
        return dict((k, self[k]) for k in self.keys() if k not in self.server_only_fields())

class Revision(Serializable):
    SERIAL_CODE = 'etc.core.Revision'

    def fields(self):
        return {
            'source_version': int,
            'modifier_uid': long,
            'modification_time': long,
            'events': [Event]
        }


class RevisionStack(Serializable):
    SERIAL_CODE = 'etc.core.RevisionStack'

    # Number of actions that can be undone.
    MAX_UNDO_SIZE = 10
    # Number of last actions that can be used for "soft" model update (when user with outdated model gets diffs, not full model).
    MAX_REVISIONS_SIZE = 10

    def __init__(self):
        super(RevisionStack, self).__init__()
        self['version'] = 1
        self['revisions'] = []
        self['undoable'] = []
        self['redoable'] = []

        self.versions_and_revisions = {}

    def set(self, f_name, f_value):
        if f_name == 'revisions':
            for revision in reversed(f_value):
                self._add_revision(revision)
        else:
            super(RevisionStack, self).set(f_name, f_value)

    def fields(self):
        return {
            'version': int,
            'revisions': [Revision],
            'undoable': [int],
            'redoable': [int]
        }

    def add(self, user_id, events, regular=True):
        self._create_revision(events, user_id)
        if regular:
            self['undoable'].insert(0, self.version)
            del self['redoable'][:]
        self['version'] += 1
        self._control_size()

    def can_undo(self):
        return bool(self['undoable'])

    def undo(self):
        undoable = self['undoable']
        redoable = self['redoable']
        if not undoable:
            return None
        revision_version = undoable.pop(0)
        redoable.insert(0, revision_version)
        revision = self.versions_and_revisions[revision_version]
        return [event.undo_action() for event in reversed(revision['events'])]

    def can_redo(self):
        return bool(self['redoable'])

    def redo(self):
        undoable = self['undoable']
        redoable = self['redoable']
        if not redoable:
            return None
        revision_version = redoable.pop(0)
        undoable.insert(0, revision_version)
        revision = self.versions_and_revisions[revision_version]
        return [event.do_action() for event in revision['events']]

    def diff(self, from_version):
        try:
            actions = []
            for source_version in range(from_version, self.version):
                revision = self.versions_and_revisions[source_version]
                actions += [event.do_action() for event in revision['events']]
            return actions
        except KeyError:
            # Some of required versions not exists in stack.
            return None

    def changed_from(self, source_version, node_id=None, f_name=None):
        actions = self.diff(source_version)
        if actions is None:
            return None
        for action in actions:
            changed_node_id, changed_field = action.changes()
            if changed_node_id == node_id and (changed_field is None or (f_name and changed_field == f_name)):
                return True
        return False

    @property
    def version(self):
        return self['version']

    def _create_revision(self, events, user_id):
        revision = Revision()
        revision.set('source_version', self.version)
        revision.set('modifier_uid', user_id)
        revision.set('modification_time', commons.current_time_ms())
        revision.set('events', events)
        self._add_revision(revision)

    def _add_revision(self, revision):
        self['revisions'].insert(0, revision)
        self.versions_and_revisions[revision['source_version']] = revision

    def _control_size(self):
        undoable = self['undoable']
        redoable = self['redoable']

        if len(undoable) > self.MAX_UNDO_SIZE:
            undoable.pop()
            # Revisions list should contain only some number of last revisions and all revisions from undo/redo lists.

        for revision in self['revisions'][:]:
            source_version = revision['source_version']
            if self.version - source_version > self.MAX_REVISIONS_SIZE and not source_version in undoable and not source_version in redoable:
                del self.versions_and_revisions[source_version]
                self['revisions'].remove(revision)
