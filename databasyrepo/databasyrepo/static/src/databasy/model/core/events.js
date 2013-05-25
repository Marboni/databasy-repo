databasy.model.core.events.Event = databasy.model.core.serializing.Serializable.extend({
    do_action:function() {
        throw new Error('Not implemented.');
    },
    undo_action:function() {
        throw new Error('Not implemented.');
    }
});

databasy.model.core.events.NodeRegistered = databasy.model.core.events.Event.extend({
    init:function(node) {
        this._super();
        if (node !== undefined) {
            this.set('node', node.copy())
        }
    },
    fields:function() {
        return this._super().concat(
            'node'
        )
    },
    do_action:function() {
        return databasy.model.core.actions.Register({node: this.val('node')});
    },
    undo_action:function() {
        return databasy.model.core.actions.Unregister({node_id: this.val('node').id()});
    }
}, {
    CODE: 'core.events.NodeRegistered'
});


databasy.model.core.events.NodeUnregistered = databasy.model.core.events.Event.extend({
    init:function(node) {
        this._super();
        if (node !== undefined) {
            this.set('node', node.copy())
        }
    },
    fields:function() {
        return this._super().concat(
            'node'
        )
    },
    do_action:function() {
        return databasy.model.core.actions.Unregister({node_id: this.val('node').id()});
    },
    undo_action:function() {
        return databasy.model.core.actions.Register({node: this.val('node')});
    }
}, {
    CODE: 'core.events.NodeUnregistered'
});


databasy.model.core.events.PropertyChanged = databasy.model.core.events.Event.extend({
    fields:function() {
        return this._super().concat(
            'node_id',
            'field',
            'old_value',
            'new_value'
        )
    },
    do_action:function() {
        return databasy.model.core.actions.Set({node_id: this.val('node_id'), field:this.val('field'), value:this.val('new_value')});
    },
    undo_action:function() {
        return databasy.model.core.actions.Set({node_id: this.val('node_id'), field:this.val('field'), value:this.val('old_value')});
    }
}, {
    CODE: 'core.events.PropertyChanged'
});


databasy.model.core.events.ItemInserted = databasy.model.core.events.Event.extend({
    fields:function() {
        return this._super().concat(
            'node_id',
            'field',
            'index',
            'item'
        )
    },
    do_action:function() {
        return databasy.model.core.actions.InsertItem({node_id: this.val('node_id'), field:this.val('field'), index:this.val('index'), item:this.val('item')});
    },
    undo_action:function() {
        return databasy.model.core.actions.DeleteItem({node_id: this.val('node_id'), field:this.val('field'), index:this.val('index')});
    }
}, {
    CODE: 'core.events.ItemInserted'
});


databasy.model.core.events.ItemDeleted = databasy.model.core.events.Event.extend({
    fields:function() {
        return this._super().concat(
            'node_id',
            'field',
            'index',
            'item'
        )
    },
    do_action:function() {
        return databasy.model.core.actions.DeleteItem({node_id: this.val('node_id'), field:this.val('field'), index:this.val('index')});
    },
    undo_action:function() {
        return databasy.model.core.actions.InsertItem({node_id: this.val('node_id'), field:this.val('field'), index:this.val('index'), item:this.val('item')});
    }
}, {
    CODE: 'core.events.ItemDeleted'
});

