from databasyrepo.models.core.nodes import NodeRef, Node
from databasyrepo.utils.validators import FieldValidator, InvalidStateError, Integer

__author__ = 'Marboni'

class IfInFields(FieldValidator):
    __top__ = True

    def __init__(self, *validators):
        FieldValidator.__init__(self)
        self.validators = validators

    def __call__(self, field, field_values):
        fields = field_values.get('fields')
        if field in fields:
            for validator in self.validators:
                validator(field, field_values)

class NodeClass(FieldValidator):
    def __init__(self, model, clazz):
        FieldValidator.__init__(self)
        self.model = model
        self.clazz = clazz

    def __call__(self, field, field_values):
        id_or_node = self.get(field, field_values)
        if isinstance(id_or_node, basestring):
            node_id = id_or_node
        elif isinstance(id_or_node, NodeRef):
            node_id = id_or_node.ref_id
        elif isinstance(id_or_node, Node):
            node_id = id_or_node.id
        else:
            raise InvalidStateError('Value must be Node, NodeRef or node ID, but it\'s %s.' + id_or_node)
        try:
            self.model.node(node_id, self.clazz)
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