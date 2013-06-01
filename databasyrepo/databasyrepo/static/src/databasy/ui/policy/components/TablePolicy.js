databasy.ui.policy.components.TablePolicy = draw2d.policy.figure.RectangleSelectionFeedbackPolicy.extend({
    NAME:"databasy.ui.policy.components.TablePolicy",

    onInstall: function(table) {
        if (table instanceof databasy.ui.components.Table) {
            this.gateway = table.gateway;
        } else {
            throw new Error('TablePolicy can\'t be installed on this figure.')
        }
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
    },

    adjustDimension: function(figure, width, height) {
        return this._super(figure, figure.getWidth(), figure.getHeight());
    }
});
