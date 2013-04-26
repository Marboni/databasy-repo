import inspect
import os
from flask.ext.testing import TestCase
from databasyrepo.config import config_by_mode
from databasyrepo.mg import connect
from databasyrepo import app, mg

__author__ = 'Marboni'

config = config_by_mode('testing')

class ODMTest(TestCase):
    def create_app(self):
        os.environ['ODM_API_ENV'] = 'testing'
        return app.create_app()

    @classmethod
    def setUpClass(cls):
        mg.recreatedb(config.MONGO_URI, config.MONGO_DATABASE_NAME)

    def setUp(self):
        self.mgdb = connect(config.MONGO_URI, config.MONGO_DATABASE_NAME)

    def tearDown(self):
        mg.clean_collections(self.mgdb)
        self.mgdb.connection.close()

    def auth_header(self, auth_token_hex):
        return [('AUTH_TOKEN', auth_token_hex)]

class Fixtures(object):
    def __init__(self, db):
        super(Fixtures, self).__init__()
        self._db = db

    def __getattribute__(self, name):
        try:
            return super(Fixtures, self).__getattribute__(name)
        except AttributeError:
            for document_name, obj in self._db.connection._registered_documents.iteritems():
                cls = obj._obj_class
                collection = self._db[cls.__collection__]
                if collection.name == name:
                    cl = CollectionLoader(self._db, cls)
                    setattr(self, name, cl)
                    return cl
            raise ValueError('Collection %s not exists.', name)

class CollectionLoader(object):
    def __init__(self, db, cls):
        super(CollectionLoader, self).__init__()
        self._cls = getattr(db, cls.__name__)

    def __setattr__(self, name, value):
        if name != '_cls':
            obj = self._cls()
            for field_name, field_value in value.iteritems():
                obj[field_name] = field_value
            obj.save()
        super(CollectionLoader, self).__setattr__(name, value)

def load_fixtures(db, *fixtures):
    from databasyrepo.testing import Fixtures

    data = Fixtures(db)
    for fixture in fixtures:
        try:
            collection = fixture.__collection__
        except AttributeError:
            raise AttributeError('Fixture must specify __collection__ field.')
        c = getattr(data, collection)
        for inner_class in inspect.getmembers(fixture, inspect.isclass):
            name = inner_class[0]
            cls = inner_class[1]
            if name != '__class__':
                values = dict([(field_name, field_value)
                               for field_name, field_value in cls.__dict__.iteritems()
                               if not field_name.startswith('__')
                ])
                setattr(c, name, values)
    return data