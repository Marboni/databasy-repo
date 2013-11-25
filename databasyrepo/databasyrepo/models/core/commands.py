from databasyrepo.models.core.actions import Set, Executor, Register, AppendItem, Unregister, FindAndDeleteItem, DeleteItem, InsertItem
from databasyrepo.models.core.elements import Table, Column
from databasyrepo.models.core.errors import IllegalCommand
from databasyrepo.models.core.reprs import Canvas, TableRepr
from databasyrepo.models.core.serializing import Serializable
from databasyrepo.models.core.validators import NodeClass, CorrectVersion, UniqueID, IfInFields
from databasyrepo.utils.validators import InvalidStateError, Always, Length, Iterable, NotEqual, Integer, Boolean

__author__ = 'Marboni'

class Command(Serializable):
    def fields(self):
        return {
            'source_version': long
        }

    def pre_validation(self, model):
        if self.__class__ not in model.commands():
            raise IllegalCommand('Command %s can not be executed on model %s.' % (self.code(), model.code()))

    def validators(self, model):
        return {
            'source_version': Always(CorrectVersion(model))
        }

    def post_validation(self, model):
        """ Custom validation logic. Starts after all validators done. Should raise IllegalCommand in case of error.
        """
        pass

    def _validate(self, model):
        for field, field_validator in self.validators(model).iteritems():
            try:
                getattr(field_validator, '__top__')
            except AttributeError:
                raise ValueError('Validator is not top-level.')
            try:
                field_validator(field, self)
            except InvalidStateError, e:
                raise IllegalCommand('Field "%s" is incorrect: %s' % (field, e.message))

        self.post_validation(model)

    def require_checks(self):
        return True

    def _check(self, executor):
        checkers = executor.model.checkers()
        for checker in checkers:
            checker(executor).modify_errors()

    def execute(self, model):
        self.pre_validation(model)
        self._validate(model)
        executor = Executor(model)
        self.do(executor)
        if self.require_checks():
            self._check(executor)
        return executor.events

    def do(self, executor):
        raise NotImplementedError


class UpdateCommand(Command):
    def __init__(self, **kwargs):
        super(UpdateCommand, self).__init__(**kwargs)

    def obj_type(self):
        """ Returns type of changeable object.
        """
        raise NotImplemented

    def obj_id_field(self):
        """ Returns name of command's field that stores object ID.
        """
        raise NotImplemented

    def obj_changeable_fields_and_validators(self):
        """ Returns dict of changeable fields and validators.
        """
        raise NotImplemented

    def fields(self):
        fields = super(UpdateCommand, self).fields()
        fields.update({
            self.obj_id_field(): basestring,
            'fields': [basestring]
        })

        obj_proto = self.obj_type()()
        changeable_fields = self.obj_changeable_fields_and_validators().keys()
        fields_and_types = {
        field: type for field, type in obj_proto.fields().items() if field in changeable_fields
        }
        fields.update(fields_and_types)
        return fields

    def validators(self, model):
        validators = super(UpdateCommand, self).validators(model)
        changeable_fields = self.obj_changeable_fields_and_validators().keys()
        validators.update({
            self.obj_id_field(): Always(NodeClass(model, self.obj_type())),
            'fields': Always(Iterable(min_length=1, allowed_values=changeable_fields)),
            })
        for field, field_validators in self.obj_changeable_fields_and_validators().items():
            validators[field] = IfInFields(*field_validators)
        return validators

    def do(self, executor):
        changeable_fields = self.val('fields')
        for changeable_field in changeable_fields:
            executor.execute(Set(self.val(self.obj_id_field()), changeable_field, self.val(changeable_field)))


class HistoryCommand(Command):
    def require_checks(self):
        return False

    def pre_validation(self, model):
        super(HistoryCommand, self).pre_validation(model)
        client_version = self.val('source_version')
        server_version = model.version
        if client_version != server_version:
            raise IllegalCommand(
                'Client model version %s not equals to server model version %s.' % (client_version, server_version))


