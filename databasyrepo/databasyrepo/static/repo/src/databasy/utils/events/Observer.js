databasy.utils.events.Observer = Class.extend({
    init: function() {
        this._listeners = [];
    },
    reset: function() {
        this._listeners = [];
    },
    fire:function(event) {
        var listenerFunc = 'on' + event.eventName;
        $.each(this._listeners.slice(), function(i, listener) {
            if (listener[listenerFunc] !== undefined) {
                listener[listenerFunc](event);
            }
        });
    },
    addListener:function(listener) {
        if ($.inArray(this._listeners, listener) === -1) {
            this._listeners.push(listener);
        }
    },
    removeListener:function(listener) {
        this._listeners.splice($.inArray(listener, this._listeners), 1)
    }
});
