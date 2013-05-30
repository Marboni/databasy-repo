from databasyrepo.models.core.actions import Set, Executor, Register, AppendItem
from databasyrepo.models.core.elements import Table
from databasyrepo.models.core.errors import IllegalCommand
from databasyrepo.models.core.reprs import Canvas, TableRepr
from databasyrepo.models.core.serializing import Serializable
from databasyrepo.models.core.validators import NodeClass, CorrectVersion, UniqueID
from databasyrepo.utils.validators import InvalidStateError, Always, Length, Iterable, NotEqual

__author__ = 'Marboni'

class Command(Serializable):
    def fields(self):
        return {
            'source_version': long
        }

    def validate_predicates(self, model):
        if self.__class__ not in model.commands():
            raise IllegalCommand('Command %s can not be executed on model %s.' % (self.code(), model.code()))

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
            raise IllegalCommand('Client model version %s not equals to server model version %s.' % (client_version, server_version))


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
        table = Table()
        table.set('name', self.val('name'))
        executor.execute(Register(node=table))
        executor.execute(AppendItem(field='tables', item=table))

        CreateTableRepr(canvas_id=self.val('canvas_id'), table_id=table.id, position=self.val('position')).do(executor)


class CreateTableRepr(Command):
    """ Is not used separately, only as part of CreateTable command.
    """
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

    def do(self, executor):
        table = executor.model.node(self['table_id'], Table)
        canvas = executor.model.node(self['canvas_id'], Canvas)

        table_repr = TableRepr(self.val('table_repr_id'))
        table_repr.set('table', table.ref())
        table_repr.set('position', self.val('position'))
        executor.execute(Register(node=table_repr))
        executor.execute(AppendItem(node_id=canvas.id, field='reprs', item=table_repr))


class MoveTableRepr(Command):
    def fields(self):
        fields = super(MoveTableRepr, self).fields()
        fields.update({
            'table_repr_id': basestring,
            'new_position': [int]
        })
        return fields

    def validators(self, model):
        validators = super(MoveTableRepr, self).validators(model)
        validators.update({
            'table_repr_id': Always(NodeClass(model, TableRepr)),
            'new_position': Always(Iterable(2, 2)),
            })
        return validators

    def do(self, executor):
        executor.execute(Set(self['table_repr_id'], 'position', self['new_position']))