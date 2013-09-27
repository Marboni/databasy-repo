databasy.ui.locator.InnerVerticalCenterLocator= draw2d.layout.locator.Locator.extend({
    NAME : "databasy.ui.locator.InnerVerticalCenterLocator",

    init: function(parent, x) {
        this._super(parent);
        this.x = x;
    },

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

        target.setPosition(this.x, boundingBox.h/2-targetBoundingBox.h/2);
    }
});