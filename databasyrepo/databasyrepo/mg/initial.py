import pymongo

__author__ = 'Marboni'

# Each collection class must have name. It can also have optional static methods initialize(collection)
# and prepopulate(collection).

class AppEvents(object):
    name = 'app_events'

    @staticmethod
    def initialize(collection):
        collection.ensure_index([
            ('event_type', pymongo.ASCENDING),
            ('added', pymongo.ASCENDING),
            ('user_id', pymongo.ASCENDING)
        ])
        collection.ensure_index('expires', expireAfterSeconds=0)


class Models(object):
    name = 'models'

    @staticmethod
    def initialize(collection):
        collection.ensure_index([
            ('model_id', pymongo.ASCENDING),
        ])
