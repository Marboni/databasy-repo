import json
from databasyrepo.mg import connect
from databasyrepo.models.core.commands import CreateTable, CreateColumn
from databasyrepo.models.core.serializing import deserialize, deserialize_command
from databasyrepo.models.postgres.models import PostgresModel

__author__ = 'Marboni'

if __name__ == '__main__':
    connect('mongodb://localhost', 'testing').models.remove()

    user_id = 1L
    model = PostgresModel.create(1L, user_id)

    canvas = model.val_as_node('canvases', model)[0]

    model.execute_command(deserialize_command({
        '_type': CreateTable.serial_code(),
        'canvas_id': canvas.id,
        'name': 'NewTable',
        'position': [10, 10],
        'source_version': 1,
        }), user_id)
    model.execute_command(deserialize_command({
        '_type': CreateTable.serial_code(),
        'canvas_id': canvas.id,
        'name': 'NewTable',
        'position': [20, 20],
        'source_version': 2,
        }), user_id)
    model.execute_command(deserialize_command({
        '_type': CreateTable.serial_code(),
        'canvas_id': canvas.id,
        'name': 'NewTable3',
        'position': [30, 30],
        'source_version': 3,
        }), user_id)

    table_id = model.val_as_node('tables', model)[0].id

    model.execute_command(deserialize_command({
        '_type': CreateColumn.serial_code(),
        'table_id': table_id,
        'name': 'cat_name',
        'source_version': 4,
        'datatype': 'int4',
        'nullable': True
    }), user_id)

    table = model._nodes_register[table_id]

    serialized = connect('mongodb://localhost', 'testing').models.find_one()

    deserialized_model = deserialize(serialized)

    with open('/Users/Marboni/tmp/dm.json', 'w+') as dm:
        print >> dm, json.dumps(deserialized_model, indent=4)

    with open('/Users/Marboni/tmp/m.json', 'w+') as dm:
        print >> dm, json.dumps(model, indent=4)

    assert deserialized_model == model