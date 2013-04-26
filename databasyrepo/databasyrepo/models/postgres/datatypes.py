import re
from databasyrepo.models.core.datatypes import *

__author__ = 'Marboni'

############ TYPES ############

class BigInt(SimpleDataTypeHandler):
    TYPE = 'bigint'
    GROUP = NUMERIC_GROUP


class Int8(SimpleDataTypeHandler):
    SERIAL_CODE = 'datatype.postgres.Int8'
    TYPE = 'int8'
    GROUP = NUMERIC_GROUP


class BigSerial(SimpleDataTypeHandler):
    TYPE = 'bigserial'
    GROUP = SERIAL_GROUP


class Serial8(SimpleDataTypeHandler):
    TYPE = 'serial8'
    GROUP = SERIAL_GROUP


class Bit(DataTypeLHandler):
    TYPE = 'bit'
    GROUP = BIT_GROUP
    

class BitVarying(DataTypeLHandler):
    TYPE = 'bit varying'
    GROUP = BIT_GROUP


class VarBit(DataTypeLHandler):
    TYPE = 'varbit'
    GROUP = BIT_GROUP


class Boolean(SimpleDataTypeHandler):
    TYPE = 'boolean'
    GROUP = BOOLEAN_GROUP


class Bool(SimpleDataTypeHandler):
    TYPE = 'bool'
    GROUP = BOOLEAN_GROUP


class Box(SimpleDataTypeHandler):
    TYPE = 'box'
    GROUP = GEOMETRY_GROUP


class Bytea(SimpleDataTypeHandler):
    TYPE = 'bytea'
    GROUP = BINARY_GROUP


class Char(DataTypeLHandler):
    TYPE = 'char'
    GROUP = CHARACTER_GROUP


class VarChar(DataTypeLHandler):
    TYPE = 'varchar'
    GROUP = CHARACTER_GROUP


class Character(DataTypeLHandler):
    TYPE = 'character'
    GROUP = CHARACTER_GROUP


class CharacterVarying(DataTypeLHandler):
    TYPE = 'character varying'
    GROUP = CHARACTER_GROUP


class Cidr(SimpleDataTypeHandler):
    TYPE = 'cidr'
    GROUP = SPECIAL_GROUP


class Circle(SimpleDataTypeHandler):
    TYPE = 'circle'
    GROUP = GEOMETRY_GROUP


class Date(SimpleDataTypeHandler):
    TYPE = 'date'
    GROUP = DATETIME_GROUP


class DoublePrecision(SimpleDataTypeHandler):
    TYPE = 'double precision'
    GROUP = NUMERIC_GROUP


class Float8(SimpleDataTypeHandler):
    TYPE = 'float8'
    GROUP = NUMERIC_GROUP


class Inet(SimpleDataTypeHandler):
    TYPE = 'inet'
    GROUP = SPECIAL_GROUP


class Integer(SimpleDataTypeHandler):
    TYPE = 'integer'
    GROUP = NUMERIC_GROUP


class Int(SimpleDataTypeHandler):
    TYPE = 'int'
    GROUP = NUMERIC_GROUP


class Int4(SimpleDataTypeHandler):
    TYPE = 'int4'
    GROUP = NUMERIC_GROUP


class Interval(DataTypeHandler):
    TYPE = 'interval'
    GROUP = DATETIME_GROUP

    FIELDS = (
        'year',
        'month',
        'day',
        'hour',
        'minute',
        'second',
        'year to month',
        'day to hour',
        'day to minute',
        'day to second',
        'hour to minute',
        'hour to second',
        'minute to second',
        )

    @classmethod
    def parse(cls, d_type):
        """ Parses string representation of data types without arguments.
        Returns:
            formatted representation and tuple of 2 arguments:
                * fields
                * precision (only if fields contains SECOND) (0..6)
        """
        # INTERVAL [fields] [(precision)]
        d_type = clean(d_type)
        match = re.match(r'^%s( (?P<fields>[ \w]+))?( \((?P<p>[0-6])?\))?$' %  cls.TYPE, d_type)
        if match:
            fields, precision = match.group('fields'), match.group('p')
            if fields is not None:
                if fields not in cls.FIELDS:
                    return None
                if precision is not None and 'second' not in fields:
                    return None
            expr = cls.TYPE + (' ' + fields if fields else '') + ('(%s)' % precision if precision else '')
            precision = int(precision) if precision else None
            return expr, (fields, precision)
        return None


