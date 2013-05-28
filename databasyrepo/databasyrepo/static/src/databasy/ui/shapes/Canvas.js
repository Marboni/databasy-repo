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
    },

    initShapes:function () {
        var reprs = this.canvasNode.val_as_node('reprs', this.gateway.model);
        $.each(reprs, $.proxy(function (index, repr) {
                var reprCode = repr.code();
                if (reprCode === databasy.model.core.reprs.TableRepr.CODE) {
                    this.drawTable(repr);
                }
            },
            this));
    },

    setEditable:function (editable) {
        var canvasPane = $('#canvas');
        if (editable) {
            canvasPane.removeClass('readonly');
        } else {
            canvasPane.addClass('readonly');
        }
    },

    drawTable:function (repr) {
        var shape = new databasy.ui.shapes.Table(this, this.gateway, repr);
        shape.draw(this);
    },

    onUserRolesChanged:function (event) {
        var editable = event.userRoles.isEditor();
        this.setEditable(editable);
    }
});