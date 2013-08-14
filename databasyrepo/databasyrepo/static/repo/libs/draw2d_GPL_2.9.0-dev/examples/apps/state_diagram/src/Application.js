// declare the namespace for this example
var example = {
        command: {},
        shape:   {},
        propertypane:   {},
        backend:   {},
        dialog : {}
};

var state_connection_router = new draw2d.layout.connection.FanConnectionRouter();
draw2d.Connection.createConnection=function(sourcePort, targetPort){
    
    var con = new example.shape.Connection();

    return con;
};


/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 * @extends draw2d.ui.parts.GraphicalEditor
 */
example.Application = Class.extend(
{
    NAME : "example.Application", 

    /**
     * @constructor
     * 
     * @param {String} canvasId the id of the DOM element to use as paint container
     */
    init : function()
    {
        RegexColorizer.addStyleSheet();
        
        this.backend = new example.backend.Backend();
        this.view = new example.View("canvas");
        this.toolbar = new example.Toolbar("toolbar",  this.view );
	    this.propertyPane = new example.PropertyPane("property", this.view);
	    
	    
	       // layout FIRST the body
	       //
	       this.contentLayout = $('#container').layout({
	   	     north: {
	            resizable:false,
	            closable:false,
                spacing_open:0,
                spacing_closed:0,
                size:80,
	            paneSelector: "#toolbar"
	         },
	         center: {
	            resizable:false,
	            closable:false,
                spacing_open:0,
                spacing_closed:0,
	            paneSelector: "#content"
	         }
	       });

           this.editorLayout = $('#content').layout({
  	         center: {
                   resizable:false,
                   closable:false,
                   spacing_open:0,
                   spacing_closed:0,
                   paneSelector: "#editor"
  	          }
  	       });

           this.appLayout = $('#editor').layout({
	   	     west: {
                 resizable:false,
                 closable:false,
                 spacing_open:0,
                 spacing_closed:0,
                 size:60,
                 paneSelector: "#palette"
	         },
	         center: {
                 resizable:true,
                 closable:false,
                 spacing_open:0,
                 spacing_closed:0,
                 paneSelector: "#view"
	          }
	       });
	       
           this.appLayout = $('#view').layout({
  	   	     south: {
                   resizable:true,
                   closable:false,
                   spacing_open:5,
                   spacing_closed:5,
                   size:220,
                   paneSelector: "#property",
                   onresize:$.proxy(function(){
                       this.propertyPane.onResize();
                   },this)
  	         },
  	         center: {
                   resizable:true,
                   closable:false,
                   spacing_open:5,
                   spacing_closed:5,
                   paneSelector: "#canvas"
  	          }
  	       });
           
           this.loadDefinition("system.json");
    },
    
    executeCommand: function(cmd)
    {
        this.view.getCommandStack().execute(cmd);
    },

    /**
     * @method
     * Return the view or canvas of the application. Required to access the document itself
     * 
     */
    getView: function(){
        return this.view;
    },
    
    /**
     * @method
     * Return the backend data storage for this application
     * 
     */
    getBackend: function()
    {
        return this.backend;
    },
    
    saveAsDefinition: function(definitionId)
    {
        this.backend.del(this.loadedDefinitionId, $.proxy(function(){
            this.loadedDefinitionId = definitionId;
            var writer = new draw2d.io.json.Writer();      
            this.backend.save(this.loadedDefinitionId, writer.marshal(this.view), $.proxy(function(){
                this.view.getCommandStack().markSaveLocation();
            },this));
        },this));
    },

    createDefinition: function(definitionId)
    {
        this.backend.create(definitionId, $.proxy(function(jsonDocument){
            this.view.clear();
            this.loadedDefinitionId = definitionId;
            var reader = new draw2d.io.json.Reader();
            reader.unmarshal(this.view, jsonDocument);
            this.view.getCommandStack().markSaveLocation();
        },this));
    },
        
    saveDefinition: function()
    {
        var writer = new draw2d.io.json.Writer();      
        this.backend.save(this.loadedDefinitionId, writer.marshal(this.view), $.proxy(function(){
            this.view.getCommandStack().markSaveLocation();
        },this));
    },
    
    loadDefinition: function(definitionId)
    {
        $("#loadedFileName").text("loading...");
        this.view.clear();
        this.backend.load(definitionId,$.proxy(function(jsonDocument){
        	this.loadedDefinitionId = definitionId;
            var reader = new draw2d.io.json.Reader();
            reader.unmarshal(this.view, jsonDocument);
            $("#loadedFileName").html("<span class='muted'>Document:</span> "+definitionId);
         },this));
    }

});
