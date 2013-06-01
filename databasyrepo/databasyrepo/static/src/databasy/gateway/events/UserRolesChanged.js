databasy.gateway.events.UserRolesChanged = databasy.utils.events.Event.extend({
    init:function(userRoles) {
        this._super('UserRolesChanged');
        this.userRoles = userRoles;
    }
});
