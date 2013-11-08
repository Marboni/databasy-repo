databasy.ui.overview.OverviewPanel = Class.extend({
    init:function () {
        this.createOverviewPanel();
        this.schemaTreePanel = new databasy.ui.overview.SchemaTreePanel();
    },

    createOverviewPanel:function () {
        this.overviewPanel = $('#overviewPanel');
        this.overviewPanel.empty();
    }
});