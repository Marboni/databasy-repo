databasy.ui.layout.gojs.Canvas = Class.extend({
    init: function(domElementId) {
        databasy.gw.addListener(this);

        this.figureByReprId = {};
        this.figureByElementId = {};

        this.canvasId = this.getDefaultCanvasNode().id();

        this.setEditable(false);

        this.initGo(domElementId);
        this.renderFigures();
    },

    initGo: function(domElementId) {
        //noinspection JSUndeclaredVariable
        mk = go.GraphObject.make;

        this.diagram = new go.Diagram(domElementId)
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
        var tableId = tableRepr.val('table').ref_id();
        var tableReprId = tableRepr.id();

        var tableFigure = new databasy.ui.layout.gojs.Table(tableId, tableReprId);
        this.diagram.add(tableFigure);
        this.cache(tableFigure);
    },

    getDefaultCanvasNode:function () {
        var model = databasy.gw.model;
        return model.val_as_node('canvases', model)[0]
    },

    getFigureByReprId:function (reprId) {
        return this.figureByReprId[reprId];
    },

    getFigureByRepr:function (repr) {
        return this.getFigureByReprId(repr.id());
    },

    getFigureByElementId:function (elementId) {
        return this.figureByElementId[elementId];
    },

    getFigureByElement:function (element) {
        return this.getFigureByElementId(element.id());
    },

    cache:function (figure) {
        this.figureByReprId[figure.getReprId()] = figure;
        this.figureByElementId[figure.getElementId()] = figure;
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        var model = databasy.gw.model;

        var eventTypes = databasy.model.core.events;

//        if (event.matches(eventTypes.ItemInserted, {node_id:this.canvasId, field:'reprs'})) {
//            var repr = modelEvent.val('item').ref_node(model);
//            this.renderFigure(repr);
//        }
    },

    setEditable:function (editable) {
        var canvasPane = $('#canvas');
        if (editable) {
            canvasPane.removeClass('readonly');
        } else {
            canvasPane.addClass('readonly');
        }
    },

    onRuntimeChanged:function (event) {
        var rt = event.runtime;
        var editable = rt.isEditor();

        this.setEditable(editable);
    }
});