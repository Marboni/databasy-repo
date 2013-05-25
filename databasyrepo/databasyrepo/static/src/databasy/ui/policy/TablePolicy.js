databasy.ui.policy.TablePolicy = draw2d.policy.figure.RectangleSelectionFeedbackPolicy.extend({
    NAME:"databasy.ui.policy.TablePolicy",

    init:function (gateway) {
        this._super();
        this.gateway = gateway;
    },

    onDragStart:function (canvas, figure) {
        if (!this.gateway.userRoles.isEditor()) {
            return;
        }
        this._super(canvas, figure);
        this._dragStartPosition = new draw2d.geo.Point(figure.getX(), figure.getY());
    },

    onDragEnd:function (canvas, figure) {
        if (!this.gateway.userRoles.isEditor()) {
            return;
        }
        this._super(canvas, figure);

        var dragEndPosition = new draw2d.geo.Point(figure.getX(), figure.getY());
        if (!this._dragStartPosition.equals(dragEndPosition)) {
            var command = new databasy.model.core.commands.MoveTableRepr({
                table_repr_id:figure.tableRepr.id(),
                new_position:[figure.x, figure.y]
            });
            this.gateway.executeCommand(command);
        }
    },

    adjustPosition:function (figure, x, y) {
        return this.gateway.userRoles.isEditor() ?
            this._super(figure, x, y) : new draw2d.geo.Point(figure.getX(), figure.getY());
    }
});