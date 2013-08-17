from databasyrepo.models.core.commands import Undo, Redo, CreateTable, MoveTableRepr, RenameTable, DeleteTableRepr, DeleteTable, CreateTableRepr
from databasyrepo.models.core.events import Event
from databasyrepo.models.core.nodes import Node
from databasyrepo.models.core.reprs import Canvas
from databasyrepo.models.core.serializing import Serializable
from databasyrepo.utils import commons
from databasyrepo.models.core.elements import Table

__author__ = 'Marboni'

def model_codes():
    """ Returns all model types.
    """
    from databasyrepo.models.register import register
    return [model_class.code() for model_class in register.by_type(Model) if model_class.Meta.creatable]

class Model(Node):
    class Meta:
        # Possibility to create this model on Production.
        creatable = False

    def __init__(self, id=None):
        super(Model, self).__init__(id)
        self._nodes_register = {}
        self._last_generated_id = None

    def fields(self):
        fields = super(Model, self).fields()
        fields.update(self.server_only_fields())
        fields.update({
            'model_id': long,
            'version': long,

            'nodes': [Node],
            'canvases': [Canvas],
            'tables': [Table],

            'revision_stack': RevisionStack
        })
        return fields

    def server_only_fields(self):
        return {
            'creation_time': long,
            'creator_uid': long,
            'modification_time': long,
            'modifier_uid': long,
        }

    def commands(self):
        return [
            Undo,
            Redo,

            CreateTable,
            RenameTable,
            DeleteTable,

            CreateTableRepr,
            MoveTableRepr,
            DeleteTableRepr,
            ]

    def checkers(self):
        return [

        ]

    def inject_connection(self, conn):
        self._conn = conn

    @property
    def version(self):
        return self.val('version')

    @property
    def revision_stack(self):
        return self.val('revision_stack')

    @classmethod
    def create(cls, model_id, user_id):
        model = cls()

        current_time = commons.current_time_ms()
        model.set('creation_time', current_time)
        model.set('modification_time', current_time)
        model.set('creator_uid', user_id)
        model.set('modifier_uid', user_id)

        model.set('model_id', model_id)
        # Pre-initializing version. Will be used to calculate unique IDs of the predefined objects.
        model.set('version', 0L)

        revision_stack = RevisionStack()
        revision_stack.inject_model(model)
        model.set('revision_stack', revision_stack)

        canvas = Canvas()
        canvas.set('name', 'Default')
        model.register(canvas)
        model.append_item('canvases', canvas.ref())

        model.set('version', 1L)

        return model

    def set_nodes(self, nodes_list):
        for node in nodes_list:
            self.register(node)

    def register(self, node):
        if self.id is None:
            raise ValueError('Node ID not specified.')
        if self._nodes_register.has_key(node.id):
            raise ValueError('Node with ID "%s" already exists.' % node.id)
        self._nodes_register[node.id] = node
        self.val('nodes').append(node)

    def unregister(self, uid):
        if not self._nodes_register.has_key(uid):
            raise ValueError('Node with ID "%s" not exists.' % uid)
        node = self._nodes_register.pop(uid)
        self.val('nodes').remove(node)
        return node

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

    def execute_command(self, command, user_id):
        events = command.execute(self)

        regular = not isinstance(command, Undo) and not isinstance(command, Redo)
        self.revision_stack.add(user_id, events, regular)
        self.save()

        return [event.do_action() for event in events]

    def serialize_for_client(self):
        return dict((k, self[k]) for k in self.keys() if k not in self.server_only_fields().keys())

    def save(self):
        self._conn.models.save(self)

    def delete(self):
        self._conn.models.remove({'model_id': self.val('model_id')})

    def deserialize(self, serialized_obj):
        super(Model, self).deserialize(serialized_obj)
        self.revision_stack.inject_model(self)


class Revision(Serializable):
    def fields(self):
        return {
            'source_version': long,
            'events': [Event]
        }


class RevisionStack(Serializable):
    # Number of actions that can be undone.
    MAX_UNDO_ITEMS = 20
    # Number of revisions that can be rolled back.
    MAX_HISTORY_ITEMS = 20

    def __init__(self):
        super(RevisionStack, self).__init__()
        self.versions_and_revisions = {}

    def fields(self):
        return {
            'revisions': [Revision],
            'undoable': [long],
            'redoable': [long]
        }

    def inject_model(self, model):
        self._model = model

    def set_revisions(self, value):
        for revision in reversed(value):
            self._add_revision(revision)

    def add(self, user_id, events, regular=True):
        revision = self._create_revision(events)
        self._add_revision(revision)

        if regular:
            self['undoable'].insert(0, revision.val('source_version'))
            del self['redoable'][:]
            self._control_size()

        self._model.set('version', self._model.version + 1)
        self._model.set('modification_time', commons.current_time_ms())
        self._model.set('modifier_uid', user_id)

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

    def _create_revision(self, events):
        revision = Revision()
        revision.set('source_version', self._model.version)
        revision.set('events', events)
        return revision

    def _add_revision(self, revision):
        self.val('revisions').insert(0, revision)
        self.versions_and_revisions[revision.val('source_version')] = revision

    def _remove_revision(self, revision):
        source_version = revision.val('source_version')
        del self.versions_and_revisions[source_version]
        self['revisions'].remove(revision)

    def _control_size(self):
        undoable = self['undoable']
        redoable = self['redoable']

        if len(undoable) > self.MAX_UNDO_ITEMS:
            undoable.pop()

        for revision in self.val('revisions')[:]:
            source_version = revision.val('source_version')
            if self._model.version - source_version > self.MAX_HISTORY_ITEMS\
               and not source_version in undoable and not source_version in redoable:
                self._remove_revision(revision)