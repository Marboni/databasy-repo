databasy.ui.layout.Layout = Class.extend({
    init:function(mm) {
        this.mm = mm;
        this.layout = this._create_layout();
        this.canvas = new databasy.ui.shapes.Canvas(this.mm, 'canvas');

        this.recreate_menu_panel();
        this.set_editable(false);
    },
    _create_layout:function() {
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

    recreate_menu_panel:function() {
        var menu_panel = $('#menuPanel');
        menu_panel.empty();

        var control_panel = $('<div id="controlPanel"></div>');
        menu_panel.append(control_panel);

        var edit_button = $('<a id="controlButton">Edit</a>').button();
        var status_p = $('<p id="controlStatusMsg">Nobody is editing the model</p>');
        control_panel.append(edit_button);
        control_panel.append(status_p);
    },

    clear_canvas: function() {
        this.canvas.clear();
    },

    draw_table: function(repr) {
        var shape = new databasy.ui.shapes.Table(this.mm, repr);
        shape.draw(this.canvas);
    },

    set_editable: function(editable) {
        if (editable) {

        } else {

        }
    }
});