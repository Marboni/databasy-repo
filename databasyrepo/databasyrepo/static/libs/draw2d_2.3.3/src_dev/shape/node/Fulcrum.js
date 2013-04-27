/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.shape.node.Fulcrum
 * 
 * A horizontal bus shape with a special kind of port handling. The hole figure is a hybrid port.
 * 
 * See the example:
 *
 *     @example preview small frame
 *     
 *     var figure =  new draw2d.shape.node.Fulcrum(");
 *     
 *     canvas.addFigure(figure,50,10);
 *     
 * @extends draw2d.shape.node.Hub
 */
draw2d.shape.node.Fulcrum = draw2d.shape.node.Hub.extend({

    NAME : "draw2d.shape.node.Fulcrum",

	/**
	 * 
	 */
	init : function()
    {
        this._super(50,50);
        
        this.port.setConnectionAnchor(new draw2d.layout.anchor.ConnectionAnchor(this.port));
        this.port.setVisible(true);
        this.port.hitTest = this.port._orig_hitTest;

        this.setColor(null);
        this.setRadius(10);
        this.setBackgroundColor(null);
        this.setStroke(0);
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());
   }
    
});
