import threading
from databasyrepo.mg import mg
from databasyrepo.models.core import serializing
from databasyrepo.models.core.errors import ModelNotFound
from databasyrepo.models.core.models import Model
from databasyrepo.models.register import register
from databasyrepo.utils.commons import ExpireCounter, current_time_ms

__author__ = 'Marboni'

class ModelManager(object):
    # How long user will be considered as active after his last ping.
    USER_ACTIVITY_TIME = 5

    def __init__(self):
        super(ModelManager, self).__init__()
        self._touch_time = None
        self._active_users = ExpireCounter(self.USER_ACTIVITY_TIME)
        self._lock = threading.Lock()

    def _check_model(self):
        if not self._model:
            raise ValueError('Manager has no model.')

    def _touch(self, user_id):
        self._touch_time = current_time_ms()
        self._active_users.add(user_id)

    def create(self, type, model_id, user_id):
        with self._lock:
            model_class = register.get(type, Model)
            self._model = model_class.create(model_id, user_id)
            self._touch(user_id)

    @staticmethod
    def retrieve_model(model_id, parent_model_uid=None):
        serialized_model = mg().models.find_one({'model_id': model_id, 'parent_model_uid': parent_model_uid})
        if not serialized_model:
            raise ModelNotFound(model_id)
        return serializing.deserialize(serialized_model)

    def load(self, model_id, user_id, parent_model_uid=None):
        with self._lock:
            self._model = self.retrieve_model(model_id, parent_model_uid)
            self._touch(user_id)

    def active_users(self, user_id):
        self._touch(user_id)
        return set(self._active_users.events)

    def diff(self, version, user_id):
        with self._lock:
            self._check_model()
            diff = self._model.diff(version)
            self._touch(user_id)
            return diff

    def execute_command(self, command, user_id):
        with self._lock:
            self._check_model()
            actions = self._model.execute_command(command, user_id)
            self._touch(user_id)
            return actions

    def expired(self, ttl):
        """ Returns whether this manager is expired based on TTL specified in seconds.
        """
        with self._lock:
            self._check_model()
            return self._touch_time < (current_time_ms() - ttl * 1000)