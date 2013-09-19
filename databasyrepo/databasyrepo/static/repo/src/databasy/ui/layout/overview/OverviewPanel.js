databasy.ui.layout.overview.OverviewPanel = Class.extend({
    init:function () {
        this.createOverviewPanel();
        this.schemaTreePanel = new databasy.ui.layout.overview.SchemaTreePanel();
    },

    createOverviewPanel:function () {
        this.overviewPanel = $('#overviewPanel');
        this.overviewPanel.empty();
    }
});