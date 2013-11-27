databasy.gateway.events.ModelChanged = databasy.utils.events.Event.extend({
    init:function(modelEvent) {
        this._super('ModelChanged');
        this.modelEvent = modelEvent;
    },

    isType: function(type) {
        return this.modelEvent instanceof type;
    },

    isNodePropertyChanged: function(nodeId, field) {
        return this.isType(databasy.model.core.events.PropertyChanged)
            && this.hasFieldValue('node_id', nodeId)
            && this.hasFieldValue('field', field);
    },

    isNodeTypePropertyChanged: function(type, field, model) {
        return this.isType(databasy.model.core.events.PropertyChanged)
            && this.hasIdFieldType('node_id', type, model)
            && this.hasFieldValue('field', field);
    },

    isNodeItemInserted: function(nodeId, field) {
        return this.isType(databasy.model.core.events.ItemInserted)
            && this.hasFieldValue('node_id', nodeId)
            && this.hasFieldValue('field', field);
    },

    isNodeTypeItemInserted: function(nodeType, field, model) {
        return this.isType(databasy.model.core.events.ItemInserted)
            && this.hasIdFieldType('node_id', nodeType, model)
            && this.hasFieldValue('field', field);
    },

    isNodeItemDeleted: function(nodeId, field) {
        return this.isType(databasy.model.core.events.ItemDeleted)
            && this.hasFieldValue('node_id', nodeId)
            && this.hasFieldValue('field', field);
    },

    isNodeTypeItemDeleted: function(nodeType, field, model) {
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