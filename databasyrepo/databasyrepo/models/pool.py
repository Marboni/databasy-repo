from databasyrepo.models.core.errors import ModelNotFound
from databasyrepo.models.manager import ModelManager
from databasyrepo.utils.commons import ReadWriteLock

__author__ = 'Marboni'

class ModelsPool(object):
    def __init__(self, app):
        super(ModelsPool, self).__init__()

        self.app = app
        self._model_managers = {} # IDs and model managers.
        self._lock = ReadWriteLock()

    def _load(self, model_id):
        # Creating manager and loading model in non-blocking code.
        mm = ModelManager(self, model_id)
        mm.reload()
        self._lock.acquire_write()
        try:
            # Check again - may be some other thread already loaded it.
            if not self._model_managers.has_key(model_id):
                self.log('ModelManager:%s was added to the pool.' % model_id)
                self._model_managers[model_id] = mm
            return self._model_managers[model_id]
        finally:
            self._lock.release_write()


    def _remove(self, model_id):
        self._lock.acquire_write()
        try:
            del self._model_managers[model_id]
        except KeyError:
            pass
        finally:
            self._lock.release_write()

    def get(self, model_id):
        self._lock.acquire_read()
        try:
            mm = self._model_managers.get(model_id)
        finally:
            self._lock.release_read()
        return mm

    def connect(self, model_id, user_id, socket):
        mm = self.get(model_id)
        if not mm:
            mm = self._load(model_id)
        with mm.lock:
            mm.runtime.add_user(user_id, socket)

    def disconnect(self, model_id, user_id):
        mm = self.get(model_id)
        if not mm:
            return
        with mm.lock:
            mm.runtime.remove_user(user_id)
            if not mm.runtime.users:
                self._remove(model_id)
                self.log('ModelManager:%s had no online users and was removed from the pool.' % model_id)

    def model_ids(self):
        self._lock.acquire_read()
        try:
            return self._model_managers.keys()
        finally:
            self._lock.release_read()

    def log(self, message):
        self.app.logger.info("[Pool] %s" % message)


