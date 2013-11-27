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
    init: function(params) {
        this._super(params);
        if (this.val('null') === null) {
            this.set('null', true);
        }
    },

    fields:function () {
        return this._super().concat(
            'table',
            'name',
            'type',
            'null',
            'default'
        )
    }
}, {
    CODE: 'core.elements.Column',
    DEFAULT_TYPE: 'VARCHAR(255)'
});