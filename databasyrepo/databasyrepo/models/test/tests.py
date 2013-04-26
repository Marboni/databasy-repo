import time
from databasyrepo.models.core import serializing
from databasyrepo.models.core.actions import Set
from databasyrepo.models.core.commands import CreateTable, RenameTable, Undo, Redo
from databasyrepo.models.core.errors import Conflict, IllegalCommand
from databasyrepo.models.core.models import Model, RevisionStack
from databasyrepo.models.core.checkers import Error
from databasyrepo.models.core.nodes import NodeRef
from databasyrepo.models.core.reprs import Canvas
from databasyrepo.models.manager import ModelManager
from databasyrepo.models.pool import create_pool
from databasyrepo.models.postgres.models import PostgresModel
from databasyrepo.models.test.commands import ChangeFirstName, ChangeLastName
from databasyrepo.models.test.models import TestModel
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'

class ModelsTests(ODMTest):
    def setUp(self):
        super(ModelsTests, self).setUp()
        self.pool = create_pool()

    def tearDown(self):
        super(ModelsTests, self).tearDown()
        self.pool.close()

    MODEL_ID = 1L
    USER_ID = 10L

    def ver(self):
        return self.pool._get(self.MODEL_ID, self.USER_ID)._model.version

    def create_model(self):
        self.pool.create(TestModel.serial_code(), self.MODEL_ID, self.USER_ID)
        return self.model()

    def model(self):
        return self.pool._model_managers.get(self.MODEL_ID)._model

    def execute_command(self, command, user_id=None):
        user_id = user_id or self.USER_ID
        self.pool.execute_command(self.MODEL_ID, command, user_id)

    def test_serialization(self):
        initial_model = self.create_model()

        self.execute_command(ChangeFirstName(first_name='John', source_version=self.ver()))

        serialized_model = self.mgdb.models.find_one({'_id': initial_model['_id']})
        deserialized_model = serializing.deserialize(serialized_model)

        self.assertEqual(initial_model, deserialized_model)

    def test_pool(self):
        self.create_model()

        self.execute_command(ChangeFirstName(first_name='John', source_version=self.ver()))

        self.pool.remove_lru_periodically(0.1)

        self.pool.diff(self.MODEL_ID, self.ver(), self.USER_ID)
        self.assertTrue(self.MODEL_ID in self.pool._model_managers)

        time.sleep(0.3)
        self.assertFalse(self.MODEL_ID in self.pool._model_managers)

    def test_diff(self):
        self.create_model()

        for index in range(RevisionStack.MAX_REVISIONS_SIZE + 10):
            # John's name suffix is equal to version of changes.
            command = ChangeFirstName(first_name='John-%s' % (self.ver() + 1), source_version=self.ver())
            self.execute_command(command)

        model = self.model()
        self.assertEqual((model.version, Model.NO_DIFF, None), self.pool.diff(self.MODEL_ID, model.version, self.USER_ID))
        self.assertEqual((model.version, Model.RELOAD, model.serialize_for_client()), self.pool.diff(self.MODEL_ID, 1, self.USER_ID))

        diff = self.pool.diff(self.MODEL_ID, model.version - 2, self.USER_ID)
        self.assertEqual(model.version, diff[0])
        self.assertEqual(Model.DIFF, diff[1])
        last_revision_diff = diff[2]

        self.assertEqual(2, len(last_revision_diff))
        set_name_pre_last, set_name_last = last_revision_diff

        self.assertTrue(isinstance(set_name_pre_last, Set))
        self.assertEqual(set_name_pre_last.val('field'), 'first_name')
        self.assertEqual(set_name_pre_last.val('value'), 'John-%s' % (self.ver() - 1))

        self.assertTrue(isinstance(set_name_last, Set))
        self.assertEqual(set_name_last.val('field'), 'first_name')
        self.assertEqual(set_name_last.val('value'), 'John-%s' % self.ver())


    def test_copy(self):
        self.create_model()
        command = ChangeFirstName(first_name='John', source_version=self.ver())
        self.execute_command(command)

        model = self.model()
        self.assertEqual(model.copy(), model)
        self.assertEqual(model.serialize_for_client(),
            dict((k, model[k]) for k in model.keys() if k not in model.server_only_fields()))


    def test_undo_redo(self):
        self.create_model()

        command = ChangeFirstName(first_name='John-2', source_version=self.ver())
        self.execute_command(command)

        command = ChangeFirstName(first_name='John-3', source_version=self.ver())
        self.execute_command(command)
        model_v3 = self.model().copy()

        self.execute_command(Undo(source_version=self.ver()))
        self.execute_command(Undo(source_version=self.ver()))
        self.execute_command(Redo(source_version=self.ver()))

        model_v7 = self.model()

        self.assertEqual(model_v3['nodes'], model_v7['nodes'])

    def test_active_users(self):
        user_1 = self.USER_ID
        user_2 = 20L
        user_3 = 30L

        ModelManager.USER_ACTIVITY_TIME = 0.1

        self.create_model()

        self.pool.diff(self.MODEL_ID, 1, user_2)
        self.pool.diff(self.MODEL_ID, 1, user_3)
        active_users = self.pool.active_users(self.MODEL_ID, user_1)
        self.assertEquals({user_1, user_2, user_3}, active_users)

        time.sleep(0.3)
        self.pool.diff(self.MODEL_ID, 1, user_2)
        active_users = self.pool.active_users(self.MODEL_ID, user_1)
        self.assertEquals({user_1, user_2}, active_users)

    def test_ref(self):
        model = self.create_model()

        canvas_ref = model.val('canvases')[0]
        self.assertEqual(canvas_ref['_type'], NodeRef.serial_code())
        self.assertEqual(canvas_ref['ref_type'], Canvas.serial_code())
        try:
            model.node(canvas_ref.ref_id, Canvas)
        except ValueError, e:
            self.fail('Unable to find referenced column: %s' % e.message())

    def test_remove_model_after_error(self):
        self.create_model()

        # Emulating error during command execution.
        def execute_command(self, serialized_command, user_id):
            raise Exception('!!!')

        mm = self.pool._model_managers[self.MODEL_ID]
        mm.execute_command = execute_command

        undo_cmd = Undo()

        self.assertRaises(Exception, self.pool.execute_command, self.MODEL_ID, undo_cmd, self.USER_ID)
        self.assertIsNone(self.pool._model_managers.get(self.MODEL_ID))

    def _test_errors(self, model, count):
        self.assertEqual(count, len(model.val('errors')))
        self.assertEqual(count, sum(isinstance(node, Error) for node in model.val('nodes')))

    def test_checks(self):
        model = self.create_model()
        canvas_id = model.val('canvases')[0].ref_id

        self.execute_command(CreateTable(name='Table', position=[10, 10], canvas_id=canvas_id, source_version=self.ver()))
        self._test_errors(model, 0)

        # Two tables with equal names.
        self.execute_command(CreateTable(name='Table', position=[20, 20], canvas_id=canvas_id, source_version=self.ver()))
        self._test_errors(model, 2)

        # Three tables with equal names.
        self.execute_command(CreateTable(name='Table', position=[30, 30], canvas_id=canvas_id, source_version=self.ver()))
        self._test_errors(model, 3)

        # One table renamed to different name, two tables have equal names.
        tables = model.val_as_node('tables', model)
        self.execute_command(RenameTable(table_id=tables[0].id, name='AnotherTable', source_version=self.ver()))
        self._test_errors(model, 2)

        # Second table renamed, but its name became equal to another table.
        self.execute_command(RenameTable(table_id=tables[1].id, name='AnotherTable', source_version=self.ver()))
        self._test_errors(model, 2)

        # All tables have different names.
        self.execute_command(RenameTable(table_id=tables[1].id, name='AbsolutelyAnotherTable', source_version=self.ver()))
        self._test_errors(model, 0)

    def test_conflicts(self):
        user_1 = self.USER_ID
        user_2 = 20L

        self.create_model()

        # During user_1 changed first name, user_2 changed last name. Independent changes, conflict shouldn't occur.
        version = self.ver()
        self.execute_command(ChangeFirstName(first_name='John', source_version=version), user_id=user_1)
        try:
            self.execute_command(ChangeLastName(last_name='Lennon', source_version=version), user_id=user_2)
        except Conflict, e:
            self.fail('Conflict on independent changes: %s.' % e.message)

        # During user_1 edited first_name, user_2 changed the same first name. Conflict.
        version = self.ver()
        self.execute_command(ChangeFirstName(first_name='Jack', source_version=version), user_id=user_1)
        with self.assertRaises(Conflict):
            self.execute_command(ChangeFirstName(first_name='Justin', source_version=version), user_id=user_2)

        # Undo and redo require current version. Conflict.
        with self.assertRaises(Conflict):
            self.execute_command(Undo(source_version=self.ver() - 1))
        with self.assertRaises(Conflict):
            self.execute_command(Redo(source_version=self.ver() - 1))

        # User tries to update from ooold version.
        for t in range(1, RevisionStack.MAX_REVISIONS_SIZE + 1):
            command = ChangeFirstName(first_name='John-%s' % (self.ver() + 1), source_version=self.ver())
            self.execute_command(command)
        with self.assertRaises(Conflict):
            command = ChangeFirstName(first_name='Joseph', source_version=1)
            self.execute_command(command)

    def test_validate_command_type(self):
        self.pool.create(PostgresModel.serial_code(), self.MODEL_ID, self.USER_ID)
        with self.assertRaises(IllegalCommand):
            self.execute_command(ChangeFirstName(first_name='John', source_version=1), user_id=self.USER_ID)

