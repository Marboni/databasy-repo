databasy.gateway.Gateway = Class.extend({
    init:function (modelId, userId) {
        this.modelId = modelId;
        this.userId = userId;

        this._listeners = [];

        this.layout = new databasy.ui.layout.Layout(this);

        this.socket = this.createSocket();
        this.commandQueue = new databasy.gateway.CommandQueue(this);
    },
    createSocket:function () {
        var socket = io.connect('/models');

        $(window).bind('beforeunload', function() {
            socket.disconnect();
        });
        databasy.utils.socket.registerListeners(socket, this);

        return socket;
    },

    // SOCKET CALLBACKS
    on_connect:function () {
        this.layout.statusMsg('Connected');
        this.socket.emit('enter', this.modelId, this.userId);
    },
    on_reconnect:function () {
        this.layout.statusMsg('Reconnected');
    },
    on_reconnecting:function () {
        this.layout.statusMsg('Reconnecting');
        databasy.utils.preloader.openPreloader(false);
    },
    on_error:function () {
        this.layout.statusMsg('Error: ' + e.message);
    },
    on_enter_done:function () {
        this.socket.emit('load');
    },
    on_load_done:function (serializedModel, roles) {
        this.initializeModel(serializedModel);
        this.changeRoles(roles);
    },
    on_roles_changed:function (roles) {
        this.changeRoles(roles);
    },
    on_exec:function(serializedCommand) {
        var command = databasy.model.core.serializing.Serializable.deserialize(serializedCommand);
        this._applyCommand(command);
    },

    executeCommand:function (command) {
        command.set('source_version', this.model.version());
        this._applyCommand(command);
        this.commandQueue.push(command);
    },

    _applyCommand: function(command) {
        var events = this.model.execute_command(command, this.userId);
        $.each(events, $.proxy(function(i, event) {
            this.fire(new databasy.gateway.events.ModelChanged(event));
        }, this));
    },

    requestControl:function () {
        this.userRoles.requestControl();
        this.fire(new databasy.gateway.events.UserRolesChanged(this.userRoles));
        this.socket.emit('request_control');
    },

    passControl:function () {
        this.userRoles.passControl();
        this.fire(new databasy.gateway.events.UserRolesChanged(this.userRoles));
        this.socket.emit('pass_control', null);
    },

    initializeModel:function (serializedModel) {
        databasy.utils.preloader.openPreloader(false);

        try {
            this.reset();

            this.model = databasy.model.core.serializing.Serializable.deserialize(serializedModel);

            var default_canvas_node = this.model.val_as_node('canvases', this.model)[0];
            var reprs = default_canvas_node.val_as_node('reprs', this.model);
            $.each(reprs, $.proxy(function (index, repr) {
                    var reprCode = repr.code();
                    if (reprCode === databasy.model.core.reprs.TableRepr.CODE) {
                        this.layout.renderTable(repr);
                    }
                },
                this));
        } finally {
            databasy.utils.preloader.closePreloader();
        }
    },
    changeRoles:function (serializedRoles) {
        this.userRoles = new databasy.gateway.UserRoles(this.userId, serializedRoles);
        this.fire(new databasy.gateway.events.UserRolesChanged(this.userRoles));
    },

    fire:function(event) {
        var listenerFunc = 'on' + event.eventName;
        $.each(this._listeners, function(i, listener) {
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
    },

    reset:function() {
        this.commandQueue.reset();
        this.layout.reset();
        this.userRoles = undefined;
    }
});
