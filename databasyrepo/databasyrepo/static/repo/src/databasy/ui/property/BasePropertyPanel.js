databasy.ui.property.BasePropertyPanel = Class.extend({
    init:function (elementId) {
        this.propertyPanel = $('#propertyPanel');
        this.propertyPanel.empty();

        this.propertyWrapper = $('<div class="wrapper"></div>');
        this.propertyPanel.append(this.propertyWrapper);

        this.elementId = elementId;

        this.createGeneralPanel();
        this.createContentPanel();

        if (this.navPills) {
            this.navPills.find('li:first-child a').trigger('click');
        }

        this.render();
        this.setReadOnly(!databasy.gw.runtime.isEditor());
        this.updateHistoryButtons();

        databasy.gw.addListener(this);
    },

    createGeneralPanel:function () {
        this.generalPanel = $('<div class="generalPanel"/>');
        this.propertyWrapper.append(this.generalPanel);

        this.createTitlePanel();
        this.createNavPanel();
        this.createHistoryPanel();
    },

    createContentPanel:function () {
        this.contentPanel = $('<div class="contentPanel"></div>');
        this.propertyWrapper.append(this.contentPanel);
    },

    createTitlePanel:function () {
        this.titlePanel = $('<div class="left"></div>');
        this.generalPanel.append(this.titlePanel);
    },

    createNavPanel: function() {
        this.navPanel = $('<div class="left"></div>');
        this.generalPanel.append(this.navPanel);

        var navPillItems = this.navPillItems();

        if (navPillItems !== null) {
            this.navPills = $('<ul id="propertyNavPills" class="nav nav-pills"></ul>');
            this.navPanel.append(this.navPills);

            for (var itemName in navPillItems) {
                var itemLink = $('<a href="#">' + itemName + '</a>').click(function() {
                    var contentPanel = $('#propertyPanel').find('.contentPanel');
                    contentPanel.empty();
                    var contentSubPanel = navPillItems[$(this).text()];
                    contentPanel.append(contentSubPanel);

                    $('#propertyNavPills').find('li').removeClass('active');
                    $(this).parent().addClass('active');
                });
                var item = $('<li></li>');
                item.append(itemLink);
                this.navPills.append(item);
            }
        }
    },

    createHistoryPanel:function () {
        this.historyPanel = $('<div class="right"></div>');
        this.generalPanel.append(this.historyPanel);

        var historyBtnPanel = $('' +
            '<div id="historyToolbar" class="btn-toolbar">' +
            '    <div class="btn-group">' +
            '        <button id="prevBtn" class="btn btn-mini"><i class="icon-back14"></i></button>' +
            '        <button id="nextBtn" class="btn btn-mini"><i class="icon-forward14"></i></button>' +
            '    </div>' +
            '</div>'
        );
        this.historyPanel.append(historyBtnPanel);

        this.prevBtn = $('#prevBtn').click(function () {
            databasy.gw.layout.propertyPanel.showPrevious();
        });
        this.nextBtn = $('#nextBtn').click(function () {
            databasy.gw.layout.propertyPanel.showNext();
        });
    },

    /**
     * Initialization of values of UI elements.
     */
    render:function () {

    },

    /**
     * Dict of navigation pill names and associated panels.
     */
    navPillItems: function() {
        return null;
    },

    setReadOnly:function (readOnly) {
        if (readOnly) {
            this.propertyPanel.find('input').attr('readonly', 'readonly');
        } else {
            this.propertyPanel.find('input').removeAttr('readonly');
        }
    },

    updateHistoryButtons:function () {
        if (databasy.gw.layout.propertyPanel.canShowPrevious()) {
            this.prevBtn.removeAttr('disabled');
        } else {
            this.prevBtn.attr('disabled', 'disabled');
        }

        if (databasy.gw.layout.propertyPanel.canShowNext()) {
            this.nextBtn.removeAttr('disabled');
        } else {
            this.nextBtn.attr('disabled', 'disabled')
        }
    },

    showElementHasBeenRemoved:function () {
        this.contentPanel.empty();
        this.contentPanel.append('' +
            '<table align="center" width="100%" height="100%">' +
            '   <tr>' +
            '       <td valign="center">' +
            '           <small class="muted text-center" style="display:block;">Element has been removed.</small>' +
            '       </td>' +
            '   </tr>' +
            '</table>'
        );
    },

    destroy:function () {
        this.propertyPanel.empty();
        databasy.gw.removeListener(this);
    },

    onRuntimeChanged:function (event) {
        var rt = event.runtime;
        this.setReadOnly(!rt.isEditor())
    },

    onModelChanged:function (event) {
        if (event.isNodeUnregistered()) {
            if (event.modelEvent.val('node').id() === this.elementId) {
                this.setReadOnly(true);
                this.showElementHasBeenRemoved();
            }
            this.updateHistoryButtons();
        }
    }
});