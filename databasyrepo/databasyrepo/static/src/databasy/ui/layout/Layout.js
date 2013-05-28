databasy.ui.layout.Layout = Class.extend({
    init:function (gateway) {
        this.gateway = gateway;
        gateway.addListener(this);
    },

    createLayout:function () {
        var defaults = {
            resizable:false,
            closable:false,
            spacing_open:5,
            spacing_closed:5
        };

        this.layout = $('#application').layout({
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
                        initClosed: true,
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
        this.recreateHtml();
        this.createLayout();
        this.createMenuPanel();
        this.createToolbar();
        this.closeToolbar();
    },

    recreateHtml:function() {
        //noinspection JSJQueryEfficiency
        $('#application').remove();
        $('body').append('<div id="application"></div>');

        //noinspection JSJQueryEfficiency
        var application = $('#application');

        application.append('<div id="menuPanel"></div>');
        application.append('<div id="chatPanel"></div>');
        application.append('<div id="propertyPanel"></div>');
        application.append('<div id="contentPanel"></div>');

        var contentPanel = $('#contentPanel');
        contentPanel.append('<div id="toolbar"></div>');
        contentPanel.append('<div id="canvasWrapper"></div>');

        $('#canvasWrapper').append(
            '<div id="canvas" onselectstart="javascript:/*IE8 hack*/return false" ' +
                'style="width:1500px; height:1500px;-webkit-tap-highlight-color: rgba(0,0,0,0); "></div>');
    },

    createCanvas: function(canvasNode) {
        this.canvas = new databasy.ui.shapes.Canvas(this.gateway, 'canvas', canvasNode);
    },

    createMenuPanel:function () {
        this.menuPanel = new databasy.ui.layout.MenuPanel(this.gateway);
        this.menuPanel.reset();
    },

    createToolbar:function () {
        this.toolbar = new databasy.ui.layout.Toolbar(this.gateway);
        this.toolbar.reset();
    },

    openToolbar:function () {
        this.layout.children.center.open('west');
    },

    closeToolbar:function () {
        this.layout.children.center.close('west');
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