from flask import json
from databasyrepo.mg import connect
from databasyrepo.models.core.commands import CreateTable
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

    default_canvas = model.val_as_node('canvases', model)[0]
    model.execute_command(CreateTable(
        name='Table',
        canvas_id=default_canvas.id,
        position=[10, 10],
        source_version=model.version
    ), user_id)

    serialized = conn.models.find_one()
    deserialized_model = deserialize(serialized)

    with open('/Users/Marboni/tmp/dm.json', 'w+') as dm:
        print >> dm, json.dumps(deserialized_model, indent=4)

    with open('/Users/Marboni/tmp/m.json', 'w+') as dm:
        print >> dm, json.dumps(model, indent=4)

    assert deserialized_model == model