databasy.ui.locators.InnerTopRightLocator= draw2d.layout.locator.Locator.extend({
    NAME : "databasy.ui.locators.InnerTopRightLocator",

    init:function(parent, offsetX, offsetY) {
        this._super(parent);
        this.offsetX = offsetX === undefined ? 0 : offsetX;
        this.offsetY = offsetX === undefined ? 0 : offsetY;
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

        target.setPosition(boundingBox.w - targetBoundingBox.w + this.offsetX, this.offsetY);
    }
});