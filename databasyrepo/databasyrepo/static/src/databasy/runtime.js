databasy.runtime.Register = Class.extend({
    init:function (pkg, field) {
        this.findAndReg(pkg, field);
    },

    findAndReg:function (obj, field) {
        if (obj instanceof Object) {
            if (field in obj) {
                this[obj[field]] = obj;
            } else {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p) && typeof(obj[p] === 'object')) {
                        this.findAndReg(obj[p], field);
                    }
                }
            }
        }
    },
    exists:function (key) {
        return this.hasOwnProperty(key);
    },
    by_key:function (key) {
        if (!this.exists(key)) {
            throw new Error(key + ' not registered.')
        }
        return this[key];
    }
});

databasy.runtime.register = new databasy.runtime.Register(databasy.model, 'CODE');

databasy.runtime.ModelManager = Class.extend({
    init:function (model_id) {
        this.model_id = model_id;
        this._init_socket();
        this.reload();
    },
    _init_socket:function () {
        this.socket = io.connect('/models');
        var that = this;

        $(window).bind('beforeunload', function () {
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
    show:function () {
        $('#busy').hide();
    },
    hide:function () {
        $('#busy').show();
    },
    reload:function () {
        this.layout = databasy.ui.layout.createLayout();

        var user_id = new Date().getTime();
        this.socket.emit('reload', this.model_id, user_id);

        var that = this;
        this.socket.on('reload', function (serialized_model, current_editor) {
            that._init_model(serialized_model);
            that._change_editor(current_editor);
            that.redraw();
            that.show();
        });
    },
    _init_model:function (serialized_model) {
        this.model = databasy.model.core.serializing.Serializable.deserialize(serialized_model);
        $('#canvas').append('<pre>' + JSON.stringify(this.model.serialize(), null, 4) + '</pre>');
    },
    _change_editor:function (editor) {

    },
    redraw:function () {
        var default_canvas_node = this.model.val_as_node('canvases', this.model)[0];
        var reprs = default_canvas_node.val_as_node('reprs', this.model);

        var canvas = new databasy.ui.shapes.Canvas(this, 'canvas');

        var reprs_by_type = {};
        for (var i = 0; i < reprs.length; i++) {
            var repr = reprs[i];
            if (!reprs_by_type.hasOwnProperty(repr.code())) {
                reprs_by_type[repr.code()] = [];
            }
            reprs_by_type[repr.code()].push(repr);
        }
        this._redraw(canvas, reprs_by_type[databasy.model.core.reprs.TableRepr.CODE], databasy.ui.shapes.Table);
    },
    _redraw:function (canvas, reprs, shape_cls) {
        if (reprs === undefined) {
            return;
        }
        for (var i = 0; i < reprs.length; i++) {
            var shape = new shape_cls(this, reprs[i]);
            shape.draw(canvas);
        }
    }
});
