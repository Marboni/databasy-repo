databasy.ui.figure.table.column.ColumnIcon = draw2d.shape.basic.Image.extend({
    NAME:"databasy.ui.figure.table.column.ColumnIcon",

    PK_ICON_PATH: '/static/repo/src/img/sprite/key16.png',
    NULL_ICON_PATH: '/static/repo/src/img/sprite/markerBlueEmpty16.png',
    NOT_NULL_ICON_PATH: '/static/repo/src/img/sprite/markerBlueFilled16.png',

    init: function(columnFigure) {
        this._super(this.NULL_ICON_PATH, 16, 16);

        this.columnId = columnFigure.columnId;

        databasy.gw.addListener(this);

        databasy.ui.utils.delegateContextMenu(this, columnFigure);
        databasy.ui.utils.delegateDoubleClick(this, columnFigure);
        databasy.ui.utils.delegateMouseEnter(this, columnFigure);
        databasy.ui.utils.delegateMouseLeave(this, columnFigure);
    },

    setPkState: function() {
        this.setPath(this.PK_ICON_PATH);
    },

    setNullState: function() {
        this.setPath(this.NULL_ICON_PATH);
    },

    setNotNullState: function() {
        this.setPath(this.NOT_NULL_ICON_PATH);
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        var eventTypes = databasy.model.core.events;

        if (event.matches(eventTypes.PropertyChanged, {node_id:this.columnId, field:'pk', new_value: true})) {
            this.setPkState();
        } else if (event.matches(eventTypes.PropertyChanged, {node_id:this.columnId, field:'null'})) {
            var column = databasy.gw.model.node(this.columnId);
            if (column.val('pk') === false) {
                var nullable = modelEvent.val('new_value');
                if (nullable) {
                    this.setNullState();
                } else {
                    this.setNotNullState();
                }
            }
        }
    },

    destroy: function() {
        databasy.gw.removeListener(this);
        this.parent.removeFigure(this);
    }
});