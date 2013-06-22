databasy.ui.layout.MenuPanel = Class.extend({
    CONTROL_BTN_LABEL_EDIT:'Edit',
    CONTROL_BTN_LABEL_EDITING_DONE:"I'm done",
    CONTROL_BTN_LABEL_REQUEST_CONTROL:'Request control',
    CONTROL_BTN_LABEL_CANCEL_REQUEST:'Cancel request',

    NOBODY_EDITING_MSG:'Nobody is editing the model',
    USER_EDITING_MSG:'You are editing the model',
    OTHER_USER_EDITING_MSG:'Editor: Somebody Else', //TODO
    PASSING_CONTROL_MSG:'Passing control...',
    REQUESTING_CONTROL_MSG:'Requesting control...',

    init:function (gateway) {
        this.gateway = gateway;
        gateway.addListener(this);

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
        this.controlPanel = $('<div id="controlPanel"></div>');
        this.menuPanel.append(this.controlPanel);
    },

    createControlButton:function () {
        this.controlButton = $('<a id="controlButton"></a>')
            .button({label:this.CONTROL_BTN_LABEL_EDIT})
            .click($.proxy(this.controlButtonClick, this));
        this.controlPanel.append(this.controlButton);
    },

    createStatusMsg:function () {
        this.controlStatusMsg = $('<p id="controlStatusMsg"></p>');
        this.controlStatusMsg.text(this.NOBODY_EDITING_MSG);
        this.controlPanel.append(this.controlStatusMsg);
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
            that.gateway.rejectControlRequests();
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
        var runtime = this.gateway.runtime;
        if (runtime.isEditor()) {
            this.gateway.passControl(null);
        } else {
            if (runtime.isApplicant()) {
                this.gateway.cancelControlRequest();
            } else {
                this.gateway.requestControl();
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
            var applicant = runtime.users[runtime.applicants[i]];
            var applicantId = applicant['user_id'];

            var applicantRow = '';
            applicantRow += '<tr class="applicant">';
            applicantRow += '    <td>User #' + applicantId + '</td>';
            applicantRow += '    <td width="100px">';
            applicantRow += '        <a class="applicant" uid="' + applicantId + '" href="#">Pass control</a>';
            applicantRow += '    </td>';
            applicantRow += '</tr>';
            table.prepend(applicantRow);
        }
        var that = this;
        $('.applicant').click(function () {
            var uid = $(this).attr('uid');
            that.gateway.passControl(uid);
        });
        this.controlPassDialog.dialog('open');
    },

    closeControlPassDialog:function () {
        this.controlPassDialog.dialog('close');
    },

    onRuntimeChanged:function (event) {
        var runtime = event.runtime;
        var isEditor = runtime.isEditor();

        this.closeControlPassDialog();

        if (isEditor) {
            this.controlButton.button('option', {disabled:false, label:this.CONTROL_BTN_LABEL_EDITING_DONE});
            this.controlStatusMsg.text(this.USER_EDITING_MSG);

            if (runtime.applicants.length > 0) {
                this.openControlPassDialog(runtime);
            }
        } else {
            if (runtime.passingControl) {
                this.controlButton.button('option', {disabled:true});
                this.controlStatusMsg.text(this.PASSING_CONTROL_MSG);

            } else if (runtime.requestingControl) {
                this.controlButton.button('option', {disabled:true});
                this.controlStatusMsg.text(this.REQUESTING_CONTROL_MSG);

            } else if (runtime.editor !== null) {
                if (runtime.isApplicant()) {
                    this.controlButton.button('option', {disabled:false, label:this.CONTROL_BTN_LABEL_CANCEL_REQUEST});
                    this.controlStatusMsg.text(this.OTHER_USER_EDITING_MSG);

                } else {
                    this.controlButton.button('option', {disabled:false, label:this.CONTROL_BTN_LABEL_REQUEST_CONTROL});
                    this.controlStatusMsg.text(this.OTHER_USER_EDITING_MSG);

                }
            } else {
                this.controlButton.button('option', {disabled:false, label:this.CONTROL_BTN_LABEL_EDIT});
                this.controlStatusMsg.text(this.NOBODY_EDITING_MSG);

            }
        }
    }
});
