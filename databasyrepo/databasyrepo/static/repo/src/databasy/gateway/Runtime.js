databasy.gateway.Runtime = Class.extend({
    init:function (serializedRuntime) {
        this.users = serializedRuntime['users'];
        this.applicants = serializedRuntime['applicants'];
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

    cancelControlRequest:function() {
        var pos = $.inArray(databasy.gw.userId, this.applicants);
        if (pos == -1) {
            throw new Error('User is not an applicant.')
        }
        this.applicants.splice(pos, 1);
    },

    rejectControlRequests:function() {
        this.applicants = [];
    },

    isEditor:function () {
        return databasy.gw.userId == this.editor;
    },

    isApplicant:function() {
        return $.inArray(databasy.gw.userId, this.applicants) != -1;
    },

    getUsername: function(userId) {
        var username = null;
        $.each(this.users, function(i, user) {
            if (user.id === userId) {
                username = user.username;
                return false;
            }
            return true;
        });
        return username;
    }
});
