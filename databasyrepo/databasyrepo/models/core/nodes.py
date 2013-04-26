from uuid import uuid4
from databasyrepo.models.core.serializing import Serializable

__author__ = 'Marboni'

class Node(Serializable):
    def __init__(self, id=None):
        super(Node, self).__init__()
        self.set('_id', id or str(uuid4()))

    def fields(self):
        return {
            '_id': basestring,
            }

    @property
    def id(self):
        return self.val('_id')

    def set(self, field, value):
        setter_name = 'set_%s' % field
        try:
            setter = getattr(self, setter_name)
        except AttributeError:
            super(Node, self).set(field, value)
        else:
            setter(value)

    def val_as_node(self, field, model):
        val = self.val(field)
        if isinstance(val, list):
            return [node_ref.ref_node(model) for node_ref in val]
        else:
            return val.ref_node(model)

    def insert_item(self, field, index, item):
        lst = self._iter_val(field)
        lst.insert(index, item)

    def append_item(self, field, item):
        lst = self._iter_val(field)
        lst.insert(self.items_count(field), item)

    def delete_item(self, field, index):
        lst = self._iter_val(field)
        return lst.pop(index)

    def item_index(self, field, item):
        lst = self._iter_val(field)
        return lst.index(item)

    def items_count(self, field):
        lst = self._iter_val(field)
        return len(lst)

    def _iter_val(self, field):
        value = self.val(field)
        try:
            iter(value)
        except TypeError:
            raise ValueError('Field %s is not iterable.' % field)
        return value

    def ref(self):
        #noinspection PyUnresolvedReferences
        return NodeRef(ref_id=self.id, ref_type=self.code())

class NodeRef(Serializable):
    def fields(self):
        return {
            'ref_id': basestring,
            'ref_type': basestring
        }

    @property
    def ref_id(self):
        return self['ref_id']

    def ref_node(self, model):
        node = model.node(self.ref_id)
        node_code = node.code()
        if node_code != self['ref_type']:
            raise ValueError('Node type (%s) not equal to the type in node reference (%s).' % (node_code, self['ref_type']))
        return node


