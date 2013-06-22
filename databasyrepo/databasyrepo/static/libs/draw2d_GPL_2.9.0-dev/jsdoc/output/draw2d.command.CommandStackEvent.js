Ext.data.JsonP.draw2d_command_CommandStackEvent({"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/CommandStackEvent.html#draw2d-command-CommandStackEvent' target='_blank'>CommandStackEvent.js</a></div></pre><div class='doc-contents'><p>Event class which will be fired for every CommandStack operation. Required for CommandStackListener.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandStackEvent'>draw2d.command.CommandStackEvent</span><br/><a href='source/CommandStackEvent.html#draw2d-command-CommandStackEvent-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/draw2d.command.CommandStackEvent-method-constructor' class='name expandable'>draw2d.command.CommandStackEvent</a>( <span class='pre'>command, details</span> ) : <a href=\"#!/api/draw2d.command.CommandStackEvent\" rel=\"draw2d.command.CommandStackEvent\" class=\"docClass\">draw2d.command.CommandStackEvent</a></div><div class='description'><div class='short'>Create a new CommandStack objects which can be execute via the CommandStack. ...</div><div class='long'><p>Create a new CommandStack objects which can be execute via the CommandStack.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>command</span> : <a href=\"#!/api/draw2d.command.Command\" rel=\"draw2d.command.Command\" class=\"docClass\">draw2d.command.Command</a><div class='sub-desc'><p>the related command</p>\n</div></li><li><span class='pre'>details</span> : Number<div class='sub-desc'><p>the current state of the command execution</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/draw2d.command.CommandStackEvent\" rel=\"draw2d.command.CommandStackEvent\" class=\"docClass\">draw2d.command.CommandStackEvent</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getCommand' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandStackEvent'>draw2d.command.CommandStackEvent</span><br/><a href='source/CommandStackEvent.html#draw2d-command-CommandStackEvent-method-getCommand' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.CommandStackEvent-method-getCommand' class='name expandable'>getCommand</a>( <span class='pre'></span> ) : <a href=\"#!/api/draw2d.command.Command\" rel=\"draw2d.command.Command\" class=\"docClass\">draw2d.command.Command</a></div><div class='description'><div class='short'>Returns null or a Command if a command is relevant to the current event. ...</div><div class='long'><p>Returns null or a Command if a command is relevant to the current event.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/draw2d.command.Command\" rel=\"draw2d.command.Command\" class=\"docClass\">draw2d.command.Command</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getDetails' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandStackEvent'>draw2d.command.CommandStackEvent</span><br/><a href='source/CommandStackEvent.html#draw2d-command-CommandStackEvent-method-getDetails' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.CommandStackEvent-method-getDetails' class='name expandable'>getDetails</a>( <span class='pre'></span> ) : Number</div><div class='description'><div class='short'>Returns an integer identifying the type of event which has occurred. ...</div><div class='long'><p>Returns an integer identifying the type of event which has occurred.\nDefined by <a href=\"#!/api/draw2d.command.CommandStack\" rel=\"draw2d.command.CommandStack\" class=\"docClass\">draw2d.command.CommandStack</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Number</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getStack' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandStackEvent'>draw2d.command.CommandStackEvent</span><br/><a href='source/CommandStackEvent.html#draw2d-command-CommandStackEvent-method-getStack' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.CommandStackEvent-method-getStack' class='name expandable'>getStack</a>( <span class='pre'></span> ) : <a href=\"#!/api/draw2d.command.CommandStack\" rel=\"draw2d.command.CommandStack\" class=\"docClass\">draw2d.command.CommandStack</a></div><div class='description'><div class='short'>Return the corresponding stack of the event. ...</div><div class='long'><p>Return the corresponding stack of the event.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/draw2d.command.CommandStack\" rel=\"draw2d.command.CommandStack\" class=\"docClass\">draw2d.command.CommandStack</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-isPostChangeEvent' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandStackEvent'>draw2d.command.CommandStackEvent</span><br/><a href='source/CommandStackEvent.html#draw2d-command-CommandStackEvent-method-isPostChangeEvent' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.CommandStackEvent-method-isPostChangeEvent' class='name expandable'>isPostChangeEvent</a>( <span class='pre'></span> ) : boolean</div><div class='description'><div class='short'>Returns true if this event is fired after the stack having changed. ...</div><div class='long'><p>Returns true if this event is fired after the stack having changed.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>boolean</span><div class='sub-desc'><p>true if post-change event</p>\n</div></li></ul></div></div></div><div id='method-isPreChangeEvent' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandStackEvent'>draw2d.command.CommandStackEvent</span><br/><a href='source/CommandStackEvent.html#draw2d-command-CommandStackEvent-method-isPreChangeEvent' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.CommandStackEvent-method-isPreChangeEvent' class='name expandable'>isPreChangeEvent</a>( <span class='pre'></span> ) : boolean</div><div class='description'><div class='short'>Returns true if this event is fired prior to the stack changing. ...</div><div class='long'><p>Returns true if this event is fired prior to the stack changing.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>boolean</span><div class='sub-desc'><p>true if pre-change event</p>\n</div></li></ul></div></div></div></div></div></div></div>","mixedInto":[],"extends":null,"uses":[],"superclasses":[],"linenr":2,"meta":{},"parentMixins":[],"requires":[],"subclasses":[],"files":[{"href":"CommandStackEvent.html#draw2d-command-CommandStackEvent","filename":"CommandStackEvent.js"}],"members":{"cfg":[],"css_var":[],"method":[{"meta":{},"owner":"draw2d.command.CommandStackEvent","name":"constructor","id":"method-constructor","tagname":"method"},{"meta":{},"owner":"draw2d.command.CommandStackEvent","name":"getCommand","id":"method-getCommand","tagname":"method"},{"meta":{},"owner":"draw2d.command.CommandStackEvent","name":"getDetails","id":"method-getDetails","tagname":"method"},{"meta":{},"owner":"draw2d.command.CommandStackEvent","name":"getStack","id":"method-getStack","tagname":"method"},{"meta":{},"owner":"draw2d.command.CommandStackEvent","name":"isPostChangeEvent","id":"method-isPostChangeEvent","tagname":"method"},{"meta":{},"owner":"draw2d.command.CommandStackEvent","name":"isPreChangeEvent","id":"method-isPreChangeEvent","tagname":"method"}],"event":[],"css_mixin":[],"property":[]},"inheritdoc":null,"inheritable":null,"html_meta":{},"singleton":false,"override":null,"private":null,"name":"draw2d.command.CommandStackEvent","mixins":[],"enum":null,"statics":{"cfg":[],"css_var":[],"method":[],"event":[],"css_mixin":[],"property":[]},"id":"class-draw2d.command.CommandStackEvent","tagname":"class","component":false,"alternateClassNames":[],"aliases":{}});