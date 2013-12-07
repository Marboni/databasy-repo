from databasyrepo.models.core.nodes import Node

__author__ = 'Marboni'


class Table(Node):
    def fields(self):
        fields = super(Table, self).fields()
        fields.update({
            'name': basestring,
            'columns': [Column],
            'indexes': [Index]
        })
        return fields


class Column(Node):
    def __init__(self, id=None):
        super(Column, self).__init__(id)
        self.set('null', True)

    def fields(self):
        fields = super(Column, self).fields()
        fields.update({
            'table': Table,
            'name': basestring,
            'type': basestring,
            'null': bool,
            'default': basestring
        })
        return fields


class Index(Node):
    PRIMARY_TYPE = 'PRIMARY'
    UNIQUE_TYPE = 'UNIQUE'
    INDEX_TYPE = 'INDEX'

    TYPES = [
        PRIMARY_TYPE,
        UNIQUE_TYPE,
        INDEX_TYPE
    ]

    def fields(self):
        fields = super(Index, self).fields()
        fields.update({
            'table': Table,
            'name': basestring,
            'type': basestring,
            'index_columns': [IndexColumn]
        })
        return fields


class IndexColumn(Node):
    ASC_ORDER = 'ASC'
    DESC_ORDER = 'DESC'

    ORDERS = [
        ASC_ORDER,
        DESC_ORDER
    ]

    def fields(self):
        fields = super(IndexColumn, self).fields()
        fields.update({
            'index': Index,
            'column': Column,
            'order': basestring
        })
        return fields