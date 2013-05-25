databasy.ui.shapes.Canvas = draw2d.Canvas.extend({
    NAME:"databasy.ui.shapes.Canvas",

    init:function (gateway, id) {
        this._super(id);
        this.setScrollArea('#' + id);

        this.gateway = gateway;
        this.gateway.addListener(this);

        this.setEditable(false);
    },

    setEditable:function(editable) {
        var canvasPane = $('#canvas');
        if (editable) {
            canvasPane.removeClass('readonly');
        } else {
            canvasPane.addClass('readonly');
        }
    },

    drawTable: function(repr) {
        var shape = new databasy.ui.shapes.Table(this, this.gateway, repr);
        shape.draw(this);
    },

    onUserRolesChanged:function(event) {
        var editable = event.userRoles.isEditor();
        this.setEditable(editable);
    }
});