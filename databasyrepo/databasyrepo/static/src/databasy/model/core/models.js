databasy.model.core.models.Model = databasy.model.core.nodes.Node.extend({
    init:function () {
        this._super();
        this._node_register = {};
    },
    fields:function () {
        return this._super().concat(
            'model_id',
            'version',

            'nodes',
            'canvases',
            'tables'
        )
    },
    register:function (node) {
        var node_id = node.id();
        if (this.exists(node_id)) {
            throw new Error('Node with ID ' + node_id + ' already exists in register.');
        }
        this._node_register[node_id] = node;
    },
    unregister:function (node_id) {
        if (!this.exists(node_id)) {
            throw new Error('Node with ID ' + node_id + ' not exists in register.');
        }
        delete this._node_register[node_id]
    },
    node:function (node_id, cls) {
        if (!this.exists(node_id)) {
            throw new Error('Node with ID ' + node_id + ' not exists in register.');
        }
        var node = this._node_register[node_id];
        if (cls !== undefined && !(node instanceof cls)) {
            throw new Error('Node with ID ' + node_id + ' has incorrect type.');
        }
        return node;
    },
    exists:function (node_id) {
        return this._node_register.hasOwnProperty(node_id);
    },
    set_nodes:function(value) {
        for (var i = 0; i < value.length; i++) {
            var node = value[i];
            this.register(node);
        }
    }
});