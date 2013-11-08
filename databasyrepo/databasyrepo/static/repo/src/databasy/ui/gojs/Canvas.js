databasy.ui.gojs.Canvas = Class.extend({
    init:function (domElementId) {
//        databasy.gw.addListener(this);

//        this.figureByReprId = {};
//        this.figureByElementId = {};

        //this.canvasId = this.getDefaultCanvasNode().id();

//        this.setEditable(false);

        this.initGo(domElementId);
        this.renderFigures();
    },

    initGo:function (domElementId) {
        this.diagram = new go.Diagram(domElementId);
        this.diagram.initialContentAlignment = go.Spot.Center;
        this.diagram.padding = 300;
        var templates = new databasy.ui.gojs.Templates();
        this.diagram.nodeTemplateMap = templates.createNodeTemplateMap();
        this.diagram.linkTemplateMap = templates.createLinkTemplateMap();

        this.diagramModel = new databasy.ui.gojs.DiagramModel(this.diagram);
    },

    renderFigures:function () {
        this.diagramModel.startTransaction();

        this.diagramModel.createTable('t0', 'T0', [-50, 250]);

        this.diagramModel.createTable('t1', 'table_name', [0, 0]);
        this.diagramModel.addColumn('t1', 'c11', 'pk', 'column_name', 'BIGINT');
        this.diagramModel.addColumn('t1', 'c12', 'null', 'column_name', 'BIGINT');
        this.diagramModel.addColumn('t1', 'c13', 'null', 'column_name', 'BIGINT');

        this.diagramModel.createTable('t2', 'T2', [200, 200]);
        this.diagramModel.addColumn('t2', 'c21', 'pk', 'col1', 'BIGINT');
        this.diagramModel.addColumn('t2', 'c22', 'null', 'col2', 'BIGINT');
        this.diagramModel.addColumn('t2', 'c23', 'null', 'col3', 'BIGINT');

        this.diagramModel.createRelationship('r1', 't1', '0..1', ['c11', 'c12'], 't2', '0..1', ['c21', 'c22']);
        this.diagramModel.createRelationship('r2', 't1', '0..1', ['c11', 'c13'], 't2', '0..1', ['c21', 'c23']);

        this.diagramModel.createView('v0', 'view_name', [0, 0]);
        this.diagramModel.removeView('v0');

        this.diagramModel.createView('v1', 'V1', [400, 400]);

        this.diagramModel.commitTransaction();

//        var that = this;
//        this.diagram.click = function() {
//            that.diagramModel.updateRelationship('r1', {hasOpenDiscussions: true});
//            that.diagram.click = function() {
//                that.diagramModel.updateRelationship('r1', {hasOpenDiscussions: false});
//            }
//        };

        databasy.gw.layout.canvasInitialized = true;
    }

//    renderFigures:function () {
//        var that = this;
//        var functions = [];
//
//        var canvas = databasy.gw.model.node(this.canvasId);
//        var reprs = canvas.val_as_node('reprs', databasy.gw.model);
//        $.each(reprs, function (index, repr) {
//            functions.push($.proxy(that.renderFigure, that, repr));
//        });
//
//        functions.push(function() {
//            databasy.gw.layout.canvasInitialized = true;
//        });
//
//        databasy.ui.utils.executeSequentially(functions);
//    },
//
//    renderFigure:function (repr) {
//        var code = repr.code();
//        switch (code) {
//            case databasy.model.core.reprs.TableRepr.CODE:
//                this.renderTable(repr);
//                break;
//            default:
//                throw new Error('Unknown representation code.')
//        }
//    },
//
//    renderTable:function (tableRepr) {
//        var tableId = tableRepr.val('table').ref_id();
//        var tableReprId = tableRepr.id();
//
//        var tableFigure = new databasy.ui.layout.gojs.Table(tableId, tableReprId);
//        this.diagram.add(tableFigure);
//        this.cache(tableFigure);
//    },
//
//    getDefaultCanvasNode:function () {
//        var model = databasy.gw.model;
//        return model.val_as_node('canvases', model)[0]
//    },
//
//    getFigureByReprId:function (reprId) {
//        return this.figureByReprId[reprId];
//    },
//
//    getFigureByRepr:function (repr) {
//        return this.getFigureByReprId(repr.id());
//    },
//
//    getFigureByElementId:function (elementId) {
//        return this.figureByElementId[elementId];
//    },
//
//    getFigureByElement:function (element) {
//        return this.getFigureByElementId(element.id());
//    },

//    cache:function (figure) {
//        this.figureByReprId[figure.getReprId()] = figure;
//        this.figureByElementId[figure.getElementId()] = figure;
//    },
//
//    onModelChanged:function (event) {
//        var modelEvent = event.modelEvent;
//        var model = databasy.gw.model;
//
//        var eventTypes = databasy.model.core.events;
//
////        if (event.matches(eventTypes.ItemInserted, {node_id:this.canvasId, field:'reprs'})) {
////            var repr = modelEvent.val('item').ref_node(model);
////            this.renderFigure(repr);
////        }
//    },
//
//    setEditable:function (editable) {
//        var canvasPane = $('#canvas');
//        if (editable) {
//            canvasPane.removeClass('readonly');
//        } else {
//            canvasPane.addClass('readonly');
//        }
//    },
//
//    onRuntimeChanged:function (event) {
//        var rt = event.runtime;
//        var editable = rt.isEditor();
//
//        this.setEditable(editable);
//    }
});