databasy.ui.components.Canvas = draw2d.Canvas.extend({
    NAME:"databasy.ui.components.Canvas",

    init:function (gateway, domNodeId) {
        this._super(domNodeId);
        this.setScrollArea('#' + domNodeId);

        this.gateway = gateway;
        this.gateway.addListener(this);

        var model = this.gateway.model;
        this.canvasNode = model.val_as_node('canvases', model)[0];

        this._componentsByReprId = {};
        this._componentsByElementId = {};

        this.setEditable(false);
        this.initComponents();

        this.installEditPolicy(new databasy.ui.policy.canvas.ToolActionPolicy());
    },

    initComponents:function () {
        var reprs = this.canvasNode.val_as_node('reprs', this.gateway.model);
        var that = this;
        $.each(reprs, function (index, repr) {
            that.drawComponent(repr);
        });
    },

    drawComponent:function (repr) {
        var drawFunction;
        var reprCode = repr.code();

        if (reprCode === databasy.model.core.reprs.TableRepr.CODE) {
            drawFunction = this.drawTable;
        } else {
            throw Error('Unknown reprCode ' + reprCode);
        }
        //noinspection UnnecessaryLocalVariableJS
        var component = drawFunction.call(this, repr);

        this._componentsByReprId[repr.id()] = component;
        var elementId = repr.elementId();
        if (elementId !== null) {
            this._componentsByElementId[elementId] = component;
        }
    },

    drawTable:function (repr) {
        var component = new databasy.ui.components.Table(this.gateway, repr);
        component.draw(this);
        return component;
    },

    setEditable:function (editable) {
        var canvasPane = $('#canvas');
        if (editable) {
            canvasPane.removeClass('readonly');
        } else {
            canvasPane.addClass('readonly');
        }
    },

    componentByReprId:function(reprId) {
        return this._componentsByReprId[reprId];
    },

    componentByElementId:function(elementId) {
        return this._componentsByElementId[elementId];
    },

    scrollTo:function(centerX, centerY) {
        var viewport = this.getScrollArea().parent();
        var w = viewport.width();
        var h = viewport.height();

        var left = centerX - w / 2;
        if (left < 0) {left = 0;}

        var top = centerY - h / 2;
        if (top < 0) {top = 0;}

        viewport.scrollTop(top);
        viewport.scrollLeft(left)
    },

    scrollToComponent:function(component) {
        var centerX = component.x + component.width / 2;
        var centerY = component.y + component.height / 2;
        this.scrollTo(centerX, centerY);
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
            this.drawComponent(modelEvent.val('item'));
        }
    }
});