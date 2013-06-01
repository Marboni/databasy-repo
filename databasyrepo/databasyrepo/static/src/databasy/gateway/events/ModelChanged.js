databasy.gateway.events.ModelChanged = databasy.utils.events.Event.extend({
    init:function(modelEvent) {
        this._super('ModelChanged');
        this.modelEvent = modelEvent;
    }
});