databasy.ui.property.PropertyPanel = Class.extend({
    init:function () {
        this.propertyPanel = $('#propertyPanel');
        this.showNothingToShow();

        this.previousStates = [];
        this.nextStates = [];
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

    _updateCurrentState: function() {
        if (this.elementPanel) {
            var that = this;
            this.currentState = {
                elementId: that.elementPanel.elementId,
                pillIndex: that.elementPanel.currentPillIndex()
            }
        } else {
            this.currentState = {
                elementId:null,
                pillIndex:null
            }
        }
    },

    _render: function() {
        var node = databasy.gw.model.node(this.currentState.elementId);
        if (this.elementPanel) {
            this.elementPanel.destroy();
        }
        if (node instanceof databasy.model.core.elements.Table) {
            this.elementPanel = new databasy.ui.property.TablePropertyPanel(this.currentState.elementId, this.currentState.pillIndex);
        }
    },

    show:function (elementId) {
        this._updateCurrentState();
        if (elementId === this.currentState.elementId) {
            return;
        }

        this.nextStates = [];
        this.previousStates.push(this.currentState);
        this.currentState = {
            elementId: elementId,
            pillIndex:0
        };

        // After deleting of element user can click on next or previous element, so current element will be the same as
        // next/previous one. Fixing it.
        this.cleanHistory();

        this._render();
    },

    showPrevious:function () {
        this._updateCurrentState();
        this.cleanHistory();
        if (this.previousStates.length > 0) {
            var previousState = this.previousStates.pop();
            this.nextStates.unshift(this.currentState);
            this.currentState = previousState;

            this._render();
        }
    },

    showNext:function () {
        this._updateCurrentState();
        this.cleanHistory();
        if (this.nextStates.length > 0) {
            var nextState = this.nextStates.shift();
            this.previousStates.push(this.currentState);
            this.currentState = nextState;

            this._render();
        }
    },

    canShowPrevious:function () {
        this.cleanHistory();
        return this.previousStates.length > 0;
    },

    canShowNext:function () {
        this.cleanHistory();
        return this.nextStates.length > 0;
    },

    /**
     * Remove non-existent IDs of non-existent elements from history.
     */
    cleanHistory: function() {
        this.previousStates = this._cleanHistory(this.previousStates);
        this.nextStates = this._cleanHistory(this.nextStates);

        if (this.previousStates.length > 0) {
            var previousState = this.previousStates[this.previousStates.length-1];
            if (previousState.elementId === this.currentState.elementId) {
                this.previousStates.pop();
            }
        }
        if (this.nextStates.length > 0) {
            var nextState = this.nextStates[0];
            if (nextState.elementId === this.currentState.elementId) {
                this.nextStates.shift();
            }
        }
    },

    _cleanHistory: function(states) {
        // Remove all non-existent.
        states = $.grep(states, function(state) {
            return databasy.gw.model.exists(state.elementId);
        });
        // Remove duplicated.
        states = $.grep(states, function(state, index) {
            var stateBefore = states[index - 1];
            return index == 0 || state.elementId !== stateBefore.elementId;
        });

        return states;
    }
});