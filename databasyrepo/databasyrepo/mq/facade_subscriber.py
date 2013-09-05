from databasyrepo.mq.client import Subscriber

__author__ = 'Marboni'

class FacadeSubscriber(Subscriber):
    def __init__(self, app, address):
        super(FacadeSubscriber, self).__init__(address)
        self.app = app

    def handle_logout(self, user_id):
        self.app.pool.disconnect_all(user_id)

    def error_handler(self, e):
        print 'ERROR: %s' % e
