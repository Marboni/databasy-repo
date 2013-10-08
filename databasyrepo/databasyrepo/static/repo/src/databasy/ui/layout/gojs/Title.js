databasy.ui.layout.gojs.Title = Class.extendFrom(go.Panel, {
    init:function (tableId) {
        this._super(go.Panel.Position);

        this.tableId = tableId;

        this.create();
        this.load();
    },

    create:function () {
        this.stretch = go.GraphObject.Fill;
        this.padding = new go.Margin(6, 6, 4, 6);

        // .icn-database16
        var tableIcon = mk(go.Picture, {
            source:'/static/repo/src/img/sprites.png',
            sourceRect:new go.Rect(22, 116, 16, 16),
            position:new go.Point(0, 0)
        });
        this.add(tableIcon);

        this.nameField = mk(go.TextBlock, {
                position:new go.Point(22, -1),
                font:'bold 16px ​Helvetica ​sans-serif'
            }
        );
        this.add(this.nameField);
    },

    load:function () {
        var table = databasy.gw.model.node(this.tableId);
        this.setName(table.val('name'));
    },

    setName:function (name) {
        this.nameField.text = name;
    }
});
