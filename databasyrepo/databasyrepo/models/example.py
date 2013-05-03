from flask import json
from databasyrepo.mg import connect
from databasyrepo.models.core.serializing import deserialize
from databasyrepo.models.postgres.models import PostgresModel

__author__ = 'Marboni'

if __name__ == '__main__':
    conn = connect('mongodb://localhost', 'testing')
    conn.models.remove()

    user_id = 1L
    model = PostgresModel.create(1L, user_id)
    model.inject_connection(conn)
    model.save()

    serialized = conn.models.find_one()
    deserialized_model = deserialize(serialized)

    with open('/Users/Marboni/tmp/dm.json', 'w+') as dm:
        print >> dm, json.dumps(deserialized_model, indent=4)

    with open('/Users/Marboni/tmp/m.json', 'w+') as dm:
        print >> dm, json.dumps(model, indent=4)

    assert deserialized_model == model