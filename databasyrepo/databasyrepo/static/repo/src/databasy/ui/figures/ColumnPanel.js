databasy.ui.figures.ColumnPanel = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.ColumnPanel",

    init:function (tableFigure) {
        this._super();
        this.tableFigure = tableFigure;

        this.setBackgroundColor('#FFFFFF');
        this.setRadius(0);
        this.setStroke(0);

        this.setMinHeight(0);
        this.setDimension(178, 0);

        tableFigure.attachResizeListener(this);

        databasy.ui.utils.delegateContextMenu(this, this.tableFigure);
        databasy.ui.utils.delegateDoubleClick(this, this.tableFigure);
    },

    createColumn: function(column) {
        var columnFigure = new databasy.ui.figures.Column(this);
        this.addFigure(columnFigure, new databasy.ui.locators.EqualItemsLocator(this));
        columnFigure.render(column);
        this.resetHeight();
    },

    resetHeight: function() {
        var height = 0;
        this.getChildren().each(function(i, child) {
            height += child.height;
        });
        this.setDimension(this.width, height);
        this.tableFigure.resetHeight();
    },

    onOtherFigureIsResizing: function(figure) {
        this.setDimension(figure.width - 2,  this.height);
    }
});
