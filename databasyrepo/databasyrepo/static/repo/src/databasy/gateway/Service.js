databasy.gateway.Service = Class.extend({
    init: function(model) {
        this.model = model;
    },

    uuid: function() {
        return databasy.model.utils.uuid();
    },

    deleteReprElements: function(reprIds) {
        $.each(reprIds, $.proxy(function (i, reprId) {
            var selectedNode = databasy.gw.model.node(reprId);
            if (selectedNode instanceof databasy.model.core.reprs.TableRepr) {
                this.deleteTable(selectedNode.val('table').ref_id());
            }
        }, this));
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

        return {
            elementId: tableId,
            reprId: reprId
        };
    },

    renameTable: function(tableId, name) {
        var table = this.model.node(tableId);
        if (table.val('name') === name) {
            return;
        }
        var command = new databasy.model.core.commands.RenameTable({
            table_id:tableId,
            new_name:name
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
        var tableRepr = this.model.node(tableReprId);
        if (tableRepr.val('position') === [x, y]) {
            return;
        }
        var command = new databasy.model.core.commands.UpdateTableRepr({
            table_repr_id:tableReprId,
            fields: ['position'],
            position:[x, y]
        });
        databasy.gw.executeCommand(command);
    },

    updateTableReprWidth: function(tableReprId, width) {
        var tableRepr = this.model.node(tableReprId);
        if (tableRepr.val('width') === width) {
            return;
        }
        var command = new databasy.model.core.commands.UpdateTableRepr({
            table_repr_id:tableReprId,
            fields: ['width'],
            width:width
        });
        databasy.gw.executeCommand(command);
    },

    createColumn: function(tableId, index) {
        var column_id = this.uuid();
        var command = new databasy.model.core.commands.CreateColumn({
            table_id:tableId,
            column_id:column_id,
            name:'column',
            type:databasy.model.core.elements.Column.DEFAULT_TYPE,
            index:index
        });
        databasy.gw.executeCommand(command);

        return column_id;
    },

    updateColumn: function(columnId, values) {
        var column = this.model.node(columnId);
        var updateRequired = false;
        $.each(values, function(field, value) {
            if (column.val(field) !== value) {
                updateRequired = true;
                return false;
            }
            return true;
        });
        if (updateRequired) {
            var commandArgs = {
                column_id: columnId,
                fields: []
            };
            $.each(values, function(field, value) {
                commandArgs.fields.push(field);
                commandArgs[field] = value;
            });
            var command = new databasy.model.core.commands.UpdateColumn(commandArgs);
            databasy.gw.executeCommand(command);
        }
    },

    deleteColumn: function(columnId) {
        var command = new databasy.model.core.commands.DeleteColumn({
            column_id:columnId
        });
        databasy.gw.executeCommand(command);
    }
});
