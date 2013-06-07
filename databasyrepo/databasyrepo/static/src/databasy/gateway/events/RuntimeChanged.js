databasy.gateway.events.RuntimeChanged = databasy.utils.events.Event.extend({
    init:function(runtime) {
        this._super('RuntimeChanged');
        this.runtime = runtime;
    }
});
