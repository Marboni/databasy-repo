databasy.ui.shapes.Canvas = draw2d.Canvas.extend({
    NAME:"databasy.ui.shapes.Canvas",

    init:function (layout, id) {
        this._super(id);
        this.setScrollArea('#' + id);

        this.layout = layout;
    },

    drawTable: function(repr) {
        var shape = new databasy.ui.shapes.Table(this.layout, repr);
        shape.draw();
    }
});