databasy.ui.figure.Rectangle = draw2d.shape.basic.Rectangle.extend({
    NAME: "databasy.ui.figure.Rectangle",

    insertFigure: function (child, index, locator) {
        child.setDraggable(false);
        child.setSelectable(false);
        child.setParent(this);

        this.children.insertElementAt({figure:child, locator:locator}, index);

        if (this.canvas !== null) {
            child.setCanvas(this.canvas);
        }

        this.repaint();

        return this;
    },

    removeFigure: function (child) {
        var index = -1;
        this.children.each(function(i, figureAndLocator) {
            if (figureAndLocator.figure === child) {
                index = i;
                return false;
            }
            return true;
        });
        if (index === -1) {
            throw new Error('Child not found.');
        }

        this.children.removeElementAt(index);
        child.canvas.removeFigure(child);
        this.repaint();
    },

    removeFromParent: function() {
        if (this.parent) {
            this.parent.removeFigure(this);
        } else {
            this.canvas.removeFigure(this);
        }
    }
});