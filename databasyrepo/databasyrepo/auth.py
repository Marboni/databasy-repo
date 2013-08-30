from functools import wraps
from flask import request
from flask.ext.login import UserMixin, current_user
from werkzeug.exceptions import Unauthorized
from databasyrepo.mq import facade_rpc

__author__ = 'Marboni'

class ModelRole(object):
    OWNER = 'owner'
    DEVELOPER = 'developer'
    VIEWER = 'viewer'

    HIERARCHY = {
        OWNER: [DEVELOPER, VIEWER],
        DEVELOPER: [VIEWER]
    }

    def __init__(self, role):
        self.role = role

    def includes(self, role):
        return self.role == role or role in (self.HIERARCHY.get(self.role) or [])

class UserInfo(UserMixin):
    def __init__(self, info):
        super(UserInfo, self).__init__()
        self.id = info['user_id']
        self.name = info['name']
        self.email = info['email']
        self.active = info['active']

    def is_active(self):
        return self.active


def load_user(user_id):
    info = facade_rpc('user_info', user_id)
    if not info:
        return None
    return UserInfo(info)

def has_role(role):
    """ Checks if user has required role for a model.
        Model ID will be taken from request field or url part with name "model_id".
    Parameters:
        role - required role.
    """
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            values = dict(request.values.items() + kwargs.items())
            try:
                model_id = values['model_id']
            except KeyError:
                raise ValueError('model_id not found in request parameters.')
            if not check_role(model_id, role):
                raise Unauthorized
            return function(*args, **kwargs)

        return wrapper

    return decorator

def check_role(model_id, role):
    r = get_role(model_id)
    return None if not r else r.includes(role)

def get_role(model_id):
    user = current_user
    if not user.is_authenticated():
        return None

    r = facade_rpc('role', model_id, user.id)
    if not r:
        return None
    return ModelRole(r)