databasy.model.core.nodes.Node = databasy.model.core.serializing.Serializable.extend({
    fields:function () {
        return this._super().concat(
            '_id'
        )
    },
    id: function() {
        return this.val('_id');
    }
});

databasy.model.core.nodes.NodeRef = databasy.model.core.serializing.Serializable.extend({
    fields:function () {
        return this._super().concat(
            'ref_id',
            'ref_type'
        )
    },
    ref_node: function(model) {
        return model.node(this.val('ref_id'));
    }
}, {
    CODE:"core.nodes.NodeRef"
});
