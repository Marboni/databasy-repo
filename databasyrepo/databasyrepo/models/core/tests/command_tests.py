from uuid import uuid4
from databasyrepo.mg import mg
from databasyrepo.models.core.commands import *
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

def create_table(model):
    canvas = default_canvas(model)
    table_id = str(uuid4())
    table_repr_id = str(uuid4())

    execute_command(model, CreateTable,
        table_id=table_id,
        default_table_repr_id=table_repr_id,
        name='Table',
        canvas_id=canvas.id,
        position = [1, 2]
    )

    return model.node(table_id)

def create_column(model, table):
    column_id = str(uuid4())

    execute_command(model, CreateColumn,
        table_id=table.id,
        column_id=column_id,
        name='Column',
        index=table.items_count('columns')
    )

    return model.node(column_id)

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
    def test_undo_redo(self):
        model = create_model()
        # v1 - Empty model.
        canvas = default_canvas(model)

        nodes_v1 = model.copy().val('nodes')

        execute_command(model, CreateTable,
            table_id = str(uuid4()),
            default_table_repr_id = str(uuid4()),
            name='Table',
            canvas_id=canvas.id,
            position = [1, 2]
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

    def test_create_table(self):
        model = create_model()
        canvas = default_canvas(model)

        execute_command(model, CreateTable,
            table_id = str(uuid4()),
            default_table_repr_id = str(uuid4()),
            name='Table',
            canvas_id=canvas.id,
            position = [1, 2]
        )

        table = query_node(model, _code=Table.code(), name='Table', columns=[])
        self.assertIsNotNone(table)
        self.assertTrue(table.ref() in model.val('tables'))

        table_repr = query_node(model, _code=TableRepr.code(), table=table.ref(), position=[1, 2])
        self.assertTrue(table_repr.ref() in canvas.val('reprs'))


    def test_rename_table(self):
        model = create_model()
        table = create_table(model)

        new_name = 'NewName'
        execute_command(model, RenameTable,
            table_id = table.id,
            new_name=new_name
        )
        self.assertEqual(new_name, table.val('name'))

    def test_delete_table(self):
        model = create_model()
        canvas = default_canvas(model)

        table_id = str(uuid4())
        table_repr_id = str(uuid4())

        execute_command(model, CreateTable,
            table_id=table_id,
            default_table_repr_id=table_repr_id,
            name='Table',
            canvas_id=canvas.id,
            position = [1, 2]
        )

        self.assertTrue(model.exists(table_id))
        self.assertTrue(model.exists(table_repr_id))
        self.assertEqual(1, len(canvas.val('reprs')))

        execute_command(model, DeleteTable,
            table_id=table_id
        )

        self.assertFalse(model.exists(table_id))
        self.assertFalse(model.exists(table_repr_id))
        self.assertEqual(0, len(canvas.val('reprs')))

    def test_create_column(self):
        model = create_model()
        table = create_table(model)
        table_id = table.id

        column_1_id = str(uuid4())
        column_2_id = str(uuid4())
        column_3_id = str(uuid4())

        execute_command(model, CreateColumn,
            table_id=table_id,
            column_id=column_2_id,
            name='Column2',
            index=0
        )

        execute_command(model, CreateColumn,
            table_id=table_id,
            column_id=column_1_id,
            name='Column1',
            index=0
        )

        execute_command(model, CreateColumn,
            table_id=table_id,
            column_id=column_3_id,
            name='Column3',
            index=2
        )

        column1 = query_node(model, _id=column_1_id, _code=Column.code(), table=table.ref(), name='Column1')
        self.assertIsNotNone(column1)
        column2 = query_node(model, _id=column_2_id, _code=Column.code(), table=table.ref(), name='Column2')
        self.assertIsNotNone(column2)
        column3 = query_node(model, _id=column_3_id, _code=Column.code(), table=table.ref(), name='Column3')
        self.assertIsNotNone(column3)

        columns = table.val('columns')
        self.assertEqual(3, len(columns))
        self.assertEqual(columns[0], column1.ref())
        self.assertEqual(columns[1], column2.ref())
        self.assertEqual(columns[2], column3.ref())

        with self.assertRaises(IllegalCommand):
            execute_command(model, CreateColumn,
                table_id=table_id,
                column_id=str(uuid4()),
                name='OutOfBoundsColumn',
                index=4
            )

    def test_rename_column(self):
        model = create_model()
        table = create_table(model)
        column = create_column(model, table)

        execute_command(model, RenameColumn,
            column_id=column.id,
            new_name='NewName',
        )

        self.assertEqual('NewName', column.val('name'))

    def test_delete_column(self):
        model = create_model()
        table = create_table(model)
        column = create_column(model, table)

        execute_command(model, DeleteColumn,
            column_id=column.id,
        )

        self.assertEqual(0, table.items_count('columns'))
        self.assertFalse(model.exists(column.id))


    def test_create_table_repr(self):
        model = create_model()
        canvas = default_canvas(model)

        table_id = str(uuid4())
        table_repr_id = str(uuid4())

        # Can't create table without repr, so creating table, then removing repr to initialize test.
        execute_command(model, CreateTable,
            table_id=table_id,
            default_table_repr_id=table_repr_id,
            name='Table',
            canvas_id=canvas.id,
            position = [1, 2]
        )

        execute_command(model, DeleteTableRepr,
            table_repr_id=table_repr_id
        )

        reprs = canvas.val_as_node('reprs', model)
        self.assertEqual(0, len(reprs))

        table_repr_id = str(uuid4())
        execute_command(model, CreateTableRepr,
            table_repr_id=table_repr_id,
            canvas_id=canvas.id,
            table_id=table_id,
            position = [10, 20]
        )
        
        table_repr = model.node(table_repr_id, TableRepr)
        self.assertEqual(table_id, table_repr.val_as_node('table', model).id)
        self.assertEqual(table_repr.val('position'), [10, 20])

        reprs = canvas.val_as_node('reprs', model)
        self.assertEqual(1, len(reprs))
        self.assertEqual(table_repr_id, reprs[0].id)

        with self.assertRaises(IllegalCommand):
            # Creating another representation of the same table on the same canvas causes an error.
            execute_command(model, CreateTableRepr,
                table_repr_id=str(uuid4()),
                canvas_id=canvas.id,
                table_id=table_id,
                position = [100, 200]
            )
        

    def test_update_table_repr(self):
        model = create_model()
        canvas = default_canvas(model)

        execute_command(model, CreateTable,
            table_id = str(uuid4()),
            default_table_repr_id = str(uuid4()),
            name='Table',
            canvas_id=canvas.id,
            position = [1, 2]
        )

        table_repr = query_node(model, _code=TableRepr.code())
        execute_command(model, UpdateTableRepr,
            table_repr_id=table_repr.id,
            fields=['position'],
            position=[10, 20]
        )
        self.assertEqual([10, 20], table_repr.val('position'))


    def test_delete_table_repr(self):
        model = create_model()
        canvas = default_canvas(model)

        table_id = str(uuid4())
        table_repr_id = str(uuid4())

        execute_command(model, CreateTable,
            table_id=table_id,
            default_table_repr_id=table_repr_id,
            name='Table',
            canvas_id=canvas.id,
            position = [1, 2]
        )

        self.assertTrue(model.exists(table_repr_id))
        reprs = canvas.val_as_node('reprs', model)
        self.assertEqual(1, len(reprs))
        self.assertEqual(table_repr_id, reprs[0].id)

        execute_command(model, DeleteTableRepr,
            table_repr_id=table_repr_id
        )

        reprs = canvas.val_as_node('reprs', model)
        self.assertEqual(0, len(reprs))
        self.assertFalse(model.exists(table_repr_id))