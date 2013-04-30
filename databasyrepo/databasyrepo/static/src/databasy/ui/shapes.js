databasy.ui.shapes.Canvas = draw2d.Canvas.extend({
    NAME : "databasy.ui.shapes.Canvas",

    init:function (mm, id) {
        this._super(id);
        this.setScrollArea('#' + id);

        this.mm = mm;

        var canvas = this;
        var EditPolicy = draw2d.policy.canvas.BoundingboxSelectionPolicy.extend({
            onMouseUp:function(figure, x, y) {
                //noinspection JSPotentiallyInvalidUsageOfThis
                this._super(figure, x, y);
                if (canvas.mm.command !== null) {
//                    var success = canvas.mm.executeCommand();
//                    if (!success) {
//                        canvas.commandStack.undo();
//                    }
                }
            }
        });

        this.installEditPolicy(new EditPolicy());
    }
});

databasy.ui.shapes.Table = draw2d.shape.basic.Rectangle.extend({
    NAME: "odm.ui.shapes.Table",

    init:function (mm, tableRepr) {
        this._super(126, 10);
        this.mm = mm;
        this.model = mm.model;
        this.tableRepr = tableRepr;
        this.tableElement = this.tableRepr.valAsNode('table', this.model);

        this.registerListeners();

        this.setBackgroundColor('#00CE00');
        this.setColor('#00BD00');
        this.setStroke(1.5);
        this.setRadius(8);

        this._subBlockWidth = this.getWidth() - 6;
        this._subBlockRadius = this.getRadius();

        this.titleBlock = new odm.ui.shapes.Table.Title(this);
        this.addFigure(this.titleBlock, new odm.ui.locators.EntityLocator(this));

        this.adjustHeight();
    },
    adjustHeight: function() {
        var newHeight = this.titleBlock.getHeight() + 6;
        this.setDimension(this.getWidth(), newHeight);
    },
    registerListeners:function() {
        var that = this;
        this.model.addChangeListener(this.tableRepr.id(), function(action) {
            var type = action.type();
            var field = action.val('field');
            // Position changed.
            if (type == odm.model.core.actions.Set.TYPE && field == 'position') {
                var newPosition = action.val('value');
                var x = newPosition[0];
                var y = newPosition[1];
                that.setPosition(x, y);
            }
        });
    },
    onDoubleClick: function() {

    },
    onDragEnd: function() {
        var wasMoved = this.isMoving;
        this._super();
        if (wasMoved) {
            this.mm.command = new odm.model.core.commands.MoveTableRepr({
                table_repr_id:this.tableRepr.id(),
                new_position:[this.x, this.y]
            });
        }
    }
}, {
    Title: draw2d.shape.basic.Rectangle.extend({
        NAME : "odm.ui.shapes.Title",

        init:function (uiTable) {
            this._super(uiTable._subBlockWidth, 30);
            this.setColor(uiTable.getBackgroundColor());
            this.setBackgroundColor('#ffffff');
            this.setRadius(uiTable._subBlockRadius);
            this.setStroke(0.5);

            this.label = new draw2d.shape.basic.Label(uiTable.tableElement.val('name'));
            this.label.setStroke(0);
            this.label.setColor("#0d0d0d");
            this.label.setFontColor("#0d0d0d");

            this.addFigure(this.label, new draw2d.layout.locator.CenterLocator(this));
            this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
        },
        onDoubleClick: function() {

        }
    })
});
