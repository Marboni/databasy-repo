databasy.ui.shapes.Canvas = draw2d.Canvas.extend({
    NAME:"databasy.ui.shapes.Canvas",

    init:function (gateway, domNodeId, canvasNode) {
        this._super(domNodeId);
        this.setScrollArea('#' + domNodeId);
        this.canvasNode = canvasNode;

        this.gateway = gateway;
        this.gateway.addListener(this);

        this.setEditable(false);
        this.initShapes();

        this.installEditPolicy(new databasy.ui.policy.canvas.ToolActionPolicy());
    },

    initShapes:function () {
        var reprs = this.canvasNode.val_as_node('reprs', this.gateway.model);
        var that = this;
        $.each(reprs, function (index, repr) {
            that.drawShape(repr);
        });
    },

    drawShape:function (repr) {
        var reprCode = repr.code();
        if (reprCode === databasy.model.core.reprs.TableRepr.CODE) {
            this.drawTable(repr);
        } else {
            throw Error('Unknown reprCode ' + reprCode);
        }
    },

    drawTable:function (repr) {
        var shape = new databasy.ui.shapes.Table(this, this.gateway, repr);
        shape.draw(this);
    },

    setEditable:function (editable) {
        var canvasPane = $('#canvas');
        if (editable) {
            canvasPane.removeClass('readonly');
        } else {
            canvasPane.addClass('readonly');
        }
    },

    onUserRolesChanged:function (event) {
        var editable = event.userRoles.isEditor();
        this.setEditable(editable);
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        if (modelEvent instanceof databasy.model.core.events.ItemInserted &&
            modelEvent.val('node_id') === this.canvasNode.id() &&
            modelEvent.val('field') === 'reprs') {
            // New repr added, drawing.
            this.drawShape(modelEvent.val('item'));
        }
    }
});