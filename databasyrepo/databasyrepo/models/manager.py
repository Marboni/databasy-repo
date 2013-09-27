import threading
import gevent
from databasyrepo.api.socket import socket_utils
from databasyrepo.mg import mg
from databasyrepo.models.core import serializing
from databasyrepo.models.core.errors import ModelNotFound
from databasyrepo.models.core.models import Model
from databasyrepo.models.register import register
from databasyrepo.mq import facade_rpc
from databasyrepo.utils import dateutils

__author__ = 'Marboni'

MODELS_NS = '/models'

def retrieve_model(model_id, conn):
    serialized_model = conn.models.find_one({'model_id': model_id})
    if not serialized_model:
        raise ModelNotFound(model_id)
    model = serializing.deserialize(serialized_model)
    model.inject_connection(conn)
    return model


def model_exists(model_id, conn):
    return bool(conn.models.find({'model_id': model_id}).limit(1))


class ModelManager(object):
    ONLINE_TIMEOUT = 10
    ACTIVE_TIMEOUT = 30
    ONLINE_STATUS_CHECK_PERIOD = 5

    def __init__(self, pool, model_id=None):
        super(ModelManager, self).__init__()
        self.pool = pool
        self.model_id = model_id
        self.runtime = None
        self.scheduler = None
        self.lock = threading.Lock()

    def _check_model(self):
        if not self._model:
            raise ValueError('Manager has no model.')

    def _init_runtime(self):
        self.runtime = Runtime()
        self._update_users_activity_periodically()

    def _update_users_activity_periodically(self):
        gevent.spawn_later(0, self.update_users_activity)
        self.scheduler = gevent.spawn_later(self.ONLINE_STATUS_CHECK_PERIOD, self._update_users_activity_periodically)

    def update_users_activity(self):
        users_to_disconnect = []

        with self.lock:
            runtime_changed = False
            for user_id in self.runtime.users.keys():
                now = dateutils.now()
                user_info = self.runtime.users[user_id]

                if now - user_info.last_online > self.ONLINE_TIMEOUT * 1000:
                    # Checking online / offline.
                    users_to_disconnect.append(user_id)
                elif now - user_info.last_activity > self.ACTIVE_TIMEOUT * 1000 and user_info.active:
                    # Checking activity.
                    user_info.active = False
                    if user_id == self.runtime.editor and self.runtime.applicants:
                        # Editor is inactive and other users requested control - passing control.
                        applicant_id = self.runtime.applicants[0]
                        self.runtime.pass_control(user_id, applicant_id)
                        self.log('Editor %s is inactive, control passed to user %s.' % (user_id, applicant_id))
                    runtime_changed = True

            if runtime_changed:
                self.emit_runtime()

        for user_id in users_to_disconnect:
            try:
                socket = self.runtime.user_socket(user_id)
            except ValueError:
                continue
            else:
                self.pool.disconnect(self.model_id, user_id)
                self.log('User %s went offline and was disconnected.' % user_id)


    def create(self, model_id, user_id):
        self.model_id = model_id

        serial = self.code_by_id(model_id)
        model_class = register.get(serial, Model)
        if not model_class:
            raise Exception('No model found for serial code %s.' % serial)
        self._model = model_class.create(model_id, user_id)
        self._model.inject_connection(mg())
        self._model.save()
        self._init_runtime()

    def delete(self):
        self._check_model()
        with self.lock:
            self._model.delete()

    @staticmethod
    def code_by_id(model_id):
        database_type = facade_rpc('database_type', model_id)
        if database_type is None:
            raise ModelNotFound
        return database_type

    def reinit(self):
        self._model = retrieve_model(self.model_id, mg())
        self._init_runtime()

    def add_user(self, user, socket):
        with self.lock:
            try:
                old_socket = self.runtime.user_socket(user.id)
            except ValueError:
                pass
            else:
                socket_utils.emit('/models', old_socket, 'server_disconnect')
            self.runtime.add_user(user, socket)

    def remove_user(self, user_id):
        with self.lock:
            try:
                socket = self.runtime.user_socket(user_id)
            except ValueError:
                return False
            else:
                self.runtime.remove_user(user_id)
                socket_utils.emit('/models', socket, 'server_disconnect')
                socket.disconnect(silent=True)
                self.emit_runtime()
                return True

    def change_role(self, user_id):
        with self.lock:
            try:
                socket = self.runtime.user_socket(user_id)
            except ValueError:
                return False
            else:
                if self.runtime.is_editor(user_id):
                    self.runtime.pass_control(user_id, None)
                    self.emit_runtime()
                socket_utils.emit('/models', socket, 'reload', 'role_changed')
                return True

    def execute_command(self, command, user_id):
        self._check_model()
        try:
            actions = self._model.execute_command(command, user_id)
            return actions
        except Exception, e:
            self.reinit()
            raise e

    def emit_runtime(self):
        self.emit_to_users('runtime_changed', self.serialize_runtime())

    def emit_to_users(self, event, *args):
        pkt = dict(type='event', name=event, args=args, endpoint=MODELS_NS)
        for user_id in self.runtime.users.keys():
            socket = self.runtime.user_socket(user_id)
            socket.send_packet(pkt)

    def serialize_model(self):
        return self._model.serialize_for_client()

    def serialize_runtime(self):
        return dict(self.runtime)

    def log(self, message):
        self.pool.app.logger.info("[ModelManager:%s] %s" % (self.model_id, message))

    def close(self):
        if self.scheduler:
            self.scheduler.kill()

