from flask.ext.login import UserMixin
from databasyrepo.mq import facade_rpc

__author__ = 'Marboni'

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
