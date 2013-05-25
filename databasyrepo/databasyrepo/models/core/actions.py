from databasyrepo.models.core.serializing import Serializable

__author__ = 'Marboni'

class Executor(object):
    def __init__(self, model):
        super(Executor, self).__init__()
        self.model = model
        self.events = []

    def execute(self, action):
        event = action.execute(self.model)
        self.events.append(event)
        return event

class Action(Serializable):
    def execute(self, model):
        """ Executes action.
        Arguments:
            model - where to execute this action.
        """
        raise NotImplementedError

    def changes(self):
        """ Return tuple of object ID and its field that can be changed by this action. Field may be None.
        """
        raise NotImplementedError

class Register(Action):
    def __init__(self, node=None):
        super(Register, self).__init__(node=node)

    def fields(self):
        from databasyrepo.models.core.nodes import Node
        return {
            'node': Node
        }

    def execute(self, model):
        node = self.val('node')
        model.register(node)
        from databasyrepo.models.core.events import NodeRegistered
        return NodeRegistered(node)

    def changes(self):
        return self.val('node').id, None


class Unregister(Action):
    def __init__(self, node_id=None):
        super(Unregister, self).__init__(node_id=node_id)


    def fields(self):
        return {
            'node_id': basestring
        }

    def execute(self, model, fire=True):
        node = model.unregister(self.val('node_id'))
        from databasyrepo.models.core.events import NodeUnregistered
        return NodeUnregistered(node)

    def changes(self):
        return self.val('node_id'), None


def _ref_or_value(obj):
    from databasyrepo.models.core.nodes import Node
    if isinstance(obj, Node):
        return obj.ref()
    else:
        return obj

class CRUDAction(Action):
    def __init__(self, node_id=None, field=None, **kwargs):
        super(CRUDAction, self).__init__(node_id=node_id, field=field, **kwargs)

    def fields(self):
        return {
            'node_id': basestring,
            'field': basestring
        }

    def target_node_or_model(self, model):
        node_id = self.val('node_id')
        if node_id:
            return model.node(node_id)
        else:
            return model

    def changes(self):
        return self.val('node_id'), self.val('field')


class Set(CRUDAction):
    def __init__(self, node_id=None, field=None, value=None):
        super(Set, self).__init__(node_id, field, value=_ref_or_value(value))

    def fields(self):
        fields = super(Set, self).fields()
        fields.update({
            'value': object
        })
        return fields

    def execute(self, model):
        field = self.val('field')
        new_value = self.val('value')

        node_or_model = self.target_node_or_model(model)
        old_value = node_or_model.val(field)
        node_or_model.set(field, new_value)

        from databasyrepo.models.core.events import PropertyChanged
        return PropertyChanged(node_id=self.val('node_id'), field=field, old_value=old_value, new_value=new_value)


class AppendItem(CRUDAction):
    # Shortcut for InsertItem with last index.
    def __init__(self, node_id=None, field=None, item=None):
        super(AppendItem, self).__init__(node_id, field, item=_ref_or_value(item))

    def fields(self):
        fields = super(AppendItem, self).fields()
        fields.update({
            'item': object
        })
        return fields

    def execute(self, model):
        field = self.val('field')

        node_id = self.val('node_id')
        node_or_model = self.target_node_or_model(model)
        new_index = node_or_model.items_count(field)

        insert_action = InsertItem(node_id=node_id, field=field, index=new_index, item=self.val('item'))
        return insert_action.execute(model)

class InsertItem(CRUDAction):
    def __init__(self, node_id=None, field=None, index=None, item=None):
        super(InsertItem, self).__init__(node_id, field, index=index, item=_ref_or_value(item))


    def fields(self):
        fields = super(InsertItem, self).fields()
        fields.update({
            'index': int,
            'item': object
        })
        return fields

    def execute(self, model):
        field = self.val('field')
        index = self.val('index')
        item = self.val('item')

        node_or_model = self.target_node_or_model(model)
        node_or_model.insert_item(field, index, item)

        from databasyrepo.models.core.events import ItemInserted
        return ItemInserted(node_id=self.val('node_id'), field=field, index=index, item=item)


class DeleteItem(CRUDAction):
    def __init__(self, node_id=None, field=None, index=None):
        super(DeleteItem, self).__init__(node_id, field, index=index)

    def fields(self):
        fields = super(DeleteItem, self).fields()
        fields.update({
            'index': int,
        })
        return fields

    def execute(self, model):
        field = self.val('field')
        index = self.val('index')

        node_or_model = self.target_node_or_model(model)
        item = node_or_model.delete_item(field, index)

        from databasyrepo.models.core.events import ItemDeleted
        return ItemDeleted(node_id=self.val('node_id'), field=field, index=index, item=item)


class FindAndDeleteItem(CRUDAction):
    # Shortcut for DeleteItem.
    def __init__(self, node_id=None, field=None, item=None):
        super(FindAndDeleteItem, self).__init__(node_id, field, item=_ref_or_value(item))

    def fields(self):
        fields = super(FindAndDeleteItem, self).fields()
        fields.update({
            'item': object,
            })
        return fields

    def execute(self, model):
        node_id = self.val('node_id')
        node = self.target_node_or_model(model)
        index = node.item_index(self.val('field'), self.val('item'))

        action = DeleteItem(node_id=node_id, field=self.val('field'), index=index)
        return action.execute(model)


