databasy.ui.layout.overview.OverviewPanel = Class.extend({
    init:function (gateway) {
        this.gateway = gateway;
        gateway.addListener(this);

        this.createOverviewPanel();

        this.schemaTreePanel = new databasy.ui.layout.overview.SchemaTreePanel(this.gateway);
    },

    createOverviewPanel:function () {
        this.overviewPanel = $('#overviewPanel');
        this.overviewPanel.empty();
    }
});