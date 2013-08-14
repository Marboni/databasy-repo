
MyFigure = draw2d.shape.basic.Rectangle.extend({

    NAME : "MyFigure",
    
    init : function()
    {
        this._super();
        
        this.createPort("input");
        this.createPort("output");
        this.setDimension(50,50);
        
        this.tooltip = null;
    },

    /**
     * @method
     * Change the color and the internal value of the figure.
     * Post the new value to related input ports.
     * 
     */
    onMouseEnter: function(){
        this.showTooltip();
    },
    
    onMouseLeave: function(){
        this.hideTooltip();
    },
    
    setPosition: function(x,y){
        this._super(x,y);
        this.positionTooltip();
    },
    
    hideTooltip:function(){          
        this.tooltip.remove();   
        this.tooltip = null;
    },
    
    
    showTooltip:function(){          
        this.tooltip= $('<div class="tooltip">Tooltip</div>').appendTo('body');
        this.positionTooltip();        
    },
    
    positionTooltip: function(){
        if( this.tooltip===null){
            return;
        }
        
        var width =  this.tooltip.outerWidth(true);
        var tPosX = this.getAbsoluteX()+this.getWidth()/2-width/2+8;
        var tPosY = this.getAbsoluteY()+this.getHeight() + 20;
        this.tooltip.css({'top': tPosY, 'left': tPosX});
    }
    
});
