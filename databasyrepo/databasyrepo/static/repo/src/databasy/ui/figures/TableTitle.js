databasy.ui.figures.TableTitle = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.TableTitle",

    init: function(tableFigure) {
        this._super(tableFigure.width, 30);

        this.tableFigure = tableFigure;

        databasy.gw.addListener(this);

        this.setRadius(8);
        this.setAlpha(0);
        this.tableFigure.attachResizeListener(this);
        databasy.ui.utils.delegateContextMenu(this, this.tableFigure);
        databasy.ui.utils.delegateDoubleClick(this, this.tableFigure);

        this.createIcon();
        this.createName();
    },

    createIcon: function() {
        this.icon = new draw2d.shape.basic.Image('/static/repo/src/img/sprite/table16.png', 16, 16);
        databasy.ui.utils.delegateContextMenu(this.icon, this);
        databasy.ui.utils.delegateDoubleClick(this.icon, this);

        this.addFigure(this.icon, new databasy.ui.locators.InnerVerticalCenterLocator(this, 8));
    },

    createName: function() {
        this.name = new databasy.ui.widgets.Label(this, this.width - 32);
        this.name.setBold(true);

        this.name.onCommit = $.proxy(function(value) {
            databasy.service.renameTable(this.tableFigure.tableId, value);
        }, this);

        this.name.onOtherFigureIsResizing = $.proxy(function(tableTitle) {
            this.setWidth(tableTitle.width - 32);
        }, this.name);
        this.attachResizeListener(this.name);

        databasy.ui.utils.delegateContextMenu(this.name, this);

        this.addFigure(this.name, new databasy.ui.locators.InnerVerticalCenterLocator(this, 25));
    },

    startRename: function() {
        this.name.startEdit();
    },

    setName: function(name) {
        this.name.setText(name);
    },

    onOtherFigureIsResizing: function(figure) {
        this.setDimension(figure.width,  this.height);
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        var eventTypes = databasy.model.core.events;

        if (event.matches(eventTypes.PropertyChanged, {node_id:this.tableFigure.tableId, field:'name'})) {
            this.setName(modelEvent.val('new_value'))
        }
    },

    destroy: function() {
        databasy.gw.removeListener(this);
        this.canvas.removeFigure(this);
    }
});