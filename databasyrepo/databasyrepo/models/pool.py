from databasyrepo.models.core.errors import IllegalCommand, ModelNotFound
from databasyrepo.models.manager import ModelManager
from databasyrepo.utils.commons import ReadWriteLock

__author__ = 'Marboni'

class ModelsPool(object):
    def __init__(self):
        super(ModelsPool, self).__init__()
        self._model_managers = {} # IDs and model managers.
        self._lock = ReadWriteLock()

    def _get(self, model_id):
        self._lock.acquire_read()
        try:
            mm = self._model_managers.get(model_id)
        finally:
            self._lock.release_read()
        return mm

    def _load(self, model_id):
        # Creating manager and loading model in non-blocking code.
        mm = ModelManager(model_id)
        mm.reload()
        self._lock.acquire_write()
        try:
            # Check again - may be some other thread already loaded it.
            if not self._model_managers.has_key(model_id):
                self._model_managers[model_id] = mm
            return self._model_managers[model_id]
        finally:
            self._lock.release_write()

    def _create(self, model_id, user_id):
        """ Creates model.
        """
        mm = ModelManager()
        mm.create(model_id, user_id)
        self._lock.acquire_write()
        try:
            # Check again - may be some other thread already loaded it.
            if not self._model_managers.has_key(model_id):
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

    def connect(self, model_id, user_id, socket):
        mm = self._get(model_id)
        if not mm:
            try:
                mm = self._load(model_id)
            except ModelNotFound:
                mm = self._create(model_id, user_id)
        with mm.lock:
            mm.add_active_user(user_id, socket)

    def get(self, model_id):
        mm = self._get(model_id)
        if not mm:
            raise ValueError('Model with ID %s not found in the pool.')
        return mm

    def disconnect(self, model_id, user_id):
        mm = self._get(model_id)
        if not mm:
            return
        with mm.lock:
            mm.remove_active_user(user_id)
            if not mm.active_users():
                self._lock.acquire_write()
                try:
                    del self._model_managers[model_id]
                except KeyError:
                    pass
                finally:
                    self._lock.release_write()


