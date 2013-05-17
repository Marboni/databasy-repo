databasy.ui.shapes.Table = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.shapes.Table",

    init:function (layout, tableRepr) {
        this._super(126, 30);
        this.layout = layout;
        this.tableRepr = tableRepr;

        this.setBackgroundColor('#00bfff');
        this.setColor('#009acd');
        this.setStroke(1.5);
        this.setRadius(8);

        var table = this.tableRepr.val_as_node('table', this.layout.mm.model);

        this.label = new draw2d.shape.basic.Label(table.val('name'));
        this.label.setStroke(0);
        this.label.setColor("#0d0d0d");
        this.label.setFontColor("#0d0d0d");
        this.addFigure(this.label, new draw2d.layout.locator.CenterLocator(this));
    },
    draw:function () {
        var position = this.tableRepr.val('position');
        this.layout.canvas.addFigure(this, position[0], position[1]);
    },
    onDoubleClick:function () {

    }
});
