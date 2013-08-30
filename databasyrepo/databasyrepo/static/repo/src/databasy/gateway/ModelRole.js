databasy.gateway.ModelRole = Class.extend({
    init:function (role) {
        this.role = role;
    },

    includes:function (required_role) {
        if (this.role == required_role) {
            return true;
        }
        var subRoles = databasy.gateway.ModelRole.HIERARCHY[this.role];
        return subRoles != undefined && $.inArray(required_role, subRoles) != -1;
    }
}, {
    OWNER: 'owner',
    DEVELOPER: 'developer',
    VIEWER: 'viewer',

    HIERARCHY: {
        owner: ['developer', 'viewer'],
        developer: ['viewer']
    }
});