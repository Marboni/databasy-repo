from uuid import uuid4
from databasyrepo.mg import mg
from databasyrepo.models.core.commands import *
from databasyrepo.models.core.models import Model

__author__ = 'Marboni'

USER_ID = 1L
MODEL_ID = 1L

def execute_command(model, command_cls, **kwargs):
    if not kwargs.has_key('source_version'):
        kwargs['source_version'] = model.version
    model.execute_command(command_cls(**kwargs), USER_ID)


def default_canvas(model):
    return model.val_as_node('canvases', model)[0]


def query_node(model, **kwargs):
    for node in model.val('nodes'):
        for field in kwargs:
            if not node.has_key(field):
                break
            value = node.get(field)
            if value != kwargs[field]:
                break
        else:
            return node
    return None

def create_model():
    model = Model.create(MODEL_ID, USER_ID)
    model.inject_connection(mg())
    return model


def create_table(model):
    canvas = default_canvas(model)
    table_id = str(uuid4())
    table_repr_id = str(uuid4())

    execute_command(model, CreateTable,
        table_id=table_id,
        default_table_repr_id=table_repr_id,
        name='Table',
        canvas_id=canvas.id,
        position=[1, 2]
    )

    return model.node(table_id)


def create_column(model, table, name='Column'):
    column_id = str(uuid4())

    execute_command(model, CreateColumn,
        table_id=table.id,
        column_id=column_id,
        name=name,
        type='VARCHAR',
        position=table.items_count('columns')
    )

    return model.node(column_id)

def create_index(model, table, name, type):
    index_id = str(uuid4())

    execute_command(model, CreateIndex,
        table_id=table.id,
        index_id=index_id,
        name=name,
        type=type
    )

    return model.node(index_id)

def create_index_column(model, index, column, order='ASC'):
    index_column_id = str(uuid4())

    execute_command(model, CreateIndexColumn,
        index_column_id=index_column_id,
        index_id=index.id,
        column_id=column.id,
        order=order
    )

    return model.node(index_column_id)
