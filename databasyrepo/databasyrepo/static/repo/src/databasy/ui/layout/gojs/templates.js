mk = go.GraphObject.make;

databasy.ui.layout.gojs.templates.createNodeTemplateMap = function () {
    var t = databasy.ui.layout.gojs.templates;
    var templates = new go.Map('string', go.Node);
    templates.add('table', t.table);
    return templates;
};

databasy.ui.layout.gojs.templates.selectionAdornmentTemplate = mk(go.Adornment, "Auto",
    mk(go.Shape, "RoundedRectangle", {
        fill:null,
        stroke:"#4aa6ff",
        strokeWidth:1,
        parameter1:4,
        strokeDashArray:[2, 2]
    }),
    mk(go.Placeholder)
);

databasy.ui.layout.gojs.templates.resizeAdornmentTemplate = mk(go.Adornment, "Spot",
    mk(go.Placeholder),
    mk(go.Shape, {
        alignment:go.Spot.Left,
        cursor:"col-resize",
        desiredSize:new go.Size(8, 8),
        fill:"#d4daea",
        stroke:"#7a7a7a"
    }),
    mk(go.Shape, {
        alignment:go.Spot.Right,
        cursor:"col-resize",
        desiredSize:new go.Size(8, 8),
        fill:"#d4daea",
        stroke:"#7a7a7a"
    })
);

databasy.ui.layout.gojs.templates.table = mk(go.Node, 'Auto', {
        width:databasy.model.core.reprs.TableRepr.REPR_DEFAULT_WIDTH,
        minSize:new go.Size(databasy.model.core.reprs.TableRepr.REPR_MIN_WIDTH, 30),
        selectionAdornmentTemplate:databasy.ui.layout.gojs.templates.selectionAdornmentTemplate,
        resizeAdornmentTemplate:databasy.ui.layout.gojs.templates.resizeAdornmentTemplate,
        resizable:true
    },

    // Background - rounded rectangle.
    mk(go.Shape, {
            figure:'RoundedRectangle',
            fill:'#00bfff',
            stroke:'#009acd',
            strokeWidth:2,
            parameter1:8,
            spot1:new go.Spot(0, 0, 2, 0),
            spot2:new go.Spot(1, 1, -2, -6)
        }
    ),

    // Content panel.
    mk(go.Panel, 'Vertical', {
            stretch:go.GraphObject.Fill
        },

        // Title panel.
        mk(go.Panel, 'Position', {
                stretch:go.GraphObject.Horizontal,
                padding:new go.Margin(6, 6, 4, 6)
            },
            mk(go.Picture, {
                source:'/static/repo/src/img/sprites.png',
                sourceRect:new go.Rect(22, 116, 16, 16),
                position:new go.Point(0, 0)
            }),
            mk(go.TextBlock, {
                    position:new go.Point(22, 1),
                    font:'bold 14px "Helvetica Neue",​ Helvetica, Arial, Sans-serif',
                    editable:true,
                    isMultiline:false,
                    wrap:go.TextBlock.None
                },
                new go.Binding('text', 'name')
            ),
            new go.Binding('maxSize', 'desiredSize', function (s) {
                return new go.Size(s.width - 4, s.height); // 2*2 (bounds)
            }).ofObject()
        ),

        // Columns panel.
        mk(go.Panel, 'Vertical', {
                stretch:go.GraphObject.Fill,
                background:'#ffffff',

                // Column panel.
                itemTemplate:mk(go.Panel, 'Vertical', {
                        stretch:go.GraphObject.Fill,
                        background:'#ffffff',
                        mouseEnter:function (e, panel) {
                            panel.background = '#ddf3ff';
                        },
                        mouseLeave:function (e, panel) {
                            panel.background = '#ffffff';
                        }
                    },
                    mk(go.Panel, 'Position', {
                            stretch:go.GraphObject.Horizontal,
                            margin:new go.Margin(2, 0, 1, 0),
                            padding:new go.Margin(0, 6, 0, 6)
                        },
                        mk(go.Shape, {
                                figure:'circle',
                                width:6,
                                height:6,
                                position:new go.Point(5, 5),
                                fill:'#ffffff',
                                stroke:'#007eb1',
                                strokeWidth:2
                            },
                            new go.Binding('figure', 'icon', function (icon) {
                                switch (icon) {
                                    case 'pk':
                                        return 'pointer';
                                    case 'null':
                                        return 'circle';
                                    case 'not_null':
                                        return 'circle';
                                    case 'fk_null':
                                        return 'diamond';
                                    case 'fk_not_null':
                                        return 'diamond';
                                    default:
                                    {
                                        console.error('Unknown column icon "' + icon + '".');
                                        return 'circle';
                                    }
                                }
                            }),
                            new go.Binding('stroke', 'icon', function (icon) {
                                switch (icon) {
                                    case 'pk':
                                        return '#ffcb00';
                                    case 'null':
                                        return '#00a9e7';
                                    case 'not_null':
                                        return '#00a9e7';
                                    case 'fk_null':
                                        return '#9f52ff';
                                    case 'fk_not_null':
                                        return '#9f52ff';
                                    default:
                                    {
                                        console.error('Unknown column icon "' + icon + '".');
                                        return '#000000';
                                    }
                                }
                            }),
                            new go.Binding('fill', 'icon', function (icon) {
                                switch (icon) {
                                    case 'pk':
                                        return '#ffcb00';
                                    case 'null':
                                        return null;
                                    case 'not_null':
                                        return '#00a9e7';
                                    case 'fk_null':
                                        return null;
                                    case 'fk_not_null':
                                        return '#9f52ff';
                                    default:
                                    {
                                        console.error('Unknown column icon "' + icon + '".');
                                        return null;
                                    }
                                }
                            })
                        ),
                        mk(go.TextBlock, {
                                position:new go.Point(22, 1),
                                font:'14px "Helvetica Neue",​ Helvetica, Arial, Sans-serif',
                                editable:true,
                                isMultiline:false,
                                wrap:go.TextBlock.None
                            },
                            new go.Binding('text', '', function (col) {
                                return col.name + ' ' + col.type;
                            })
                        )
                    )
                )
            },
            new go.Binding('itemArray', 'columns'),
            new go.Binding('maxSize', 'desiredSize', function (s) {
                return new go.Size(s.width - 4, s.height); // 2*2 (bounds)
            }).ofObject()
        )
    ),

    new go.Binding('position', 'position', function (pos) {
        return new go.Point(pos[0], pos[1]);
    }),
    new go.Binding('width', 'width')
);
