
var CustomFigure = draw2d.SVGFigure.extend({

    init : function()
    {
        this._super();
        this.setDimension(100,100);
    },

    getSVG: function(){
      return '<svg xmlns="http://www.w3.org/2000/svg">'+
             '  <path stroke="#000" fill="#FFF" stroke-miterlimit="4" d="m0,49.842l0,-49.742l49.982,0l0,49.742l-49.982,0z" id="polygon3873"/>'+
             '  <text text-anchor="middle" fill="#000000" font-family="Sans-serif" x="24.81563" y="26.50938" xml:space="preserve" font-size="8px" id="svg_1">INTERFACE</text>'+
             '</svg>';
    }
});
