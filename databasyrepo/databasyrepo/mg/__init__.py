from databasyrepo.mg.engine import connect, recreatedb, clean_collections

__author__ = 'Marboni'

_db = None
mg = lambda: _db # Initializes when application starts.

def init_engine(uri, db_name):
    global _db
    _db = connect(uri, db_name)