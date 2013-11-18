databasy.ui.utils.executeSequentially = function (functions) {
    if (functions.length == 0) {
        return;
    }
    setTimeout(function () {
        functions[0]();
        functions.splice(0, 1);
        databasy.ui.utils.executeSequentially(functions);
    }, 0);
};

databasy.ui.utils.initContextMenu = function () {
    var diagram = databasy.gw.layout.canvas.diagram;
    var diagramContextMenuTool = diagram.toolManager.contextMenuTool;

    $('body').click(function () {
        diagramContextMenuTool.stopTool();
    });

    context.init({
        fadeSpeed:1
    });
    context.attach('#canvasWrapper:not(.readonly)', [
        {
            text:'Create Table',
            action:function (e) {
                var canvas = databasy.gw.layout.canvas;
                var diagramModel = databasy.gw.layout.canvas.diagramModel;
                var tablePosition = diagramModel.cursorDocPosition();
                var tableInfo = databasy.service.createTable(canvas.canvasId, [tablePosition.x, tablePosition.y]);
                diagramModel.startTransaction();
                diagramModel.select(tableInfo.reprId);
                diagramModel.commitTransaction();
            }
        }
    ]);
};
