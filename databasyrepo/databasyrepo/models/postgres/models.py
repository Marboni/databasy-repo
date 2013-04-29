from databasyrepo.models.core.models import Model

__author__ = 'Marboni'

class PostgresModel(Model):
    class Meta:
        creatable = True