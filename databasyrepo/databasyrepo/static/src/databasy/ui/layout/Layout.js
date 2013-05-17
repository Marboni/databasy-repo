databasy.ui.layout.Layout = Class.extend({
    init:function(mm) {
        this.mm = mm;
        this.layout = this._createLayout();
        this.canvas = new databasy.ui.shapes.Canvas(this, 'canvas');

        this.recreateMenuPanel();
        this.setEditable(true);
    },
    _createLayout:function() {
        var defaults = {
            resizable:false,
            closable:false,
            spacing_open:5,
            spacing_closed:5
        };

        return $('body').layout({
            applyDefaultStyles:true,
            defaults:defaults,
            north:{
                paneSelector:'#menuPanel',
                size:70
            },
            east:{
                paneSelector:'#chatPanel',
                closable:true
            },
            west:{
                paneSelector:'#propertyPanel',
                closable:true
            },
            center:{
                paneSelector:'#contentPanel',
                childOptions:{
                    applyDefaultStyles:true,
                    defaults:defaults,
                    west:{
                        paneSelector:"#toolbox",
                        spacing_open:1,
                        spacing_closed:1,
                        size:30
                    },
                    center:{
                        paneSelector:"#canvas"
                    }
                }
            }
        });
    },

    recreateMenuPanel:function() {
        var menu_panel = $('#menuPanel');
        menu_panel.empty();

        var control_panel = $('<div id="controlPanel"></div>');
        menu_panel.append(control_panel);

        var edit_button = $('<a id="controlButton">Edit</a>').button();
        var status_p = $('<p id="controlStatusMsg">Nobody is editing the model</p>');
        control_panel.append(edit_button);
        control_panel.append(status_p);
    },

    setEditable: function(editable) {
        if (editable) {

        } else {

        }
        this._editable = editable;
    },

    isEditable:function() {
        return this._editable;
    },
    renderTable:function(repr) {
        this.canvas.drawTable(repr);
    }
});