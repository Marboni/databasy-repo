databasy.ui.figures.Table = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.Table",

    init:function (tableId, tableReprId) {
        this.tableId = tableId;
        this.tableReprId = tableReprId;

        databasy.gw.addListener(this);

        this.columnsCache = {}; // Column ID and column figure.

        this._super(65, 30);
        this.setMinWidth(65);

        // If internal logic changes figure size, this flag will be true. Otherwise it's false. It allows to prevent
        // user to resize figure, but allow resizing in code.
        this.internalModification = false;

        this.attachResizeListener(this);

        this.installEditPolicy(new databasy.ui.policy.figures.TablePolicy());

        this.setBackgroundColor('#00bfff');
        this.setColor('#009acd');
        this.setStroke(2);
        this.setRadius(8);

        this.createTitle();
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

        var columns = table.val_as_node('columns', model);
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            this.createColumn(column);
        }
    },

    getElementId:function () {
        return this.tableId
    },

    getReprId:function () {
        return this.tableReprId;
    },

    createTitle:function () {
        this.title = new databasy.ui.figures.TableTitle(this);
        this.addFigure(this.title, new databasy.ui.locators.InnerPositionLocator(this, 0, 0));
    },

    createColumnPanel:function () {
        this.columnPanel = new databasy.ui.figures.ColumnPanel(this);
        this.addFigure(this.columnPanel, new databasy.ui.locators.InnerPositionLocator(this, 1, this.title.height));
    },

    addComment:function () {
        this.comment = new databasy.ui.figures.Comment(this);
        this.title.addFigure(this.comment, new databasy.ui.locators.InnerTopRightLocator(this.title, 1, -1));
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

    renameTable:function (newName) {
        databasy.service.renameTable(this.tableId, newName);
    },

    startRename:function () {
        this.title.startRename();
    },

    createColumn:function (column) {
        this.columnPanel.createColumn(column);
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

    getColumn:function (columnId) {
        // TODO
    },

    getColumnCount: function() {
        var count = 0;
        for (var column in this.columnsCache) {
            count++;
        }
        return count;
    },

    onDoubleClick:function () {
    },

    onDragStart:function (relativeX, relativeY) {
        if (!databasy.gw.runtime.isEditor()) {
            return false;
        }
        this._super(relativeX, relativeY);
        this._dragStartPosition = this.getPosition();
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
        var model = databasy.gw.model;

        var eventTypes = databasy.model.core.events;

        if (event.matches(eventTypes.ItemInserted, {node_id:this.tableId, field:'columns'})) {
            // Column added.
            var item = modelEvent.val('item');
            var index = modelEvent.val('index');
            var column = item.ref_node(model);
            this.createColumn(column);
        } else if (event.matches(eventTypes.PropertyChanged, {node_id:this.tableReprId, field:'position'})) {
            var newValue = modelEvent.val('new_value');
            this.setPosition(newValue[0], newValue[1]);
        } else if (event.matches(eventTypes.PropertyChanged, {node_id:this.tableReprId, field:'width'})) {
            this.setWidth(modelEvent.val('new_value'));
        } else if (event.matches(eventTypes.PropertyChanged, {node_id:this.tableId, field:'name'})) {
            this.setName(modelEvent.val('new_value'))
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
        databasy.gw.removeListener(this);
        this.canvas.removeFigure(this);
    }
});
