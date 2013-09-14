databasy.gateway.Context = Class.extend({
    put: function(key, value) {
        this[key] = value;
    },

    has: function(key) {
        return this[key] !== undefined;
    },

    pop: function(key) {
        var value = this[key];
        if (value !== undefined) {
            this[key] = undefined;
        }
        return value;
    }
});
