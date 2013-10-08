databasy.gateway.Gateway = Class.extend({
    init:function (modelId) {
        databasy.gw = this;
        databasy.context = new databasy.gateway.Context();

        this.modelId = modelId;
        this.disconnecting = false;

        this._observer = new databasy.utils.events.Observer();
        this.runtime = new databasy.gateway.RuntimeStub();

        this.socket = this.createSocket();
        this._commandQueue = new databasy.gateway.CommandQueue(this);
        this.listenActivity();
    },

    createSocket:function () {
        var socket = io.connect('/models', {
            'reconnection limit':30000,
            'query':'m=' + this.modelId
        });

        $(window).bind('beforeunload', function () {
            socket.disconnect();
        });
        databasy.utils.socket.registerListeners(socket, this);

        return socket;
    },

    listenActivity:function () {
        this.activity = false;
        var that = this;
        $('body').bind('mousedown keydown', function (event) {
            that.activity = true;
        });
    },

    // SOCKET CALLBACKS
    on_connect:function () {
        this.socket.emit('enter');
    },
    on_server_disconnect:function () {
        this.disconnecting = true;
        setTimeout("document.location.href='/'", 300);
    },
    on_reconnect:function () {

    },
    on_reconnecting:function () {
        databasy.utils.preloader.openPreloader(false);
        window.location.href = '/models/' + this.modelId;
    },
    on_error:function (error, message) {
        if (this.disconnecting) {
            return;
        }
        alert(error + ': ' + message + '\n\n' + 'Model will be reloaded.');
        this.disconnecting = true;
        databasy.utils.preloader.openPreloader(false);
        window.location.href = '/models/' + this.modelId;
    },
    on_enter_done:function (userId, role) {
        this.userId = userId;
        this.role = new databasy.gateway.ModelRole(role);

        this.socket.emit('load');
    },
    on_load_done:function (serializedModel, serializedRuntime) {
        this.initializeModel(serializedModel);
        this.changeRuntime(serializedRuntime);
    },
    on_runtime_changed:function (runtime) {
        this.changeRuntime(runtime);
    },
    on_reload:function (cause) {
        if ('role_changed' == cause) {
            alert('Model owner changed your permissions. Model will be reloaded.');
        } else {
            alert('Server forced model reload.')
        }
        this.disconnecting = true;
        window.location.href = '/models/' + this.modelId;
    },
    on_exec:function (serializedCommand) {
        var command = databasy.model.core.serializing.Serializable.deserialize(serializedCommand);
        this._applyCommand(command);
    },

    executeCommand:function (command) {
        command.set('source_version', this.model.version());
        this._applyCommand(command);
        this._commandQueue.push(command);
    },

    _applyCommand:function (command) {
        var events = this.model.execute_command(command, this.userId);
        $.each(events, $.proxy(function (i, event) {
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
    cancelControlRequest:function () {
        this.runtime.cancelControlRequest();
        this.fire(new databasy.gateway.events.RuntimeChanged(this.runtime));
        this.socket.emit('cancel_control_request');
    },

    /**
     * Editor rejects control requests.
     */
    rejectControlRequests:function () {
        this.runtime.rejectControlRequests();
        this.fire(new databasy.gateway.events.RuntimeChanged(this.runtime));
        this.socket.emit('reject_control_requests');
    },

    initializeModel:function (serializedModel) {
        databasy.utils.preloader.openPreloader(false);

        this.model = databasy.model.core.serializing.Serializable.deserialize(serializedModel);
        databasy.service = new databasy.gateway.Service(this.model);

        this.layout = new databasy.ui.layout.Layout();
        this.layout.initializePanels($.proxy(function () {
            this.startReportActivity();
            this._observer.setActive(true); // Fire all events received during rendering.
            databasy.utils.preloader.closePreloader();
        }, this));
    },

    startReportActivity:function () {
        this.activity = false;
        var that = this;
        var delay = 5000;

        var ping = function () {
            that.socket.emit('activity', that.activity);
            that.activity = false;
            clearTimeout(that.activityTimer);
            that.activityTimer = setTimeout(ping, delay);
        };
        this.activityTimer = setTimeout(ping, delay);
    },

    changeRuntime:function (serializedRoles) {
        this.runtime = new databasy.gateway.Runtime(serializedRoles);
        this.fire(new databasy.gateway.events.RuntimeChanged(this.runtime));
    },

    fire:function (event) {
        this._observer.fire(event);
    },

    addListener:function (listener) {
        this._observer.addListener(listener);
    },

    removeListener:function (listener) {
        this._observer.removeListener(listener);
    }
});
