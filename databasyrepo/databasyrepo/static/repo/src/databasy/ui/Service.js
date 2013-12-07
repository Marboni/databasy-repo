databasy.ui.Service = Class.extend({
    createTable: function(position) {
        var canvas = databasy.gw.layout.canvas;
        var diagramModel = canvas.diagramModel;

        var tableInfo = databasy.service.createTable(canvas.canvasId, position);

        diagramModel.startTransaction();
        diagramModel.select(tableInfo.reprId);
        diagramModel.startTableNameEditing(tableInfo.reprId);
        diagramModel.commitTransaction();

        databasy.gw.layout.propertyPanel.show(tableInfo.elementId);
        databasy.gw.layout.openPropertyPanel();
    },

    createColumn: function(tableId, position) {
        var diagramModel = databasy.gw.layout.canvas.diagramModel;

        var columnId = databasy.service.createColumn(tableId, position);
        diagramModel.startTransaction();
        diagramModel.startColumnEditing(columnId);
        diagramModel.commitTransaction();
    }
});