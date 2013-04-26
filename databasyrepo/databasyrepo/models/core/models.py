from databasyrepo.models.core.nodes import Node
from databasyrepo.utils import commons

__author__ = 'Marboni'

class Model(Node):
    class Meta:
        # Possibility to create this model on Production.
        creatable = False

    def __init__(self, id=None):
        super(Model, self).__init__(id)
        self._nodes_register = {}

    def dbms_type(self):
        raise NotImplementedError

    def dbms_version(self):
        raise NotImplementedError

    def fields(self):
        fields = super(Model, self).fields()
        fields.update({
            'model_id': long,

            'creation_time': long,
            'creator_uid': long,
            'modification_time': long,
            'modifier_uid': long,
            })
        return fields

    def server_only_fields(self):
        return [
            'creation_time',
            'creator_uid',
            'modification_time',
            'modifier_uid'
        ]

    @classmethod
    def create(cls, model_id, user_id, conn):
        model = cls()

        model.set('model_id', model_id)
        current_time = commons.current_time_ms()
        model.set('creation_time', current_time)
        model.set('modification_time', current_time)
        model.set('creator_uid', user_id)
        model.set('modifier_uid', user_id)

        model._save(conn)
        return model

    def _save(self, conn):
        conn.models.save(self)

    def serialize_for_client(self):
        return dict((k, self[k]) for k in self.keys() if k not in self.server_only_fields())

