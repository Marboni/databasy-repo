databasy.ui.locators.InnerPositionLocator= draw2d.layout.locator.Locator.extend({
    NAME : "databasy.ui.locators.InnerPositionLocator",

    init: function(parent, x, y) {
        this._super(parent);
        this.x = x;
        this.y = y;
    },

    /**
     * @method
     * Relocates the given Figure.
     *
     * @param {Number} index child index of the target
     * @param {draw2d.Figure} target The figure to relocate
     **/
    relocate:function(index, target) {
        target.setPosition(this.x, this.y);
    }
});