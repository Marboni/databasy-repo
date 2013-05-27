databasy.ui.layout.Toolbar = Class.extend({
    init:function (gateway) {
        this.gateway = gateway;
        this._currentTool = null;
        this._defaultTool = 'pointer';
    },

    reset:function () {
        this.createToolbar();
        this.createEditToolbar();

        this.toolbar.append(this.toolPanel);

        this.createToolbarButton('pointer', 'ui-icon-pointer', 'Select');
        this.createToolbarButton('createTable', 'ui-icon-table', 'Create Table');

        this.toolPanel.buttonsetv();

        this.selectDefault();
    },
    createToolbar:function () {
        this.toolbar = $('#toolbar');
        this.toolbar.empty();
    },
    createEditToolbar:function () {
        this.toolPanel = $('<div id="toolPanel"></div>');
    },
    createToolbarButton:function (toolName, icon, tooltip) {
        var buttonId = toolName + 'ToolbarButton';
        var button = $(
            '<input type="radio" id="' + buttonId + '" name="tools" tool="' + toolName + '" />' +
                '<label for="' + buttonId + '">' + tooltip + '</label>'
        );

        this.toolPanel.append(button);

        var that = this;
        $('#' + buttonId).button({
            icons:{primary:icon},
            text:false
        }).click(function () {
                var tool = $(this).attr('tool');
                if (tool === that._currentTool) {
                    that.selectDefault();
                } else {
                    that._currentTool = tool;
                }
            });
        return button;
    },
    select:function(tool) {
        this._currentTool = tool;
        $('#toolPanel').find('input[tool=' + tool + ']').prop('checked', true);
        this.toolPanel.buttonset('refresh');
    },
    selectDefault: function() {
        this.select(this._defaultTool);
    },
    getCurrentTool:function() {
        return this._currentTool;
    }
});
