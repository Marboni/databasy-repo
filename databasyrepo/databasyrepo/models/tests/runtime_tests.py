from unittest import TestCase
from databasyrepo.models.manager import Runtime

__author__ = 'Marboni'

class RuntimeTest(TestCase):
    def setUp(self):
        super(RuntimeTest, self).setUp()
        self.runtime = Runtime()

    def test_add_user(self):
        self.runtime.add_user(1L, 'S1')
        self.assertEqual('S1', self.runtime.user_socket(1L))

        user_info = self.runtime.users.get(1L)
        user_info.active = False

        self.runtime.add_user(1L, 'S11')
        self.assertEqual('S11', self.runtime.user_socket(1L))
        self.assertFalse(user_info.active) # Same user info left, only socket changed.

    def test_applicant(self):
        self.runtime.add_user(1L, 'S1')

        self.runtime.add_applicant(1L)
        self.runtime.remove_applicant(1L)
        self.assertFalse(self.runtime.applicants)

        self.runtime.add_applicant(1L)
        self.runtime.remove_user(1L)
        self.assertFalse(self.runtime.users)
        self.assertFalse(self.runtime.applicants)

    def test_editor(self):
        self.runtime.add_user(1L, 'S1')
        self.runtime.add_user(2L, 'S2')
        self.runtime.add_user(3L, 'S3')

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
        self.runtime.add_user(1L, 'S1')
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



