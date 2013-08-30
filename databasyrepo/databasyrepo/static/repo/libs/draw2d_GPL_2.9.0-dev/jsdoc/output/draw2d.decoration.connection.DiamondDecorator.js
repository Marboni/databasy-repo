Ext.data.JsonP.draw2d_decoration_connection_DiamondDecorator({"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/draw2d.decoration.connection.Decorator' rel='draw2d.decoration.connection.Decorator' class='docClass'>draw2d.decoration.connection.Decorator</a><div class='subclass '><strong>draw2d.decoration.connection.DiamondDecorator</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/DiamondDecorator.html#draw2d-decoration-connection-DiamondDecorator' target='_blank'>DiamondDecorator.js</a></div></pre><div class='doc-contents'><p>See the example:</p>\n\n<pre class='inline-example preview small frame'><code>// create and add two nodes which contains Ports (In and OUT)\n//\nvar start = new <a href=\"#!/api/draw2d.shape.node.Start\" rel=\"draw2d.shape.node.Start\" class=\"docClass\">draw2d.shape.node.Start</a>();\nvar end   = new <a href=\"#!/api/draw2d.shape.node.End\" rel=\"draw2d.shape.node.End\" class=\"docClass\">draw2d.shape.node.End</a>();\n\n// ...add it to the canvas \ncanvas.addFigure( start, 50,50);\ncanvas.addFigure( end, 230,80);\n\n// Create a Connection and connect the Start and End node\n//\nvar c = new <a href=\"#!/api/draw2d.Connection\" rel=\"draw2d.Connection\" class=\"docClass\">draw2d.Connection</a>();\n\n// toggle from ManhattenRouter to DirectRouter to show the rotation of decorations\nc.setRouter(new <a href=\"#!/api/draw2d.layout.connection.DirectRouter\" rel=\"draw2d.layout.connection.DirectRouter\" class=\"docClass\">draw2d.layout.connection.DirectRouter</a>());\n\n// Set the endpoint decorations for the connection\n//\nc.setSourceDecorator(new <a href=\"#!/api/draw2d.decoration.connection.DiamondDecorator\" rel=\"draw2d.decoration.connection.DiamondDecorator\" class=\"docClass\">draw2d.decoration.connection.DiamondDecorator</a>());\nc.setTargetDecorator(new <a href=\"#!/api/draw2d.decoration.connection.DiamondDecorator\" rel=\"draw2d.decoration.connection.DiamondDecorator\" class=\"docClass\">draw2d.decoration.connection.DiamondDecorator</a>());   \n// Connect the endpoints with the start and end port\n//\nc.setSource(start.getOutputPort(0));\nc.setTarget(end.getInputPort(0));\n\n// and finally add the connection to the canvas\ncanvas.addFigure(c);\n</code></pre>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.decoration.connection.DiamondDecorator'>draw2d.decoration.connection.DiamondDecorator</span><br/><a href='source/DiamondDecorator.html#draw2d-decoration-connection-DiamondDecorator-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/draw2d.decoration.connection.DiamondDecorator-method-constructor' class='name expandable'>draw2d.decoration.connection.DiamondDecorator</a>( <span class='pre'>[width], [height]</span> ) : <a href=\"#!/api/draw2d.decoration.connection.DiamondDecorator\" rel=\"draw2d.decoration.connection.DiamondDecorator\" class=\"docClass\">draw2d.decoration.connection.DiamondDecorator</a></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>width</span> : Number (optional)<div class='sub-desc'><p>the width of the arrow</p>\n</div></li><li><span class='pre'>height</span> : Number (optional)<div class='sub-desc'><p>the height of the arrow</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/draw2d.decoration.connection.DiamondDecorator\" rel=\"draw2d.decoration.connection.DiamondDecorator\" class=\"docClass\">draw2d.decoration.connection.DiamondDecorator</a></span><div class='sub-desc'>\n</div></li></ul><p>Overrides: <a href='#!/api/draw2d.decoration.connection.Decorator-method-constructor' rel='draw2d.decoration.connection.Decorator-method-constructor' class='docClass'>draw2d.decoration.connection.Decorator.constructor</a></p></div></div></div><div id='method-paint' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.decoration.connection.DiamondDecorator'>draw2d.decoration.connection.DiamondDecorator</span><br/><a href='source/DiamondDecorator.html#draw2d-decoration-connection-DiamondDecorator-method-paint' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.decoration.connection.DiamondDecorator-method-paint' class='name expandable'>paint</a>( <span class='pre'>paper</span> )</div><div class='description'><div class='short'>Draw a filled diamond decoration. ...</div><div class='long'><p>Draw a filled diamond decoration.</p>\n\n<p>It's not your work to rotate the arrow. The draw2d do this job for you.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>paper</span> : Raphael<div class='sub-desc'><p>the raphael paper object for the paint operation</p>\n</div></li></ul><p>Overrides: <a href='#!/api/draw2d.decoration.connection.Decorator-method-paint' rel='draw2d.decoration.connection.Decorator-method-paint' class='docClass'>draw2d.decoration.connection.Decorator.paint</a></p></div></div></div><div id='method-setBackgroundColor' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/draw2d.decoration.connection.Decorator' rel='draw2d.decoration.connection.Decorator' class='defined-in docClass'>draw2d.decoration.connection.Decorator</a><br/><a href='source/Decorator.html#draw2d-decoration-connection-Decorator-method-setBackgroundColor' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.decoration.connection.Decorator-method-setBackgroundColor' class='name expandable'>setBackgroundColor</a>( <span class='pre'>c</span> ) : <a href=\"#!/api/draw2d.decoration.connection.Decorator\" rel=\"draw2d.decoration.connection.Decorator\" class=\"docClass\">draw2d.decoration.connection.Decorator</a><strong class='chainable signature' >chainable</strong></div><div class='description'><div class='short'>Set the background color for the decoration ...</div><div class='long'><p>Set the background color for the decoration</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>c</span> : <a href=\"#!/api/draw2d.util.Color\" rel=\"draw2d.util.Color\" class=\"docClass\">draw2d.util.Color</a>|String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/draw2d.decoration.connection.Decorator\" rel=\"draw2d.decoration.connection.Decorator\" class=\"docClass\">draw2d.decoration.connection.Decorator</a></span><div class='sub-desc'><p>this</p>\n</div></li></ul></div></div></div><div id='method-setColor' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/draw2d.decoration.connection.Decorator' rel='draw2d.decoration.connection.Decorator' class='defined-in docClass'>draw2d.decoration.connection.Decorator</a><br/><a href='source/Decorator.html#draw2d-decoration-connection-Decorator-method-setColor' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.decoration.connection.Decorator-method-setColor' class='name expandable'>setColor</a>( <span class='pre'>c</span> ) : <a href=\"#!/api/draw2d.decoration.connection.Decorator\" rel=\"draw2d.decoration.connection.Decorator\" class=\"docClass\">draw2d.decoration.connection.Decorator</a><strong class='chainable signature' >chainable</strong></div><div class='description'><div class='short'>Set the stroke color for the decoration ...</div><div class='long'><p>Set the stroke color for the decoration</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>c</span> : <a href=\"#!/api/draw2d.util.Color\" rel=\"draw2d.util.Color\" class=\"docClass\">draw2d.util.Color</a>|String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/draw2d.decoration.connection.Decorator\" rel=\"draw2d.decoration.connection.Decorator\" class=\"docClass\">draw2d.decoration.connection.Decorator</a></span><div class='sub-desc'><p>this</p>\n</div></li></ul></div></div></div><div id='method-setDimension' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/draw2d.decoration.connection.Decorator' rel='draw2d.decoration.connection.Decorator' class='defined-in docClass'>draw2d.decoration.connection.Decorator</a><br/><a href='source/Decorator.html#draw2d-decoration-connection-Decorator-method-setDimension' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.decoration.connection.Decorator-method-setDimension' class='name expandable'>setDimension</a>( <span class='pre'>width, height</span> ) : <a href=\"#!/api/draw2d.decoration.connection.Decorator\" rel=\"draw2d.decoration.connection.Decorator\" class=\"docClass\">draw2d.decoration.connection.Decorator</a><strong class='chainable signature' >chainable</strong></div><div class='description'><div class='short'>Change the dimension of the decoration shape ...</div><div class='long'><p>Change the dimension of the decoration shape</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>width</span> : Number<div class='sub-desc'><p>The new width of the decoration</p>\n</div></li><li><span class='pre'>height</span> : Number<div class='sub-desc'><p>The new height of the decoration</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/draw2d.decoration.connection.Decorator\" rel=\"draw2d.decoration.connection.Decorator\" class=\"docClass\">draw2d.decoration.connection.Decorator</a></span><div class='sub-desc'><p>this</p>\n</div></li></ul></div></div></div></div></div></div></div>","mixedInto":[],"extends":"draw2d.decoration.connection.Decorator","uses":[],"superclasses":["draw2d.decoration.connection.Decorator"],"linenr":1,"meta":{"author":["Andreas Herz"]},"parentMixins":[],"requires":[],"subclasses":[],"files":[{"href":"DiamondDecorator.html#draw2d-decoration-connection-DiamondDecorator","filename":"DiamondDecorator.js"}],"members":{"cfg":[],"css_var":[],"method":[{"meta":{},"owner":"draw2d.decoration.connection.DiamondDecorator","name":"constructor","id":"method-constructor","tagname":"method"},{"meta":{},"owner":"draw2d.decoration.connection.DiamondDecorator","name":"paint","id":"method-paint","tagname":"method"},{"meta":{"chainable":true},"owner":"draw2d.decoration.connection.Decorator","name":"setBackgroundColor","id":"method-setBackgroundColor","tagname":"method"},{"meta":{"chainable":true},"owner":"draw2d.decoration.connection.Decorator","name":"setColor","id":"method-setColor","tagname":"method"},{"meta":{"chainable":true},"owner":"draw2d.decoration.connection.Decorator","name":"setDimension","id":"method-setDimension","tagname":"method"}],"event":[],"css_mixin":[],"property":[]},"inheritdoc":null,"inheritable":true,"html_meta":{"author":null},"singleton":false,"override":null,"private":null,"name":"draw2d.decoration.connection.DiamondDecorator","mixins":[],"enum":null,"statics":{"cfg":[],"css_var":[],"method":[],"event":[],"css_mixin":[],"property":[]},"id":"class-draw2d.decoration.connection.DiamondDecorator","tagname":"class","component":false,"alternateClassNames":[],"aliases":{}});