/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.layout.connection.ConnectionRouter
 * Routes a {@link draw2d.Connection}, possibly using a constraint.
 *
 * @author Andreas Herz
 */
draw2d.layout.connection.ConnectionRouter = Class.extend({
    NAME : "draw2d.layout.connection.ConnectionRouter",

	/**
	 * @constructor 
	 * Creates a new Router object
	 */
    init: function(){
    },
    
    
    /**
     * @method
     * Routes the Connection.
     * 
     * @param {draw2d.Connection} connection The Connection to route
     * @template
     */
    route:function( connection)
    {
    	throw "subclasses must implement the method [ConnectionRouter.route]";
    },
    
    /**
     * @method
     * Callback method if the router has been assigned to a connection.
     * 
     * @param {draw2d.Connection} connection The assigned connection
     * @template
     * @since 2.7.2
     */
    onInstall: function(connection)
    {
        
    },
    
    /**
     * @method
     * Callback method if the router has been removed from the connection.
     * 
     * @param {draw2d.Connection} connection The related connection
     * @template
     * @since 2.7.2
     */
    onUninstall: function(connection)
    {
        
    }
});