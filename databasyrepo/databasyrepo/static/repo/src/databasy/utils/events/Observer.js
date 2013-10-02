databasy.utils.events.Observer = Class.extend({
    init: function() {
        this._listeners = [];
        this._active = false;
        this._waitingEvents = [];
    },
    setActive: function(active) {
        this._active = active;
        if (active) {
            var that = this;
            $.each(this._waitingEvents, function(i, e) {
                that._fireEvent(e);
            });
            this._waitingEvents = [];
        }
    },
    fire:function(event) {
        if (this._active) {
            this._fireEvent(event);
        } else {
            this._waitingEvents.push(event);
        }
    },
    _fireEvent: function(event) {
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
