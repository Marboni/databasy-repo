databasy.ui.layout.PropertyPanel = Class.extend({
    init:function (gateway, layout) {
        this.gateway = gateway;
        this.layout = layout;
        this.currentComponent = null;

        this.propertyPanel = $('#propertyPanel');

        layout.canvas.addListener(this);
    },

    onComponentDblClicked: function(event) {
        this.layout.openPropertyPanel();

        var component = event.component;
        if (this.currentComponent === component) {
            return;
        }
        this.currentComponent = component;

        this.propertyPanel.empty();
        if (component instanceof databasy.ui.components.Table) {
            this.createTableProperties();
        }
    },

    createTableProperties:function() {
        var table = this.currentComponent.table;
        this.propertyPanel.append('<h2>' + table.val('name') + '</h2>');
    }
});