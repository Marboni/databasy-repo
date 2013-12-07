from databasyrepo.models.core.tests.utils import *
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'

class TableTest(ODMTest):
    def test_create(self):
        model = create_model()
        canvas = default_canvas(model)

        execute_command(model, CreateTable,
            table_id=str(uuid4()),
            default_table_repr_id=str(uuid4()),
            name='Table',
            canvas_id=canvas.id,
            position=[1, 2]
        )

        table = query_node(model, _code=Table.code(), name='Table', columns=[])
        self.assertIsNotNone(table)
        self.assertTrue(table.ref() in model.val('tables'))

        table_repr = query_node(model, _code=TableRepr.code(), table=table.ref(), position=[1, 2],
            width=TableRepr.DEFAULT_REPR_WIDTH)
        self.assertTrue(table_repr.ref() in canvas.val('reprs'))


    def test_rename(self):
        model = create_model()
        table = create_table(model)

        new_name = 'NewName'
        execute_command(model, RenameTable,
            table_id=table.id,
            new_name=new_name
        )
        self.assertEqual(new_name, table.val('name'))

    def test_delete(self):
        model = create_model()
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

        self.assertTrue(model.exists(table_id))
        self.assertTrue(model.exists(table_repr_id))
        self.assertEqual(1, len(canvas.val('reprs')))

        execute_command(model, DeleteTable,
            table_id=table_id
        )

        self.assertFalse(model.exists(table_id))
        self.assertEqual([], model.val('tables'))