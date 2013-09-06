databasy.ui.figures.Table = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.Table",

    init:function (gateway, tableRepr) {
        this._super(180, 80);
        this.gateway = gateway;
        this.tableRepr = tableRepr;
        this.table = tableRepr.val_as_node('table', this.gateway.model);

        this.gateway.addListener(this);
        this.installEditPolicy(new databasy.ui.policy.figures.TablePolicy());

        this.setBackgroundColor('#00bfff');
        this.setColor('#009acd');
        this.setStroke(2);
        this.setRadius(8);

        this.createTitle();
        this.createColumnPanel();

        this.columnPanel.addColumn('user_id');
        this.columnPanel.addColumn('user_name');
    },

    createTitle: function() {
        this.title = new draw2d.shape.basic.Rectangle(180, 30);
        this.title.setRadius(8);
        this.title.setAlpha(0);
        this.addFigure(this.title, new databasy.ui.locators.InnerPositionLocator(this, 0, 0));
        this.title.onDoubleClick = $.proxy(this.onDoubleClick, this);
        this.title.onContextMenu = $.proxy(this.onContextMenu, this);

        this.icon = new draw2d.shape.basic.Image('/static/repo/src/img/sprite/table16.png', 16, 16);
        this.title.addFigure(this.icon, new databasy.ui.locators.InnerVerticalCenterLocator(this.title, 8));

        this.label = new draw2d.shape.basic.Label(this.table.val('name'));
        this.label.setStroke(0);
        this.label.setColor("#0d0d0d");
        this.label.setFontSize(13);
        this.label.setFontColor("#0d0d0d");
        this.label.setBold(true);
        this.title.addFigure(this.label, new databasy.ui.locators.InnerVerticalCenterLocator(this.title, 26));

        this.label.onDoubleClick = $.proxy(this.onDoubleClick, this);
        this.label.onContextMenu = $.proxy(this.onContextMenu, this);

        this.comment = new databasy.ui.figures.Comment(this);
        this.title.addFigure(this.comment, new databasy.ui.locators.InnerTopRightLocator(this.title, 1, -1));
    },

    createColumnPanel:function() {
        this.columnPanel = new databasy.ui.figures.ColumnPanel(this);
        this.addFigure(this.columnPanel, new databasy.ui.locators.InnerPositionLocator(this, 1, 30));
    },

    draw:function (canvas) {
        var position = this.tableRepr.val('position');
        canvas.addFigure(this, position[0], position[1]);
    },

    resetHeight: function() {
        var children = this.getChildren();
        var height = 0;
        for (var i = 0; i < children.length; i++) {
            height += children[i].h;
        }
        this.setDimension(this.width, height);
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
