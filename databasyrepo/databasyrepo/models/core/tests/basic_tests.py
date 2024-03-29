import json
from unittest import TestCase
from databasyrepo.models.core.models import Model
from databasyrepo.models.core.reprs import Canvas
from databasyrepo.models.core.serializing import deserialize
from databasyrepo.models.register import register

__author__ = 'Marboni'

class BasicTest(TestCase):
    def test_register(self):
        model_class = register.by_key(Model.code())
        self.assertEqual(Model, model_class)

        with self.assertRaises(ValueError):
            register.by_key('non.existent.class')
        with self.assertRaises(ValueError):
            register.by_key(Model.code(), Canvas)

    def test_serialization(self):
        model = Model.create(1L, 1L)
        serialized_model = json.dumps(model)
        deserialized_model = deserialize(serialized_model)

        self.assertEqual(model, deserialized_model)
