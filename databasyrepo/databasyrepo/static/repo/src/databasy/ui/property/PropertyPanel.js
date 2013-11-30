databasy.ui.property.PropertyPanel = Class.extend({
    init:function () {
        this.propertyPanel = $('#propertyPanel');
        this.showNothingToShow();

        this.elementId = null;
        this.previousElementIds = [];
        this.nextElementIds = [];
    },

    showNothingToShow:function () {
        var messagePanel = $(
            '<table align="center" width="100%" height="100%">' +
                '   <tr>' +
                '       <td valign="center">' +
                '           <small class="muted text-center" style="display:block;">Nothing to show.</small>' +
                '       </td>' +
                '   </tr>' +
                '</table>'
        );

        this.propertyPanel.empty();
        this.propertyPanel.append(messagePanel);
    },

    _render: function(elementId) {
        var node = databasy.gw.model.node(elementId);
        if (this.elementPanel) {
            this.elementPanel.destroy();
        }
        if (node instanceof databasy.model.core.elements.Table) {
            this.elementPanel = new databasy.ui.property.TablePropertyPanel(elementId);
        }
    },

    show:function (elementId) {
        if (elementId === this.elementId) {
            return;
        }

        this.nextElementIds = [];
        this.previousElementIds.push(this.elementId);
        this.elementId = elementId;

        // After deleting of element user can click on next or previous element, so current element will be the same as
        // next/previous one. Fixing it.
        this.cleanHistory();


        this._render(elementId);
    },

    showPrevious:function () {
        this.cleanHistory();
        if (this.previousElementIds.length > 0) {
            var previousElementId = this.previousElementIds.pop();
            this.nextElementIds.unshift(this.elementId);
            this.elementId = previousElementId;

            this._render(previousElementId);
        }
    },

    showNext:function () {
        this.cleanHistory();
        if (this.nextElementIds.length > 0) {
            var nextElementId = this.nextElementIds.shift();
            this.previousElementIds.push(this.elementId);
            this.elementId = nextElementId;

            this._render(nextElementId);
        }
    },

    canShowPrevious:function () {
        this.cleanHistory();
        return this.previousElementIds.length > 0;
    },

    canShowNext:function () {
        this.cleanHistory();
        return this.nextElementIds.length > 0;
    },

    /**
     * Remove non-existent IDs of non-existent elements from history.
     */
    cleanHistory: function() {
        this.previousElementIds = this._cleanHistory(this.previousElementIds);
        this.nextElementIds = this._cleanHistory(this.nextElementIds);

        if (this.previousElementIds.length > 0) {
            if (this.previousElementIds[this.previousElementIds.length-1] === this.elementId) {
                this.previousElementIds.pop();
            }
        }
        if (this.nextElementIds.length > 0) {
            if (this.nextElementIds[0] === this.elementId) {
                this.nextElementIds.shift();
            }
        }
    },

    _cleanHistory: function(elementIds) {
        // Remove all non-existent.
        elementIds = $.grep(elementIds, function(elementId) {
            return databasy.gw.model.exists(elementId);
        });
        // Remove duplicated.
        elementIds = $.grep(elementIds, function(elementId, index) {
            return index == 0 || elementId !== elementIds[index - 1];
        });

        return elementIds;
    }
});