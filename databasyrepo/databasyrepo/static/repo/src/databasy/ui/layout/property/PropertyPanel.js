databasy.ui.layout.property.PropertyPanel = Class.extend({
    init:function () {
        this.element = null;
        this.propertyPanel = $('#propertyPanel');
    },

    refreshProperties: function(elementId) {
        if (elementId !== this.elementId) {
            this.propertyPanel.empty();
            if (this.properties) {
                this.properties.destroy();
                this.properties = undefined;
            }

            var element = databasy.gw.model.node(elementId);
            this.createProperties(element);
            this.element = element;
        }
    },

    createProperties:function(element) {
        var code = element.code();
        switch (code) {
            case 'core.elements.Table':
                this.properties = new databasy.ui.layout.property.TablePropertyPanel(element.id());
                break;
            default:
                throw new Error('Properties for element ' + code + ' not implemented.');
        }
    }
});