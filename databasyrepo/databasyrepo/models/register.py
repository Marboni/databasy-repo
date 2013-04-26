from databasyrepo.models.core.serializing import Serializable
from databasyrepo.utils import commons

__author__ = 'Marboni'

MODULES = [
    'core',
    'postgres',
    'test'
]

for module_name in MODULES:
    full_module_name = 'databasyrepo.models.' + module_name
    __import__(full_module_name, fromlist=['commands', 'events', 'models', 'nodes', 'actions', 'validation', 'datatypes', 'views'])

class Register(object):
    """ Register objects for future search by code.
    """

    def __init__(self):
        super(Register, self).__init__()
        self._codes_and_classes = {}
        for subclass in commons.itersubclasses(Serializable):
            self._codes_and_classes[subclass.serial_code()] = subclass
        self._by_types = {}

    def get(self, serial_code, superclass=None):
        try:
            clazz = self._codes_and_classes[serial_code]
        except KeyError:
            raise ValueError('Type %s not registered.' % serial_code)
        if superclass and not (superclass == clazz or issubclass(clazz, superclass)):
            raise ValueError('Class with SERIAL_CODE %s is not subclass of %s.' % (serial_code, superclass))
        return clazz


    def get_by_type(self, superclass):
        if not self._by_types.has_key(superclass):
            self._by_types[superclass] = [clazz for clazz in self._codes_and_classes.values()
                                          if (superclass == clazz or issubclass(clazz, superclass))]
        return self._by_types.get(superclass)

register = Register()