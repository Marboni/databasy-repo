databasy.ui.Layout = Class.extend({
    TOOLBAR_SIZE:44,
    OVERVIEW_SIZE:150,

    init:function () {
        databasy.gw.addListener(this);

        this.createHtml();
        this.createLayout();
    },

    initializePanels: function(onInitialized) {
        this.onInitilized = onInitialized;

        this.canvasInitialized = false;
        this.schemaTreeInitialized = false;

        this.canvas = new databasy.ui.gojs.Canvas('canvasWrapper');
        this.menuPanel = new databasy.ui.MenuPanel();
        this.toolbar = new databasy.ui.Toolbar();
        this.propertyPanel = new databasy.ui.property.PropertyPanel();
        this.generalPanel = new databasy.ui.general.GeneralPanel();

        databasy.ui.utils.initContextMenu();

        this.waitInitialization();
    },

    waitInitialization: function() {
        var that = this;
        setTimeout(function() {
            if (that.canvasInitialized && that.schemaTreeInitialized) {
                that.onInitilized();
            } else {
                that.waitInitialization();
            }
        }, 500);
    },

    createLayout:function () {
        var defaults = {
            fxName:'none',
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
                size:300,
                closable:true
            },
            west:{
                paneSelector:'#generalPanel',
                closable:true,
                childOptions:{
                    applyDefaultStyles:true,
                    defaults:defaults,
                    north:{
                        paneSelector:"#overviewPanel",
                        size:this.OVERVIEW_SIZE,
                        initClosed:false
                    },
                    center:{
                        paneSelector:"#schemaTreePanel"
                    }
                }
            },
            center:{
                paneSelector:'#contentPanel',
                childOptions:{
                    applyDefaultStyles:true,
                    defaults:defaults,
                    west:{
                        paneSelector:"#toolbar",
                        initClosed:false,
                        size:this.TOOLBAR_SIZE,
                        spacing_open:0,
                        spacing_closed:0
                    },
                    center:{
                        paneSelector:"#canvasWrapper"
                    },
                    south:{
                        paneSelector:"#propertyPanel",
                        size:150,
                        initClosed:true,
                        closable:true
                    }
                }
            }
        });
    },

    createHtml:function () {
        $('#application').remove();

        var application = $('<div id="application"></div>');
        application.appendTo('body');

        application.append('<div id="menuPanel"></div>');
        application.append('<div id="chatPanel"></div>');
        application.append('<div id="generalPanel"></div>');
        application.append('<div id="contentPanel"></div>');

        var contentPanel = $('#contentPanel');
        contentPanel.append('<div id="toolbar"></div>');
        contentPanel.append('<div id="canvasWrapper"></div>');
        contentPanel.append('<div id="propertyPanel"></div>');

        var generalPanel = $('#generalPanel');
        generalPanel.append('<div id="overviewPanel"></div>');
        generalPanel.append('<div id="schemaTreePanel"></div>');
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

    onRuntimeChanged:function (event) {
        var rt = event.runtime;
        var editable = rt.isEditor();

        if (editable) {
            this.openToolbar();
        } else {
            this.closeToolbar();
        }
    }
});