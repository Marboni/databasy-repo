databasy.ui.layout.canvas.ContextMenu = Class.extend({
    init:function (gateway) {
        this.gateway = gateway;
        this.contextMenuPlatforms = {};

        var that = this;

        this.createContextMenu('table', databasy.ui.figures.Table, {
            deleteFigure:{
                name:'Delete Figure',
                handler:function (figure) {
                    var command = new databasy.model.core.commands.DeleteTableRepr({
                        table_repr_id:figure.tableRepr.id()
                    });
                    that.gateway.executeCommand(command);
                }
            },
            deleteTable:{
                name:'Delete Table',
                handler:function (figure) {
                    var command = new databasy.model.core.commands.DeleteTable({
                        table_id:figure.table.id()
                    });
                    that.gateway.executeCommand(command);
                }
            }
        });
    },


    /**
     * Creates context menu.
     * @param idPrefix prefix of context menu ID.
     * @param figureClass figure class.
     * @param items object of item code and item options: name (string) and handler of selecting (function(figure)).
     */
    createContextMenu:function (idPrefix, figureClass, items) {
        var that = this;

        var cmPlatform = $('<div id="' + idPrefix + 'CmPlatform' + '"></div>');
        cmPlatform.css({
            position:'absolute',
            height:'1px',
            width:'1px',
            left:'1px',
            top:'1px'
        });
        cmPlatform.appendTo('#canvas');
        cmPlatform.hide();

        var menu = $('<ul id="' + idPrefix + 'Cm" class="jeegoocontext cm_default"></ul>');
        for (var code in items) {
            var opts = items[code];
            $('<li code="' + code + '">' + opts.name + '</li>').appendTo(menu);
        }
        menu.appendTo('body');

        cmPlatform.jeegoocontext(idPrefix + 'Cm', {
            onSelect:function (e, context) {
                var code = $(e.currentTarget).attr('code');
                items[code].handler(that.contextMenuTarget);
                that.contextMenuTarget = undefined;
            }
        });

        this.contextMenuPlatforms[figureClass] = cmPlatform;
    },

    show:function (figure, x, y) {
        var cmPlatform = this.contextMenuPlatforms[figure.constructor];
        if (!cmPlatform) {
            throw new Error('Figure has no context menu.');
        }
        this.contextMenuTarget = figure;
        cmPlatform
            .css({
                left:x,
                top:y
            })
            .show()
            .trigger({
                type:'mousedown',
                which:3
            });
    }
});
