databasy.ui.figure.table.column.Column = databasy.ui.figure.Rectangle.extend({
    NAME:"databasy.ui.figure.table.column.Column",

    init:function (columnId, tableFigure) {
        this._super(178, 20);
        this.tableFigure = tableFigure;
        this.columnId = columnId;

        databasy.gw.addListener(this);

        this.setBackgroundColor("#ffffff");
        this.setRadius(0);
        this.setStroke(0);

        tableFigure.columnPanel.attachResizeListener(this);

        databasy.ui.utils.delegateDoubleClick(this, tableFigure.columnPanel);

        this.createName();
        this.createIcon();
    },

    render:function () {
        var column = databasy.gw.model.node(this.columnId);
        this.setName(column.val('name'));
    },

    createName:function () {
        this.name = new databasy.ui.widget.Label(this, this.width - 32);
        this.name.setRestorePreviousValueIfEmpty(true);

        this.name.onCommit = $.proxy(function (value) {
            databasy.service.renameColumn(this.columnId, value);
        }, this);

        this.name.onOtherFigureIsResizing = $.proxy(function (tableTitle) {
            this.setWidth(tableTitle.width - 32);
        }, this.name);
        this.attachResizeListener(this.name);

        databasy.ui.utils.delegateContextMenu(this.name, this);

        this.addFigure(this.name, new databasy.ui.locator.InnerVerticalCenterLocator(this, 25));
    },

    createIcon:function () {
        this.icon = new databasy.ui.figure.table.column.ColumnIcon(this);
        this.addFigure(this.icon, new databasy.ui.locator.InnerVerticalCenterLocator(this, 8));
    },

    addComment:function () {
        this.comment = new databasy.ui.figure.Comment(this);
        this.addFigure(this.comment, new databasy.ui.locator.InnerTopRightLocator(this, 2, 0));
    },

    removeComment:function () {
        this.removeFigure(this.comment);
        this.comment = undefined;
    },

    startRename:function () {
        this.name.startEdit();
    },

    setName:function (name) {
        this.name.setText(name);
    },

    onContextMenu:function (x, y) {
        if (databasy.gw.runtime.isEditor()) {
            this.canvas.showContextMenu(this, x, y);
        }
    },

    onMouseEnter:function () {
        if (databasy.gw.runtime.isEditor()) {
            this.setBackgroundColor('#ddf3ff');
        }
    },

    onMouseLeave:function () {
        this.setBackgroundColor('#ffffff');
    },

    onOtherFigureIsResizing:function (figure) {
        this.setDimension(figure.width, this.height);
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;

        var eventTypes = databasy.model.core.events;

        if (event.matches(eventTypes.PropertyChanged, {node_id:this.columnId, field:'name'})) {
            var newValue = modelEvent.val('new_value');
            this.setName(newValue);
        } else if (event.matches(eventTypes.ItemDeleted, {node_id:this.tableFigure.tableId, field:'columns'}) &&
            modelEvent.val('item').ref_id() === this.columnId) {
            this.destroy();
        }
    },

    destroy:function () {
        this.icon.destroy();

        databasy.gw.removeListener(this);
        this.removeFromParent();

        this.tableFigure.columnPanel.resetHeight();
    }
});