class Runtime(dict):
    def __init__(self):
        super(Runtime, self).__init__()
        self['users'] = {}
        self['editor'] = None
        self['applicants'] = [] # IDs of users that requested control.

    @property
    def users(self):
        return self['users']

    @property
    def editor(self):
        return self['editor']

    @property
    def applicants(self):
        return self['applicants']

    def add_user(self, user, socket):
        # If user reconnects and already exists in list of active users, just update his socket.
        user_id = user.id
        if self.users.has_key(user_id):
            self.users[user_id].socket = socket
        else:
            user_info = UserInfo(user, socket)
            self.users[user_id] = user_info

    def remove_user(self, user_id):
        if not self.users.has_key(user_id):
            return
        if self.is_editor(user_id):
            self.pass_control(user_id, None)
        elif self.is_applicant(user_id):
            self.remove_applicant(user_id)
        del self.users[user_id]

    def add_applicant(self, user_id):
        if user_id not in self['applicants']:
            self['applicants'].append(user_id)

    def remove_applicant(self, user_id):
        if user_id in self['applicants']:
            self['applicants'].remove(user_id)

    def remove_applicants(self):
        self['applicants'] = []

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
        if to_user_id and not self.users.get(to_user_id):
            to_user_id = None
        if not to_user_id and self.applicants:
            to_user_id = self.applicants[0]
        if not from_user_id and self.editor:
            return False # User requested control not knowing that other user edits the model.
        self['editor'] = to_user_id
        self['applicants'] = []
        return True

    def is_online(self, user_id):
        return user_id in self.users

    def is_applicant(self, user_id):
        return user_id in self.applicants

    def is_editor(self, user_id):
        return user_id == self.editor

    def user_socket(self, user_id):
        try:
            return self.users[user_id].socket
        except KeyError:
            raise ValueError('User %s is not online.' % user_id)

    def has_user(self, user_id):
        return self.users.has_key(user_id)


class UserInfo(dict):
    def __init__(self, user, socket):
        super(UserInfo, self).__init__()
        self['id'] = user.id
        self['username'] = user.username
        self['active'] = True
        self.last_online = dateutils.now()
        self.last_activity = dateutils.now()
        self.socket = socket

    @property
    def id(self):
        return self['id']

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

