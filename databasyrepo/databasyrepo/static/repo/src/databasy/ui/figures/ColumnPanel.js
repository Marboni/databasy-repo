databasy.ui.figures.ColumnPanel = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.ColumnPanel",

    init:function (tableFigure) {
        this._super(178, 0);
        this.tableFigure = tableFigure;
        this.gateway = tableFigure.gateway;

        this.gateway.addListener(this);

        this.setBackgroundColor('#FFFFFF');
        this.setColor('#FFFFFF');
        this.setRadius(0);
        this.setStroke(0);
    },

    addColumn: function(name) {
        var column = new databasy.ui.figures.Column(this.gateway, name);
        this.addFigure(column, new databasy.ui.locators.EqualItemsLocator(this));
        this.resetHeight();
    },

    resetHeight: function() {
        var children = this.getChildren();
        var height = 0;
        for (var i = 0; i < children.length; i++) {
            height += children[i].h;
        }
        this.setDimension(this.width, height);

        this.tableFigure.resetHeight();
    }
});
