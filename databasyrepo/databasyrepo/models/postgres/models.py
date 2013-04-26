from databasyrepo.models.core.models import Model
from databasyrepo.models.postgres.datatypes import *

__author__ = 'Marboni'

POSTGRES_DBMS = 'PostgreSQL'

class PostgresModel(Model):
    class Meta:
        creatable = True

    STATIC = {
        'dbms_type': POSTGRES_DBMS,
        'dbms_version': '9.x'
    }

    def datatype_handlers(self):
        return [
            BigInt,
            BigSerial,
            Bit,
            BitVarying,
            Bool,
            Boolean,
            Box,
            Bytea,
            Char,
            Character,
            CharacterVarying,
            Cidr,
            Circle,
            Date,
            Decimal,
            DoublePrecision,
            Float4,
            Float8,
            Inet,
            Int,
            Int2,
            Int4,
            Int8,
            Integer,
            Interval,
            JSON,
            Line,
            Lseg,
            MacAddr,
            Money,
            Numeric,
            Path,
            Point,
            Polygon,
            Real,
            Serial,
            Serial2,
            Serial4,
            Serial8,
            SmallInt,
            SmallSerial,
            Text,
            Time,
            TimeTz,
            Timestamp,
            TimestampTz,
            TsQuery,
            TsVector,
            TxIdSnapshot,
            UUID,
            VarBit,
            VarChar,
            XML,
        ]










