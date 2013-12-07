from databasyrepo.models.core.tests.utils import *
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'


class IndexTest(ODMTest):
    def test_create(self):
        model = create_model()
        table = create_table(model)

        index_id = str(uuid4())
        execute_command(model, CreateIndex,
                        table_id=table.id,
                        index_id=index_id,
                        name='pk',
                        type='PRIMARY'
        )

        index = model.node(index_id)
        self.assertEqual(table.ref(), index.val('table'))
        self.assertEqual('pk', index.val('name'))
        self.assertEqual('PRIMARY', index.val('type'))
        self.assertEqual([], index.val('index_columns'))

        with self.assertRaises(IllegalCommand):
            # Unable to create PK twice.
            execute_command(model, CreateIndex,
                            table_id=table.id,
                            index_id=index_id,
                            name='pk2',
                            type='PRIMARY'
            )

        with self.assertRaises(IllegalCommand):
            # Unable to create index of unknown type.
            execute_command(model, CreateIndex,
                            table_id=table.id,
                            index_id=index_id,
                            name='sry',
                            type='SECONDARY'
            )

        index_id = str(uuid4())
        execute_command(model, CreateIndex,
                        table_id=table.id,
                        index_id=index_id,
                        name='idx',
                        type='INDEX'
        )

        index = model.node(index_id)
        self.assertEqual(table.ref(), index.val('table'))
        self.assertEqual('idx', index.val('name'))
        self.assertEqual('INDEX', index.val('type'))
        self.assertEqual([], index.val('index_columns'))

    def test_update(self):
        model = create_model()
        table = create_table(model)
        index = create_index(model, table, 'uq', 'UNIQUE')

        execute_command(model, UpdateIndex,
                        index_id=index.id,
                        fields=['name', 'type'],
                        name='pk',
                        type='PRIMARY'
        )

        self.assertEqual('pk', index.val('name'))
        self.assertEqual('PRIMARY', index.val('type'))

        index2 = create_index(model, table, 'idx', 'INDEX')
        with self.assertRaises(IllegalCommand):
            # Unable to update index to PRIMARY type if PK exists.
            execute_command(model, UpdateIndex,
                            index_id=index2.id,
                            fields=['type'],
                            type='PRIMARY'
            )

        # But can update PRIMARY to PRIMARY.
        execute_command(model, UpdateIndex,
                        index_id=index.id,
                        fields=['name', 'type'],
                        name='pk2',
                        type='PRIMARY'
        )

    def test_delete(self):
        model = create_model()
        table = create_table(model)
        index = create_index(model, table, 'uq', 'UNIQUE')

        execute_command(model, DeleteIndex,
                        index_id=index.id,
        )

        self.assertEqual(0, table.items_count('indexes'))
        self.assertFalse(model.exists(index.id))

    def test_impact(self):
        model = create_model()
        table = create_table(model)
        index = create_index(model, table, 'idx', 'INDEX')

        execute_command(model, DeleteTable,
                        table_id=table.id
        )
        self.assertFalse(model.exists(index.id))