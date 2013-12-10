from databasyrepo.models.core.tests.utils import *
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'


class ColumnTest(ODMTest):
    def test_create(self):
        model = create_model()
        table = create_table(model)
        table_id = table.id

        column_1_id = str(uuid4())
        column_2_id = str(uuid4())
        column_3_id = str(uuid4())

        column_type = 'VARCHAR'

        execute_command(model, CreateColumn,
                        table_id=table_id,
                        column_id=column_2_id,
                        type=column_type,
                        name='Column2',
                        position=0
        )

        execute_command(model, CreateColumn,
                        table_id=table_id,
                        column_id=column_1_id,
                        type=column_type,
                        name='Column1',
                        position=0
        )

        execute_command(model, CreateColumn,
                        table_id=table_id,
                        column_id=column_3_id,
                        type=column_type,
                        name='Column3',
                        position=2
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
                            type=column_type,
                            position=4
            )


    def test_update(self):
        model = create_model()
        table = create_table(model)
        column = create_column(model, table)

        self.assertTrue(column.val('null'))
        self.assertIsNone(column.val('default'))

        execute_command(model, UpdateColumn,
                        column_id=column.id,
                        fields=['name', 'type', 'null', 'default'],
                        name='NewName',
                        type='INT',
                        null=True,
                        default='1'
        )

        self.assertEqual('NewName', column.val('name'))
        self.assertEqual('INT', column.val('type'))
        self.assertTrue(column.val('null'))
        self.assertEqual('1', column.val('default'))


    def test_delete(self):
        model = create_model()
        table = create_table(model)
        column = create_column(model, table)

        execute_command(model, DeleteColumn, column_id=column.id)

        self.assertEqual(0, table.items_count('columns'))
        self.assertFalse(model.exists(column.id))

    def test_impact(self):
        model = create_model()
        table = create_table(model)
        column = create_column(model, table)

        # Removing of table unregisters columns.
        execute_command(model, DeleteTable,
                        table_id=table.id
        )
        self.assertFalse(model.exists(column.id))
