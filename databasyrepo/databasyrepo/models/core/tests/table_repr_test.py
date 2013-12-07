from databasyrepo.models.core.tests.utils import *
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'

class TableReprTest(ODMTest):
    def test_create(self):
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
            position=[1, 2]
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
            position=[10, 20]
        )

        table_repr = model.node(table_repr_id, TableRepr)
        self.assertEqual(table_id, table_repr.val_as_node('table', model).id)
        self.assertEqual([10, 20], table_repr.val('position'))
        self.assertEqual(TableRepr.DEFAULT_REPR_WIDTH, table_repr.val('width'))

        reprs = canvas.val_as_node('reprs', model)
        self.assertEqual(1, len(reprs))
        self.assertEqual(table_repr_id, reprs[0].id)

        with self.assertRaises(IllegalCommand):
            # Creating another representation of the same table on the same canvas causes an error.
            execute_command(model, CreateTableRepr,
                table_repr_id=str(uuid4()),
                canvas_id=canvas.id,
                table_id=table_id,
                position=[100, 200]
            )


    def test_update(self):
        model = create_model()
        canvas = default_canvas(model)

        execute_command(model, CreateTable,
            table_id=str(uuid4()),
            default_table_repr_id=str(uuid4()),
            name='Table',
            canvas_id=canvas.id,
            position=[1, 2]
        )

        table_repr = query_node(model, _code=TableRepr.code())

        # Position
        execute_command(model, UpdateTableRepr,
            table_repr_id=table_repr.id,
            fields=['position'],
            position=[10, 20]
        )
        self.assertEqual([10, 20], table_repr.val('position'))

        # Width
        execute_command(model, UpdateTableRepr,
            table_repr_id=table_repr.id,
            fields=['width'],
            width=200
        )
        self.assertEqual(200, table_repr.val('width'))


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

    def test_impact(self):
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

        self.assertTrue(model.exists(table_repr_id))
        self.assertEqual(1, len(canvas.val('reprs')))

        # Remove repr if table removed.
        execute_command(model, DeleteTable,
            table_id=table_id
        )

        self.assertFalse(model.exists(table_repr_id))
        self.assertEqual(0, len(canvas.val('reprs')))