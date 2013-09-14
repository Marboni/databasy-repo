databasy.ui.figures.Column = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.Column",

    init:function (tableFigure, name) {
        this._super(178, 20);
        this.tableFigure = tableFigure;

        databasy.gw.addListener(this);

        this.setBackgroundColor('#FFFFFF');
        this.setColor('#FFFFFF');
        this.setRadius(0);
        this.setStroke(0);

        databasy.ui.utils.delegateContextMenu(this, this.tableFigure);
        databasy.ui.utils.delegateDoubleClick(this, this.tableFigure);

        this.createName(name);
    },

    createName: function(name) {
        this.label = new draw2d.shape.basic.Label(name);
        this.label.setStroke(0);
        this.label.setColor("#0d0d0d");
        this.label.setFontSize(12);
        this.label.setFontColor("#0d0d0d");
        databasy.ui.utils.delegateContextMenu(this.label, this.tableFigure);
        databasy.ui.utils.delegateDoubleClick(this.label, this.tableFigure);

        this.addFigure(this.label, new databasy.ui.locators.InnerVerticalCenterLocator(this, 20));
    },

    addComment: function() {
        this.comment = new databasy.ui.figures.Comment(this);
        this.addFigure(this.comment, new databasy.ui.locators.InnerTopRightLocator(this, 2, 0));
    },

    removeComment:function() {
        this.removeFigure(this.comment);
        this.comment = undefined;
    },

    setName: function(name) {
        this.label.setText(name);
    }
});
