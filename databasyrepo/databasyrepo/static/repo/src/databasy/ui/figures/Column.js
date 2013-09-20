databasy.ui.figures.Column = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.Column",

    init:function (columnPanelFigure) {
        this._super(178, 20);
        this.columnPanelFigure = columnPanelFigure;

        this.setAlpha(0);
        this.setRadius(0);
        this.setStroke(0);

        columnPanelFigure.attachResizeListener(this);

        databasy.ui.utils.delegateContextMenu(this, this.columnPanelFigure);
        databasy.ui.utils.delegateDoubleClick(this, this.columnPanelFigure);

        this.createName();
    },

    render: function(column) {
        this.setName(column.val('name'));
    },

    createName: function() {
        this.name = new databasy.ui.widgets.Label(this.width - 27);

        this.name.onCommit = $.proxy(function(value) {
            //this.tableFigure.renameTable(value);
        }, this);

        this.name.onOtherFigureIsResizing = $.proxy(function(tableTitle) {
            this.setWidth(tableTitle.width - 27);
        }, this.name);
        this.attachResizeListener(this.name);

        databasy.ui.utils.delegateContextMenu(this.name, this);

        this.addFigure(this.name, new databasy.ui.locators.InnerVerticalCenterLocator(this, 20));
    },

    addComment: function() {
        this.comment = new databasy.ui.figures.Comment(this);
        this.addFigure(this.comment, new databasy.ui.locators.InnerTopRightLocator(this, 2, 0));
    },

    removeComment:function() {
        this.removeFigure(this.comment);
        this.comment = undefined;
    },

    setName: function(name) {
        this.name.setText(name);
    },

    onOtherFigureIsResizing: function(figure) {
        this.setDimension(figure.width,  this.height);
    }
});
