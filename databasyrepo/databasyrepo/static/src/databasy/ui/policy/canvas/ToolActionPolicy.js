databasy.ui.policy.canvas.ToolActionPolicy = draw2d.policy.canvas.CanvasPolicy.extend({
    NAME:"databasy.ui.policy.canvas.ToolActionPolicy",

    onInstall:function(canvas) {
        if (canvas instanceof databasy.ui.shapes.Canvas) {
            this.gateway = canvas.gateway;
        } else {
            throw new Error("ToolActionPolicy can't be installed on this canvas.")
        }
    },

    onMouseUp: function(canvas, x,y) {
        if (!this.gateway.userRoles.isEditor()) {
            return;
        }
        var toolbar = this.gateway.layout.toolbar;
        var currentTool = toolbar.getCurrentTool();
        var pos = [x, y];
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
        var model = this.gateway.model;

        // Searching for default name of table. Its format is "Table<N>" where <N> is integer. Name should be unique.
        var tables = model.val_as_node('tables', model);
        var tableNames = $.map(tables, function(table, i) {
            return table.val('name');
        });
        var newTableNamePrefix = 'Table';
        var newTableNameSuffix = 1;
        var newTableName = newTableNamePrefix + newTableNameSuffix;
        while ($.inArray(newTableName, tableNames) !== -1) {
            newTableName = newTableNamePrefix + ++newTableNameSuffix;
        }
        // New name found.

        var uuid = databasy.model.utils.uuid;
        var command = new databasy.model.core.commands.CreateTable({
            table_id: uuid(),
            default_table_repr_id: uuid(),
            name: newTableName,
            canvas_id: canvas.canvasNode.id(),
            position: pos
        });
        this.gateway.executeCommand(command);
    }
});
