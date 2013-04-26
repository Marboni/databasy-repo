import json
from databasyrepo.models.core.errors import DeserializationException

__author__ = 'Marboni'

MODELS_MODULE_PREFIX = 'databasyrepo.models.'

class Serializable(dict):
    def __init__(self, **kwargs):
        super(Serializable, self).__init__()
        try:
            #noinspection PyUnresolvedReferences
            self['_type'] = self.serial_code()
        except KeyError:
            raise ValueError('Unable to serialized: SERIAL_CODE not defined.')

        self._init_fields()
        for f_name, f_value in kwargs.iteritems():
            self.set(f_name, f_value)

    def _init_fields(self):
        for f_name, f_type in self.fields().iteritems():
            init_value = [] if isinstance(f_type, list) else None
            self[f_name] = init_value

    @classmethod
    def serial_code(cls):
        full_name = '%s.%s' % (cls.__module__, cls.__name__)
        if full_name.startswith(MODELS_MODULE_PREFIX):
            return full_name[len(MODELS_MODULE_PREFIX):]
        else:
            raise ValueError('Name of class "%s" doesn\'t start with models module prefix.' % full_name)


    def fields(self):
        raise NotImplementedError('%s not implemented method fields().' % type(self))

    def set(self, f_name, f_value):
        fields = self.fields()
        f_type = fields.get(f_name)
        if not f_type:
            raise ValueError('Field "%s" not exists. Available fields: %s.' % (f_name, fields.keys()))
        if not self.check_type(f_name, f_value):
            raise ValueError(
                'Unable to set value of type %s to field "%s" of type %s.' % (type(f_value), f_name, f_type))
        self[f_name] = f_value

    def val(self, field):
        try:
            return self[field]
        except KeyError:
            raise ValueError('Field "%s" not exists in object of type %s.' % (field, self.get('_type', 'N/A')))

    def __delitem__(self, name):
        raise ValueError('Operation is prohibited.')

    def deserialize(self, serialized_obj):
        for f_name, f_type in self.fields().iteritems():
            is_obj, type = self._field_type_info(f_name)
            if is_obj:
                if issubclass(f_type, Serializable):
                    value = node_value(serialized_obj, f_name)
                else:
                    value = raw_value(serialized_obj, f_name)
            else:
                if issubclass(type, Serializable):
                    value = node_list_value(serialized_obj, f_name)
                else:
                    value = raw_list_value(serialized_obj, f_name)
            try:
                self.set(f_name, value)
            except ValueError, e:
                raise DeserializationException('Unable to deserialize object: %s' % e.message)

    def _field_type_info(self, f_name):
        """ Information of field type.
        Returns:
            tuple of two elements:
                1) True is field contains object, False if it contains list.
                2) Type of list elements if field is list or type of object, if field is object.
        """
        try:
            f_type = self.fields()[f_name]
        except KeyError:
            raise ValueError('Field %s not exists.' % f_name)
        if isinstance(f_type, list):
            try:
                return False, f_type[0]
            except IndexError:
                raise ValueError(
                    'Type of element must be specified for array field %s of class %s.' % (f_name, self.__class__))
        else:
            return True, f_type

    def check_type(self, f_name, f_value):
        """ Checks whether value matches to field type.
        Returns:
            True if matches, False otherwise.
        """
        if f_value is None:
            return True
        is_obj, type = self._field_type_info(f_name)

        if is_obj:
            elements_to_check = [f_value]
        else:
            try:
                iter(f_value)
            except TypeError:
                return False
            elements_to_check = f_value

        from databasyrepo.models.core.nodes import NodeRef
        from databasyrepo.models.register import register

        for element in elements_to_check:
            if isinstance(element, type):
                return True
            elif isinstance(element, NodeRef):
                try:
                    register.get(element.val('ref_type'), type)
                    return True
                except ValueError:
                    return False
            else:
                return False
        else:
            return True

    def copy(self):
        return deserialize(self)


def deserialize(serialized_object, superclass=None):
    if serialized_object is None:
        return None

    if isinstance(serialized_object, basestring):
        try:
            serialized_object = json.loads(serialized_object)
        except ValueError, e:
            raise DeserializationException('Unable to parse command: "' + e.message + '".')
    elif not isinstance(serialized_object, dict):
        raise TypeError('Serialized object must be dict or string.')

    type = raw_value(serialized_object, '_type')
    try:
        from databasyrepo.models.register import register
        obj_class = register.get(type, superclass)
    except ValueError, e:
        raise DeserializationException(e.message)
    node = obj_class()
    node.deserialize(serialized_object)
    return node


def deserialize_command(serialized_command):
    from databasyrepo.models.core.commands import Command

    return deserialize(serialized_command, Command)


def raw_value(serialized_parent, field):
    try:
        return serialized_parent[field]
    except KeyError:
        raise DeserializationException('Object doesn\'t contain field "%s": %s' % (field, serialized_parent))


def node_value(serialized_parent, field):
    val = raw_value(serialized_parent, field)
    return deserialize(val)


def raw_list_value(serialized_parent, field):
    return raw_value(serialized_parent, field)


def node_list_value(serialized_parent, field):
    lst = raw_value(serialized_parent, field)
    return [deserialize(sn) for sn in lst]