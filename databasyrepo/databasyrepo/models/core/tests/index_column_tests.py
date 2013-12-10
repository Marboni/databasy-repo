from databasyrepo.models.core.tests.utils import *
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'


class IndexColumnTest(ODMTest):
    def test_create(self):
        model = create_model()
        table = create_table(model)
        column = create_column(model, table, 'col1')
        index = create_index(model, table, 'idx', 'INDEX')

        index_column_id = str(uuid4())
        execute_command(model, CreateIndexColumn,
                        index_column_id=index_column_id,
                        index_id=index.id,
                        column_id=column.id,
                        order='ASC')

        with self.assertRaises(IllegalCommand):
            execute_command(model, CreateIndexColumn,
                            index_column_id=index_column_id,
                            index_id=index.id,
                            column_id=column.id,
                            order='UNKNOWN'
            )

        index_column = model.node(index_column_id)
        self.assertEqual(index.ref(), index_column.val('index'))
        self.assertEqual(column.ref(), index_column.val('column'))
        self.assertEqual('ASC', index_column.val('order'))

    def test_update(self):
        model = create_model()
        table = create_table(model)
        column1 = create_column(model, table, 'col1')
        column2 = create_column(model, table, 'col2')
        index = create_index(model, table, 'idx', 'INDEX')

        index_column = create_index_column(model, index, column1)

        execute_command(model, UpdateIndexColumn,
                        index_column_id=index_column.id,
                        fields=['column', 'order'],
                        column=column2.ref(),
                        order='DESC'
        )

        with self.assertRaises(IllegalCommand):
            non_existent_column = Column()
            execute_command(model, UpdateIndexColumn,
                            index_column_id=index_column.id,
                            fields=['column', 'order'],
                            column=non_existent_column.ref(),
                            order='DESC'
            )

        self.assertEqual(column2.ref(), index_column.val('column'))
        self.assertEqual('DESC', index_column.val('order'))

    def test_delete(self):
        model = create_model()
        table = create_table(model)
        column = create_column(model, table, 'col')
        index = create_index(model, table, 'idx', 'INDEX')
        index_column = create_index_column(model, index, column)

        execute_command(model, DeleteIndexColumn, index_column_id=index_column.id)

        self.assertEqual(0, len(index.val('index_columns')))
        self.assertFalse(model.exists(index_column.id))

    def test_affect(self):
        model = create_model()
        table = create_table(model)
        column = create_column(model, table, 'col')

        # Removing index
        index = create_index(model, table, 'idx', 'INDEX')
        index_column = create_index_column(model, index, column)

        execute_command(model, DeleteIndex,
                        index_id=index.id,
        )

        self.assertFalse(model.exists(index_column.id))

        # Removing column
        index = create_index(model, table, 'idx', 'INDEX')
        index_column = create_index_column(model, index, column)

        execute_command(model, DeleteColumn, column_id=column.id)

        self.assertFalse(model.exists(index_column.id))

