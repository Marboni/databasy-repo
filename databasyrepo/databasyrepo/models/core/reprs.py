from databasyrepo.models.core.elements import Table
from databasyrepo.models.core.nodes import Node

__author__ = 'Marboni'

class Canvas(Node):
    def fields(self):
        fields = super(Canvas, self).fields()
        fields.update({
            'name': basestring,
            'reprs': [Repr],
            })
        return fields

class Repr(Node):
    pass

class TableRepr(Repr):
    DEFAULT_REPR_WIDTH = 180
    MIN_REPR_WIDTH = 80

    def __init__(self, id=None):
        super(TableRepr, self).__init__(id)
        self['position'] = None

    def fields(self):
        fields = super(TableRepr, self).fields()
        fields.update({
            'table': Table,
            'position': [int],
            'width': int
        })
        return fields
