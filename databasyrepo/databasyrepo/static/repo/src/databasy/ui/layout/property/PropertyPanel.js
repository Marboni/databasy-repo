databasy.ui.layout.property.PropertyPanel = Class.extend({
    init:function (gateway, layout) {
        this.gateway = gateway;
        this.layout = layout;
        this.element = null;

        gateway.addListener(this);

        this.propertyPanel = $('#propertyPanel');

        this.setEditable(false);
    },

    refreshProperties: function(element) {
        if (element !== this.element) {
            this.propertyPanel.empty();
            this.createProperties(element);
            this.element = element;
        }
    },

    createProperties:function(element) {
        if (this.properties) {
            this.properties.destroy();
            this.properties = undefined;
        }
        if (element instanceof databasy.model.core.elements.Table) {
            this.properties = new databasy.ui.layout.property.TablePropertyPanel(this.gateway, element);
        }
    },

    open: function() {
        this.gateway.layout.openPropertyPanel();
    },

    close: function() {
        this.gateway.layout.closePropertyPanel();
    },

    setEditable:function(editable) {
        if (editable) {
            this.propertyPanel.removeClass('readonly');
        } else {
            this.propertyPanel.addClass('readonly');
        }
    },

    onRuntimeChanged:function (event) {
        var editable = event.runtime.isEditor();
        this.setEditable(editable);
    }
});