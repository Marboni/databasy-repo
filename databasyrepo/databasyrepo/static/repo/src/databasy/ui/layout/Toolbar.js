databasy.ui.layout.Toolbar = Class.extend({
    init:function () {
        this._currentTool = null;
        this._defaultTool = 'pointer';

        this.createToolbar();
        this.createEditToolbar();

        this.toolbar.append(this.toolPanel);

        var constant = databasy.ui.layout.Toolbar;
        this.createToolbarButton(constant.POINTER, 'icn-pointer24', 'Select');
        this.createToolbarButton(constant.CREATE_TABLE, 'icn-table24', 'Create Table');

        this.selectDefault();
    },
    createToolbar:function () {
        this.toolbar = $('#toolbar');
        this.toolbar.empty();
    },
    createEditToolbar:function () {
        this.toolPanel = $('<div id="toolPanel" class="btn-group btn-group-vertical" data-toggle="buttons-radio"></div>');
    },
    createToolbarButton:function (toolName, icon, tooltip) {
        var buttonId = toolName + 'ToolbarButton';
        var button = $(
            '<button id="' + buttonId + '" type="button" class="btn" name="tools" data-tool="' + toolName +
                '" data-toggle="tooltip" data-original-title="' + tooltip + '">' +
                '<i class="icn ' + icon + '"></i>' +
                '</button>');

        this.toolPanel.append(button);

        var that = this;
        $('#' + buttonId)
            .tooltip({
                placement: 'right',
                delay: 500,
                container: 'body'
            })
            .click(function () {
                var tool = $(this).data('tool');
                if (tool === that._currentTool) {
                    that.selectDefault();
                } else {
                    that._currentTool = tool;
                }
            });
        return button;
    },
    select:function (tool) {
        this._currentTool = tool;
        this.toolPanel.find('button').removeClass('active');
        this.toolPanel.find('button[data-tool=' + tool + ']').addClass('active');
    },
    selectDefault:function () {
        this.select(this._defaultTool);
    },
    getCurrentTool:function () {
        return this._currentTool;
    }
}, {
    POINTER:'pointer',
    CREATE_TABLE:'createTable'
});
