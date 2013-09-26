databasy.ui.figures.ColumnPanel = databasy.ui.figures.Rectangle.extend({
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

    createColumn:function (columnId, index) {
        var columnFigure = new databasy.ui.figures.Column(columnId, this.tableFigure);
        this.insertFigure(columnFigure, index, new databasy.ui.locators.EqualItemsLocator(this));
        columnFigure.render();
        this.resetHeight();
        return columnFigure;
    },

    resetHeight:function () {
        var height = 0;
        this.getChildren().each(function (i, child) {
            height += child.height;
        });
        this.setDimension(this.width, height);
        this.tableFigure.resetHeight();
    },

    onOtherFigureIsResizing:function (figure) {
        this.setDimension(figure.width - 2, this.height);
    },

    destroy:function () {
        this.getChildren().each(function(i, figure) {
            figure.destroy();
        });
        this.removeFromParent();
    }
});
