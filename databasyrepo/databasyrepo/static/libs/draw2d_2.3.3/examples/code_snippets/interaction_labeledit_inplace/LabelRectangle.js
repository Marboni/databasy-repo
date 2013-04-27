/**
 * @class example.connection_labeledit.LabelConnection
 * 
 * A simple Connection with a label wehich sticks in the middle of the connection..
 *
 * @author Andreas Herz
 * @extend draw2d.Connection
 */
var LabelRectangle= draw2d.shape.basic.Rectangle.extend({
    
    init:function(width, height)
    {
      this._super(width, height);
    
      // Create any Draw2D figure as decoration for the connection
      //
      this.label = new draw2d.shape.basic.Label("I'm a Label");
      this.label.setColor("#0d0d0d");
      this.label.setFontColor("#0d0d0d");
      
      // add the new decoration to the connection with a position locator.
      //
      this.addFigure(this.label, new draw2d.layout.locator.CenterLocator(this));
      
      this.label.installEditor(new draw2d.ui.LabelInplaceEditor());
    }
});
