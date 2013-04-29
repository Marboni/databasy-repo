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

databasy.runtime.ModelHandler = Class.extend({
    init: function(model_id) {
        this.model_id = model_id;
        this._init_socket();
        this.reload();
    },
    _init_socket:function() {
        this.socket = io.connect('/models');
        var that = this;

        $(window).bind('beforeunload', function() {
            that.socket.disconnect();
        });

        this.socket.on('connect', function () {
        });

        this.socket.on('reconnect', function () {
        });

        this.socket.on('reconnecting', function () {
        });

        this.socket.on('error', function (e) {
            alert(e.message);
        });
    },
    show:function() {
        $('#busy').hide();
    },
    hide:function() {
        $('#busy').show();
    },
    reload:function() {
        var user_id = new Date().getTime();
        this.socket.emit('reload', this.model_id, user_id);

        var that = this;
        this.socket.on('reload', function(serialized_model, current_editor) {
            that._init_model(serialized_model);
            that._change_editor(current_editor);
            that.show();
        });
    },
    _init_model:function(serialized_model) {
        this._model = databasy.model.core.serializing.Serializable.deserialize(serialized_model);
        $('#canvas').append('<pre>' + JSON.stringify(this._model.serialize(), null, 4) + '</pre>');
    },
    _change_editor:function(editor) {

    }
});
