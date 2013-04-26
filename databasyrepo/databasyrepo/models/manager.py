import threading
from databasyrepo.mg import mg
from databasyrepo.models.core import serializing
from databasyrepo.models.core.errors import ModelNotFound
from databasyrepo.models.core.models import Model
from databasyrepo.models.register import register

__author__ = 'Marboni'

class ModelManager(object):
    def __init__(self):
        super(ModelManager, self).__init__()
        self._lock = threading.Lock()
        self._active_users = []

    def _check_model(self):
        if not self._model:
            raise ValueError('Manager has no model.')

    def create(self, model_id, user_id):
        with self._lock:
            serial = self.serial_by_id(model_id)
            # TODO Handle case when model not found.
            model_class = register.get(serial, Model)
            conn = mg()
            self._model = model_class.create(model_id, user_id, conn)

    @staticmethod
    def serial_by_id(model_id):
        # TODO Should take it from some source.
        from databasyrepo.models.postgres.models import PostgresModel
        return PostgresModel.code()

    @staticmethod
    def retrieve_model(model_id, conn):
        serialized_model = conn.models.find_one({'model_id': model_id})
        if not serialized_model:
            raise ModelNotFound(model_id)
        model = serializing.deserialize(serialized_model)
        return model

    def load(self, model_id):
        with self._lock:
            conn = mg()
            self._model = self.retrieve_model(model_id, conn)

    def register_user(self, uid):
        with self._lock:
            self._active_users.append(uid)

    def unregister_user(self, uid):
        with self._lock:
            self._active_users.remove(uid)

    def in_use(self):
        with self._lock:
            return bool(self._active_users)

    def execute_command(self, command, user_id):
        with self._lock:
            self._check_model()
            actions = self._model.execute_command(command, user_id)
            return actions

    def serialize(self):
        with self._lock:
            return self._model.serialize_for_client()