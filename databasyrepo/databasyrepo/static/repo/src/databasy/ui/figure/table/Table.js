databasy.ui.figure.table.Table = databasy.ui.figure.Rectangle.extend({
    NAME:"databasy.ui.figure.table.Table",

    init:function (tableId, tableReprId) {
        this.tableId = tableId;
        this.tableReprId = tableReprId;

        databasy.gw.addListener(this);

        this._super(65, 30);
        this.setMinWidth(65);

        // If internal logic changes figure size, this flag will be true. Otherwise it's false. It allows to prevent
        // user to resize figure, but allow resizing in code.
        this.internalModification = false;

        this.attachResizeListener(this);

        this.installEditPolicy(new databasy.ui.policy.figure.TablePolicy());

        this.setBackgroundColor('#00bfff');
        this.setColor('#009acd');
        this.setStroke(2);
        this.setRadius(8);

        this.createTitlePanel();
        this.createColumnPanel();

        this.addComment();
    },

    render: function() {
        var model = databasy.gw.model;
        var table = model.node(this.tableId);
        var tableRepr = model.node(this.tableReprId);

        this.setName(table.val('name'));
        this.setWidth(tableRepr.val('width'));
        var position = tableRepr.val('position');
        this.setPosition(position[0], position[1]);

        var columnRefs = table.val('columns');
        for (var index = 0; index < columnRefs.length; index++) {
            var columnRef = columnRefs[index];
            this.createColumn(columnRef.ref_id(), index);
        }
    },

    getElementId:function () {
        return this.tableId
    },

    getReprId:function () {
        return this.tableReprId;
    },

    createTitlePanel:function () {
        this.title = new databasy.ui.figure.table.TableTitle(this);
        this.addFigure(this.title, new databasy.ui.locator.InnerPositionLocator(this, 0, 0));
    },

    createColumnPanel:function () {
        this.columnPanel = new databasy.ui.figure.table.column.ColumnPanel(this);
        this.addFigure(this.columnPanel, new databasy.ui.locator.InnerPositionLocator(this, 1, this.title.height));
    },

    addComment:function () {
        this.comment = new databasy.ui.figure.Comment(this);
        this.title.addFigure(this.comment, new databasy.ui.locator.InnerTopRightLocator(this.title, 1, -1));
    },

    removeComment:function () {
        this.removeFigure(this.comment);
        this.comment = undefined;
    },

    resetHeight:function () {
        var height = 0;
        this.getChildren().each(function (i, child) {
            height += child.height;
        });
        if (height != this.title.height) {
            height += 8; // Adding footer.
        }

        this.setDimensionInternally(this.width, height);
    },

    highlight:function () {
        var c = this.getBackgroundColor();
        var c2 = c.lighter(0.1);

        var setColor1 = $.proxy(this.setBackgroundColor, this, c);
        var setColor2 = $.proxy(this.setBackgroundColor, this, c2);

        this.setBackgroundColor(c2);
        setTimeout(setColor1, 150);
        setTimeout(setColor2, 300);
        setTimeout(setColor1, 450);
        setTimeout(setColor2, 600);
        setTimeout(setColor1, 750);
    },

    setName:function (name) {
        this.title.setName(name);
    },

    setWidth:function (width) {
        this.setDimensionInternally(width, this.height);
    },

    startRename:function () {
        this.title.startRename();
    },

    createColumn:function (columnId, index) {
        return this.columnPanel.createColumn(columnId, index);
    },

    setEditable:function (editable) {
        if (editable != this.isResizeable()) {
            this.setResizeable(editable);
        }
        if (editable != this.isDraggable()) {
            this.setDraggable(editable);
        }
        if (!editable && this.canvas.getSelection().contains(this)) {
            this.unselect();
        }
    },

    setDimensionInternally:function (w, h) {
        this.internalModification = true;
        this.setDimension(w, h);
        this.internalModification = false;
    },

    onDoubleClick:function () {
    },

    onDragStart:function (relativeX, relativeY) {
        if (!databasy.gw.runtime.isEditor()) {
            return false;
        }

        this._super(relativeX, relativeY);

        if (!this._dragStartPosition) {
            this._dragStartPosition = this.getPosition();
        }

        return true;
    },

    onDragEnd:function () {
        if (!databasy.gw.runtime.isEditor()) {
            return;
        }
        this._super();

        var dragEndPosition = this.getPosition();
        if (!this._dragStartPosition.equals(dragEndPosition)) {
            databasy.service.updateTableReprPosition(this.tableReprId, dragEndPosition.getX(), dragEndPosition.getY());
        }
        this._dragStartPosition = undefined;
    },

    onContextMenu:function (x, y) {
        if (databasy.gw.runtime.isEditor()) {
            this.canvas.showContextMenu(this, x, y);
        }
    },

    onOtherFigureIsResizing:function (figure) {
        if (figure === this) {
            if (databasy.gw.runtime.isEditor()) {
                databasy.context.put('tableReprWidthChanged', {
                    tableReprId:this.tableReprId,
                    width:this.width
                });
            }
        }
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;

        var eventTypes = databasy.model.core.events;

        if (event.matches(eventTypes.ItemInserted, {node_id:this.tableId, field:'columns'})) {
            // Column added.
            var item = modelEvent.val('item');
            var index = modelEvent.val('index');
            var columnId = item.ref_id();
            var columnFigure = this.createColumn(columnId, index);
            columnFigure.startRename();
        } else if (event.matches(eventTypes.PropertyChanged, {node_id:this.tableReprId, field:'position'})) {
            var newValue = modelEvent.val('new_value');
            this.setPosition(newValue[0], newValue[1]);
        } else if (event.matches(eventTypes.PropertyChanged, {node_id:this.tableReprId, field:'width'})) {
            this.setWidth(modelEvent.val('new_value'));
        } else if (event.matches(eventTypes.ItemDeleted, {node_id:this.canvas.canvasId, field:'reprs'}) &&
            modelEvent.val('item').ref_id() === this.tableReprId) {
            this.destroy();
        }
    },

    onRuntimeChanged:function (event) {
        var rt = event.runtime;
        var editable = rt.isEditor();

        this.setEditable(editable);
    },

    destroy:function () {
        this.title.destroy();
        this.columnPanel.destroy();

        databasy.gw.removeListener(this);
        this.removeFromParent();
    }
});
