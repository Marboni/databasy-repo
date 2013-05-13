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

    def on_reload(self, model_id, user_id):
        user_id = long(user_id)
        model_id = long(model_id)

        self.session['user_id'] = user_id
        self.session['model_id'] = model_id
        mm = self.context.app.pool.connect(model_id, user_id)
        self.log('[uid:%s] Connected to model %s.' % (user_id, model_id))
        self.emit('reload', mm.serialize(), mm.current_editor())

    def on_exec(self, command):
        user_id = self.session['user_id']
        model_id = self.session['model_id']

        command = deserialize(command, Command)
        command_version = command.val('source_version')
        try:
            mm = self.context.app.pool.get(model_id)
            mm.execute_command(command, user_id)
        except Exception, e:
            self.emit('exec_fail', command_version)
            self.log('[uid:%s] Failed to execute command: \n\n%s\nCause: %s\n' % (user_id, json.dumps(command, indent=4), e.message))
        else:
            self.emit('exec_success', command_version)
            self.log('[uid:%s] Successfully executed command: \n\n%s\n' % (user_id, json.dumps(command, indent=4)))


    def recv_disconnect(self):
        if 'user_id' in self.session:
            user_id = self.session['user_id']
            model_id = self.session['model_id']
            self.context.app.pool.disconnect(model_id, user_id)
            self.disconnect(silent=True)
            self.log('[uid:%s] Disconnected from model %s.' % (user_id, model_id))

    def disconnect(self, *args, **kwargs):
        if self.context:
            try:
                self.context.pop()
            except:
                return
        super(ModelsNamespace, self).disconnect(*args, **kwargs)