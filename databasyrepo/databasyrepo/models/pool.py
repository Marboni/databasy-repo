from threading import Timer
from databasyrepo.models.core.errors import IllegalCommand
from databasyrepo.models.manager import ModelManager
from databasyrepo.utils.commons import ReadWriteLock

__author__ = 'Marboni'

class ModelsPool(object):
    def __init__(self):
        super(ModelsPool, self).__init__()
        self._model_managers = {} # IDs and models.
        self._lock = ReadWriteLock()
        self._gc = None

    def _load(self, model_id, user_id):
        # Creating manager and loading model in non-blocking code.
        mm = ModelManager()
        mm.load(model_id, user_id)
        self._lock.acquire_write()
        try:
            # Check again - may be some other thread already loaded it.
            if not self._model_managers.has_key(model_id):
                self._model_managers[model_id] = mm
            return self._model_managers[model_id]
        finally:
            self._lock.release_write()

    def _get(self, model_id, user_id):
        self._lock.acquire_read()
        try:
            model_manager = self._model_managers.get(model_id)
        finally:
            self._lock.release_read()

        if not model_manager:
            model_manager = self._load(model_id, user_id)

        return model_manager

    def create(self, type, model_id, user_id):
        """ Creates model.
        """
        mm = ModelManager()
        mm.create(type, model_id, user_id)
        # Nobody tries to read newly-created model until current transaction commits and model becomes available
        # for other account user. Read lock here because cleanup task needs to wait until creation of new element
        # finishes, but reader thread does not wait for it to read other models.
        self._lock.acquire_read()
        try:
            self._model_managers[model_id] = mm
        finally:
            self._lock.release_read()

    def diff(self, model_id, version, user_id):
        """ Find difference between specified version of model and current one.
        Returns:
            tuple of three elements:
            * Current version
            * Diff tatus
                NO_DIFF - current model version is the same as specified. Third element will be always None in this case.
                DIFF - model's version is newer then specified, third element stores all events to update it.
                RELOAD - model's version is newer then specified, third element stores serialized model in current version.
            * Diff content (depends on diff status).
        Raises:
            ValueError if model not found or specified version is greater then current one.
        """
        mm = self._get(model_id, user_id)
        try:
            return mm.diff(version, user_id)
        except BaseException:
            self.remove_mm(model_id)
            raise

    def execute_command(self, model_id, command, user_id):
        """ Executes command.
        Returns:
            list of actions executed by the command.
        Raises:
            ValueError if model not found.
        """
        mm = self._get(model_id, user_id)
        try:
            return mm.execute_command(command, user_id)
        except BaseException, e:
            if not isinstance(e, IllegalCommand):
                self.remove_mm(model_id)
            raise

    def active_users(self, model_id, user_id):
        mm = self._get(model_id, user_id)
        return mm.active_users(user_id)

    def model(self, model_id, user_id):
        """ !!! For testing purpose only !!!
        """
        return pool._get(model_id, user_id)._model

    def remove_mm(self, model_id):
        self._lock.acquire_write()
        try:
            del self._model_managers[model_id]
        except KeyError:
            pass
        finally:
            self._lock.release_write()

    def remove_lru(self, ttl):
        """ Removes from stack old model managers that were not accessed by specific time.
        Arguments:
            ttl - time in second. This argument sets time for which manager can be removed from pool.
        """
        self._lock.acquire_write()
        try:
            for model_id in self._model_managers.keys():
                if self._model_managers[model_id].expired(ttl):
                    del self._model_managers[model_id]
        finally:
            self._lock.release_write()

    def remove_lru_periodically(self, ttl):
        """ Periodically removes from stack old model managers that were not accessed by specific time.
        Arguments:
            ttl - time in second. This argument sets how often this method will run and time for which manager can be
            removed.
        """
        self.remove_lru(ttl)

        self._gc = Timer(ttl, self.remove_lru_periodically, args=[ttl])
        self._gc.daemon = True
        self._gc.start()

    def close(self):
        """ Removes all model managers from pool, stop process that removes LRU model managers.
        """
        self._lock.acquire_write()
        try:
            self._model_managers.clear()
            if self._gc:
                self._gc.cancel()
                self._gc = None
        finally:
            self._lock.release_write()


def create_pool():
    pool = ModelsPool()
    pool.remove_lru_periodically(24 * 60 * 60)
    return pool

pool = create_pool()