class Line(SimpleDataTypeHandler):
    TYPE = 'line'
    GROUP = GEOMETRY_GROUP


class Lseg(SimpleDataTypeHandler):
    TYPE = 'lseg'
    GROUP = GEOMETRY_GROUP


class MacAddr(SimpleDataTypeHandler):
    TYPE = 'macaddr'
    GROUP = SPECIAL_GROUP


class Money(SimpleDataTypeHandler):
    TYPE = 'money'
    GROUP = SPECIAL_GROUP


class Numeric(DataTypePSHandler):
    TYPE = 'numeric'
    GROUP = NUMERIC_GROUP


class Decimal(DataTypePSHandler):
    TYPE = 'decimal'
    GROUP = NUMERIC_GROUP


class Path(SimpleDataTypeHandler):
    TYPE = 'path'
    GROUP = GEOMETRY_GROUP


class Point(SimpleDataTypeHandler):
    TYPE = 'point'
    GROUP = GEOMETRY_GROUP


class Polygon(SimpleDataTypeHandler):
    TYPE = 'polygon'
    GROUP = GEOMETRY_GROUP


class Real(SimpleDataTypeHandler):
    TYPE = 'real'
    GROUP = NUMERIC_GROUP


class Float4(SimpleDataTypeHandler):
    TYPE = 'float4'
    GROUP = NUMERIC_GROUP


class SmallInt(SimpleDataTypeHandler):
    TYPE = 'smallint'
    GROUP = NUMERIC_GROUP


class Int2(SimpleDataTypeHandler):
    TYPE = 'int2'
    GROUP = NUMERIC_GROUP


class SmallSerial(SimpleDataTypeHandler):
    TYPE = 'smallserial'
    GROUP = SERIAL_GROUP


class Serial2(SimpleDataTypeHandler):
    TYPE = 'serial2'
    GROUP = SERIAL_GROUP


class Serial(SimpleDataTypeHandler):
    TYPE = 'serial'
    GROUP = SERIAL_GROUP


class Serial4(SimpleDataTypeHandler):
    TYPE = 'serial4'
    GROUP = SERIAL_GROUP


class Text(SimpleDataTypeHandler):
    TYPE = 'text'
    GROUP = SERIAL_GROUP


class Time(DataTypeTZHandler):
    TYPE = 'time'
    GROUP = DATETIME_GROUP


class TimeTz(DataTypeLHandler):
    TYPE = 'timetz'
    GROUP = DATETIME_GROUP


class Timestamp(DataTypeTZHandler):
    TYPE = 'timestamp'
    GROUP = DATETIME_GROUP

    @classmethod
    def parse(cls, d_type):
        """ Parses string representation of data types without arguments.
        Returns:
            formatted representation and tuple of 2 arguments:
                * precision (0..6)
                * with time zone or without time zone if specified
        """
        result = super(Timestamp, cls).parse(d_type)
        if result:
            precision = result[1][0]
            if precision <= 6:
                return result
        return None


class TimestampTz(DataTypeLHandler):
    TYPE = 'timestamptz'
    GROUP = DATETIME_GROUP

    @classmethod
    def parse(cls, d_type):
        """ Parses string representation of data type.
        Returns:
            formatted representation and tuple of 1 argument:
                * precision
        """
        d_type = clean(d_type)
        match = re.match(r'^%s( \((?P<p>[0-6]+)?\))?$' % cls.TYPE, d_type)
        if match:
            precision = match.group('p')
            if precision is None:
                return cls.TYPE, (None,)
            else:
                return '%s(%s)' % (cls.TYPE, precision), (int(precision),)
        return None


class TsQuery(SimpleDataTypeHandler):
    TYPE = 'tsquery'
    GROUP = SPECIAL_GROUP


class TsVector(SimpleDataTypeHandler):
    TYPE = 'tsvector'
    GROUP = SPECIAL_GROUP


class TxIdSnapshot(SimpleDataTypeHandler):
    TYPE = 'txid_snapshot'
    GROUP = SPECIAL_GROUP


class UUID(SimpleDataTypeHandler):
    TYPE = 'uuid'
    GROUP = SPECIAL_GROUP


class XML(SimpleDataTypeHandler):
    TYPE = 'xml'
    GROUP = FORMAT_GROUP


class JSON(SimpleDataTypeHandler):
    TYPE = 'json'
    GROUP = FORMAT_GROUP