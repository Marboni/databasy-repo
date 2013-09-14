databasy.ui.layout.canvas.Canvas = draw2d.Canvas.extend({
    NAME:"databasy.ui.layout.canvas.Canvas",

    init:function (domNodeId) {
        this._super(domNodeId);
        this.setScrollArea('#' + domNodeId);

        databasy.gw.addListener(this);

        var model = databasy.gw.model;
        this.canvasNode = model.val_as_node('canvases', model)[0];

        this._figuresByReprId = {};
        this._figuresByElementId = {};

        this.setEditable(false);
        this.initFigures();

        if (!this.constructor.contextMenu) {
            // Context menu is common for all canvas.
            this.constructor.contextMenu = new databasy.ui.layout.canvas.ContextMenu();
        }

        this.installEditPolicy(new databasy.ui.policy.canvas.ToolActionPolicy());
    },

    initFigures:function () {
        var reprs = this.canvasNode.val_as_node('reprs', databasy.gw.model);
        var that = this;
        $.each(reprs, function (index, repr) {
            that.drawFigure(repr);
        });
    },

    drawFigure:function (repr) {
        var drawFunction;
        var reprCode = repr.code();

        if (reprCode === databasy.model.core.reprs.TableRepr.CODE) {
            drawFunction = this.drawTable;
        } else {
            throw Error('Unknown reprCode ' + reprCode);
        }
        //noinspection UnnecessaryLocalVariableJS
        var figure = drawFunction.call(this, repr);

        this._figuresByReprId[repr.id()] = figure;
        var elementId = repr.elementId();
        if (elementId !== null) {
            this._figuresByElementId[elementId] = figure;
        }
    },

    drawTable:function (repr) {
        var figure = new databasy.ui.figures.Table(repr);
        figure.draw(this);
        return figure;
    },

    setEditable:function (editable) {
        var canvasPane = $('#canvas');
        if (editable) {
            canvasPane.removeClass('readonly');
        } else {
            canvasPane.addClass('readonly');
        }
    },

    figureByReprId:function (reprId) {
        return this._figuresByReprId[reprId];
    },

    figureByElementId:function (elementId) {
        return this._figuresByElementId[elementId];
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

    showContextMenu: function(figure, x, y) {
        this.constructor.contextMenu.show(figure, x, y);
    },

    onRuntimeChanged:function (event) {
        var editable = event.runtime.isEditor();
        this.setEditable(editable);
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        if (modelEvent instanceof databasy.model.core.events.ItemInserted &&
            modelEvent.val('node_id') === this.canvasNode.id() &&
            modelEvent.val('field') === 'reprs') {
            // New repr added, drawing.
            var repr = modelEvent.val('item').ref_node(databasy.gw.model);
            this.drawFigure(repr);
        }
    }
});