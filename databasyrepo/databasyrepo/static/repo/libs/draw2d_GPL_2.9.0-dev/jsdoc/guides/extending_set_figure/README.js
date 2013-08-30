Ext.data.JsonP.extending_set_figure({"guide":"<h1>Inherit from <strong><a href=\"#!/api/draw2d.SetFigure\" rel=\"draw2d.SetFigure\" class=\"docClass\">draw2d.SetFigure</a></strong>.</h1>\n<div class='toc'>\n<p><strong>Contents</strong></p>\n<ol>\n<li><a href='#!/guide/extending_set_figure-section-1'>Inherit from the draw2d.SetFigure</a></li>\n<li><a href='#!/guide/extending_set_figure-section-2'>The NAME attribute</a></li>\n<li><a href='#!/guide/extending_set_figure-section-3'>init()</a></li>\n<li><a href='#!/guide/extending_set_figure-section-4'>createSet()</a></li>\n<li><a href='#!/guide/extending_set_figure-section-5'>Live Example</a></li>\n</ol>\n</div>\n\n<p>In general images are not the best way to create shapes for draw2d. The obvious defect is the bad zooming with the\nloose of render quality. But I use images in this examples just to show that it is possible.</p>\n\n<p>The SetFigure is a good starting point if your element can be created with basic geometry shapes like circle, rectangle\nor simples path elements.</p>\n\n<h2 id='extending_set_figure-section-1'>Inherit from the draw2d.SetFigure</h2>\n\n<p>This is a good starting point for your first custom figure in Draw2D.</p>\n\n<pre><code>BgColorImage = draw2d.SetFigure.extend({\n\n    NAME: \"BgColorImage\",\n\n    init : function()\n    {\n        this._super();\n        this.setBackgroundColor(\"#f0f0ff\");\n    },\n\n    createSet: function(){\n        var set = this._super();\n\n        return set;\n    }\n});\n</code></pre>\n\n<p>draw2d is heavily based on John Resig JS Class implementation. Just google <strong>john resig simple JavaScript class inheritance</strong> and will\nyou find a lot of further information.</p>\n\n<h2 id='extending_set_figure-section-2'>The NAME attribute</h2>\n\n<p>The NAME attribute is a Draw2D specific attribute and required if you serialize your data model to JSON. I need this information to restore your\nclass instances in the JsonReader. Please ensure that the NAME attribute contains the correct class name. We can use reflection if we\nare in the Java world. Unfortunately this is not possible in JavaScript. I didn't found any other solution without declaring the class name twice.</p>\n\n<h2 id='extending_set_figure-section-3'>init()</h2>\n\n<p>The init method is the constructor for a new object. Well known behaviour in Java. Keep in mind that you <strong>must</strong> call the super method of the parent class.</p>\n\n<p>This is a good moment to set some basic attributes like color, dimension or a selection policy.</p>\n\n<h2 id='extending_set_figure-section-4'>createSet()</h2>\n\n<p>Apparently the <strong>createSet</strong> method is the key function for the SetFigure. You can create a bunch of Raphael shapes and add them to the set. Draw2D calculates the bounding box\nand handles the drag&amp;drop, resize, hitTest, delete and all the other required stuff for the SVG management.</p>\n\n<p>But at this point you have just an empty figure with <em>#f0f0ff</em> as background color. Now we add some shapes to the set.</p>\n\n<pre><code>createSet: function(){\n    var set = this._super();\n\n    set.push( this.canvas.paper.image(\"HTML5.png\",0,0,128,128));\n    set.push( this.canvas.paper.circle(20, 20, 10));\n\n    return set;\n}\n</code></pre>\n\n<p>The <strong>this.canvas.paper</strong> object is always accessible and valid within the <strong>createSet</strong> method. It's a RaphaelJS paper object.\nWe add an image and a circle to the set.</p>\n\n<h2 id='extending_set_figure-section-5'>Live Example</h2>\n\n<pre class='inline-example '><code>BgColorImage = draw2d.SetFigure.extend({\n\n    NAME: \"BgColorImage\",\n\n    init : function()\n    {\n        this._super();\n\n        this.setBackgroundColor(\"f0f0ff\");\n        this.setStroke(1);\n        this.setDimension(128,128);\n    },\n\n    createSet: function(){\n        var set = this._super();\n\n        set.push( this.canvas.paper.image(\"guides/extending_set_figure/HTML5.png\",0,0,128,128));\n        set.push( this.canvas.paper.circle(20, 20, 10));\n        return set;\n    }\n\n\n});\n\nvar shape = new BgColorImage();\ncanvas.addFigure( shape,100,100);\n</code></pre>\n","title":"Inherit from SetFigure"});