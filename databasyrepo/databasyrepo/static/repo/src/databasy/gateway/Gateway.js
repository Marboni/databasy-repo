databasy.gateway.Gateway = Class.extend({
    init:function (modelId, userId) {
        this.modelId = modelId;
        this.userId = userId;

        this._observer = new databasy.utils.events.Observer();

        this.socket = this.createSocket();
        this._commandQueue = new databasy.gateway.CommandQueue(this);
        this.listenActivity();
    },

    createSocket:function () {
        var socket = io.connect('/models', {
            'reconnection limit': 4000
        });

        $(window).bind('beforeunload', function() {
            socket.disconnect();
        });
        databasy.utils.socket.registerListeners(socket, this);

        return socket;
    },

    listenActivity: function() {
        this.activity = false;
        var that = this;
        $('body').bind('mousedown keydown', function(event) {
            that.activity = true;
        });
    },

    // SOCKET CALLBACKS
    on_connect:function () {
        this.enter();
    },
    on_reconnect:function () {
    },
    on_reconnecting:function () {
        databasy.utils.preloader.openPreloader(false);
    },
    on_error:function (e) {
        console.log('ERROR: ' + e.toString());
        this.enter();
    },
    on_enter_done:function () {
        this.socket.emit('load');
    },
    on_load_done:function (serializedModel, serializedRuntime) {
        this.initializeModel(serializedModel);
        this.changeRuntime(serializedRuntime);
    },
    on_runtime_changed:function (runtime) {
        this.changeRuntime(runtime);
    },
    on_exec:function(serializedCommand) {
        var command = databasy.model.core.serializing.Serializable.deserialize(serializedCommand);
        this._applyCommand(command);
    },

    enter: function() {
        this.socket.emit('enter', this.modelId, this.userId);
    },

    executeCommand:function (command) {
        command.set('source_version', this.model.version());
        this._applyCommand(command);
        this._commandQueue.push(command);
    },

    _applyCommand: function(command) {
        var events = this.model.execute_command(command, this.userId);
        $.each(events, $.proxy(function(i, event) {
            this.fire(new databasy.gateway.events.ModelChanged(event));
        }, this));
    },

    requestControl:function () {
        this.runtime.requestControl();
        this.fire(new databasy.gateway.events.RuntimeChanged(this.runtime));
        this.socket.emit('request_control');
    },

    passControl:function (toUserId) {
        this.runtime.passControl();
        this.fire(new databasy.gateway.events.RuntimeChanged(this.runtime));
        this.socket.emit('pass_control', toUserId);
    },

    /**
     * Applicant cancels its control request.
     */
    cancelControlRequest: function() {
        this.runtime.cancelControlRequest();
        this.fire(new databasy.gateway.events.RuntimeChanged(this.runtime));
        this.socket.emit('cancel_control_request');
    },

    /**
     * Editor rejects control requests.
     */
    rejectControlRequests: function() {
        this.runtime.rejectControlRequests();
        this.fire(new databasy.gateway.events.RuntimeChanged(this.runtime));
        this.socket.emit('reject_control_requests');
    },

    initializeModel:function (serializedModel) {
        databasy.utils.preloader.openPreloader(false);

        try {
            this._observer.reset();
            this._commandQueue.reset();
            this.runtime = undefined;
            this.model = databasy.model.core.serializing.Serializable.deserialize(serializedModel);
            this.layout = new databasy.ui.layout.Layout(this);
            this.reportActivity();
        } finally {
            databasy.utils.preloader.closePreloader();
        }
    },

    reportActivity: function() {
        this.activity = false;
        var that = this;
        var delay = 5000;

        var ping = function() {
            that.socket.emit('activity', that.activity);
            that.activity = false;
            clearTimeout(that.activityTimer);
            that.activityTimer = setTimeout(ping, delay);
        };
        this.activityTimer = setTimeout(ping, delay);
    },

    changeRuntime:function (serializedRoles) {
        this.runtime = new databasy.gateway.Runtime(this.userId, serializedRoles);
        this.fire(new databasy.gateway.events.RuntimeChanged(this.runtime));
    },

    fire:function(event) {
        this._observer.fire(event);
    },

    addListener:function(listener) {
        this._observer.addListener(listener);
    },

    removeListener:function(listener) {
        this._observer.removeListener(listener);
    }
});
