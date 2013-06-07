databasy.ui.layout.MenuPanel = Class.extend({
    CONTROL_BTN_LABEL_EDIT: 'Edit',
    CONTROL_BTN_LABEL_EDITING_DONE: "I'm done",

    NOBODY_EDITING_MSG: 'Nobody is editing the model',
    USER_EDITING_MSG: 'You are editing the model',
    OTHER_USER_EDITING_MSG: 'Somebody else is editing the model', //TODO
    PASSING_CONTROL_MSG: 'Passing control...',
    REQUESTING_CONTROL_MSG: 'Requesting control...',

    init: function(gateway) {
        this.gateway = gateway;
        gateway.addListener(this);

        this.createMenuPanel();
        this.createControlPanel();
        this.createControlButton();
        this.createStatusMsg();

        this.menuPanel.append(this.controlPanel);
        this.controlPanel.append(this.controlButton);
        this.controlPanel.append(this.controlStatusMsg);
    },
    createMenuPanel:function() {
        this.menuPanel = $('#menuPanel');
        this.menuPanel.empty();
    },
    createControlPanel:function() {
        this.controlPanel = $('<div id="controlPanel"></div>');
    },
    createControlButton: function() {
        this.controlButton = $('<a id="controlButton"></a>')
            .button({label: this.CONTROL_BTN_LABEL_EDIT})
            .click($.proxy(this.controlButtonClick, this));
    },
    createStatusMsg: function() {
        this.controlStatusMsg = $('<p id="controlStatusMsg"></p>');
        this.controlStatusMsg.text(this.NOBODY_EDITING_MSG);
    },
    controlButtonClick: function() {
        if (this.gateway.runtime.isEditor()) {
            this.gateway.passControl();
        } else {
            this.gateway.requestControl();
        }
    },

    onRuntimeChanged:function(event) {
        var userRoles = event.runtime;
        var isEditor = userRoles.isEditor();

        if (isEditor) {
            this.controlButton.button('option', {disabled: false, label: this.CONTROL_BTN_LABEL_EDITING_DONE});
            this.controlStatusMsg.text(this.USER_EDITING_MSG);
        } else {
            if (userRoles.passingControl) {
                this.controlButton.button('option', {disabled: true, label: this.CONTROL_BTN_LABEL_EDITING_DONE});
                this.controlStatusMsg.text(this.PASSING_CONTROL_MSG);

            } else if (userRoles.requestingControl) {
                this.controlButton.button('option', {disabled: true, label: this.CONTROL_BTN_LABEL_EDIT});
                this.controlStatusMsg.text(this.REQUESTING_CONTROL_MSG);

            } else if (userRoles.editor !== null) {
                this.controlButton.button('option', {disabled: true, label: this.CONTROL_BTN_LABEL_EDIT});
                this.controlStatusMsg.text(this.OTHER_USER_EDITING_MSG);

            } else {
                this.controlButton.button('option', {disabled: false, label: this.CONTROL_BTN_LABEL_EDIT});
                this.controlStatusMsg.text(this.NOBODY_EDITING_MSG);

            }
        }
    }
});
