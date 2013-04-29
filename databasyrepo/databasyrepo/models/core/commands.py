from databasyrepo.models.core.actions import Set, Executor, Register, AppendItem
from databasyrepo.models.core.elements import Table
from databasyrepo.models.core.errors import IllegalCommand
from databasyrepo.models.core.reprs import Canvas, TableRepr
from databasyrepo.models.core.serializing import Serializable
from databasyrepo.models.core.validators import NodeClass, CorrectVersion
from databasyrepo.utils.validators import InvalidStateError, Always, Length, Iterable

__author__ = 'Marboni'

class Command(Serializable):
    def fields(self):
        return {
            'source_version': int
        }

    def validate_predicates(self, model):
        if self.__class__ not in model.commands():
            raise IllegalCommand('Command %s can not be executed on model %s.' % (self.code(), model.serial_code()))

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