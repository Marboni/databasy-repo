databasy.ui.figures.Table = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.Table",

    init:function (gateway, tableRepr) {
        this._super(180, 30);
        this.gateway = gateway;
        this.tableRepr = tableRepr;
        this.table = tableRepr.val_as_node('table', this.gateway.model);

        // If internal logic changes figure size, this flag will be true. Otherwise it's false. It allows to prevent
        // user to resize figure, but allow resizing in code.
        this.sizeRecalc = false;

        this.gateway.addListener(this);
        this.installEditPolicy(new databasy.ui.policy.figures.TablePolicy());

        this.setBackgroundColor('#00bfff');
        this.setColor('#009acd');
        this.setStroke(2);
        this.setRadius(8);

        this.createTitle();
        this.createColumnPanel();

        this.addComment();
    },

    createTitle:function () {
        this.title = new databasy.ui.figures.TableTitle(this);
        this.addFigure(this.title, new databasy.ui.locators.InnerPositionLocator(this, 0, 0));
    },

    createColumnPanel:function () {
        this.columnPanel = new databasy.ui.figures.ColumnPanel(this);
        this.addFigure(this.columnPanel, new databasy.ui.locators.InnerPositionLocator(this, 1, 30));
    },

    addComment:function () {
        this.comment = new databasy.ui.figures.Comment(this);
        this.title.addFigure(this.comment, new databasy.ui.locators.InnerTopRightLocator(this.title, 1, -1));
    },

    removeComment:function () {
        this.removeFigure(this.comment);
        this.comment = undefined;
    },

    draw:function (canvas) {
        var position = this.tableRepr.val('position');
        canvas.addFigure(this, position[0], position[1]);
    },

    resetHeight:function () {
        var height = 0;
        this.getChildren().each(function (i, child) {
            height += child.height;
        });
        if (height != this.title.height) {
            height += 8; // Adding footer.
        }
        this.sizeRecalc = true;
        this.setDimension(this.width, height);
        this.sizeRecalc = false;
    },

    renameTable: function(new_name) {
        if (this.table.val('name') === new_name) {
            return;
        }
        var command = new databasy.model.core.commands.RenameTable({
            table_id:this.table.id(),
            new_name:new_name
        });
        this.gateway.executeCommand(command);
    },

    startRename: function() {
        this.title.startRename();
    },

    startCreateColumn: function(index) {
        alert('Create column ' + index);
    },

    onDoubleClick:function () {
        //this.gateway.layout.propertyPanel.refreshProperties(this.table);
        this.columnPanel.addColumn('ZZZ');
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
            this.name.setText(newName);
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
})
;
