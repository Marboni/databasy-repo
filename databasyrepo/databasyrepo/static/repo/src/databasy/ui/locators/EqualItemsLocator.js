databasy.ui.locators.EqualItemsLocator = draw2d.layout.locator.Locator.extend({
    NAME : "databasy.ui.locators.EqualItemsLocator",

    /**
     * @method
     * Relocates the given Figure.
     *
     * @param {Number} index child index of the target
     * @param {draw2d.Figure} target The figure to relocate
     **/
    relocate:function(index, target) {
        var parent = this.getParent();
        var boundingBox = parent.getBoundingBox();
        var targetBoundingBox = target.getBoundingBox();

        target.setPosition(0, targetBoundingBox.h * index);
    }
});