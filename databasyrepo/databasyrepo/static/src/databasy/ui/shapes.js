databasy.ui.shapes.Canvas = draw2d.Canvas.extend({
    NAME:"databasy.ui.shapes.Canvas",

    init:function (mm, id) {
        this._super(id);
        this.setScrollArea('#' + id);

        this.mm = mm;
    }
});

databasy.ui.shapes.Table = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.shapes.Table",

    init:function (mm, table_repr) {
        this._super(126, 30);
        this.mm = mm;
        this.table_repr = table_repr;

        this.setBackgroundColor('#00bfff');
        this.setColor('#009acd');
        this.setStroke(1.5);
        this.setRadius(8);

        var table = this.table_repr.val_as_node('table', this.mm.model);

        this.label = new draw2d.shape.basic.Label(table.val('name'));
        this.label.setStroke(0);
        this.label.setColor("#0d0d0d");
        this.label.setFontColor("#0d0d0d");
        this.addFigure(this.label, new draw2d.layout.locator.CenterLocator(this));
    },
    draw:function (canvas) {
        var position = this.table_repr.val('position');
        canvas.addFigure(this, position[0], position[1]);
    },
    onDoubleClick:function () {

    },
    onDragEnd: function() {
        var wasMoved = this.isMoving;
        this._super();
        if (wasMoved) {
            var command = new databasy.model.core.commands.MoveTableRepr({
                table_repr_id:this.table_repr.id(),
                new_position:[this.x, this.y]
            });
            this.mm.execute_command(command);
        }
    }
});
