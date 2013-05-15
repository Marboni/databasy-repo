databasy.gateway.CommandQueue = Class.extend({
    init:function (gw) {
        this.gw = gw;
        this.socket = gw.socket;
        this._commandInProgress = null;
        this._pendingCommands = [];

        databasy.utils.socket.registerListeners(gw.socket, this);
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
        this.gw.socket.emit('exec', command.serialize());
    },
    reset: function() {
        this._commandInProgress = null;
        this._pendingCommands = [];
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
        alert("FUCK!");
    }
});