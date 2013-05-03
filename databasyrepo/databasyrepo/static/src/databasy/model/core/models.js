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
    checkers:function() {
        return [
        ]
    },
    register:function (node) {
        var node_id = node.id();
        if (this.exists(node_id)) {
            throw new Error('Node with ID ' + node_id + ' already exists in register.');
        }
        this._node_register[node_id] = node;
        this.val('nodes').push(node);
    },
    unregister:function (node_id) {
        var node = this.node(node_id);
        delete this._node_register[node_id];
        var nodes = this.val('nodes');
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] === node) {
                nodes.splice(i, 1);
                return
            }
        }
        throw new Error('Node ' + node_id + ' not found in the nodes list.')
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
        this.f['nodes'] = [];
        for (var i = 0; i < value.length; i++) {
            var node = value[i];
            this.register(node);
        }
    }
});