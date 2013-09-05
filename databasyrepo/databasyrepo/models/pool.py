from databasyrepo.models.core.errors import ModelNotFound
from databasyrepo.models.manager import ModelManager
from databasyrepo.mq import facade_rpc
from databasyrepo.utils.commons import ReadWriteLock

__author__ = 'Marboni'

class ModelsPool(object):
    def __init__(self, app):
        super(ModelsPool, self).__init__()

        self.app = app
        self._model_managers = {} # IDs and model managers.
        self._user_models = {} # User ID and list of user's models IDs.
        self._lock = ReadWriteLock()

    def _create(self, model_id, user_id):
        """ Creates model.
        """
        mm = ModelManager(self)
        mm.create(model_id, user_id)
        self._lock.acquire_write()
        try:
            # Check again - may be some other thread already loaded it.
            if not self._model_managers.has_key(model_id):
                self._model_managers[model_id] = mm
                self.log('ModelManager:%s was added to the pool.' % model_id)
            return self._model_managers[model_id]
        finally:
            self._lock.release_write()

    def _load(self, model_id):
        # Creating manager and loading model in non-blocking code.
        mm = ModelManager(self, model_id)
        mm.reinit()
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
            mm = self._model_managers.pop(model_id)
            mm.close()
        except KeyError:
            pass
        finally:
            self._lock.release_write()

    def bind_user_to_model(self, user_id, model_id):
        self._lock.acquire_write()
        try:
            try:
                model_ids = self._user_models[user_id]
            except KeyError:
                model_ids = set()
                self._user_models[user_id] = model_ids
            model_ids.add(model_id)
        finally:
            self._lock.release_write()

    def unbind_user_from_model(self, user_id, model_id):
        self._lock.acquire_read()
        try:
            try:
                model_ids = self._user_models[user_id]
            except KeyError:
                return
            if model_id not in model_ids:
                return
        finally:
            self._lock.release_read()

        self._lock.acquire_write()
        try:
            try:
                model_ids = self._user_models[user_id]
            except KeyError:
                return
            try:
                model_ids.remove(model_id)
            except KeyError:
                pass
            else:
                if not model_ids:
                    del self._user_models[user_id]
        finally:
            self._lock.release_write()

    def user_model_ids(self, user_id):
        self._lock.acquire_read()
        try:
            try:
                return self._user_models[user_id]
            except KeyError:
                return set()
        finally:
            self._lock.release_read()

    def get(self, model_id):
        self._lock.acquire_read()
        try:
            mm = self._model_managers.get(model_id)
        finally:
            self._lock.release_read()
        return mm

    def get_or_load(self, model_id):
        mm = self.get(model_id)
        if not mm:
            mm = self._load(model_id)
        return mm

    def connect(self, model_id, user_id, socket):
        try:
            mm = self.get_or_load(model_id)
        except ModelNotFound:
            mm = self._create(model_id, user_id)

        mm.add_user(user_id, socket)
        self.bind_user_to_model(user_id, model_id)

    def disconnect(self, model_id, user_id):
        mm = self.get(model_id)
        if not mm:
            return False

        removed = mm.remove_user(user_id)
        if removed:
            self.unbind_user_from_model(user_id, model_id)

            if not mm.runtime.users:
                self._remove(model_id)
                self.log('ModelManager:%s had no online users and was removed from the pool.' % model_id)

        return removed

    def change_role(self, model_id, user_id):
        mm = self.get(model_id)
        if not mm:
            return False
        return mm.change_role(user_id)

    def disconnect_all(self, user_id):
        for x in range(50):
            model_ids = set(self.user_model_ids(user_id))
            if not model_ids:
                self.log('User %s disconnected from all models.' % user_id)
                break
            for model_id in model_ids:
                self.disconnect(model_id, user_id)
        else:
            raise Exception('User still has not been disconnected from all its models after 50 tries.')


    def delete_model(self, model_id):
        model_info = facade_rpc('delete_model', model_id)
        try:
            mm = self.get_or_load(model_id)
        except ModelNotFound:
            pass
        else:
            for x in range(50):
                user_ids = list(mm.runtime.users.keys())
                if not user_ids:
                    break
                for user_id in user_ids:
                    mm.remove_user()
                    self.unbind_user_from_model(user_id, model_id)
            else:
                raise Exception('Model users still has not been disconnected from all its models after 50 tries.')

            mm.delete()
            self._remove(model_id)
            self.log('ModelManager:%s removed model and was removed from pool.' % model_id)

        return model_info


    def model_ids(self):
        self._lock.acquire_read()
        try:
            return self._model_managers.keys()
        finally:
            self._lock.release_read()

    def log(self, message):
        self.app.logger.info("[Pool] %s" % message)


