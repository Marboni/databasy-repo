databasy.gateway.events.ModelChanged = databasy.utils.events.Event.extend({
    init:function(modelEvent) {
        this._super('ModelChanged');
        this.modelEvent = modelEvent;
    },

    isType: function(type) {
        return this.modelEvent instanceof type;
    },

    isNodeRegistered: function() {
        return this.isType(databasy.model.core.events.NodeRegistered);
    },

    isNodeUnregistered: function() {
        return this.isType(databasy.model.core.events.NodeUnregistered);
    },

    isPropertyChangedByNodeId: function(nodeId, field) {
        return this.isType(databasy.model.core.events.PropertyChanged)
            && this.hasFieldValue('node_id', nodeId)
            && this.hasFieldValue('field', field);
    },

    isPropertyChangedByNodeType: function(type, field, model) {
        return this.isType(databasy.model.core.events.PropertyChanged)
            && this.hasIdFieldType('node_id', type, model)
            && this.hasFieldValue('field', field);
    },

    isItemInsertedByNodeId: function(nodeId, field) {
        return this.isType(databasy.model.core.events.ItemInserted)
            && this.hasFieldValue('node_id', nodeId)
            && this.hasFieldValue('field', field);
    },

    isItemInsertedByNodeType: function(nodeType, field, model) {
        return this.isType(databasy.model.core.events.ItemInserted)
            && this.hasIdFieldType('node_id', nodeType, model)
            && this.hasFieldValue('field', field);
    },

    isItemDeletedByNodeId: function(nodeId, field) {
        return this.isType(databasy.model.core.events.ItemDeleted)
            && this.hasFieldValue('node_id', nodeId)
            && this.hasFieldValue('field', field);
    },

    isItemDeletedByNodeIdAndItemId: function(nodeId, field, itemId) {
        if (!this.isItemDeletedByNodeId(nodeId, field)) {
            return false;
        }
        var item = this.modelEvent.val('item');
        if (item instanceof databasy.model.core.nodes.NodeRef) {
            return item.ref_id() === itemId;
        } else if (item instanceof databasy.model.core.nodes.Node) {
            return item.id() === itemId;
        } else {
            throw new Error('Item is not Node or NodeRef.');
        }
    },

    isItemDeletedByNodeType: function(nodeType, field, model) {
        return this.isType(databasy.model.core.events.ItemDeleted)
            && this.hasIdFieldType('node_id', nodeType, model)
            && this.hasFieldValue('field', field);
    },

    hasFieldValue: function(field, value) {
        return this.modelEvent.val(field) === value;
    },

    hasFieldType: function(field, type) {
        return this.modelEvent.val(field) instanceof type;
    },

    hasIdFieldType: function(field, type, model) {
        var id = this.modelEvent.val(field);
        if (id == null) {
            return false; // It's model itself.
        }
        var node = model.node(id);
        return node instanceof type;
    }
});