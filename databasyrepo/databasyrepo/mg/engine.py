from pymongo import Connection
from databasyrepo.mg.initial import AppEvents, Models

__author__ = 'Marboni'

COLLECTION_CLASSES = [
    AppEvents,
    Models
]

def connect(uri, database_name):
    connection = Connection(uri, safe=True)
    if database_name not in connection.database_names():
        db = recreatedb(uri, database_name)
    else:
        db = connection[database_name]
    return db


def recreatedb(uri, database_name):
    connection = Connection(uri)
    connection.drop_database(database_name)
    db = connection[database_name]
    for cc in COLLECTION_CLASSES:
        collection = db[cc.name]
        try:
            cc.initialize(collection)
        except AttributeError:
            pass
        try:
            cc.prepopulate(collection)
        except AttributeError:
            pass
    return db

def clean_collections(db):
    for cc in COLLECTION_CLASSES:
        collection = db[cc.name]
        collection.remove({})
        try:
            cc.prepopulate(collection)
        except AttributeError:
            pass
