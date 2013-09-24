databasy.ui.layout.property.PropertyPanel = Class.extend({
    init:function () {
        this.element = null;
        this.propertyPanel = $('#propertyPanel');
        this.createEmptyPanel();
    },

    createEmptyPanel: function() {
        this.emptyPanel = $(
            '<table align="center" width="100%" height="100%">' +
            '   <tr>' +
            '       <td valign="center">' +
            '           <small class="muted text-center" style="display:block;">Nothing to show</small>' +
            '       </td>' +
            '   </tr>' +
            '</table>'
        );

        this.propertyPanel.append(this.emptyPanel);
    },

    refreshProperties: function(elementId) {
        if (elementId !== this.elementId) {
            this.propertyPanel.empty();
            if (this.properties) {
                this.properties.destroy();
                this.properties = undefined;
            }
        }

        if (elementId == null) {
            this.propertyPanel.append(this.emptyPanel);
        } else {
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