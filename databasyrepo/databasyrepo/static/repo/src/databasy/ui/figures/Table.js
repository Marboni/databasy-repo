databasy.ui.figures.Table = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.Table",

    init:function (gateway, tableRepr) {
        this._super(126, 30);
        this.gateway = gateway;
        this.tableRepr = tableRepr;
        this.table = tableRepr.val_as_node('table', this.gateway.model);

        this.gateway.addListener(this);
        this.installEditPolicy(new databasy.ui.policy.figures.TablePolicy());

        this.setBackgroundColor('#00bfff');
        this.setColor('#009acd');
        this.setStroke(1.5);
        this.setRadius(8);

        this.label = new draw2d.shape.basic.Label(this.table.val('name'));
        this.label.setStroke(0);
        this.label.setColor("#0d0d0d");
        this.label.setFontColor("#0d0d0d");
        this.addFigure(this.label, new draw2d.layout.locator.CenterLocator(this));

        this.label.onDoubleClick = $.proxy(this.onDoubleClick, this);
        this.label.onContextMenu = $.proxy(this.onContextMenu, this);
    },

    draw:function (canvas) {
        var position = this.tableRepr.val('position');
        canvas.addFigure(this, position[0], position[1]);
    },

    onDoubleClick:function () {
        this.gateway.layout.propertyPanel.refreshProperties(this.table);
    },

    onContextMenu:function (x, y) {
        if (this.gateway.runtime.isEditor()) {
            this.canvas.showContextMenu(this, x, y);
        }
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        if (modelEvent instanceof databasy.model.core.events.PropertyChanged &&
            modelEvent.val('node_id') === this.tableRepr.id() &&
            modelEvent.val('field') === 'position') {

            // Table representation's position changed.
            var newPosition = modelEvent.val('new_value');
            this.setPosition(newPosition[0], newPosition[1]);
        } else if (modelEvent instanceof databasy.model.core.events.PropertyChanged &&
            modelEvent.val('node_id') === this.table.id() &&
            modelEvent.val('field') === 'name') {

            // Table name changed.
            var newName = modelEvent.val('new_value');
            this.label.setText(newName);
        } else if (modelEvent instanceof databasy.model.core.events.ItemDeleted &&
            modelEvent.val('node_id') === this.canvas.canvasNode.id() &&
            modelEvent.val('field') === 'reprs' &&
            modelEvent.val('item').ref_id() === this.tableRepr.id()) {

            // Table repr removed.
            this.destroy();
        }
    },

    destroy:function () {
        this.gateway.removeListener(this);
        this.canvas.removeFigure(this);
    }
});
