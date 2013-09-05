from logging import StreamHandler, Formatter
import logging
from flask import Flask, request, current_app
from flask.ext.login import LoginManager
import os
from socketio.server import SocketIOServer
import sys
from databasyrepo import config, mg, mq
from databasyrepo.auth import load_user
from databasyrepo.models.pool import ModelsPool

def load_modules(app):
    try:
        modules = app.config['MODULES']
    except KeyError:
        raise Exception('Key MODULES not found in your configuration.')
    for prefix, module_name in modules.iteritems():
        try:
            module = __import__(module_name, fromlist=['bp'])
        except ImportError, e:
            raise ImportError('Unable to load module %s: %s.' % (module_name, e.message))
        try:
            app.register_blueprint(module.bp, url_prefix=prefix)
        except AttributeError:
            raise AttributeError('Module %s has no required attribute bp.' % module_name)


def wrap_into_middlewares(app):
    for middleware_name in reversed(app.config['MIDDLEWARES']):
        module_name, clazz_name = middleware_name.rsplit('.', 1)
        module = __import__(module_name, fromlist=[clazz_name])
        app.wsgi_app = getattr(module, clazz_name)(app)


def configure_logging(app):
    if not app.debug:
        stderr_handler = StreamHandler(sys.stderr)
        stderr_handler.setLevel(logging.WARNING)
        stderr_handler.setFormatter(Formatter(
            '%(asctime)s %(levelname)s: %(message)s'
        ))
        app.logger.addHandler(stderr_handler)

def create_models_pool(app):
    app.pool = ModelsPool(app)

def init_facade_clients(app):
    mq.init_facade_clients(app, app.config['FACADE_RPC_ADDRESS'], app.config['FACADE_PUB_ADDRESS'])

class PatchedLoginManager(LoginManager):
    def _load_user(self):
        if request.path.startswith(current_app.static_url_path):
            return
        super(PatchedLoginManager, self)._load_user()


def init_login_manager(app):
    login_manager = PatchedLoginManager()
    #noinspection PyTypeChecker
    login_manager.user_loader(load_user)
    login_manager.login_view = app.config['LOGIN_VIEW']
    login_manager.login_message = app.config['LOGIN_MESSAGE']

    login_manager.init_app(app)

def create_app():
    app = Flask('databasyrepo')
    app.config.from_object(config.config_by_mode(os.environ.get('ODM_API_ENV')))
    mg.init_engine(app.config['MONGO_URI'], app.config['MONGO_DATABASE_NAME'])
    load_modules(app)
    wrap_into_middlewares(app)
    configure_logging(app)
    create_models_pool(app)
    init_facade_clients(app)
    init_login_manager(app)
    return app

app = create_app()

if __name__ == '__main__':
    print 'Server is listening on port %s.' % app.config['PORT']
    transports = ['xhr-multipart', 'xhr-polling', 'jsonp-polling']
    SocketIOServer((app.config['HOST'], app.config['PORT']), app, resource='socket.io', transports=transports).serve_forever()
