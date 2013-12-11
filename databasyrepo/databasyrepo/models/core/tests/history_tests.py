from databasyrepo.models.core.tests.utils import *
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'


class HistoryTest(ODMTest):
    def test_undo_redo(self):
        model = create_model()

        # v1 - Empty model.
        nodes_v1 = model.copy().val('nodes')

        create_table(model)

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