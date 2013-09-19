databasy.gateway.Service = Class.extend({
    init: function(model) {
        this.model = model;
    },

    uuid: function() {
        return databasy.model.utils.uuid();
    },

    createTable: function(canvasNodeId, position) {
        var tableId = this.uuid();
        var reprId = this.uuid();
        var command = new databasy.model.core.commands.CreateTable({
            table_id: tableId,
            default_table_repr_id: reprId,
            name: 'table',
            canvas_id: canvasNodeId,
            position: position
        });
        databasy.gw.executeCommand(command);

        return tableId;
    },

    renameTable: function(tableId, newName) {
        var table = this.model.node(tableId);
        if (table.val('name') === newName) {
            return;
        }
        var command = new databasy.model.core.commands.RenameTable({
            table_id:tableId,
            new_name:newName
        });
        databasy.gw.executeCommand(command);
    },

    deleteTable: function(tableId) {
        var command = new databasy.model.core.commands.DeleteTable({
            table_id:tableId
        });
        databasy.gw.executeCommand(command);
    },

    updateTableReprPosition: function(tableReprId, x, y) {
        var command = new databasy.model.core.commands.UpdateTableRepr({
            table_repr_id:tableReprId,
            fields: ['position'],
            position:[x, y]
        });
        databasy.gw.executeCommand(command);
    },

    updateTableReprWidth: function(tableReprId, width) {
        var command = new databasy.model.core.commands.UpdateTableRepr({
            table_repr_id:tableReprId,
            fields: ['width'],
            width:width
        });
        databasy.gw.executeCommand(command);
    },

    createColumn: function(tableId) {
        var column_id = this.uuid();
        var command = new databasy.model.core.commands.CreateColumn({
            table_id:tableId,
            column_id:column_id,
            name:'column',
            index:0
        });
        databasy.gw.executeCommand(command);
    }
});
