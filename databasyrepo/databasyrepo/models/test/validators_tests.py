from databasyrepo.models.core.commands import CreateTable
from databasyrepo.models.core.elements import Column, Table
from databasyrepo.models.core.validators import *
from databasyrepo.models.core.reprs import Canvas
from databasyrepo.models.postgres.models import PostgresModel
from databasyrepo.models.test.models import TestModel
from databasyrepo.testing import ODMTest

__author__ = 'Marboni'

class ValidatorsTest(ODMTest):
    def test_node_class(self):
        model_id = 1L
        user_id = 10L

        model = TestModel.create(model_id, user_id)
        canvas = model.val_as_node('canvases', model)[0]

        validator = NodeClass(model, Canvas)
        try:
            validator('canvas_id', {'canvas_id': canvas.id})
        except InvalidStateError:
            self.fail('NodeClass validator raise InvalidStateError on correct type.')

        validator = NodeClass(model, Table)
        with self.assertRaises(InvalidStateError):
            validator('table_id', {'table_id': canvas.id})