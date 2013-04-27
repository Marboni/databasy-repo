databasy.runtime.register = new (Class.extend({
    init:function() {
        this.findAndReg(databasy.model);
    },

    findAndReg:function (obj) {
        if (obj instanceof Object) {
            if ('CODE' in obj) {
                this[obj.CODE] = obj;
            } else {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p) && typeof(obj[p] === 'object')) {
                        this.findAndReg(obj[p]);
                    }
                }
            }
        }
    },
    exists:function(type) {
        return this.hasOwnProperty(type);
    },
    byType:function(type) {
        if (!this.exists(type)) {
            throw new Error(type + ' not registered.')
        }
        return this[type];
    }
}))();

databasy.runtime.Socket = Class.extend({
    init: function(model_id) {
        this.socket = io.connect('/models');
        var that = this;

        $(window).bind("beforeunload", function() {
            that.socket.disconnect();
        });

        this.socket.on('connect', function () {
            that.socket.emit('connect', model_id, 1);
        });

        this.socket.on('reconnect', function () {
        });

        this.socket.on('reconnecting', function () {
        });

        this.socket.on('reload', function(model) {
            var model_repr = JSON.stringify(model, 4);
            $('#canvas').append('<p>' + model_repr + '</p>');
        });

        this.socket.on('error', function (e) {
            alert(e);
        });
    }
});
