__author__ = 'Marboni'

def registered_node(model, actions, node_class=None):
    from databasyrepo.models.core.actions import Register

    node = None
    for action in actions:
        if action['_type'] == Register.serial_code() \
        and (not node_class or action['node']['_type'] == node_class.serial_code()):
            if node:
                raise ValueError('Several nodes were registered by actions.')
            node = model.node(action['node']['_id'])
    if not node:
        raise ValueError('There is no action that registers a node.')
    return node