class Undo(HistoryCommand):
    def pre_validation(self, model):
        super(Undo, self).pre_validation(model)
        if not model.revision_stack.can_undo():
            raise IllegalCommand('Nothing to undo.')

    def do(self, executor):
        actions = executor.model.revision_stack.undo()
        for action in actions:
            executor.execute(action)


class Redo(HistoryCommand):
    def pre_validation(self, model):
        super(Redo, self).pre_validation(model)
        if not model.revision_stack.can_redo():
            raise IllegalCommand('Nothing to redo.')

    def do(self, executor):
        actions = executor.model.revision_stack.redo()
        for action in actions:
            executor.execute(action)

# =================== TABLE ===================

class CreateTable(Command):
    def fields(self):
        fields = super(CreateTable, self).fields()
        fields.update({
            'table_id': basestring,
            'default_table_repr_id': basestring,
            'name': basestring,
            'canvas_id': basestring,
            'position': [int]
        })
        return fields

    def validators(self, model):
        validators = super(CreateTable, self).validators(model)
        validators.update({
            'table_id': Always(UniqueID(model), NotEqual('default_table_repr_id')),
            'default_table_repr_id': Always(UniqueID(model), NotEqual('table_id')),
            'name': Always(Length(1, 512)),
            'canvas_id': Always(NodeClass(model, Canvas)),
            'position': Always(Iterable(2, 2))
        })
        return validators

    def do(self, executor):
        table = Table(self.val('table_id'))
        table.set('name', self.val('name'))
        executor.execute(Register(node=table))
        executor.execute(AppendItem(field='tables', item=table))

        CreateTableRepr(
            canvas_id=self.val('canvas_id'),
            table_id=table.id,
            table_repr_id=self.val('default_table_repr_id'),
            position=self.val('position')
        ).do(executor)


class RenameTable(Command):
    def fields(self):
        fields = super(RenameTable, self).fields()
        fields.update({
            'table_id': basestring,
            'new_name': basestring
        })
        return fields

    def validators(self, model):
        validators = super(RenameTable, self).validators(model)
        validators.update({
            'table_id': Always(NodeClass(model, Table)),
            'new_name': Always(Length(1, 512))
        })
        return validators

    def do(self, executor):
        executor.execute(Set(self.val('table_id'), 'name', self.val('new_name')))


class DeleteTable(Command):
    def fields(self):
        fields = super(DeleteTable, self).fields()
        fields.update({
            'table_id': basestring,
        })
        return fields

    def validators(self, model):
        validators = super(DeleteTable, self).validators(model)
        validators.update({
            'table_id': Always(NodeClass(model, Table)),
        })
        return validators

    def do(self, executor):
        table_id = self.val('table_id')
        table = executor.model.node(table_id)

        for canvas in executor.model.val_as_node('canvases', executor.model):
            for repr in canvas.val_as_node('reprs', executor.model):
                if repr.val('table').ref_id == table_id:
                    DeleteTableRepr(
                        table_repr_id=repr.id
                    ).do(executor)
                    break

        executor.execute(FindAndDeleteItem(None, 'tables', table))
        executor.execute(Unregister(table_id))


class CreateColumn(Command):
    def fields(self):
        fields = super(CreateColumn, self).fields()
        fields.update({
            'table_id': basestring,
            'column_id': basestring,
            'name': basestring,
            'type': basestring,
            'index': int
        })
        return fields

    def validators(self, model):
        validators = super(CreateColumn, self).validators(model)
        validators.update({
            'table_id': Always(NodeClass(model, Table)),
            'column_id': Always(UniqueID(model)),
            'name': Always(Length(1, 512)),
            'type': Always(Length(1, 512)),
            'index': Always(Integer(min_value=0, max_value=model.node(self.val('table_id')).items_count('columns')))
        })
        return validators

    def do(self, executor):
        table_id = self.val('table_id')
        table = executor.model.node(table_id)

        column = Column(self.val('column_id'))
        column.set('name', self.val('name'))
        column.set('type', self.val('type'))
        column.set('table', table.ref())

        executor.execute(Register(node=column))
        executor.execute(InsertItem(node_id=table_id, field='columns', index=self.val('index'), item=column))


