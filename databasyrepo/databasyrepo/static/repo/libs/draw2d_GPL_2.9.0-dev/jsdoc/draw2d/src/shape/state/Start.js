/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.shape.node.Start
 * 
 * A generic Node which has an OutputPort. Mainly used for demo and examples.
 * 
 * See the example:
 *
 *     @example preview small frame
 *     
 *     var figure =  new draw2d.shape.node.Start();
 *     figure.setColor("#3d3d3d");
 *     
 *     canvas.addFigure(figure,50,10);
 *     
 * @extends draw2d.shape.basic.Rectangle
 */
draw2d.shape.state.Start = draw2d.shape.basic.Circle.extend({

    NAME : "draw2d.shape.state.Start",

	DEFAULT_COLOR : new draw2d.util.Color("#4D90FE"),

	init : function()
    {
        this._super();
        
        this.port = this.createPort("output", new draw2d.layout.locator.BottomLocator(this));
        this.port.setConnectionAnchor(new draw2d.layout.anchor.ShortesPathConnectionAnchor(this.port));
        
        this.setDimension(50, 50);
        this.setBackgroundColor(this.DEFAULT_COLOR);
        this.installEditPolicy(new draw2d.policy.figure.AntSelectionFeedbackPolicy());

        this.setStroke(0);
        //this.setColor(this.DEFAULT_COLOR.darker());

        var label = new draw2d.shape.basic.Label("Start");
        label.setStroke(0);
        this.addFigure(label, new draw2d.layout.locator.CenterLocator(this));
        
    },
 
	/**
	 * @method
	 * 
	 * @param draggedFigure
	 * @return {draw2d.Figure} the figure which should receive the drop event or null if the element didnt want a drop event
	 */
    /*
	onDragEnter : function( draggedFigure )
	{
	    // redirect the dragEnter handling to the hybrid port
	    // In this case we can drop any port on the shape for connection creation
		//
		return this.port.onDragEnter(draggedFigure);
	}
	*/

});
