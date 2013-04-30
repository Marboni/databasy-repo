databasy.ui.locators.EntityLocator = draw2d.layout.locator.Locator.extend({
    NAME : "odm.ui.locator.EntityLocator",

    init: function(entity)
    {
        this._super(entity);
    },

    relocate:function(index, target)
    {
        var entity = this.getParent();
        var boundingBox = entity.getBoundingBox();

        var targetBoundingBox = target.getBoundingBox();
        var padding = boundingBox.w/2-targetBoundingBox.w/2;
        target.setPosition(padding, padding);
    }
});