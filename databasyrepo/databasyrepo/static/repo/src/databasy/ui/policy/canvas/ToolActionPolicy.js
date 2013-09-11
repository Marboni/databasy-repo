databasy.ui.policy.canvas.ToolActionPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME:"databasy.ui.policy.canvas.ToolActionPolicy",

    onInstall:function(canvas) {
        if (canvas instanceof databasy.ui.layout.canvas.Canvas) {
            this.gateway = canvas.gateway;
        } else {
            throw new Error("ToolActionPolicy can't be installed on this canvas.")
        }
    },

    onMouseUp: function(canvas, x,y) {
        if (!this.gateway.runtime.isEditor()) {
            return;
        }
        var toolbar = this.gateway.layout.toolbar;
        var currentTool = toolbar.getCurrentTool();
        var pos = [Math.round(x), Math.round(y)];
        var selectDefaultTool = this.applyTool(currentTool, canvas, pos);
        if (selectDefaultTool) {
            toolbar.selectDefault();
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
    createTable:function(canvas, pos) {
        var uuid = databasy.model.utils.uuid;
        var table_id = uuid();
        var repr_id = uuid();
        var command = new databasy.model.core.commands.CreateTable({
            table_id: table_id,
            default_table_repr_id: repr_id,
            name: 'table',
            canvas_id: canvas.canvasNode.id(),
            position: pos
        });
        this.gateway.executeCommand(command);

        var figure = canvas.figureByElementId(table_id);
        setTimeout($.proxy(figure.startRename, figure), 100);
    }
});
