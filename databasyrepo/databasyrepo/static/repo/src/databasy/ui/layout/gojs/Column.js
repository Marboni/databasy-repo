databasy.ui.layout.gojs.Column = Class.extendFrom(go.Panel, {
    init:function (columnId) {
        this._super(go.Panel.Position);

        this.columnId = columnId;

        this.create();
        this.load();
    },

    create:function () {
        this.stretch = go.GraphObject.Fill;
        this.margin = new go.Margin(1, 0, 1, 0);
        this.padding = new go.Margin(0, 0, 0, 6);

        var tableIcon = mk(go.Shape, {
            figure:'circle',
            width:6,
            height:6,
            position:new go.Point(5, 5),
            fill:'#ffffff',
            stroke:'#007eb1'
        });
        this.add(tableIcon);

        this.nameField = mk(go.TextBlock, {
            position:new go.Point(22, -1),
            font:'16px ​Helvetica ​sans-serif'
        });
        this.add(this.nameField);
    },

    load: function() {
        var column = databasy.gw.model.node(this.columnId);
        this.setName(column.val('name'));
    },

    setName: function(name) {
        this.nameField.text = name;
    }
});
