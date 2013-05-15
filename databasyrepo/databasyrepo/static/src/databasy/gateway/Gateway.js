databasy.gateway.Gateway = Class.extend({
    init:function (modelId) {
        this.modelId = modelId;
        this.userId = new Date().getTime();

        this.socket = this.createSocket();

        this.layout = new databasy.ui.layout.Layout(this);
        this.commandQueue = new databasy.gateway.CommandQueue(this);
    },
    createSocket:function () {
        var socket = io.connect('/models');

        $(window).bind('beforeunload', socket.disconnect);
        databasy.utils.socket.registerListeners(socket, this);

        return socket;
    },

    // SOCKET CALLBACKS
    on_connect:function () {
        $('#canvas').append('<pre>' + 'Connected' + '</pre>');
        this.socket.emit('enter', this.modelId, this.userId);
    },
    on_reconnect:function () {
        $('#canvas').append('<pre>' + 'Reconnected' + '</pre>');
    },
    on_reconnecting:function () {
        $('#canvas').append('<pre>' + 'Reconnecting' + '</pre>');
        databasy.utils.preloader.openPreloader(false);
    },
    on_error:function () {
        $('#canvas').append('<pre>' + 'Error: ' + e.message + '</pre>');
    },
    on_enter_done:function () {
        this.socket.emit('reload');
    },
    on_reload_done:function (serializedModel, editor) {
        this.initializeModel(serializedModel);
        this.changeEditor(editor);
    },

    execute_command:function (command) {
        command.set('source_version', this.model.version());
        this.model.execute_command(command);
        this.commandQueue.push(command);
    },

    initializeModel:function (serializedModel) {
        databasy.utils.preloader.openPreloader(false);

        try {
            this.model = databasy.model.core.serializing.Serializable.deserialize(serializedModel);

            this.commandQueue.reset();
            this.layout.canvas.clear();

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
    changeEditor:function (editor) {

    }
});
