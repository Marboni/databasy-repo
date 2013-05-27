databasy.ui.layout.Layout = Class.extend({
    init:function (gateway) {
        this.gateway = gateway;
        this.layout = this.createLayout();
        this.canvas = new databasy.ui.shapes.Canvas(gateway, 'canvas');

        this.reset();

        gateway.addListener(this);
    },

    createLayout:function () {
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
                        paneSelector:"#toolbar",
                        size:47,
                        spacing_open:0,
                        spacing_closed:0,
                        closable:true
                    },
                    center:{
                        paneSelector:"#canvasWrapper"
                    }
                }
            }
        });
    },

    reset:function () {
        this.recreateMenuPanel();
        this.recreateToolbar();
        this.canvas.clear();
        this.closeToolbar();
    },

    recreateMenuPanel:function () {
        if (this.menuPanel === undefined) {
            this.menuPanel = new databasy.ui.layout.MenuPanel(this.gateway);
        }
        this.menuPanel.reset();
    },

    recreateToolbar:function () {
        if (this.toolbar === undefined) {
            this.toolbar = new databasy.ui.layout.Toolbar(this.gateway);
        }
        this.toolbar.reset();
    },

    openToolbar:function () {
        this.layout.children.center.open('west');
    },

    closeToolbar:function () {
        this.layout.children.center.close('west');
    },

    renderTable:function (repr) {
        this.canvas.drawTable(repr);
    },

    statusMsg:function (msg) {
        $('#chatPanel').append('<pre>' + msg + '</pre>');
    },

    onUserRolesChanged:function(event) {
        var userRoles = event.userRoles;
        var isEditor = userRoles.isEditor();

        if (isEditor) {
            this.openToolbar()
        } else {
            this.closeToolbar();
        }
    }
});