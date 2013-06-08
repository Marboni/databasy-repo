import threading
from databasyrepo.mg import mg
from databasyrepo.models.core import serializing
from databasyrepo.models.core.errors import ModelNotFound
from databasyrepo.models.core.models import Model
from databasyrepo.models.register import register
from databasyrepo.utils import dateutils, geventutils

__author__ = 'Marboni'

ONLINE_TIMEOUT = 10
ACTIVE_TIMEOUT = 30
ONLINE_STATUS_CHECK_PERIOD = 5

MODELS_NS = '/models'

class ModelManager(object):
    def __init__(self, pool, model_id=None):
        super(ModelManager, self).__init__()
        self.pool = pool
        self.model_id = model_id
        self.lock = threading.Lock()

    def _check_model(self):
        if not self._model:
            raise ValueError('Manager has no model.')

    def _init_runtime(self):
        self._runtime = Runtime()
        geventutils.schedule(ONLINE_STATUS_CHECK_PERIOD, self.update_users_activity)

    def update_users_activity(self):
        requires_runtime_emit = False

        for user_id in self._runtime.users.keys():
            now = dateutils.now()
            user_info = self._runtime.users[user_id]

            if now - user_info.last_online > ONLINE_TIMEOUT * 1000:
                self.user_socket(user_id).disconnect(silent=True)
                requires_runtime_emit = False # Disconnect emits runtime itself.
            elif now - user_info.last_activity > ACTIVE_TIMEOUT * 1000 and user_info['active']:
                user_info['active'] = False
                requires_runtime_emit = True

        if requires_runtime_emit:
            self.emit_runtime()

    def create(self, model_id, user_id):
        self.model_id = model_id

        serial = self.code_by_id(model_id)
        # TODO Handle case when model not found.
        model_class = register.get(serial, Model)
        self._model = model_class.create(model_id, user_id)
        self._model.inject_connection(mg())
        self._model.save()
        self._init_runtime()

    @staticmethod
    def code_by_id(model_id):
        # TODO Should take it from some source.
        from databasyrepo.models.postgres.models import PostgresModel

        return PostgresModel.code()

    @staticmethod
    def retrieve_model(model_id, conn):
        serialized_model = conn.models.find_one({'model_id': model_id})
        if not serialized_model:
            raise ModelNotFound(model_id)
        model = serializing.deserialize(serialized_model)
        model.inject_connection(conn)
        return model

    def reload(self):
        self._model = self.retrieve_model(self.model_id, mg())
        self._init_runtime()

    def execute_command(self, command, user_id):
        self._check_model()
        try:
            actions = self._model.execute_command(command, user_id)
            return actions
        except Exception, e:
            self.reload()
            raise e

    @property
    def users(self):
        """ Returns dict of IDs and UserInfos of active users.
        """
        return self._runtime.users

    def user_socket(self, user_id):
        return self._runtime.user_socket(user_id)

    def add_user(self, user_id, socket):
        return self._runtime.add_user(user_id, socket)

    def update_activity(self, user_id, activity):
        return self._runtime.update_activity(user_id, activity)

    def remove_user(self, user_id):
        return self._runtime.remove_user(user_id)

    def pass_control(self, from_user, to_user):
        return self._runtime.pass_control(from_user, to_user)

    def emit_runtime(self):
        self.emit_to_users('runtime_changed', self.serialize_runtime())

    def emit_to_users(self, event, *args):
        pkt = dict(type='event', name=event, args=args, endpoint=MODELS_NS)
        for user_id in self.users.keys():
            socket = self.user_socket(user_id)
            socket.send_packet(pkt)

    def serialize_model(self):
        return self._model.serialize_for_client()

    def serialize_runtime(self):
        return dict(self._runtime)

    def log(self, message):
        self.pool.app.logger.info("[ModelManager:%s] %s" % (self.model_id, message))


class Runtime(dict):
    def __init__(self):
        super(Runtime, self).__init__()
        self['users'] = {}
        self['editor'] = None

    @property
    def users(self):
        return self['users']

    @property
    def editor(self):
        return self['editor']

    def add_user(self, user_id, socket):
        # If user reconnects and already exists in list of active users, just update his socket.
        if self.users.has_key(user_id):
            self.users[user_id].socket = socket
        else:
            user_info = UserInfo(user_id, socket)
            self.users[user_id] = user_info

    def remove_user(self, user_id):
        if not self.users.has_key(user_id):
            raise ValueError('User %s is not online.' % user_id)
        user_info = self.users[user_id]
        if self.is_editor(user_info.user_id):
            self.pass_control(user_id, None)
        del self.users[user_id]

    def update_activity(self, user_id, activity):
        if not self.users.has_key(user_id):
            raise ValueError('User %s is not online.' % user_id)
        user_info = self.users[user_id]
        user_info.update_last_online()
        if activity:
            user_info.update_last_activity()

    def pass_control(self, from_user_id, to_user_id):
        if from_user_id:
            from_user = self.users.get(from_user_id)
            if not from_user:
                raise ValueError('User %s is not online.' % from_user_id)
            if not self.is_editor(from_user_id):
                raise ValueError('User %s is not an editor.' % from_user_id)
        if to_user_id:
            to_user = self.users.get(to_user_id)
            if not to_user:
                raise ValueError('User %s is not online.' % to_user)
        if not from_user_id and self.editor:
            return False # User requested control not knowing that other user edits the model.
        self['editor'] = to_user_id
        return True

    def is_editor(self, user_id):
        return user_id == self.editor

    def user_socket(self, user_id):
        try:
            return self.users[user_id].socket
        except KeyError:
            raise ValueError('User %s is not online.' % user_id)

class UserInfo(dict):
    def __init__(self, user_id, socket):
        super(UserInfo, self).__init__()
        self['user_id'] = user_id
        self['active'] = True
        self.last_online = dateutils.now()
        self.last_activity = dateutils.now()
        self.socket = socket

    @property
    def user_id(self):
        return self['user_id']

    @property
    def active(self):
        return self['active']

    @active.setter
    def active(self, active):
        self['active'] = active

    def update_last_online(self):
        self.last_online = dateutils.now()

    def update_last_activity(self):
        self.last_activity = dateutils.now()
        if not self.active:
            self.active = True

