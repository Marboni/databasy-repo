databasy.ui.layout.gojs.Table = Class.extendFrom(go.Node, {
    init:function (tableId, tableReprId) {
        this._super(go.Panel.Auto);

        this.width = databasy.model.core.reprs.TableRepr.REPR_DEFAULT_WIDTH;
        this.resizable = true;

        this.tableId = tableId;
        this.tableReprId = tableReprId;

        this.create();
        this.load();
    },

    create:function () {
        this.columnPanel = mk(go.Panel, 'Vertical', {
                stretch:go.GraphObject.Fill,
                background:'#ffffff'
            }
        );

        // Background rounded rectangle.
        this.add(mk(go.Shape, {
            figure:'RoundedRectangle',
            fill:'#00bfff',
            stroke:'#009acd',
            strokeWidth:2,
            parameter1: 8,
            spot1:new go.Spot(0, 0, 2, 0),
            spot2:new go.Spot(1, 1, -2, -4)
        }));

        // Content panel.
        this.add(
            mk(go.Panel, 'Vertical', {
                    stretch:go.GraphObject.Fill
                },
                new databasy.ui.layout.gojs.Title(this.tableId),
                this.columnPanel
            )
        );
    },

    load: function() {
        var that = this;

        var table = databasy.gw.model.node(this.tableId);
        var tableRepr = databasy.gw.model.node(this.tableReprId);

        var pos = tableRepr.val('position');
        this.setPosition(pos.x, pos.y);

        var columnRefs = table.val('columns');
        $.each(columnRefs, function(i, columnRef) {
            that.createColumn(columnRef.ref_id());
        });
    },

    setPosition: function(x, y) {
        this.position = new go.Point(x, y);
    },

    createColumn:function (columnId) {
        var column = new databasy.ui.layout.gojs.Column(columnId);
        this.columnPanel.add(column);
    },

    getElementId:function () {
        return this.tableId;
    },

    getReprId:function () {
        return this.tableReprId;
    }
});
