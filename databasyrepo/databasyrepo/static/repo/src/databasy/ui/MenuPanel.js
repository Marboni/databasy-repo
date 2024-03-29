databasy.ui.MenuPanel = Class.extend({
    CONTROL_BTN_LABEL_EDIT:'Edit',
    CONTROL_BTN_LABEL_EDITING_DONE:"I'm done",
    CONTROL_BTN_LABEL_REQUEST_CONTROL:'Request control',
    CONTROL_BTN_LABEL_CANCEL_REQUEST:'Cancel request',

    NOBODY_EDITING_MSG:'Nobody is editing the model',
    USER_EDITING_MSG:'You are editing the model',
    OTHER_USER_EDITING_MSG:'Editor: ',
    PASSING_CONTROL_MSG:'Passing control...',
    REQUESTING_CONTROL_MSG:'Requesting control...',

    init:function () {
        databasy.gw.addListener(this);

        this.createMenuPanel();
        this.createControlPanel();
        this.createControlButton();
        this.createStatusMsg();
        this.createControlPassDialog();
    },

    createMenuPanel:function () {
        this.menuPanel = $('#menuPanel');
        this.menuPanel.empty();
    },

    createControlPanel:function () {
        this.controlTools = $('<div id="controlPanel"></div>');
        this.menuPanel.append(this.controlTools);
    },

    createControlButton:function () {
        this.controlButton = $('<a id="controlButton" class="btn btn-info"></a>')
            .text(this.CONTROL_BTN_LABEL_EDIT)
            .click($.proxy(this.controlButtonClick, this));
        this.controlTools.append(this.controlButton);
        if (!databasy.gw.role.includes(databasy.gateway.ModelRole.DEVELOPER)) {
            this.controlButton.attr('disabled', true);
        }
    },

    createStatusMsg:function () {
        this.controlStatusMsg = $('<p id="controlStatusMsg"></p>');
        this.controlStatusMsg.text(this.NOBODY_EDITING_MSG);
        this.controlTools.append(this.controlStatusMsg);
    },

    createControlPassDialog:function () {
        var that = this;

        this.controlPassDialog = $('<div id="controlPassDialog"></div>');
        this.controlPassDialog.append('<p class="title"></p>');
        this.controlPassDialog.append('<table class="applicants" width="100%" cellspacing="0" cellpadding="0"></table>');

        var notNowRow = ''
            + '<tr class="notNowRow">'
            + '    <td></td>'
            + '    <td width="100px">'
            + '        <a class="notNow" href="#">Not now</a>'
            + '    </td>'
            + '</tr>';

        this.controlPassDialog.find('table').append(notNowRow);
        this.controlPassDialog.find('.notNow').click(function () {
            that.controlPassDialog.dialog('close');
            databasy.gw.rejectControlRequests();
        });

        this.controlPassDialog.dialog({
            position:{my:'right top', at:'right bottom', of:this.controlButton},
            autoOpen:false,
            draggable:false,
            resizable:false,
            dialogClass:'noTitleDialog'
        });
    },

    controlButtonClick:function () {
        if (!databasy.gw.role.includes(databasy.gateway.ModelRole.DEVELOPER)) {
            return;
        }
        var runtime = databasy.gw.runtime;
        if (runtime.isEditor()) {
            databasy.gw.passControl(null);
        } else {
            if (runtime.isApplicant()) {
                databasy.gw.cancelControlRequest();
            } else {
                databasy.gw.requestControl();
            }
        }
    },

    openControlPassDialog:function (runtime) {
        var table = this.controlPassDialog.find('table.applicants');
        table.find('.applicant').remove();

        var title = this.controlPassDialog.find('.title');
        if (runtime.applicants.length == 1) {
            title.text('Other user wants to be an editor:')
        } else {
            title.text('Other users want to be an editor:')
        }

        for (var i = 0; i < runtime.applicants.length; i++) {
            var applicantId = runtime.applicants[i];
            var applicantUsername = runtime.getUsername(applicantId);

            var applicantRow = '';
            applicantRow += '<tr class="applicant">';
            applicantRow += '    <td>' + applicantUsername + '</td>';
            applicantRow += '    <td width="100px">';
            applicantRow += '        <a class="applicant" uid="' + applicantId + '" href="#">Pass control</a>';
            applicantRow += '    </td>';
            applicantRow += '</tr>';
            table.prepend(applicantRow);
        }
        $('.applicant').click(function () {
            var uid = $(this).attr('uid');
            databasy.gw.passControl(uid);
            table.find('.applicant').remove();
        });
        this.controlPassDialog.dialog('open');
    },

    closeControlPassDialog:function () {
        this.controlPassDialog.dialog('close');
    },

    changeControlButtonClass: function(newClass) {
        this.controlButton.attr('class', 'btn ' + newClass);
    },

    setEditorState: function() {
        this.controlButton.text(this.CONTROL_BTN_LABEL_EDITING_DONE);
        this.changeControlButtonClass('btn-success');
        this.controlButton.attr('disabled', false);
        this.controlStatusMsg.text(this.USER_EDITING_MSG);
    },

    setPassingControlState: function() {
        this.controlButton.attr('disabled', true);
        this.controlStatusMsg.text(this.PASSING_CONTROL_MSG);
    },

    setRequestingControlState: function() {
        this.controlButton.attr('disabled', true);
        this.controlStatusMsg.text(this.REQUESTING_CONTROL_MSG);
    },

    setApplicantState: function(usernameOfEditor) {
        this.controlButton.text(this.CONTROL_BTN_LABEL_CANCEL_REQUEST);
        this.changeControlButtonClass('btn-info');
        this.controlButton.attr('disabled', false);
        this.controlStatusMsg.text(this.OTHER_USER_EDITING_MSG + usernameOfEditor);
    },

    setNotApplicantState: function(usernameOfEditor) {
        this.controlButton.text(this.CONTROL_BTN_LABEL_REQUEST_CONTROL);
        this.changeControlButtonClass('btn-info');
        this.controlButton.attr('disabled', false);
        this.controlStatusMsg.text(this.OTHER_USER_EDITING_MSG + usernameOfEditor);
    },

    setNobodyEditingState: function() {
        this.controlButton.text(this.CONTROL_BTN_LABEL_EDIT);
        this.changeControlButtonClass('btn-info');
        this.controlButton.attr('disabled', false);
        this.controlStatusMsg.text(this.NOBODY_EDITING_MSG);
    },

    setViewerOtherUserEditingState: function(usernameOfEditor) {
        this.controlButton.text(this.CONTROL_BTN_LABEL_EDIT);
        this.controlButton.attr('disabled', true);
        this.controlStatusMsg.text(this.OTHER_USER_EDITING_MSG + usernameOfEditor);
    },

    setViewerNobodyEditingState: function() {
        this.controlButton.text(this.CONTROL_BTN_LABEL_EDIT);
        this.controlButton.attr('disabled', true);
        this.controlStatusMsg.text(this.NOBODY_EDITING_MSG);
    },

    onRuntimeChanged:function (event) {
        var role = databasy.gw.role;
        var runtime = event.runtime;

        if (role.includes(databasy.gateway.ModelRole.DEVELOPER)) {
            var isEditor = runtime.isEditor();

            this.closeControlPassDialog();

            if (isEditor) {
                this.setEditorState();
                if (runtime.applicants.length > 0) {
                    this.openControlPassDialog(runtime);
                }
            } else {
                if (runtime.passingControl) {
                    this.setPassingControlState();
                } else if (runtime.requestingControl) {
                    this.setRequestingControlState();
                } else if (runtime.editor !== null) {
                    var usernameOfEditor = runtime.getUsername(runtime.editor);
                    if (runtime.isApplicant()) {
                        this.setApplicantState(usernameOfEditor);
                    } else {
                        this.setNotApplicantState(usernameOfEditor);
                    }
                } else {
                    this.setNobodyEditingState();
                }
            }
        } else {
            if (runtime.editor === null) {
                this.setViewerNobodyEditingState();
            } else {
                this.setViewerOtherUserEditingState(runtime.getUsername(runtime.editor));
            }
        }
    }
});
