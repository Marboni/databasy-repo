
var MyFigure = draw2d.shape.layout.VerticalLayout.extend({

	NAME: "MyFigure",
	
    init : function()
    {
        this._super();
        
        var hshape = new draw2d.shape.layout.HorizontalLayout();
        hshape.addFigure( new draw2d.shape.basic.Label("Label2"));
        hshape.addFigure( new draw2d.shape.basic.Label("Label3"));
        hshape.addFigure( new draw2d.shape.basic.Label("Label4"));
             
        // add the new decoration to the connection with a position locator.
        //
        var l3 = new draw2d.shape.basic.Label("Lafff ll fbel3");
        l3.setDimension(300,10);
        l3.createPort("input").setName("BLUBBER");
        l3.createPort("output");
        l3.installEditor(new draw2d.ui.LabelInplaceEditor());

        this.addFigure( new draw2d.shape.basic.Label("Label2"));
        this.addFigure( new draw2d.shape.basic.Label("Label4"));
        this.addFigure( l3);
//        this.addFigure( hshape);
     }

});
