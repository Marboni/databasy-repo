// Registers any functions with name starting with "on_" as socket listeners.
databasy.utils.socket.registerListeners = function(socket, obj) {
    for (var field in obj) {
        if (field.substr(0, 3) === 'on_' && field.length > 3) {
            var eventName = field.substr(3);
            socket.on(eventName, $.proxy(obj, field));
        }
    }
};
