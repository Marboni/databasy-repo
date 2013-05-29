databasy.model.core.actions.Executor = Class.extend({
    init: function(model) {
        this.model = model;
        this.events = [];
    },
    execute:function(action) {
        var event = action.execute(this.model);
        this.events.push(event);
        return event;
    }
});

databasy.model.core.actions.Action = databasy.model.core.serializing.Serializable.extend({
    fields:function () {
        return this._super();
    },
    execute:function(model) {
        throw Error('Not implemented.')
    }
});

databasy.model.core.actions.Register = databasy.model.core.actions.Action.extend({
    fields:function () {
        return this._super().concat(
            'node'
        );
    },
    execute:function(model) {
        var node = this.val('node');
        model.register(node);
        return new databasy.model.core.events.NodeRegistered(node);
    }
}, {
    CODE: 'core.actions.Register'
});

databasy.model.core.actions.Unregister = databasy.model.core.actions.Action.extend({
    fields:function () {
        return this._super().concat(
            'node_id'
        );
    },
    execute:function(model) {
        var node = model.unregister(this.val('node_id'));
        return new databasy.model.core.events.NodeUnregistered(node);
    }
}, {
    CODE: 'core.actions.Unregister'
});

databasy.model.core.actions.CRUDAction = databasy.model.core.actions.Action.extend({
    fields:function () {
        return this._super().concat(
            'node_id',
            'field'
        );
    },
    target_node_or_model:function(model) {
        var node_id = this.val('node_id');
        if (node_id === null) {
            return model;
        } else {
            return model.node(node_id);
        }

    },
    _replace_with_ref:function(f_name) {
        var value = this.val(f_name);
        if (value !== undefined) {
            this.set(f_name, this._ref_or_value(value))
        }
    },
    _ref_or_value:function(obj) {
        return (obj instanceof databasy.model.core.nodes.NodeRef) ? obj.ref(): obj;
    }
});

databasy.model.core.actions.Set = databasy.model.core.actions.CRUDAction.extend({
    init:function(params) {
        this._super(params);
        this._replace_with_ref('value');
    },
    fields:function () {
        return this._super().concat(
            'value'
        );
    },
    execute:function(model) {
        var field = this.val('field');
        var new_value = this.val('value');

        var node_or_model = this.target_node_or_model(model);
        var old_value = node_or_model.val(field);
        node_or_model.set(field, new_value);
        return new databasy.model.core.events.PropertyChanged({
            node_id: this.val('node_id'),
            field: field,
            old_value: old_value,
            new_value: new_value
        });
    }
}, {
    CODE: 'core.actions.Set'
});

databasy.model.core.actions.AppendItem = databasy.model.core.actions.CRUDAction.extend({
    init:function(params) {
        this._super(params);
        this._replace_with_ref('item');
    },
    fields:function () {
        return this._super().concat(
            'item'
        );
    },

    execute:function(model) {
        var field = this.val('field');
        var node_id = this.val('node_id');

        var node_or_model = this.target_node_or_model(model);
        var new_index = node_or_model.items_count(field);

        var action =
            new databasy.model.core.actions.InsertItem({node_id:node_id, field:field, index:new_index, item:this.val('item')});
        return action.execute(model);
    }
}, {
    CODE: 'core.actions.AppendItem'
});

databasy.model.core.actions.InsertItem = databasy.model.core.actions.CRUDAction.extend({
    init:function(params) {
        this._super(params);
        this._replace_with_ref('item');
    },
    fields:function () {
        return this._super().concat(
            'index',
            'item'
        );
    },
    execute:function(model) {
        var field = this.val('field');
        var index = this.val('index');
        var item = this.val('item');

        var node_or_model = this.target_node_or_model(model);
        node_or_model.insert_item(field, index, item);

        return new databasy.model.core.events.ItemInserted({
            node_id: this.val('node_id'),
            field: field,
            index: index,
            item: item
        });
    }
}, {
    CODE: 'core.actions.InsertItem'
});

databasy.model.core.actions.DeleteItem = databasy.model.core.actions.CRUDAction.extend({
    fields:function () {
        return this._super().concat(
            'index'
        );
    },
    execute:function(model) {
        var field = this.val('field');
        var index = this.val('index');

        var node_or_model = this.target_node_or_model(model);
        var item = node_or_model.delete_item(field, index);

        return new databasy.model.core.events.ItemDeleted({
            node_id: this.val('node_id'),
            field: field,
            index: index,
            item: item
        });
    }
}, {
    CODE: 'core.actions.DeleteItem'
});

databasy.model.core.actions.FindAndDeleteItem = databasy.model.core.actions.CRUDAction.extend({
    init:function(params) {
        this._super(params);
        this._replace_with_ref('item');
    },
    fields:function () {
        return this._super().concat(
            'item'
        );
    },
    execute:function(model) {
        var node_id = this.val('node_id');
        var node = this.target_node_or_model(model);
        var index = node.item_index(this.val('field'), this.val('item'));

        var action = new databasy.model.core.actions.DeleteItem({node_id:node_id, field:this.val('field'), index:index});
        return action.execute(model);
    }
}, {
    CODE: 'core.actions.FindAndDeleteItem'
});