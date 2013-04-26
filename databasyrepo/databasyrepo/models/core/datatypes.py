import re
from databasyrepo.models.core.nodes import Node

__author__ = 'Marboni'

BIT_GROUP = 'bt'
BINARY_GROUP = 'br'
BOOLEAN_GROUP = 'bn'
CHARACTER_GROUP = 'ch'
DATETIME_GROUP = 'dt'
FORMAT_GROUP = 'fm'
GEOMETRY_GROUP = 'gm'
NUMERIC_GROUP = 'nm'
SERIAL_GROUP = 'sl'
SPECIAL_GROUP = 'sp'

class DataType(Node):
    def __init__(self, id=None):
        super(DataType, self).__init__(id)

    def fields(self):
        fields = super(DataType, self).fields()
        fields.update({
            'group': basestring,
            'type': basestring,
        })
        return fields

class DataTypeHandler(object):
    @property
    def TYPE(self):
        raise NotImplementedError

    @property
    def GROUP(self):
        raise NotImplementedError

    @classmethod
    def create(cls):
        datatype = DataType()
        datatype.set('group', cls.GROUP)
        datatype.set('type', cls.TYPE)
        return datatype

    @classmethod
    def parse(cls, d_type):
        """ Parses data type representation.
        Arguments:
            d_type - string representation of data type (with or without arguments): NUMERIC, NUMERIC(10) etc.
        Returns:
            formatted representation and tuple of arguments if d_type is correct representation of this data type, None otherwise.
        """
        raise NotImplementedError


def clean(d_type):
    """ Checks value is not None, makes upper-case, removes leading and trailing slashes, replaces multiple spaces with one.
    """
    if d_type is None:
        raise ValueError('Data type not defined.')
    d_type = d_type.replace('(', ' (').replace(')', ') ').replace(',', ', ')
    return re.sub(' {2,}', ' ', d_type).replace('( ', '(').replace(' )', ')').replace(' ,', ',').lower().strip()


class SimpleDataTypeHandler(DataTypeHandler):
    @classmethod
    def parse(cls, d_type):
        """ Parses string representation of data type.
        Returns:
            formatted representation and empty tuple of arguments.
        """
        return (cls.TYPE, ()) if cls.TYPE == clean(d_type) else None


class DataTypeLHandler(DataTypeHandler):
    @classmethod
    def parse(cls, d_type):
        """ Parses string representation of data type.
        Returns:
            formatted representation and tuple of 1 argument:
                * length
        """
        d_type = clean(d_type)
        match = re.match(r'^%s( \((?P<l>[1-9]\d*)?\))?$' % cls.TYPE, d_type)
        if match:
            length = match.group('l')
            if length is None:
                return cls.TYPE, (None,)
            else:
                return '%s(%s)' % (cls.TYPE, length), (int(length),)
        return None


class DataTypePSHandler(DataTypeHandler):
    @classmethod
    def parse(cls, d_type):
        """ Parses string representation of data type.
        Returns:
            formatted representation and tuple of 2 argument:
                * precision
                * scale
        """
        d_type = clean(d_type)
        match = re.match(r'^%s( \(((?P<p>[1-9]\d*)(, (?P<s>\d*))?)?\))?$' % cls.TYPE, d_type)
        if match:
            precision, scale = match.group('p'), match.group('s')
            if precision is None:
                return cls.TYPE, (None, None)
            else:
                precision = int(precision)
                if scale is not None:
                    scale = int(scale)
                    if scale > precision:
                        return None
                    definition = '%s(%s, %s)' % (cls.TYPE, precision, scale)
                else:
                    definition = '%s(%s)' % (cls.TYPE, precision)
                return definition, (precision, scale)
        return None


class DataTypeTZHandler(DataTypeHandler):
    @classmethod
    def parse(cls, d_type):
        """ Parses string representation of data types without arguments.
        Returns:
            formatted representation and tuple of 2 arguments:
                * precision
                * "with time zone" or "without time zone" if specified
        """
        # <TYPE> [(precision)] [with time zone | without time zone]
        d_type = clean(d_type)
        match = re.match(r'^%s( \((?P<p>\d+)?\))?( (?P<tz>(with time zone)|(without time zone)))?$' % cls.TYPE, d_type)
        if match:
            precision, tz = match.group('p'), match.group('tz')
            expr = cls.TYPE + ('(%s)' % precision if precision else '') + (' ' + tz if tz else '')
            precision = int(precision) if precision else None
            return expr, (precision, tz)
        return None