databasy.ui.figures.TableTitle = draw2d.shape.basic.Rectangle.extend({
    NAME:"databasy.ui.figures.TableTitle",

    init: function(tableFigure) {
        this._super(180, 30);

        this.tableFigure = tableFigure;

        this.setRadius(8);
        this.setAlpha(0);
        this.tableFigure.attachResizeListener(this);
        databasy.ui.utils.delegateContextMenu(this, this.tableFigure);
        databasy.ui.utils.delegateDoubleClick(this, this.tableFigure);

        this.createIcon();
        this.createName();
    },

    createIcon: function() {
        this.icon = new draw2d.shape.basic.Image('/static/repo/src/img/sprite/table16.png', 16, 16);
        databasy.ui.utils.delegateContextMenu(this.icon, this);
        databasy.ui.utils.delegateDoubleClick(this.icon, this);

        this.addFigure(this.icon, new databasy.ui.locators.InnerVerticalCenterLocator(this, 8));
    },

    createName: function() {
        this.name = new draw2d.shape.basic.Label(this.tableFigure.table.val('name'));
        this.name.setStroke(0);
        this.name.setColor("#0d0d0d");
        this.name.setFontSize(13);
        this.name.setFontColor("#0d0d0d");
        this.name.setBold(true);
        this.name.installEditor(new databasy.ui.InplaceEditor(databasy.gw, {
            onCommit:$.proxy(this.renameTable, this),
            onTabPressed:$.proxy(this.startCreateColumn, this, 0)
        }));
        databasy.ui.utils.delegateContextMenu(this.name, this);

        this.addFigure(this.name, new databasy.ui.locators.InnerVerticalCenterLocator(this, 26));
    },

    startRename: function() {
        var editor = this.name.editor;
        editor.start(this.name);
    },

    onOtherFigureIsResizing: function(figure) {
        this.setDimension(figure.width,  this.height);
    }
});