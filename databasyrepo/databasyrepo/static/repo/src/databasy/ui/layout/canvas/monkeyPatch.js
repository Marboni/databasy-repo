draw2d.Figure.prototype.originalOnDragStart = draw2d.Figure.prototype.onDragStart;
draw2d.Figure.prototype.onDragStart = function(relativeX, relativeY) {
    // Fix bug with dragging figure outside canvas and triggering mouseup. Figure's alpha will decrease each time.
    this.setAlpha(this.originalAlpha);
    this.originalOnDragStart(relativeX, relativeY);
};


//noinspection JSAccessibilityCheck
draw2d.ResizeHandle.prototype.originalOnDragEnd = draw2d.ResizeHandle.prototype.onDragEnd;
draw2d.ResizeHandle.prototype.onDragEnd = function() {
    // Fix bug with dragging figure outside canvas and triggering mouseup. As result, when user clicks on canvas next time,
    // hide() method called and canvas disappears from ResizeHandler, so this method doesn't work.

    this.canvas = this.owner.canvas;
    this.originalOnDragEnd();
};
