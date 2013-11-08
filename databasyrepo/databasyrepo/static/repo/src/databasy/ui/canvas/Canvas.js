databasy.ui.canvas.Canvas = draw2d.Canvas.extend({
    NAME:"databasy.ui.canvas.Canvas",

    init:function (domNodeId) {
        this._super(domNodeId);
        this.setScrollArea('#' + domNodeId);

        databasy.gw.addListener(this);

        this.figureByReprId = {};
        this.figureByElementId = {};

        this.canvasId = this.getDefaultCanvasNode().id();

        this.setEditable(false);

        if (!this.constructor.contextMenu) {
            // Context menu is common for all canvas.
            this.constructor.contextMenu = new databasy.ui.layout.canvas.ContextMenu();
        }

        this.installEditPolicy(new databasy.ui.policy.canvas.CanvasPolicy());

        this.renderFigures();
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

        var tableFigure = new databasy.ui.figure.table.Table(tableId, tableReprId);
        this.addFigure(tableFigure);
        this.cache(tableFigure);

        tableFigure.render();
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

    removeFigure:function (figure) {
        if (figure.getElementId) {
            delete this.figureByElementId[figure.getElementId()];
        }
        if (figure.getReprId) {
            delete this.figureByReprId[figure.getReprId()];
        }
        this._super(figure);
    },

    setEditable:function (editable) {
        var canvasPane = $('#canvas');
        if (editable) {
            canvasPane.removeClass('readonly');
        } else {
            canvasPane.addClass('readonly');
        }
    },

    scrollTo:function (centerX, centerY) {
        var viewport = this.getScrollArea().parent();
        var w = viewport.width();
        var h = viewport.height();

        var left = centerX - w / 2;
        if (left < 0) {
            left = 0;
        }

        var top = centerY - h / 2;
        if (top < 0) {
            top = 0;
        }

        viewport.scrollTop(top);
        viewport.scrollLeft(left)
    },

    scrollToFigure:function (figure) {
        var centerX = figure.x + figure.width / 2;
        var centerY = figure.y + figure.height / 2;
        this.scrollTo(centerX, centerY);
    },

    showContextMenu:function (figure, x, y) {
        this.constructor.contextMenu.show(figure, x, y);
    },

    onKeyDown:function (keyCode, ctrl) {
        if (keyCode == 46 && databasy.gw.runtime.isEditor()) {
            // Delete button pressed.
            this.selection.getAll().each(function(i, figure) {
                if (figure instanceof databasy.ui.figure.table.Table) {
                    databasy.service.deleteTable(figure.tableId);
                }
            });
            databasy.gw.layout.propertyPanel.refreshProperties(null);
        } else {
            this._super(keyCode, ctrl);
        }
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        var model = databasy.gw.model;

        var eventTypes = databasy.model.core.events;

        if (event.matches(eventTypes.ItemInserted, {node_id:this.canvasId, field:'reprs'})) {
            var repr = modelEvent.val('item').ref_node(model);
            this.renderFigure(repr);
        }
    },

    onRuntimeChanged:function (event) {
        var rt = event.runtime;
        var editable = rt.isEditor();

        this.setEditable(editable);
    }
});