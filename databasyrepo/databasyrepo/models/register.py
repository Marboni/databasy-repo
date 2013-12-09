from databasyrepo.models.core.serializing import Serializable
from databasyrepo.utils import commons

__author__ = 'Marboni'

MODULES = [
    'core',
    'postgres',
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
            self._codes_and_classes[subclass.code()] = subclass

        self._superclasses_and_classes = {}

    def by_key(self, code, superclass=None):
        try:
            clazz = self._codes_and_classes[code]
        except KeyError:
            raise ValueError('Type %s not registered.' % code)
        if superclass and not (superclass == clazz or issubclass(clazz, superclass)):
            raise ValueError('Class with code %s is not subclass of %s.' % (code, superclass))
        return clazz

    def by_type(self, superclass):
        if superclass not in self._superclasses_and_classes:
            subclasses = []
            for cls in self._codes_and_classes.values():
                if issubclass(cls, superclass):
                    subclasses.append(cls)
            self._superclasses_and_classes[superclass] = subclasses
        return self._superclasses_and_classes[superclass]

register = Register()