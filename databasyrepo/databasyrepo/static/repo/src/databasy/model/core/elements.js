databasy.model.core.elements.Table = databasy.model.core.nodes.Node.extend({
    init: function(params) {
        this._super(params);
        if (this.val('columns') === null) {
            this.set('columns', []);
        }
        if (this.val('indexes') === null) {
            this.set('indexes', []);
        }
    },

    fields:function () {
        return this._super().concat(
            'name',
            'columns',
            'indexes'
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

databasy.model.core.elements.Index = databasy.model.core.nodes.Node.extend({
    init: function(params) {
        this._super(params);
        if (this.val('index_columns') === null) {
            this.set('index_columns', []);
        }
    },

    fields:function () {
        return this._super().concat(
            'table',
            'name',
            'type',
            'index_columns'
        )
    }
}, {
    PRIMARY_TYPE: 'PRIMARY',
    UNIQUE_TYPE: 'UNIQUE',
    INDEX_TYPE: 'INDEX',

    TYPES: [
        this.PRIMARY_TYPE,
        this.UNIQUE_TYPE,
        this.INDEX_TYPE
    ]
});

databasy.model.core.elements.IndexColumn = databasy.model.core.nodes.Node.extend({
    fields:function () {
        return this._super().concat(
            'index',
            'column',
            'order'
        )
    }
}, {
    ASC_ORDER: 'ASC',
    DESC_ORDER: 'DESC',

    ORDERS: [
        this.ASC_ORDER,
        this.DESC_ORDER
    ]
});