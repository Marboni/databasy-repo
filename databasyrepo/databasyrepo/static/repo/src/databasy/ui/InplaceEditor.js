databasy.ui.InplaceEditor = draw2d.ui.LabelInplaceEditor.extend({
    init: function(gateway, listener) {
        this._super(listener);
        this.gateway = gateway;
    },

    start: function(label) {
        if (this.gateway.runtime.isEditor()) {
            this._super(label);
        }
    }
});