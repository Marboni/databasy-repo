databasy.gateway.events.UserRolesChanged = databasy.gateway.events.GatewayEvent.extend({
    init:function(userRoles) {
        this._super('UserRolesChanged');
        this.userRoles = userRoles;
    }
});
