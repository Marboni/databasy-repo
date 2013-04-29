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
    def fields(self):
        fields = super(Column, self).fields()
        fields.update({
            'table': Table,
            'name': basestring,
            })
        return fields
