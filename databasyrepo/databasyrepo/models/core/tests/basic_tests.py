import json
from unittest import TestCase
from databasyrepo.models.core.models import Model
from databasyrepo.models.core.reprs import Canvas
from databasyrepo.models.core.serializing import deserialize
from databasyrepo.models.register import register

__author__ = 'Marboni'

class BasicTests(TestCase):
    def test_register(self):
        model_class = register.get(Model.code())
        self.assertEqual(Model, model_class)

        with self.assertRaises(ValueError):
            register.get('non.existent.class')
        with self.assertRaises(ValueError):
            register.get(Model.code(), Canvas)

    def test_serialization(self):
        model = Model.create(1L, 1L)
        serialized_model = json.dumps(model)
        deserialized_model = deserialize(serialized_model)

        self.assertEqual(model, deserialized_model)
