databasy.gateway.CommandQueue = Class.extend({
    init:function () {
        this.socket = databasy.gw.socket;
        this._commandInProgress = null;
        this._pendingCommands = [];

        databasy.utils.socket.registerListeners(this.socket, this);
    },
    push:function (command) {
        if (this._commandInProgress === null) {
            this.send(command);
        } else {
            this._pendingCommands.push(command);
        }
    },
    send:function (command) {
        this._commandInProgress = command;
        databasy.gw.socket.emit('exec', command.serialize());
    },
    on_exec_done: function() {
        if (this._pendingCommands.length == 0) {
            this._commandInProgress = null;
        } else {
            var command = this._pendingCommands.shift();
            this.send(command);
        }
    },
    on_exec_fail: function() {
        alert('Server rejected model modification.\n\nModel will be reloaded.');
        databasy.utils.preloader.openPreloader(false);
        window.location.href = '/models/' + databasy.gw.modelId;
    }
});