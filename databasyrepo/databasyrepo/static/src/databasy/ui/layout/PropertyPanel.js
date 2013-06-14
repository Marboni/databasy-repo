databasy.ui.layout.PropertyPanel = Class.extend({
    init:function (gateway, layout) {
        this.gateway = gateway;
        this.layout = layout;

        this.propertyPanel = $('#propertyPanel');
    },

    refreshProperties: function(element) {
        this.propertyPanel.empty();

        if (element instanceof databasy.model.core.elements.Table) {
            this.createTableProperties(element);
        }

        this.layout.openPropertyPanel();
    },

    createTableProperties:function(table) {
        this.propertyPanel.append('<h2>' + table.val('name') + '</h2>');
    }
});