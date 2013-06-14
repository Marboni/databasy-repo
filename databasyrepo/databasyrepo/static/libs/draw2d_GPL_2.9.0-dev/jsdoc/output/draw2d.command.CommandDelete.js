Ext.data.JsonP.draw2d_command_CommandDelete({"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/draw2d.command.Command' rel='draw2d.command.Command' class='docClass'>draw2d.command.Command</a><div class='subclass '><strong>draw2d.command.CommandDelete</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/CommandDelete.html#draw2d-command-CommandDelete' target='_blank'>CommandDelete.js</a></div></pre><div class='doc-contents'><p>Command to remove a figure with CommandStack support.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandDelete'>draw2d.command.CommandDelete</span><br/><a href='source/CommandDelete.html#draw2d-command-CommandDelete-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/draw2d.command.CommandDelete-method-constructor' class='name expandable'>draw2d.command.CommandDelete</a>( <span class='pre'>figure</span> ) : <a href=\"#!/api/draw2d.command.CommandDelete\" rel=\"draw2d.command.CommandDelete\" class=\"docClass\">draw2d.command.CommandDelete</a></div><div class='description'><div class='short'>Create a delete command for the given figure. ...</div><div class='long'><p>Create a delete command for the given figure.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>figure</span> : <a href=\"#!/api/draw2d.Figure\" rel=\"draw2d.Figure\" class=\"docClass\">draw2d.Figure</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/draw2d.command.CommandDelete\" rel=\"draw2d.command.CommandDelete\" class=\"docClass\">draw2d.command.CommandDelete</a></span><div class='sub-desc'>\n</div></li></ul><p>Overrides: <a href='#!/api/draw2d.command.Command-method-constructor' rel='draw2d.command.Command-method-constructor' class='docClass'>draw2d.command.Command.constructor</a></p></div></div></div><div id='method-canExecute' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/draw2d.command.Command' rel='draw2d.command.Command' class='defined-in docClass'>draw2d.command.Command</a><br/><a href='source/Command.html#draw2d-command-Command-method-canExecute' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.Command-method-canExecute' class='name expandable'>canExecute</a>( <span class='pre'></span> ) : boolean</div><div class='description'><div class='short'>Returns [true] if the command can be execute and the execution of the\ncommand modifies the model. ...</div><div class='long'><p>Returns [true] if the command can be execute and the execution of the\ncommand modifies the model. e.g.: a CommandMove with [startX,startX] == [endX,endY] should\nreturn false. The execution of this Command doesn't modify the model.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>boolean</span><div class='sub-desc'><p>return try if the command modify the model or make any relevant changes</p>\n</div></li></ul></div></div></div><div id='method-cancel' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/draw2d.command.Command' rel='draw2d.command.Command' class='defined-in docClass'>draw2d.command.Command</a><br/><a href='source/Command.html#draw2d-command-Command-method-cancel' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.Command-method-cancel' class='name expandable'>cancel</a>( <span class='pre'></span> )<strong class='template signature' >template</strong></div><div class='description'><div class='short'>Will be called if the user cancel the operation. ...</div><div class='long'><p>Will be called if the user cancel the operation.</p>\n      <div class='signature-box template'>\n      <p>This is a <a href=\"#!/guide/components\">template method</a>.\n         a hook into the functionality of this class.\n         Feel free to override it in child classes.</p>\n      </div>\n</div></div></div><div id='method-execute' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandDelete'>draw2d.command.CommandDelete</span><br/><a href='source/CommandDelete.html#draw2d-command-CommandDelete-method-execute' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.CommandDelete-method-execute' class='name expandable'>execute</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Execute the command the first time ...</div><div class='long'><p>Execute the command the first time</p>\n<p>Overrides: <a href='#!/api/draw2d.command.Command-method-execute' rel='draw2d.command.Command-method-execute' class='docClass'>draw2d.command.Command.execute</a></p></div></div></div><div id='method-getLabel' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/draw2d.command.Command' rel='draw2d.command.Command' class='defined-in docClass'>draw2d.command.Command</a><br/><a href='source/Command.html#draw2d-command-Command-method-getLabel' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.Command-method-getLabel' class='name expandable'>getLabel</a>( <span class='pre'></span> ) : String</div><div class='description'><div class='short'>Returns a label of the Command. ...</div><div class='long'><p>Returns a label of the Command. e.g. \"move figure\".</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'><p>the label for this command</p>\n</div></li></ul></div></div></div><div id='method-redo' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandDelete'>draw2d.command.CommandDelete</span><br/><a href='source/CommandDelete.html#draw2d-command-CommandDelete-method-redo' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.CommandDelete-method-redo' class='name expandable'>redo</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Redo the command after the user has undo this command ...</div><div class='long'><p>Redo the command after the user has undo this command</p>\n<p>Overrides: <a href='#!/api/draw2d.command.Command-method-redo' rel='draw2d.command.Command-method-redo' class='docClass'>draw2d.command.Command.redo</a></p></div></div></div><div id='method-undo' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='draw2d.command.CommandDelete'>draw2d.command.CommandDelete</span><br/><a href='source/CommandDelete.html#draw2d-command-CommandDelete-method-undo' target='_blank' class='view-source'>view source</a></div><a href='#!/api/draw2d.command.CommandDelete-method-undo' class='name expandable'>undo</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Undo the command ...</div><div class='long'><p>Undo the command</p>\n<p>Overrides: <a href='#!/api/draw2d.command.Command-method-undo' rel='draw2d.command.Command-method-undo' class='docClass'>draw2d.command.Command.undo</a></p></div></div></div></div></div></div></div>","mixedInto":[],"extends":"draw2d.command.Command","uses":[],"superclasses":["draw2d.command.Command"],"linenr":2,"meta":{},"parentMixins":[],"requires":[],"subclasses":[],"files":[{"href":"CommandDelete.html#draw2d-command-CommandDelete","filename":"CommandDelete.js"}],"members":{"cfg":[],"css_var":[],"method":[{"meta":{},"owner":"draw2d.command.CommandDelete","name":"constructor","id":"method-constructor","tagname":"method"},{"meta":{},"owner":"draw2d.command.Command","name":"canExecute","id":"method-canExecute","tagname":"method"},{"meta":{"template":true},"owner":"draw2d.command.Command","name":"cancel","id":"method-cancel","tagname":"method"},{"meta":{},"owner":"draw2d.command.CommandDelete","name":"execute","id":"method-execute","tagname":"method"},{"meta":{},"owner":"draw2d.command.Command","name":"getLabel","id":"method-getLabel","tagname":"method"},{"meta":{},"owner":"draw2d.command.CommandDelete","name":"redo","id":"method-redo","tagname":"method"},{"meta":{},"owner":"draw2d.command.CommandDelete","name":"undo","id":"method-undo","tagname":"method"}],"event":[],"css_mixin":[],"property":[]},"inheritdoc":null,"inheritable":null,"html_meta":{},"singleton":false,"override":null,"private":null,"name":"draw2d.command.CommandDelete","mixins":[],"enum":null,"statics":{"cfg":[],"css_var":[],"method":[],"event":[],"css_mixin":[],"property":[]},"id":"class-draw2d.command.CommandDelete","tagname":"class","component":false,"alternateClassNames":[],"aliases":{}});