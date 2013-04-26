from unittest import TestCase
from databasyrepo.models.postgres.datatypes import *

__author__ = 'Marboni'

SIMPLE_DATA_TYPES = [
    BigInt,
    Int8,
    BigSerial,
    Serial8,
    Boolean,
    Bool,
    Box,
    Bytea,
    Cidr,
    Circle,
    Date,
    DoublePrecision,
    Float8,
    Inet,
    Integer,
    Int,
    Int4,
    Line,
    Lseg,
    MacAddr,
    Money,
    Path,
    Point,
    Polygon,
    Real,
    Float4,
    SmallInt,
    Int2,
    SmallSerial,
    Serial2,
    Serial,
    Serial4,
    Text,
    TsQuery,
    TsVector,
    TxIdSnapshot,
    UUID,
    XML,
    JSON
]
DATA_TYPES_WITH_LENGTH = [
    Bit,
    BitVarying,
    VarBit,
    Char,
    VarChar,
    Character,
    CharacterVarying
]
DATA_TYPE_INTERVAL = [
    Interval
]
DATA_TYPES_WITH_PRECISION_AND_TIMEZONE = [
    Time
]
DATA_TYPES_WITH_PRECISION_MAX6_AND_TIMEZONE = [
    Timestamp
]
DATA_TYPES_WITH_PRECISION_ONLY = [
    TimeTz
]
DATA_TYPES_WITH_PRECISION_MAX6_ONLY = [
    TimestampTz
]
DATA_TYPES_WITH_PRECISION_AND_SCALE = [
    Decimal,
    Numeric,
]

