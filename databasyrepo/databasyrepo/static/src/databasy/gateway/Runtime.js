databasy.gateway.Runtime = Class.extend({
    init:function (userId, serializedRuntime) {
        this.userId = userId;
        this.users = serializedRuntime['users'];
        this.editor = serializedRuntime['editor'];
        this.passingControl = false;
        this.requestingControl = false;
    },

    passControl:function () {
        if (!this.isEditor()) {
            throw new Error('User is not editor.')
        }
        this.editor = null;
        this.passingControl = true;
    },

    requestControl:function() {
        if (this.isEditor()) {
            throw new Error('User is already an editor.')
        }
        this.requestingControl = true;
    },

    isEditor:function () {
        return this.userId == this.editor;
    }
});
