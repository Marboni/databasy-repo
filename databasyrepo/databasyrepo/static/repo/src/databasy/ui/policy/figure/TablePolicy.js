databasy.ui.policy.figure.TablePolicy = draw2d.policy.figure.RectangleSelectionFeedbackPolicy.extend({
    NAME:"databasy.ui.policy.figure.TablePolicy",

    adjustDimension: function(figure, width, height) {
        if (!figure.internalModification) {
            height = figure.getHeight();
        }
        return this._super(figure, width, height);
    },

    onSelect: function(canvas, figure, isPrimarySelection) {
        databasy.gw.layout.propertyPanel.refreshProperties(figure.tableId);
        this._super(canvas, figure, isPrimarySelection);
    }
});
