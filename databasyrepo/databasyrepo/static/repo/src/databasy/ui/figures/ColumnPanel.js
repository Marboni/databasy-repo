databasy.ui.figures.ColumnPanel = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.ColumnPanel",

    init:function (tableFigure) {
        this._super();
        this.tableFigure = tableFigure;
        this.gateway = tableFigure.gateway;

        this.gateway.addListener(this);

        this.setBackgroundColor('#FFFFFF');
        this.setRadius(0);
        this.setStroke(0);

        this.setMinHeight(0);
        this.setDimension(178, 0);

        databasy.ui.utils.delegateContextMenu(this, this.tableFigure);
        databasy.ui.utils.delegateDoubleClick(this, this.tableFigure);
    },

    addColumn: function(name) {
        var column = new databasy.ui.figures.Column(this.tableFigure, name);
        this.addFigure(column, new databasy.ui.locators.EqualItemsLocator(this));
        this.resetHeight();
    },

    resetHeight: function() {
        var height = 0;
        this.getChildren().each(function(i, child) {
            height += child.height;
        });
        this.setDimension(this.width, height);
        this.tableFigure.resetHeight();
    }
});
