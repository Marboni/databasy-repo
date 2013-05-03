from databasyrepo.mg import mg
from databasyrepo.models.core.commands import CreateTable, Undo, Redo
from databasyrepo.models.core.elements import Table
from databasyrepo.models.core.errors import IllegalCommand
from databasyrepo.models.core.models import Model
from databasyrepo.models.core.reprs import TableRepr
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'

USER_ID = 1L
MODEL_ID = 1L

def create_model():
    model = Model.create(MODEL_ID, USER_ID)
    model.inject_connection(mg())
    return model

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

class CommandTest(ODMTest):
    def test_create_table(self):
        model = create_model()
        canvas = default_canvas(model)

        execute_command(model, CreateTable,
            name='Table',
            canvas_id=canvas.id,
            position = [1, 1]
        )

        table = query_node(model, _code=Table.code(), name='Table', columns=[])
        self.assertIsNotNone(table)
        self.assertTrue(table.ref() in model.val('tables'))

        table_repr = query_node(model, _code=TableRepr.code(), table=table.ref(), position=[1,1])
        self.assertTrue(table_repr.ref() in canvas.val('reprs'))

    def test_undo_redo(self):
        model = create_model()
        # v1 - Empty model.
        canvas = default_canvas(model)

        nodes_v1 = model.copy().val('nodes')

        execute_command(model, CreateTable,
            name='Table',
            canvas_id=canvas.id,
            position = [1, 1]
        )
        # v2 - Model with table.
        nodes_v2 = model.copy().val('nodes')

        with self.assertRaises(IllegalCommand):
            # Nothing to redo.
            execute_command(model, Redo)

        execute_command(model, Undo)
        # v3 = v1 - Empty model.
        self.assertEqual(nodes_v1, model.val('nodes'))

        with self.assertRaises(IllegalCommand):
            # Nothing to undo.
            execute_command(model, Undo)

        execute_command(model, Redo)
        # v4 = v2 - Model with table.
        self.assertEqual(nodes_v2, model.val('nodes'))