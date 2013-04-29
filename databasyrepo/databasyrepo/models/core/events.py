from databasyrepo.models.core.serializing import Serializable
from databasyrepo.models.core.actions import Register, Unregister, Set, InsertItem, DeleteItem

__author__ = 'Marboni'

class Event(Serializable):
    def do_action(self):
        """ Returns action to make this modification.
        """
        raise NotImplementedError

    def undo_action(self):
        """ Returns action to revert this modification.
        """
        raise NotImplementedError

class NodeRegistered(Event):
    def __init__(self, node=None):
        super(NodeRegistered, self).__init__()
        if node:
            self['node'] = node.copy()

    def fields(self):
        from databasyrepo.models.core.nodes import Node
        return {
            'node': Node
        }

    def do_action(self):
        return Register(node=self['node'])

    def undo_action(self):
        return Unregister(node_id=self['node'].id)


class NodeUnregistered(Event):
    def __init__(self, node=None):
        super(NodeUnregistered, self).__init__()
        if node:
            self['node'] = node.copy()

    def fields(self):
        from databasyrepo.models.core.nodes import Node
        return {
            'node': Node
        }

    def do_action(self):
        return Unregister(node_id=self['node'].id)

    def undo_action(self):
        return Register(node=self['node'])


class PropertyChanged(Event):
    def fields(self):
        return {
            'node_id': basestring,
            'field': basestring,
            'old_value': object,
            'new_value': object
        }

    def do_action(self):
        return Set(node_id=self['node_id'], field=self['field'], value=self['new_value'])

    def undo_action(self):
        return Set(node_id=self['node_id'], field=self['field'], value=self['old_value'])

class ItemInserted(Event):
    def fields(self):
        return {
            'node_id': basestring,
            'field': basestring,
            'index': object,
            'item': object
        }

    def do_action(self):
        return InsertItem(node_id=self['node_id'], field=self['field'], index=self['index'], item=self['item'])

    def undo_action(self):
        return DeleteItem(node_id=self['node_id'], field=self['field'], index=self['index'])


class ItemDeleted(Event):
    def fields(self):
        return {
            'node_id': basestring,
            'field': basestring,
            'index': object,
            'item': object
        }

    def do_action(self):
        return DeleteItem(node_id=self['node_id'], field=self['field'], index=self['index'])

    def undo_action(self):
        return InsertItem(node_id=self['node_id'], field=self['field'], index=self['index'], item=self['item'])