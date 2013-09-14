databasy.ui.layout.Layout = Class.extend({
    init:function () {
        databasy.gw.addListener(this);

        this.recreateHtml();
        this.createLayout();

        this.canvas = new databasy.ui.layout.canvas.Canvas('canvas');
        this.menuPanel = new databasy.ui.layout.MenuPanel();
        this.toolbar = new databasy.ui.layout.Toolbar();
        this.propertyPanel = new databasy.ui.layout.property.PropertyPanel();
        this.overviewPanel = new databasy.ui.layout.overview.OverviewPanel();
    },

    createLayout:function () {
        var defaults = {
            fxName: 'none',
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
                paneSelector:'#overviewPanel',
                closable:true
            },
            center:{
                paneSelector:'#contentPanel',
                childOptions:{
                    applyDefaultStyles:true,
                    defaults:defaults,
                    west:{
                        paneSelector:"#toolbar",
                        fxName: 'slide',
                        initClosed: true,
                        size:44,
                        spacing_open:0,
                        spacing_closed:0,
                        closable:true
                    },
                    center:{
                        paneSelector:"#canvasWrapper"
                    },
                    south: {
                        paneSelector:"#propertyPanel",
                        size:150,
                        initClosed: true,
                        closable:true
                    }
                }
            }
        });
    },

    recreateHtml:function() {
        $('#application').remove();

        var application = $('<div id="application"></div>');
        application.appendTo('body');

        application.append('<div id="menuPanel"></div>');
        application.append('<div id="chatPanel"></div>');
        application.append('<div id="overviewPanel"></div>');
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

    onRuntimeChanged:function(event) {
        var userRoles = event.runtime;
        var isEditor = userRoles.isEditor();

        if (isEditor) {
            this.openToolbar()
        } else {
            this.closeToolbar();
        }
    }
});