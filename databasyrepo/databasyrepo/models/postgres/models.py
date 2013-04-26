from databasyrepo.models.core.models import Model

__author__ = 'Marboni'

class PostgresModel(Model):
    class Meta:
        creatable = True

    def dbms_type(self):
        return 'PostgreSQL'

    def dbms_version(self):
        return '9.x'


