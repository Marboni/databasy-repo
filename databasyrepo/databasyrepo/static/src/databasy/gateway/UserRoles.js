databasy.gateway.UserRoles = Class.extend({
    init:function (userId, serializedRoles) {
        this.userId = userId;
        this.activeUsers = serializedRoles['active_users'];
        this.editor = serializedRoles['editor'];
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
