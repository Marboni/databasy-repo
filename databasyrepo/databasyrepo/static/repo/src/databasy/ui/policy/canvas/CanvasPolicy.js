databasy.ui.policy.canvas.CanvasPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME:"databasy.ui.policy.canvas.CanvasPolicy",

    onMouseUp: function(canvas, x,y) {
        if (!databasy.gw.runtime.isEditor()) {
            return;
        }

        var toolbar = databasy.gw.layout.toolbar;
        var currentTool = toolbar.getCurrentTool();
        var pos = [Math.round(x), Math.round(y)];
        var selectDefaultTool = this.applyTool(currentTool, canvas, pos);
        if (selectDefaultTool) {
            toolbar.selectDefault();
        }

        if (databasy.context.has('tableReprWidthChanged')) {
            var change = databasy.context.pop('tableReprWidthChanged');
            databasy.service.updateTableReprWidth(change.tableReprId, change.width);
        }
    },

    applyTool: function(tool, canvas, pos) {
        // Returns True if default tool must be selected on the toolbar, False if toolbar must be left as is.
        var tb = databasy.ui.layout.Toolbar;
        switch (tool) {
            case tb.POINTER:
                return false;
            case tb.CREATE_TABLE:
                this.createTable(canvas, pos);
                return true;
            default:
                return false;
        }
    },
    createTable:function(canvas, position) {
        var tableId = databasy.service.createTable(canvas.canvasId, position);

        var figure = canvas.getFigureByElementId(tableId);
        figure.startRename();
    }
});
