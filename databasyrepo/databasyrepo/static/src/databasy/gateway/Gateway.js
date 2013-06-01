databasy.gateway.Gateway = Class.extend({
    init:function (modelId, userId) {
        this.modelId = modelId;
        this.userId = userId;

        this._observer = new databasy.utils.events.Observer();

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
        this.socket.emit('enter', this.modelId, this.userId);
    },
    on_reconnect:function () {
    },
    on_reconnecting:function () {
        databasy.utils.preloader.openPreloader(false);
    },
    on_error:function (e) {
        alert('ERROR: ' + e.message);
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
            this.commandQueue.reset();
            this.userRoles = undefined;
            this.model = databasy.model.core.serializing.Serializable.deserialize(serializedModel);
            this.layout = new databasy.ui.layout.Layout(this);
        } finally {
            databasy.utils.preloader.closePreloader();
        }
    },

    changeRoles:function (serializedRoles) {
        this.userRoles = new databasy.gateway.UserRoles(this.userId, serializedRoles);
        this.fire(new databasy.gateway.events.UserRolesChanged(this.userRoles));
    },

    fire:function(event) {
        this._observer.fire(event);
    },

    addListener:function(listener) {
        this._observer.addListener(listener);
    },

    removeListener:function(listener) {
        this._observer.removeListener(listener);
    },
});
