from databasyrepo.models.core.actions import Set
from databasyrepo.models.core.commands import Command
from databasyrepo.utils.validators import Always, Length

__author__ = 'Marboni'

class ChangeFirstName(Command):
    SERIAL_CODE = 'commands.test.ChangeFirstName'

    def fields(self):
        fields = super(ChangeFirstName, self).fields()
        fields.update({
            'first_name': basestring,
        })
        return fields

    def validate_predicates(self, model):
        super(ChangeFirstName, self).validate_predicates(model)
        model.check_conflicts(self['source_version'], None, 'first_name')

    def validators(self, model):
        validators = super(ChangeFirstName, self).validators(model)
        validators.update({
            'first_name': Always(Length(1, 10)),
        })
        return validators

    def do(self, executor):
        executor.execute(Set(field='first_name', value=self.val('first_name')))


class ChangeLastName(Command):
    SERIAL_CODE = 'commands.test.ChangeLastName'

    def fields(self):
        fields = super(ChangeLastName, self).fields()
        fields.update({
            'last_name': basestring,
            })
        return fields

    def validate_predicates(self, model):
        super(ChangeLastName, self).validate_predicates(model)
        model.check_conflicts(self['source_version'], None, 'last_name')

    def validators(self, model):
        validators = super(ChangeLastName, self).validators(model)
        validators.update({
            'last_name': Always(Length(1, 10)),
            })
        return validators

    def do(self, executor):
        executor.execute(Set(field='last_name', value=self.val('last_name')))

