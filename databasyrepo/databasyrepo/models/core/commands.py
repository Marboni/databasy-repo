from databasyrepo.models.core.actions import Set, Executor, Register, AppendItem, Unregister, FindAndDeleteItem
from databasyrepo.models.core.elements import Column, Table
from databasyrepo.models.core.errors import IllegalCommand, Conflict
from databasyrepo.models.core.serializing import Serializable
from databasyrepo.models.core.validators import NodeClass, CorrectVersion
from databasyrepo.models.core.reprs import Canvas, TableRepr
from databasyrepo.utils.validators import InvalidStateError, Always, Length, Iterable

__author__ = 'Marboni'

class Command(Serializable):
    def fields(self):
        return {
            'source_version': int
        }

    def validate_predicates(self, model):
        if self.__class__ not in model.commands():
            raise IllegalCommand('Command %s can not be executed on model %s.' % (self.serial_code(), model.serial_code()))

    def validators(self, model):
        return {
            'source_version': Always(CorrectVersion(model))
        }

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

    def require_checks(self):
        return True

    def _check(self, executor):
        checkers = executor.model.checkers()
        for checker in checkers:
            checker(executor).modify_errors()

    def execute(self, model):
        self.validate_predicates(model)
        self._validate(model)
        executor = Executor(model)
        self.do(executor)
        if self.require_checks():
            self._check(executor)
        return executor.events

    def do(self, executor):
        raise NotImplementedError


class HistoryCommand(Command):
    def require_checks(self):
        return False

    def validate_predicates(self, model):
        super(HistoryCommand, self).validate_predicates(model)
        client_version = self['source_version']
        server_version = model.version
        if client_version != server_version:
            raise Conflict(
                'Client model version %s not equals to server model version %s.' % (client_version, server_version))


class Undo(HistoryCommand):
    def validate_predicates(self, model):
        super(Undo, self).validate_predicates(model)
        if not model.revision_stack.can_undo():
            raise IllegalCommand('Nothing to undo.')

    def do(self, executor):
        actions = executor.model.revision_stack.undo()
        for action in actions:
            executor.execute(action)


class Redo(HistoryCommand):
    def validate_predicates(self, model):
        super(Redo, self).validate_predicates(model)
        if not model.revision_stack.can_redo():
            raise IllegalCommand('Nothing to redo.')

    def do(self, executor):
        actions = executor.model.revision_stack.redo()
        for action in actions:
            executor.execute(action)


class CreateTable(Command):
    def fields(self):
        fields = super(CreateTable, self).fields()
        fields.update({
            'name': basestring,
            'canvas_id': basestring,
            'position': [int]
        })
        return fields

    def validators(self, model):
        validators = super(CreateTable, self).validators(model)
        validators.update({
            'name': Always(Length(1, 512)),
            'canvas_id': Always(NodeClass(model, Canvas)),
            'position': Always(Iterable(2, 2))
        })
        return validators

    def do(self, executor):
        table = Table()
        executor.execute(Register(node=table))
        executor.execute(AppendItem(field='tables', item=table))
        executor.execute(Set(node_id=table.id, field='name', value=self['name']))

        CreateTableRepr(canvas_id=self['canvas_id'], table_id=table.id, position=self['position']).do(executor)


class RenameTable(Command):
    def fields(self):
        fields = super(RenameTable, self).fields()
        fields.update({
            'table_id': basestring,
            'name': basestring,
        })
        return fields

    def validate_predicates(self, model):
        super(RenameTable, self).validate_predicates(model)
        model.check_conflicts(self['source_version'], self['table_id'], 'name')

    def validators(self, model):
        validators = super(RenameTable, self).validators(model)
        validators.update({
            'table_id': Always(NodeClass(model, Table)),
            'name': Always(Length(1, 128)),
        })
        return validators

    def do(self, executor):
        executor.execute(Set(node_id=self['table_id'], field='name', value=self.val('name')))


class DeleteTable(Command):
    def fields(self):
        fields = super(DeleteTable, self).fields()
        fields.update({
            'table_id': basestring,
        })
        return fields

    def validate_predicates(self, model):
        super(DeleteTable, self).validate_predicates(model)
        model.check_conflicts(self['source_version'], self['table_id'])

    def validators(self, model):
        validators = super(DeleteTable, self).validators(model)
        validators.update({
            'table_id': Always(NodeClass(model, Table)),
        })
        return validators

    def do(self, executor):
        model = executor.model
        table = model.node(self['table_id'], Table)
        for canvas in model.val_as_node('canvases', model):
            for view in canvas.val_as_node('reprs', model)[:]:
                if isinstance(view, TableRepr) and view.val('table').ref_id == table.id:
                    DeleteTableRepr(canvas_id=canvas.id, table_repr_id=view.id).do(executor)

        for column_ref in table['columns'][:]:
            delete_column_cmd = DeleteColumn(source_version=self['source_version'], column_id=column_ref.ref_id)
            delete_column_cmd.do(executor)
        executor.execute(FindAndDeleteItem(field='tables', item=table))
        executor.execute(Unregister(node_id=self['table_id']))


