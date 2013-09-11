databasy.ui.figures.Label = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.Label",

    init: function(width, text) {
        this._super(width, 10);

        this.setStroke(0);

        this.label = new draw2d.shape.basic.Label(text);
        this.label.setStroke(0);
        this.label.setColor("#0d0d0d");
        this.label.setFontSize(13);
        this.label.setFontColor("#0d0d0d");
        this.label.setBold(true);

        var that = this;
        this.label.installEditor(new databasy.ui.InplaceEditor(databasy.gw, {
            onCommit: function(value) {
                that.onCommit(value);
            },
            onCancel: function() {
                that.onCancel();
            }
        }));

        this.addFigure(this.label, new databasy.ui.locators.InnerPositionLocator(this, 0, 0));
    },

    repaint: function(attributes) {
        if (this.label !== undefined) {
            this.setDimension(this.width, this.label.height);
        }
        this._super(attributes);
    },

    setText: function(text) {
        this.label.setText(text);
    },

    onCommit: function(value) {
    },

    onCancel: function() {
    }
});
