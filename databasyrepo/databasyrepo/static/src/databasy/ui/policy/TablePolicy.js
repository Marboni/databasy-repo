databasy.ui.policy.TablePolicy = draw2d.policy.figure.RectangleSelectionFeedbackPolicy.extend({
    init:function (layout) {
        this._super();
        this.layout = layout;
    },

    onDragStart:function (canvas, figure) {
        if (!this.layout.isEditable()) {
            return;
        }
        this._super(canvas, figure);
        this._dragStartPosition = new draw2d.geo.Point(figure.getX(), figure.getY());
    },

    onDragEnd:function (canvas, figure) {
        if (!this.layout.isEditable()) {
            return;
        }
        this._super(canvas, figure);

        var dragEndPosition = new draw2d.geo.Point(figure.getX(), figure.getY());
        if (!this._dragStartPosition.equals(dragEndPosition)) {
            var command = new databasy.model.core.commands.MoveTableRepr({
                table_repr_id:figure.tableRepr.id(),
                new_position:[figure.x, figure.y]
            });
            this.layout.mm.execute_command(command);
        }
    },

    adjustPosition:function (figure, x, y) {
        return this.layout.isEditable() ? this._super(figure, x, y) : new draw2d.geo.Point(figure.getX(), figure.getY());
    }
});