class UpdateColumn(UpdateCommand):
    def obj_type(self):
        return Column

    def obj_id_field(self):
        return 'column_id'

    def obj_changeable_fields_and_validators(self):
        return {
            'name': [Length(1, 512)],
            'type': [Length(1, 512)],
            'null': [Boolean()],
            'default': [],
            }


class DeleteColumn(Command):
    def fields(self):
        fields = super(DeleteColumn, self).fields()
        fields.update({
            'column_id': basestring,
        })
        return fields

    def validators(self, model):
        validators = super(DeleteColumn, self).validators(model)
        validators.update({
            'column_id': Always(NodeClass(model, Column)),
        })
        return validators

    def do(self, executor):
        column_id = self.val('column_id')
        column = executor.model.node(column_id)

        executor.execute(FindAndDeleteItem(node_id=column.val('table').ref_id, field='columns', item=column))
        executor.execute(Unregister(node_id=column_id))


# =================== TABLE REPR ===================

class CreateTableRepr(Command):
    def fields(self):
        fields = super(CreateTableRepr, self).fields()
        fields.update({
            'table_repr_id': basestring,
            'canvas_id': basestring,
            'table_id': basestring,
            'position': [int]
        })
        return fields

    def validators(self, model):
        validators = super(CreateTableRepr, self).validators(model)
        validators.update({
            'table_repr_id': Always(UniqueID(model)),
            'canvas_id': Always(NodeClass(model, Canvas)),
            'table_id': Always(NodeClass(model, Table)),
            'position': Always(Iterable(2, 2))
        })
        return validators

    def post_validation(self, model):
        super(CreateTableRepr, self).post_validation(model)
        canvas = model.node(self.val('canvas_id'))
        for repr in canvas.val_as_node('reprs', model):
            if repr.val('table').ref_id == self.val('table_id'):
                raise IllegalCommand('Canvas %s already has representation of table %s.' %
                                     (self.val('canvas_id'), self.val('table_id')))

    def do(self, executor):
        table = executor.model.node(self.val('table_id'), Table)
        canvas = executor.model.node(self.val('canvas_id'), Canvas)

        table_repr = TableRepr(self.val('table_repr_id'))
        table_repr.set('table', table.ref())
        table_repr.set('position', self.val('position'))
        table_repr.set('width', TableRepr.DEFAULT_REPR_WIDTH)
        executor.execute(Register(table_repr))
        executor.execute(AppendItem(canvas.id, 'reprs', table_repr))


class UpdateTableRepr(UpdateCommand):
    def obj_type(self):
        return TableRepr

    def obj_id_field(self):
        return 'table_repr_id'

    def obj_changeable_fields_and_validators(self):
        return {
            'position': [Iterable(2, 2)],
            'width': [Integer(TableRepr.MIN_REPR_WIDTH)],
        }

class DeleteTableRepr(Command):
    def fields(self):
        fields = super(DeleteTableRepr, self).fields()
        fields.update({
            'table_repr_id': basestring
        })
        return fields

    def validators(self, model):
        validators = super(DeleteTableRepr, self).validators(model)
        validators.update({
            'table_repr_id': Always(NodeClass(model, TableRepr)),
        })
        return validators

    def do(self, executor):
        table_repr_id = self.val('table_repr_id')

        for canvas in executor.model.val_as_node('canvases', executor.model):
            for repr_index, repr_ref in enumerate(canvas.val('reprs')):
                if repr_ref.ref_id == table_repr_id:
                    executor.execute(DeleteItem(canvas.id, 'reprs', repr_index))
                    executor.execute(Unregister(table_repr_id))
                    return

        raise ValueError('Table repr with ID %s was not removed.' % table_repr_id)
