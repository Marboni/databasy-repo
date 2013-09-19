databasy.gateway.events.ModelChanged = databasy.utils.events.Event.extend({
    init:function(modelEvent) {
        this._super('ModelChanged');
        this.modelEvent = modelEvent;
    },

    matches: function(type, conditions) {
        if (!(this.modelEvent instanceof type)) {
            return false;
        }
        for (var key in conditions) {
            if (this.modelEvent.val(key) !== conditions[key]) {
                return false;
            }
        }
        return true;
    }
});