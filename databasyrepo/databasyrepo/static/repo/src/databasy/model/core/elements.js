databasy.model.core.elements.Table = databasy.model.core.nodes.Node.extend({
    init: function(params) {
        this._super(params);
        if (this.val('columns') === null) {
            this.set('columns', []);
        }
    },

    fields:function () {
        return this._super().concat(
            'name',
            'columns'
        )
    }
}, {
    CODE: 'core.elements.Table'
});

databasy.model.core.elements.Column = databasy.model.core.nodes.Node.extend({
    fields:function () {
        return this._super().concat(
            'table',
            'name'
        )
    }
}, {
    CODE: 'core.elements.Column'
});