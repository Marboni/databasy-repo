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
        this.user_id = new Date().getTime();
        this.layout = databasy.ui.layout.createLayout();

        this._command_queue = undefined;
        this._init_socket();
    },
    _init_socket:function () {
        this.socket = io.connect('/models');
        var that = this;

        $(window).bind('beforeunload', function () {
            that.socket.disconnect();
        });

        this.socket.on('connect', function () {
            $('#canvas').append('<pre>' + 'Connected' + '</pre>');
            that.socket.emit('enter', that.model_id, that.user_id);
        });

        this.socket.on('reconnect', function () {
            $('#canvas').append('<pre>' + 'Reconnected' + '</pre>');
        });

        this.socket.on('reconnecting', function () {
            $('#canvas').append('<pre>' + 'Reconnecting' + '</pre>');
            databasy.utils.preloader.openPreloader(false);
        });

        this.socket.on('error', function (e) {
            $('#canvas').append('<pre>' + 'Error: ' + e.message + '</pre>');
        });

        this.socket.on('enter_done', function() {
            that.reload();
        });
    },
    reload:function () {
        this.socket.emit('reload');

        var that = this;
        this.socket.on('reload_done', function (serialized_model, current_editor) {
            that._init_model(serialized_model);
            that._change_editor(current_editor);
            that.redraw();
        });
    },
    execute_command:function(command) {
        command.set('source_version', this.model.version());
        this.model.execute_command(command);
        this._command_queue.push(command);
    },
    _init_model:function (serialized_model) {
        this.model = databasy.model.core.serializing.Serializable.deserialize(serialized_model);
        this._command_queue = new databasy.runtime.ModelManager.CommandQueue(this);
//        $('#canvas').append('<pre>' + JSON.stringify(this.model.serialize(), null, 4) + '</pre>');
    },
    _change_editor:function (editor) {

    },
    redraw:function () {
        databasy.utils.preloader.openPreloader(false);

        try {
            var default_canvas_node = this.model.val_as_node('canvases', this.model)[0];
            var reprs = default_canvas_node.val_as_node('reprs', this.model);

            if (this.canvas === undefined) {
                this.canvas = new databasy.ui.shapes.Canvas(this, 'canvas');
            } else {
                this.canvas.clear();
            }

            var reprs_by_type = {};
            for (var i = 0; i < reprs.length; i++) {
                var repr = reprs[i];
                if (!reprs_by_type.hasOwnProperty(repr.code())) {
                    reprs_by_type[repr.code()] = [];
                }
                reprs_by_type[repr.code()].push(repr);
            }
            this._redraw(reprs_by_type[databasy.model.core.reprs.TableRepr.CODE], databasy.ui.shapes.Table);
        } finally {
            databasy.utils.preloader.closePreloader();
        }
    },
    _redraw:function (reprs, shape_cls) {
        if (reprs === undefined) {
            return;
        }
        for (var i = 0; i < reprs.length; i++) {
            var shape = new shape_cls(this, reprs[i]);
            shape.draw(this.canvas);
        }
    }
}, {
    CommandQueue: Class.extend({
        init:function(mm) {
            this._mm = mm;
            this._command_in_progress = null;
            this._pending_commands = [];

            var that = this;
            this._mm.socket.on('exec_done', function() {
                that._on_exec_done()
            });
            this._mm.socket.on('exec_fail', function() {
                that._on_exec_fail()
            });
        },
        push:function(command) {
            if (this._command_in_progress === null) {
                this._send(command);
            } else {
                this._pending_commands.push(command);
            }
        },
        _send:function(command) {
            this._command_in_progress = command;
            this._mm.socket.emit('exec', command.serialize());
        },
        _on_exec_done:function() {
            if (this._pending_commands.length == 0) {
                this._command_in_progress = null;
            } else {
                var command = this._pending_commands.shift();
                this._send(command);
            }
        },
        _on_exec_fail:function() {
            alert("FUCK!");
            this._mm.reload();
        }
    })
});
