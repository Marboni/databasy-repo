from databasyrepo.utils.validators import FieldValidator, InvalidStateError, Integer

__author__ = 'Marboni'

class NodeClass(FieldValidator):
    def __init__(self, model, clazz):
        FieldValidator.__init__(self)
        self.model = model
        self.clazz = clazz

    def __call__(self, field, field_values):
        id = self.get(field, field_values)
        try:
            self.model.node(id, self.clazz)
        except ValueError, e:
            raise InvalidStateError(e)

class UniqueID(FieldValidator):
    def __init__(self, model):
        FieldValidator.__init__(self)
        self.model = model

    def __call__(self, field, field_values):
        id = self.get(field, field_values)
        if self.model.exists(id):
            raise InvalidStateError('ID %s already exists.' % id)


class CorrectVersion(Integer):
    def __init__(self, model):
        super(CorrectVersion, self).__init__()
        self.current_version = model.version

    def __call__(self, field, field_values):
        super(CorrectVersion, self).__call__(field, field_values)
        user_version = self.get(field, field_values)
        if user_version <= 0:
            raise InvalidStateError('Field must be positive.')
        if self.current_version != user_version:
            raise InvalidStateError('Source version of command (%s) is greater then current model version (%s).' %
                                    (user_version, self.current_version))