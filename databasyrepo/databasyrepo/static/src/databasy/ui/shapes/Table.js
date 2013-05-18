databasy.ui.shapes.Table = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.shapes.Table",

    init:function (canvas, gateway, tableRepr) {
        this._super(126, 30);
        this.gateway = gateway;
        this.tableRepr = tableRepr;

        this.installEditPolicy(new databasy.ui.policy.TablePolicy(gateway));

        this.setBackgroundColor('#00bfff');
        this.setColor('#009acd');
        this.setStroke(1.5);
        this.setRadius(8);

        var table = this.tableRepr.val_as_node('table', this.gateway.model);

        this.label = new draw2d.shape.basic.Label(table.val('name'));
        this.label.setStroke(0);
        this.label.setColor("#0d0d0d");
        this.label.setFontColor("#0d0d0d");
        this.addFigure(this.label, new draw2d.layout.locator.CenterLocator(this));
    },
    draw:function (canvas) {
        var position = this.tableRepr.val('position');
        canvas.addFigure(this, position[0], position[1]);
    },
    onDoubleClick:function () {

    }
});