class DataTypesTest(TestCase):
    def _test_parse(self, datatype_handlers, test_method):
        for datatype_handler in datatype_handlers:
            type = datatype_handler.TYPE
            for test_value, expected_result in test_method(type).iteritems():
                result = datatype_handler.parse(test_value)
                self.assertEqual(result, expected_result,
                    'Error when parse "%s": result is "%s", should be %s' % (test_value, result, expected_result))

    def test_parse(self):
        # <TYPE>
        self._test_parse(SIMPLE_DATA_TYPES, lambda type: {
            type.capitalize(): (type, ()),
            ' %s ' % type.upper(): (type, ()),
            'XXX': None
        })

        # <TYPE> [(length)]
        #   where length is positive int.
        self._test_parse(DATA_TYPES_WITH_LENGTH, lambda type: {
            type.capitalize(): (type, (None,)),
            ' %s ' % type: (type, (None,)),
            ' %s() ' % type: (type, (None,)),
            ' %s(  )' % type: (type, (None,)),
            ' %s(  21  )' % type: (type + '(21)', (21,)),
            ' %s (21) ' % type: (type + '(21)', (21,)),
            ' %s(21) ' % type: (type + '(21)', (21,)),

            '%s(0)' % type: None,
            '%s (0)' % type: None,
            '%s(-1)' % type: None,
            '%s (-1)' % type: None,
            '%s (XXX)' % type: None,
            'XXX': None,
        })

        # <TYPE> [fields] [(precision)]
        self._test_parse(DATA_TYPE_INTERVAL, lambda type: {
            ' %s ' % type: (type, (None, None)),
            ' %s() ' % type: (type, (None, None)),
            ' %s(  )' % type: (type, (None, None)),
            ' %s(  0  )' % type: (type + '(0)', (None, 0)),
            ' %s (0) ' % type: (type + '(0)', (None, 0)),
            ' %s(0) ' % type: (type + '(0)', (None, 0)),
            ' %s HOUR ' % type: (type + ' hour', ('hour', None)),
            ' %s  SECOND(  0  )' % type: (type + ' second(0)', ('second', 0)),
            ' %s  SECOND  ' % type: (type + ' second', ('second', None)),
            ' %s  HOUR   TO  SECOND(  0  )' % type: (type + ' hour to second(0)', ('hour to second', 0)),
            ' %s  HOUR   TO  SECOND  ' % type: (type + ' hour to second', ('hour to second', None)),

            '%s(-1)' % type: None,
            '%s (-1)' % type: None,
            '%s (7)' % type: None,
            '%s (XXX)' % type: None,
            '%sSECOND' % type: None,
            'XXX': None,

            '%s (7)' % type: None,
            '%s hour (0)' % type: None,
        })

        # <TYPE> [(precision)] [(with time zone | without time zone)]
        self._test_parse(DATA_TYPES_WITH_PRECISION_AND_TIMEZONE, lambda type: {
            type.capitalize(): (type, (None, None)),
            ' %s ' % type: (type, (None, None)),
            ' %s() ' % type: (type, (None, None)),
            ' %s(  )' % type: (type, (None, None)),
            ' %s(  7  )' % type: (type + '(7)', (7, None)),
            ' %s (7) ' % type: (type + '(7)', (7, None)),
            ' %s(7) ' % type: (type + '(7)', (7, None)),

            ' %s  with time zone' % type: (type + ' with time zone', (None, 'with time zone')),
            ' %s(  )with time zone' % type: (type + ' with time zone', (None, 'with time zone')),
            ' %s(  7  )with time zone' % type: (type + '(7) with time zone', (7, 'with time zone')),

            ' %s  without time zone' % type: (type + ' without time zone', (None, 'without time zone')),
            ' %s(  )without time zone' % type: (type + ' without time zone', (None, 'without time zone')),
            ' %s(  7  )without time zone' % type: (type + '(7) without time zone', (7, 'without time zone')),

            '%s(-1)' % type: None,
            '%s (-1)' % type: None,
            '%s (XXX)' % type: None,
            '%swith time zone' % type: None,
            '%s WITHO TIME ZONE' % type: None,
            'XXX': None,
        })
        # <TYPE> [(precision)] [(with time zone | without time zone)], precision <= 6
        self._test_parse(DATA_TYPES_WITH_PRECISION_MAX6_AND_TIMEZONE, lambda type: {
            type.capitalize(): (type, (None, None)),
            ' %s ' % type: (type, (None, None)),
            ' %s() ' % type: (type, (None, None)),
            ' %s(  )' % type: (type, (None, None)),
            ' %s(  0  )' % type: (type + '(0)', (0, None)),
            ' %s (0) ' % type: (type + '(0)', (0, None)),
            ' %s(0) ' % type: (type + '(0)', (0, None)),

            ' %s  WITH TIME ZONE' % type: (type + ' with time zone', (None, 'with time zone')),
            ' %s(  )WITH TIME ZONE' % type: (type + ' with time zone', (None, 'with time zone')),
            ' %s(  0  )WITH TIME ZONE' % type: (type + '(0) with time zone', (0, 'with time zone')),

            ' %s  WITHOUT TIME ZONE' % type: (type + ' without time zone', (None, 'without time zone')),
            ' %s(  )WITHOUT TIME ZONE' % type: (type + ' without time zone', (None, 'without time zone')),
            ' %s(  0  )WITHOUT TIME ZONE' % type: (type + '(0) without time zone', (0, 'without time zone')),

            '%s(-1)' % type: None,
            '%s (-1)' % type: None,
            '%s (7)' % type: None,
            '%s (XXX)' % type: None,
            '%swith time zone' % type: None,
            '%s WITHO TIME ZONE' % type: None,
            'XXX': None,
        })

        # <TYPE> [(precision)]
        self._test_parse(DATA_TYPES_WITH_PRECISION_ONLY, lambda type: {
            type.capitalize(): (type, (None,)),
            ' %s ' % type: (type, (None,)),
            ' %s() ' % type: (type, (None,)),
            ' %s(  )' % type: (type, (None,)),
            ' %s(  7  )' % type: (type + '(7)', (7,)),
            ' %s (7) ' % type: (type + '(7)', (7,)),
            ' %s(7) ' % type: (type + '(7)', (7,)),

            '%s without time zone' % type: None,
            '%s without time zone' % type: None,
            '%s(6) without time zone' % type: None,

            '%s with time zone' % type: None,
            '%s with time zone' % type: None,
            '%s(6) with time zone' % type: None,

            '%s(-1)' % type: None,
            '%s (-1)' % type: None,
            '%s (XXX)' % type: None,
            '%swith time zone' % type: None,
            '%s WITHO TIME ZONE' % type: None,
            'XXX': None,
            })

        # <TYPE> [(precision)], precision <= 6
        self._test_parse(DATA_TYPES_WITH_PRECISION_MAX6_ONLY, lambda type: {
            type.capitalize(): (type, (None,)),
            ' %s ' % type: (type, (None,)),
            ' %s() ' % type: (type, (None,)),
            ' %s(  )' % type: (type, (None,)),
            ' %s(  0  )' % type: (type + '(0)', (0,)),
            ' %s (0) ' % type: (type + '(0)', (0,)),
            ' %s(0) ' % type: (type + '(0)', (0,)),

            '%s without time zone' % type: None,
            '%s without time zone' % type: None,
            '%s(6) without time zone' % type: None,

            '%s with time zone' % type: None,
            '%s with time zone' % type: None,
            '%s(6) with time zone' % type: None,

            '%s(-1)' % type: None,
            '%s (-1)' % type: None,
            '%s (7)' % type: None,
            '%s (XXX)' % type: None,
            '%swith time zone' % type: None,
            '%s WITHO TIME ZONE' % type: None,
            'XXX': None,
            })

        self._test_parse(DATA_TYPES_WITH_PRECISION_AND_SCALE, lambda type: {
            type.capitalize(): (type, (None, None)),
            ' %s ' % type: (type, (None, None)),
            ' %s() ' % type: (type, (None, None)),
            ' %s ( 2 )' % type: (type + '(2)', (2, None)),
            ' %s ( 2 , 1 )' % type: (type + '(2, 1)', (2, 1)),
            ' %s ( 2 , 2 )' % type: (type + '(2, 2)', (2, 2)),

            '%s(,1)' % type: None,
            '%s(1, 2)' % type: None,
            '%s(-1)' % type: None,
            '%s(-1, -1)' % type: None,
            'XXX': None
        })
