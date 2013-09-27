from unittest import TestCase
import time
from flask import current_app
from databasyrepo.models.manager import Runtime, ModelManager
from databasyrepo.models.pool import ModelsPool

__author__ = 'Marboni'

class RuntimeTest(TestCase):
    def setUp(self):
        super(RuntimeTest, self).setUp()
        self.runtime = Runtime()

    def _create_user(self, id):
        from databasyrepo.auth import UserInfo
        return UserInfo({
            'user_id': id,
            'username': 'Marboni',
            'email': 'marboni@example.com',
            'active': True
        })

    def test_add_user(self):
        self.runtime.add_user(self._create_user(1L), 'S1')
        self.assertEqual('S1', self.runtime.user_socket(1L))

        user_info = self.runtime.users.get(1L)
        user_info.active = False

        self.runtime.add_user(self._create_user(1L), 'S11')
        self.assertEqual('S11', self.runtime.user_socket(1L))
        self.assertFalse(user_info.active) # Same user info left, only socket changed.

    def test_applicant(self):
        self.runtime.add_user(self._create_user(1L), 'S1')

        self.runtime.add_applicant(1L)
        self.runtime.remove_applicant(1L)
        self.assertFalse(self.runtime.applicants)

        self.runtime.add_applicant(1L)
        self.runtime.remove_user(1L)
        self.assertFalse(self.runtime.users)
        self.assertFalse(self.runtime.applicants)

    def test_editor(self):
        self.runtime.add_user(self._create_user(1L), 'S1')
        self.runtime.add_user(self._create_user(2L), 'S2')
        self.runtime.add_user(self._create_user(3L), 'S3')

        self.runtime.pass_control(None, 1L)
        self.assertEqual(1L, self.runtime.editor)

        self.runtime.add_applicant(2L)

        with self.assertRaises(ValueError):
            self.runtime.pass_control(3L, 2L)

        self.assertFalse(self.runtime.pass_control(None, 2L))
        self.assertTrue(self.runtime.pass_control(1L, 2L))
        self.assertEqual(2L, self.runtime.editor)
        self.assertFalse(self.runtime.applicants)

        self.assertTrue(self.runtime.pass_control(2L, None))

        self.assertFalse(self.runtime.editor)

    def test_activity(self):
        self.runtime.add_user(self._create_user(1L), 'S1')
        user_info = self.runtime.users[1L]

        user_info.active = False
        user_info.last_online = None
        user_info.last_activity = None

        self.runtime.update_activity(1L, False)
        self.assertIsNotNone(user_info.last_online)
        self.assertIsNone(user_info.last_activity)

        self.runtime.update_activity(1L, True)
        self.assertIsNotNone(user_info.last_online)
        self.assertIsNotNone(user_info.last_online)
        self.assertTrue(user_info.active)

    def _MM(self):
        mm = ModelManager(None, None)

        mm.runtime_emitted = False
        mm.runtime = Runtime()
        mm.log = lambda message: None

        mm.ONLINE_TIMEOUT = 0.3
        mm.ACTIVE_TIMEOUT = 0.2
        mm.ONLINE_STATUS_CHECK_PERIOD = 0.05

        def emit_runtime_stub():
            mm.runtime_emitted = True
        mm.emit_runtime = emit_runtime_stub

        def disconnect(model_id, user_id):
            mm.runtime.remove_user(user_id)
            mm.runtime_emitted = True

        mm.pool = ModelsPool(current_app)
        mm.pool.disconnect = disconnect

        return mm

    #noinspection PyUnresolvedReferences
    def test_update_users_activity(self):
        # Disconnect by timeout
        mm = self._MM()
        mm.runtime.add_user(self._create_user(1L), 'S1')
        self.assertTrue(mm.runtime.is_online(1L))
        time.sleep(0.35)
        mm.update_users_activity()
        self.assertFalse(mm.runtime.is_online(1L))
        self.assertTrue(mm.runtime_emitted)

        # Passing control from inactive editor to applicant.
        mm = self._MM()
        mm.runtime.add_user(self._create_user(1L), 'S1')
        mm.runtime.add_user(self._create_user(2L), 'S2')

        mm.runtime.pass_control(None, 1L)
        mm.runtime.add_applicant(2L)

        self.assertTrue(mm.runtime.is_editor(1L))
        self.assertTrue(mm.runtime.is_applicant(2L))

        time.sleep(0.25)
        mm.update_users_activity()

        self.assertTrue(mm.runtime.is_online(1L))
        self.assertTrue(mm.runtime.is_online(2L))

        self.assertFalse(mm.runtime.is_editor(1L))
        self.assertTrue(mm.runtime.is_editor(2L))

        self.assertFalse(mm.runtime.applicants)

        self.assertTrue(mm.runtime_emitted)

        # Editor is inactive, but nobody requests control.
        mm = self._MM()
        mm.runtime.add_user(self._create_user(1L), 'S1')
        mm.runtime.add_user(self._create_user(2L), 'S2')

        mm.runtime.pass_control(None, 1L)

        self.assertTrue(mm.runtime.users[1L].active)
        self.assertTrue(mm.runtime.is_editor(1L))

        time.sleep(0.25)
        mm.update_users_activity()

        self.assertFalse(mm.runtime.users[1L].active)
        self.assertTrue(mm.runtime.is_editor(1L))






