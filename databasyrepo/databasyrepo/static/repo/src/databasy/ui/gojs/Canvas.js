databasy.ui.gojs.Canvas = Class.extend({
    init:function (domElementId) {
        databasy.gw.addListener(this);

        this.canvasId = this.getDefaultCanvasNode().id();

        this.initGo(domElementId);
        this.renderFigures();

        this.diagramModel.setReadOnly(true);
    },

    initGo:function (domElementId) {
        this.diagram = new go.Diagram(domElementId);
        this.diagram.initialContentAlignment = go.Spot.Center;
        this.diagram.padding = 300;

        var templates = new databasy.ui.gojs.Templates();
        this.diagram.contextMenu = templates.contextMenuTemplate();
        this.diagram.nodeTemplateMap = templates.createNodeTemplateMap();
        this.diagram.linkTemplateMap = templates.createLinkTemplateMap();

        this.diagram.addDiagramListener('PartResized', function(diagramEvent) {
            if (!databasy.gw.runtime.isEditor()) {
                return;
            }
            var part = diagramEvent.subject;
            var data = part.data;
            switch (data.category) {
                case 'table': {
                    databasy.service.updateTableReprWidth(data.key, part.width);
                    break;
                }
            }
        });

        this.diagram.addDiagramListener('SelectionMoved', function(diagramEvent) {
            if (!databasy.gw.runtime.isEditor()) {
                return;
            }
            var movedPartsIt = diagramEvent.diagram.selection.iterator;
            while(movedPartsIt.next()) {
                var part = movedPartsIt.value;
                var position = part.position;
                var data = part.data;
                switch (data.category) {
                    case 'table': {
                        databasy.service.updateTableReprPosition(data.key, position.x, position.y);
                        break;
                    }
                }
            }
        });

        this.diagramModel = new databasy.ui.gojs.DiagramModel(this.diagram);
    },

    renderFigures:function () {
        var that = this;
        var functions = [];

        var canvas = databasy.gw.model.node(this.canvasId);
        var reprs = canvas.val_as_node('reprs', databasy.gw.model);
        $.each(reprs, function (index, repr) {
            functions.push($.proxy(that.renderFigure, that, repr));
        });

        functions.push(function() {
            databasy.gw.layout.canvasInitialized = true;
        });

        databasy.ui.utils.executeSequentially(functions);
    },

    renderFigure:function (repr) {
        var code = repr.code();
        switch (code) {
            case databasy.model.core.reprs.TableRepr.CODE:
                this.renderTable(repr);
                break;
            default:
                throw new Error('Unknown representation code.')
        }
    },

    renderTable:function (tableRepr) {
        var model = databasy.gw.model;

        var tableReprId = tableRepr.id();
        var tableId = tableRepr.val('table').ref_id();
        var table = model.node(tableId);

        this.diagramModel.startTransaction();

        this.diagramModel.createTable(tableReprId, table.val('name'), tableRepr.val('width'), tableRepr.val('position'));
        var columns = table.val_as_node('columns', model);
        $.each(columns, $.proxy(function(i, column) {
            this.diagramModel.addColumn(tableReprId, column.id(), 'null', column.val('name'), '')
        }, this));

        this.diagramModel.commitTransaction();
    },

    getDefaultCanvasNode:function () {
        var model = databasy.gw.model;
        return model.val_as_node('canvases', model)[0]
    },

    onModelChanged:function (event) {
        var diagramModel = this.diagramModel;

        var modelEvent = event.modelEvent;
        var model = databasy.gw.model;

        var eventTypes = databasy.model.core.events;

        if (event.matches(eventTypes.ItemInserted, {node_id:this.canvasId, field:'reprs'})) {
            var repr = modelEvent.val('item').ref_node(model);
            this.renderFigure(repr);
        } else if (event.matches(eventTypes.PropertyChanged, {field: 'width'})) {
            var nodeId = modelEvent.val('node_id');
            var repr = model.node(nodeId);
            if (repr instanceof databasy.model.core.reprs.TableRepr) {
                var width = modelEvent.val('new_value');
                diagramModel.startTransaction();
                diagramModel.updateTable(repr.id(), {width: width});
                diagramModel.commitTransaction();
            }
        } else if (event.matches(eventTypes.PropertyChanged, {field: 'position'})) {
            var nodeId = modelEvent.val('node_id');
            var repr = model.node(nodeId);
            if (repr instanceof databasy.model.core.reprs.TableRepr) {
                var position = modelEvent.val('new_value');
                diagramModel.startTransaction();
                diagramModel.updateTable(repr.id(), {position: position});
                diagramModel.commitTransaction();
            }
        }
    },

    onRuntimeChanged:function (event) {
        var rt = event.runtime;
        var editable = rt.isEditor();

        this.diagramModel.setReadOnly(!editable);
    }
});