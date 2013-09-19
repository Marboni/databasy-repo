databasy.gateway.RuntimeStub = databasy.gateway.Runtime.extend({
    init:function () {
    },

    passControl:function () {
        throw new Error('Runtime is not defined.')
    },

    requestControl:function() {
        throw new Error('Runtime is not defined.')
    },

    cancelControlRequest:function() {
        throw new Error('Runtime is not defined.')
    },

    rejectControlRequests:function() {
        throw new Error('Runtime is not defined.')
    },

    isEditor:function () {
        return false;
    },

    isApplicant:function() {
        return false;
    }
});
