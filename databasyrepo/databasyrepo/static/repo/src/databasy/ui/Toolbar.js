databasy.ui.Toolbar = Class.extend({
    init:function () {
        this._currentTool = null;
        this._defaultTool = 'pointer';

        databasy.gw.addListener(this);

        this.createToolbar();

        this.createControlTools();
        this.createActionTools();
        this.createExtraTools();

        this.selectDefault();
    },

    createToolbar:function () {
        this.toolbar = $('#toolbar');
        this.toolbar.empty();
        this.toolbar
            .addClass('btn-toolbar')
            .attr({
                'data-toggle': 'buttons-radio'
            });
    },

    createControlTools:function () {
        var constant = databasy.ui.Toolbar;

        this.controlTools = $('<div id="controlTools" class="btn-group-vertical"></div>');
        this.toolbar.append(this.controlTools);

        this.createToolbarButton(this.controlTools, constant.POINTER, 'icon-pointer24', 'Select');
        this.createToolbarButton(this.controlTools, constant.MOVE, 'icon-move24', 'Move');
    },

    createActionTools:function () {
        var constant = databasy.ui.Toolbar;

        this.actionTools = $('<div id="actionTools" class="btn-group-vertical"></div>');
        this.toolbar.append(this.actionTools);

        this.actionTools.hide();

        this.createToolbarButton(this.actionTools, constant.CREATE_TABLE, 'icon-table24', 'Create Table');
        this.createToolbarButton(this.actionTools, constant.CREATE_VIEW, 'icon-view24', 'Create View');
        this.createToolbarButton(this.actionTools, constant.CREATE_REFERENCE, 'icon-rel24', 'Create Relationship');
    },

    createExtraTools:function () {
        var constant = databasy.ui.Toolbar;

        this.extraTools = $('<div id="extraTools" class="btn-group-vertical"></div>');
        this.toolbar.append(this.extraTools);

        this.createToolbarButton(this.extraTools, constant.START_DISCUSSION, 'icon-discussion24', 'Start Discussion')
            .css('border-radius', 4); // Fix appearance of single button in the panel.
    },

    createToolbarButton:function (toolPanel, toolName, icon, tooltip) {
        var buttonId = toolName + 'ToolbarButton';
        var button = $(
            '<button id="' + buttonId + '" type="button" class="btn" name="tools" data-tool="' + toolName +
                '" data-toggle="tooltip" data-original-title="' + tooltip + '">' +
                '<i class="' + icon + '"></i>' +
                '</button>');

        toolPanel.append(button);

        var that = this;
        $('#' + buttonId)
            .tooltip({
                placement:'right',
                delay:500,
                container:'body'
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
        this.controlTools.find('button').removeClass('active');
        this.controlTools.find('button[data-tool=' + tool + ']').addClass('active');
    },

    selectDefault:function () {
        this.select(this._defaultTool);
    },

    getCurrentTool:function () {
        return this._currentTool;
    },

    onRuntimeChanged:function (event) {
        var rt = event.runtime;
        var actionToolsPanel = $('#actionTools');
        if (rt.isEditor()) {
            actionToolsPanel.slideDown();
        } else {
            actionToolsPanel.slideUp();
        }
    }
}, {
    POINTER:'pointer',
    MOVE:'move',

    CREATE_TABLE:'createTable',
    CREATE_VIEW:'createView',
    CREATE_REFERENCE:'createLink',

    START_DISCUSSION:'addComment'
});
