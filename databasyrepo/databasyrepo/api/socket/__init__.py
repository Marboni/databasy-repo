from flask import Blueprint, request, Response, current_app
from socketio import socketio_manage
from socketio.mixins import RoomsMixin, BroadcastMixin
from socketio.namespace import BaseNamespace

__author__ = 'Marboni'

bp = Blueprint('socket.io', __name__)

@bp.route('/<path:remaining>')
def socketio(remaining):
    app = current_app._get_current_object()
    try:
        # Hack: set app instead of request to make it available in the namespace.
        socketio_manage(request.environ, {'/models': ModelsNamespace}, app)
    except:
        app.logger.error("Exception while handling socket.io connection", exc_info=True)
    return Response()

class ModelsNamespace(BaseNamespace):
    def __init__(self, environ, ns_name, request=None):
        self.context = None
        if request:
            # Hack: initialize context with app that was set instead of request. Then miss it in parent constructor call.
            app = request
            self.context = app.request_context(environ)
            self.context.push()
            app.preprocess_request()
        super(ModelsNamespace, self).__init__(environ, ns_name)

    def log(self, message):
        self.context.app.logger.info("[%s] %s" % (self.socket.sessid, message))

    def on_connect(self, user_id, model_id):
        user_id = long(user_id)
        model_id = long(model_id)

        self.session['user_id'] = user_id
        self.session['model_id'] = model_id
        mm = self.context.app.pool.connect(model_id, user_id)
        self.log('[uid:%s] Connected to model %s.' % (user_id, model_id))
        self.emit('reload', mm.serialize())

    def recv_disconnect(self):
        user_id = self.session['user_id']
        model_id = self.session['model_id']
        self.context.app.pool.disconnect(model_id, user_id)
        self.disconnect(silent=True)
        self.log('[uid:%s] Disconnected from model %s.' % (user_id, model_id))
        return True

    def disconnect(self, *args, **kwargs):
        if self.context:
            self.context.pop()
        super(ModelsNamespace, self).disconnect(*args, **kwargs)

class ChatNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
    def __init__(self, environ, ns_name, request=None):
        self.context = None
        if request:
            # Hack: initialize context with app that was set instead of request. Then miss it in parent constructor call.
            app = request
            self.context = app.request_context(environ)
            self.context.push()
            app.preprocess_request()
        super(ChatNamespace, self).__init__(environ, ns_name)

    def initialize(self):
        self.log("Socket.io session started")

    def log(self, message):
        self.context.app.logger.info("[{0}] {1}".format(self.socket.sessid, message))

    def on_username(self, username):
        self.log('%s has connected.' % username)
        self.session['username'] = username
        room = 'ROOM'
        self.session['room'] = room
        self.join(room)
        self.emit_to_room(room, 'announcement', '%s has connected' % self.session['username'])
        return True

    def recv_disconnect(self):
        username = self.session['username']
        self.log('%s has disconnected.' % username)
        self.emit_to_room(self.session['room'], 'announcement', '%s has disconnected' % username)
        self.disconnect(silent=True)
        return True

    def on_user_message(self, msg):
        self.log('User message: "%s".' % msg)
        self.emit_to_room(self.session['room'], 'msg_to_room', self.session['username'], msg)
        return True

    def disconnect(self, *args, **kwargs):
        if self.context:
            self.context.pop()
        super(ChatNamespace, self).disconnect(*args, **kwargs)
