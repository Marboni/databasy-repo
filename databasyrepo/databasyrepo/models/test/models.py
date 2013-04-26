from databasyrepo.models.core.models import Model
from databasyrepo.models.test.commands import *

__author__ = 'Marboni'

TEST_DBMS = 'TestDB'

class TestModel(Model):
    class Meta:
        creatable = False

    STATIC = {
        'dbms_type': TEST_DBMS,
        'dbms_version': '9.x'
    }

    def fields(self):
        fields = super(TestModel, self).fields()
        fields.update({
            'first_name': basestring,
            'last_name': basestring
        })
        return fields

    def commands(self):
        return super(TestModel, self).commands() + [
            ChangeFirstName,
            ChangeLastName
        ]
















