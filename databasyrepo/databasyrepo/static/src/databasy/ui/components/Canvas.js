databasy.ui.components.Canvas = draw2d.Canvas.extend({
    NAME:"databasy.ui.components.Canvas",

    init:function (gateway, domNodeId) {
        this._super(domNodeId);
        this.setScrollArea('#' + domNodeId);

        this.gateway = gateway;
        this.gateway.addListener(this);

        var model = this.gateway.model;
        this.canvasNode = model.val_as_node('canvases', model)[0];

        this._observer = new databasy.utils.events.Observer();

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
        var reprCode = repr.code();
        if (reprCode === databasy.model.core.reprs.TableRepr.CODE) {
            this.drawTable(repr);
        } else {
            throw Error('Unknown reprCode ' + reprCode);
        }
    },

    drawTable:function (repr) {
        var component = new databasy.ui.components.Table(this.gateway, repr);
        component.draw(this);
    },

    setEditable:function (editable) {
        var canvasPane = $('#canvas');
        if (editable) {
            canvasPane.removeClass('readonly');
        } else {
            canvasPane.addClass('readonly');
        }
    },

    fire:function(event) {
        this._observer.fire(event);
    },

    addListener:function(listener) {
        this._observer.addListener(listener);
    },

    removeListener:function(listener) {
        this._observer.removeListener(listener);
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