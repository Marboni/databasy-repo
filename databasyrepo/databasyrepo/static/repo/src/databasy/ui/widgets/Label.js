databasy.ui.widgets.Label = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.widgets.Label",

    init: function(parent, width) {
        this._super(width, 10); // Height will be recalculated according to label height on repaint.

        this.setStroke(0);
        this.setAlpha(0);

        this.text = '';
        this.restoreTextWhenEmpty = false;

        databasy.ui.utils.delegateContextMenu(this, parent);

        this.createLabel();
    },

    createLabel: function() {
        this.label = new draw2d.shape.basic.Label(this.text);
        this.label.setStroke(0);
        this.label.setColor("#0d0d0d");
        this.label.setFontSize(13);
        this.label.setFontColor("#0d0d0d");

        var that = this;
        var labelListener = {
            onCommit: function(value) {
                if (that.restoreTextWhenEmpty && value === "") {
                    value = that.text;
                }
                that.setText(value);
                that.onCommit(value);
            },
            onCancel: function() {
                that.onCancel();
            }
        };
        this.label.installEditor(new databasy.ui.widgets.InplaceEditor(labelListener, $.proxy(this.getText, this)));

        this.label.onOtherFigureIsResizing = $.proxy(this.adjustLabelToWrapper, this);
        this.attachResizeListener(this.label);

        databasy.ui.utils.delegateDoubleClick(this, this.label);
        databasy.ui.utils.delegateContextMenu(this.label, this);

        this.addFigure(this.label, new databasy.ui.locators.InnerPositionLocator(this, 0, 0));
    },

    setFontSize: function(fontSize) {
        this.label.setFontSize(fontSize);
    },

    setBold: function(bold) {
        this.label.setBold(bold);
    },

    getText: function() {
        return this.text;
    },

    setText: function(text) {
        this.text = text;
        this.adjustLabelToWrapper();
    },

    /**
     * Defines actions in case of user commits empty string.
     * If false (by default), empty string will be left. If true, it will be changed to value before edition.
     */
    setRestorePreviousValueIfEmpty: function(restore) {
        this.restoreTextWhenEmpty = restore;
    },

    startEdit: function() {
        setTimeout($.proxy(this.label.editor.start, this.label.editor, this.label), 100);
    },

    setWidth: function(width) {
        this.setDimension(width, 30); // Height will be recalculated according to label height on repaint.
    },

    adjustLabelToWrapper: function() {
        var text = this.text;
        this.label.setText(text);
        if (this.label.svgNodes.getBBox().width > this.width) {
            text = text.substring(0, text.length - 3);

            do {
                this.label.setText(text + '...');
                text = text.substring(0, text.length - 1);
            } while (this.label.svgNodes.getBBox().width > this.width && text.length > 1);
        }
    },

    repaint: function(attributes) {
        var labelHeight = this.label === undefined ? null :
            (this.label.svgNodes === null ? null : this.label.svgNodes.getBBox().height + this.label.padding * 2);
        if (labelHeight !== this.height) {
            this.setDimension(this.width, labelHeight);
        }
        this._super(attributes);
    },

    onCommit: function(value) {
    },

    onCancel: function() {
    }
});
