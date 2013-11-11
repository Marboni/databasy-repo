databasy.ui.general.GeneralPanel = Class.extend({
    init:function () {
        this.createGeneralPanel();
        this.schemaTreePanel = new databasy.ui.general.SchemaTreePanel();
    },

    createGeneralPanel:function () {
        this.generalPanel = $('#generalPanel');
        this.generalPanel.empty();
    }
});