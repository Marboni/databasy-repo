from flask import Blueprint, request, Response, current_app
import json
from socketio import socketio_manage
from socketio.namespace import BaseNamespace
from databasyrepo.models.core.commands import Command
from databasyrepo.models.core.serializing import deserialize

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

    def on_enter(self, model_id, user_id):
        user_id = long(user_id)
        model_id = long(model_id)

        self.session['user_id'] = user_id
        self.session['model_id'] = model_id

        self.context.app.pool.connect(model_id, user_id, self.socket)

        self.emit('enter_done')
        self.log('[uid:%s] Connected to model %s.' % (self.user_id, self.model_id))

    def on_load(self):
        with self.mm.lock:
            model = self.mm.serialize_model()
            active_users = self.mm.serialize_user_roles()
            self.emit('load_done', model, active_users)
            self.log('[uid:%s] Loaded model %s.' % (self.user_id, self.model_id))

    def on_exec(self, command):
        command = deserialize(command, Command)
        command_version = command.val('source_version')
        try:
            with self.mm.lock:
                self.mm.execute_command(command, self.user_id)
                self.emit('exec_done', command_version)
                self.log('[uid:%s] Successfully executed command: \n\n%s\n' % (self.user_id, json.dumps(command, indent=4)))
        except Exception, e:
            self.emit('exec_fail', command_version)
            self.log('[uid:%s] Failed to execute command: \n\n%s\nCause: %s\n' % (self.user_id, json.dumps(command, indent=4), e.message))

    def on_request_control(self):
        with self.mm.lock:
            self.log('[uid:%s] Requesting control.')
            if self.mm.pass_control(None, self.user_id):
                self.emit_to_all('roles_changed', self.mm.serialize_user_roles())
                self.log('[uid:%s] Control provided.')
            else:
                self.log('[uid:%s] Request rejected - other user is editing the model.')

    def on_pass_control(self, new_editor):
        with self.mm.lock:
            self.mm.pass_control(self.user_id, new_editor)
            self.emit_to_all('roles_changed', self.mm.serialize_user_roles())
            self.log('[uid:%s] Control passed.')

    def recv_disconnect(self):
        if 'user_id' in self.session:
            self.context.app.pool.disconnect(self.model_id, self.user_id)
            self.disconnect(silent=True)
            self.log('[uid:%s] Disconnected from model %s.' % (self.user_id, self.model_id))

    def disconnect(self, *args, **kwargs):
        if self.context:
            try:
                self.context.pop()
            except:
                return
        super(ModelsNamespace, self).disconnect(*args, **kwargs)

    @property
    def user_id(self):
        return self.session['user_id']

    @property
    def model_id(self):
        return self.session['model_id']

    @property
    def mm(self):
        return self.context.app.pool.get(self.model_id)

    def emit_to_all(self, event, *args):
        self.emit_to_users(self.mm.active_users(), event, *args)

    def emit_to_other(self, event, *args):
        user_ids = self.mm.active_users() # returns copy of user IDs set.
        user_ids.remove(self.user_id)
        self.emit_to_users(user_ids, event, *args)

    def emit_to_users(self, user_ids, event, *args):
        pkt = dict(type='event', name=event, args=args, endpoint=self.ns_name)
        for user_id in user_ids:
            socket = self.mm.user_socket(user_id)
            socket.send_packet(pkt)