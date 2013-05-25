databasy.gateway.events.ModelChanged = databasy.gateway.events.GatewayEvent.extend({
    init:function(modelEvent) {
        this._super('ModelChanged');
        this.modelEvent = modelEvent;
    }
});