databasy.ui.layout.Layout = Class.extend({
    init:function (gateway) {
        this.gateway = gateway;
        gateway.addListener(this);

        this.recreateHtml();
        this.createLayout();

        this.canvas = new databasy.ui.components.Canvas(this.gateway, 'canvas');
        this.menuPanel = new databasy.ui.layout.MenuPanel(this.gateway);
        this.toolbar = new databasy.ui.layout.Toolbar(this.gateway);
        this.propertyPanel = new databasy.ui.layout.PropertyPanel(this.gateway, this);
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
                paneSelector:'#treePanel',
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
                    },
                    south: {
                        paneSelector:"#propertyPanel",
                        initClosed: true,
                        closable:true
                    }
                }
            }
        });
    },

    recreateHtml:function() {
        //noinspection JSJQueryEfficiency
        $('#application').remove();
        $('body').append('<div id="application"></div>');

        //noinspection JSJQueryEfficiency
        var application = $('#application');

        application.append('<div id="menuPanel"></div>');
        application.append('<div id="chatPanel"></div>');
        application.append('<div id="treePanel"></div>');
        application.append('<div id="contentPanel"></div>');

        var contentPanel = $('#contentPanel');
        contentPanel.append('<div id="toolbar"></div>');
        contentPanel.append('<div id="canvasWrapper"></div>');
        contentPanel.append('<div id="propertyPanel"></div>');

        $('#canvasWrapper').append(
            '<div id="canvas" onselectstart="javascript:/*IE8 hack*/return false" ' +
                'style="width:1500px; height:1500px;-webkit-tap-highlight-color: rgba(0,0,0,0); "></div>');
    },

    openToolbar:function () {
        this.layout.children.center.open('west');
    },

    closeToolbar:function () {
        this.layout.children.center.close('west');
    },

    openPropertyPanel:function () {
        this.layout.children.center.open('south');
    },

    closePropertyPanel:function () {
        this.layout.children.center.close('south');
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