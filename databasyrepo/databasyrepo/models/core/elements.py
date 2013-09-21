from databasyrepo.models.core.nodes import Node

__author__ = 'Marboni'

class Table(Node):
    def fields(self):
        fields = super(Table, self).fields()
        fields.update({
            'name': basestring,
            'columns': [Column]
        })
        return fields

class Column(Node):
    def __init__(self, id=None):
        super(Column, self).__init__(id)
        self.set('pk', False)
        self.set('unique', False)
        self.set('null', False)

    def fields(self):
        fields = super(Column, self).fields()
        fields.update({
            'table': Table,
            'name': basestring,
            'pk': bool,
            'unique': bool,
            'null': bool
            })
        return fields
