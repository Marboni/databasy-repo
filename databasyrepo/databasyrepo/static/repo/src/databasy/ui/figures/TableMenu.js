databasy.ui.figures.TableMenu = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.TableMenu",

    init: function(tableFigure) {
        this._super(tableFigure.width, 30);

        this.tableFigure = tableFigure;

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
        this.name = new databasy.ui.widgets.Label(this.width - 35, this.tableFigure.table.val('name'));

        this.name.onCommit = $.proxy(function(value) {
            this.tableFigure.renameTable(value);
        }, this);

        this.name.onOtherFigureIsResizing = $.proxy(function(tableTitle) {
            this.setWidth(tableTitle.width - 35);
        }, this.name);
        this.attachResizeListener(this.name);

        databasy.ui.utils.delegateContextMenu(this.name, this);

        this.addFigure(this.name, new databasy.ui.locators.InnerVerticalCenterLocator(this, 28));
    },

    startRename: function() {
        var editor = this.name.editor;
        editor.start(this.name);
    },

    setName: function(name) {
        this.name.setText(name);
    },

    onOtherFigureIsResizing: function(figure) {
        this.setDimension(figure.width,  this.height);
    }
});