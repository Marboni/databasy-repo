databasy.ui.layout.Layout = Class.extend({
    init:function (gateway) {
        this.gateway = gateway;
        this.layout = this._createLayout();
        this.canvas = new databasy.ui.shapes.Canvas(gateway, 'canvas');

        this.reset();
    },

    _createLayout:function () {
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
                        paneSelector:"#canvasWrapper"
                    }
                }
            }
        });
    },

    reset: function() {
        this.recreateMenuPanel();
        this.canvas.clear();
    },

    recreateMenuPanel:function () {
        if (this.menuPanel === undefined) {
            this.menuPanel = new databasy.ui.layout.MenuPanel(this.gateway);
        }
        this.menuPanel.reset();
    },

    renderTable:function (repr) {
        this.canvas.drawTable(repr);
    },

    statusMsg:function (msg) {
        $('#chatPanel').append('<pre>' + msg + '</pre>');
    }
});