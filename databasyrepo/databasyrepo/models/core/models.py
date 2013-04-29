from databasyrepo.models.core.nodes import Node
from databasyrepo.models.core.reprs import Canvas
from databasyrepo.utils import commons
from databasyrepo.models.core.elements import Table

__author__ = 'Marboni'

class Model(Node):
    class Meta:
        # Possibility to create this model on Production.
        creatable = False

    def __init__(self, id=None):
        super(Model, self).__init__(id)
        self._nodes_register = {}

    def fields(self):
        fields = super(Model, self).fields()
        fields.update(self.server_only_fields())
        fields.update({
            'model_id': long,
            'version': long,

            'nodes': [Node],
            'canvases': [Canvas],
            'tables': [Table]
            })
        return fields

    def server_only_fields(self):
        return {
            'creation_time': long,
            'creator_uid': long,
            'modification_time': long,
            'modifier_uid': long
        }

    @classmethod
    def create(cls, model_id, user_id, conn):
        model = cls()

        current_time = commons.current_time_ms()
        model.set('creation_time', current_time)
        model.set('modification_time', current_time)
        model.set('creator_uid', user_id)
        model.set('modifier_uid', user_id)

        model.set('model_id', model_id)
        model.set('version', 1L)

        canvas = Canvas()
        canvas.set('name', 'Default')
        model.register(canvas)
        model.append_item('canvases', canvas.ref())

        model._save(conn)
        return model

    def set_nodes(self, nodes_list):
        for node in nodes_list:
            self.register(node)

    def _add_node(self, node):
        if self._nodes_register.has_key(node.id):
            raise ValueError('Node with ID "%s" already exists.' % node.id)
        self._nodes_register[node.id] = node
        self.val('nodes').append(node)

    def _remove_node(self, id):
        if not self._nodes_register.has_key(id):
            raise ValueError('Node with ID "%s" not exists.' % id)
        node = self._nodes_register.pop(id)
        self.val('nodes').remove(node)
        return node

    def register(self, node):
        self._add_node(node)

    def unregister(self, uid):
        return self._remove_node(uid)

    def node(self, id, clazz=None):
        try:
            node = self._nodes_register[id]
            if clazz and not isinstance(node, clazz):
                raise ValueError('Node with ID "%s" is not an instance of class %s.' % (id, clazz))
            return node
        except KeyError:
            raise ValueError('Node with ID "%s" not registered in the model.' % id)

    def exists(self, id):
        return self._nodes_register.has_key(id)

    def serialize_for_client(self):
        return dict((k, self[k]) for k in self.keys() if k not in self.server_only_fields().keys())

    def _save(self, conn):
        conn.models.save(self)

