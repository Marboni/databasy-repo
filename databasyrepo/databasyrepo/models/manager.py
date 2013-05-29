import threading
from databasyrepo.mg import mg
from databasyrepo.models.core import serializing
from databasyrepo.models.core.errors import ModelNotFound
from databasyrepo.models.core.models import Model
from databasyrepo.models.register import register

__author__ = 'Marboni'

class ModelManager(object):
    def __init__(self, model_id=None):
        super(ModelManager, self).__init__()
        self.model_id = model_id
        self.lock = threading.Lock()
        self._user_roles = UserRoles()

    def _check_model(self):
        if not self._model:
            raise ValueError('Manager has no model.')

    def create(self, model_id, user_id):
        self.model_id = model_id

        serial = self.code_by_id(model_id)
        # TODO Handle case when model not found.
        model_class = register.get(serial, Model)
        self._model = model_class.create(model_id, user_id)
        self._model.inject_connection(mg())
        self._model.save()

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

    def execute_command(self, command, user_id):
        self._check_model()
        try:
            actions = self._model.execute_command(command, user_id)
            return actions
        except Exception, e:
            self.reload()
            raise e


    def has_active_users(self):
        return bool(self._user_roles.active_users)

    def active_users(self):
        return list(self._user_roles.active_users)

    def user_socket(self, user_id):
        return self._user_roles.user_socket(user_id)

    def add_active_user(self, user_id, socket):
        return self._user_roles.add_active_user(user_id, socket)

    def remove_active_user(self, user_id):
        return self._user_roles.remove_active_user(user_id)

    def pass_control(self, from_user, to_user):
        return self._user_roles.pass_control(from_user, to_user)

    def serialize_model(self):
        return self._model.serialize_for_client()

    def serialize_user_roles(self):
        return dict(self._user_roles)


class UserRoles(dict):
    def __init__(self):
        super(UserRoles, self).__init__()
        self['active_users'] = []
        self['editor'] = None
        self.users_and_sockets = {}

    @property
    def active_users(self):
        return self['active_users']

    @property
    def editor(self):
        return self['editor']

    def add_active_user(self, user_id, socket):
        # If user reconnects and already exists in list of active users, just update his socket.
        if user_id not in self.active_users:
            self.active_users.append(user_id)
        self.users_and_sockets[user_id] = socket

    def remove_active_user(self, user_id):
        if user_id not in self.active_users:
            raise ValueError('User %s is not active.' % user_id)
        self.active_users.remove(user_id)
        del self.users_and_sockets[user_id]
        if user_id == self.editor:
            self.pass_control(user_id, None)

    def pass_control(self, from_user, to_user):
        if from_user and not self.is_editor(from_user):
            raise ValueError('User %s is not an editor.' % from_user)
        if to_user and not self.is_active(to_user):
            raise ValueError('User %s is not active.' % to_user)
        if not from_user and self.editor:
            return False # User requested control not knowing that other user edits the model.
        self['editor'] = to_user
        return True

    def is_editor(self, user_id):
        return self.editor == user_id

    def is_active(self, user_id):
        return user_id in self.active_users

    def user_socket(self, user_id):
        try:
            return self.users_and_sockets[user_id]
        except KeyError:
            raise ValueError('User %s is not active.' % user_id)