class CreateColumn(Command):
    def fields(self):
        fields = super(CreateColumn, self).fields()
        fields.update({
            'table_id': basestring,
            'name': basestring,
            'datatype': basestring,
            'nullable': bool,
        })
        return fields

    def validators(self, model):
        validators = super(CreateColumn, self).validators(model)
        validators.update({
            'table_id': Always(NodeClass(model, Table)),
            'name': Always(Length(1, 128)),
        })
        return validators

    def do(self, executor):
        column = Column()
        executor.execute(Register(node=column))
        table = executor.model.node(self.val('table_id'), Table)
        executor.execute(AppendItem(node_id=table.id, field='columns', item=column))

        executor.execute(Set(node_id=column.id, field='name', value=self.val('name')))
        executor.execute(Set(node_id=column.id, field='table', value=table))


class DeleteColumn(Command):
    def fields(self):
        fields = super(DeleteColumn, self).fields()
        fields.update({
            'column_id': basestring,
            })
        return fields

    def validate_predicates(self, model):
        super(DeleteColumn, self).validate_predicates(model)
        model.check_conflicts(self['source_version'], self['column_id'])

    def validators(self, model):
        validators = super(DeleteColumn, self).validators(model)
        validators.update({
            'column_id': Always(NodeClass(model, Column)),
            })
        return validators

    def do(self, executor):
        column = executor.model.node(self.val('column_id'), Column)

        table_id = column.val('table').ref_id
        executor.execute(FindAndDeleteItem(node_id=table_id, field='columns', item=column))
        executor.execute(Unregister(node_id=self['column_id']))



########## REPRS ##########

class CreateTableRepr(Command):
    def fields(self):
        fields = super(CreateTableRepr, self).fields()
        fields.update({
            'canvas_id': basestring,
            'table_id': basestring,
            'position': [int]
        })
        return fields

    def validators(self, model):
        validators = super(CreateTableRepr, self).validators(model)
        validators.update({
            'canvas_id': Always(NodeClass(model, Canvas)),
            'table_id': Always(NodeClass(model, Table)),
            'position': Always(Iterable(2, 2))
        })
        return validators

    def do(self, executor):
        table = executor.model.node(self['table_id'], Table)
        canvas = executor.model.node(self['canvas_id'], Canvas)

        table_repr = TableRepr()
        executor.execute(Register(node=table_repr))
        executor.execute(AppendItem(node_id=canvas.id, field='reprs', item=table_repr))
        executor.execute(Set(node_id=table_repr.id, field='table', value=table))
        executor.execute(Set(node_id=table_repr.id, field='position', value=self.val('position')))

class MoveTableRepr(Command):
    def fields(self):
        fields = super(MoveTableRepr, self).fields()
        fields.update({
            'table_repr_id': basestring,
            'new_position': [int]
            })
        return fields

    def validate_predicates(self, model):
        super(MoveTableRepr, self).validate_predicates(model)
        model.check_conflicts(self['source_version'], self['table_repr_id'])

    def validators(self, model):
        validators = super(MoveTableRepr, self).validators(model)
        validators.update({
            'table_repr_id': Always(NodeClass(model, TableRepr)),
            'new_position': Always(Iterable(2, 2)),
            })
        return validators

    def do(self, executor):
        executor.execute(Set(self['table_repr_id'], 'position', self['new_position']))

class DeleteTableRepr(Command):
    def fields(self):
        fields = super(DeleteTableRepr, self).fields()
        fields.update({
            'canvas_id': basestring,
            'table_repr_id': basestring,
        })
        return fields

    def validators(self, model):
        validators = super(DeleteTableRepr, self).validators(model)
        validators.update({
            'canvas_id': Always(NodeClass(model, Canvas)),
            'table_repr_id': Always(NodeClass(model, TableRepr)),
        })
        return validators

    def do(self, executor):
        table_repr = executor.model.node(self['table_repr_id'], TableRepr)
        executor.execute(FindAndDeleteItem(node_id=self['canvas_id'], field='reprs', item=table_repr))
        executor.execute(Unregister(node_id=self['table_repr_id']))
