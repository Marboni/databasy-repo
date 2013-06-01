databasy.ui.events.ComponentDblClicked = databasy.utils.events.Event.extend({
    init:function(component) {
        this._super('ComponentDblClicked');
        this.component = component;
    }
});
