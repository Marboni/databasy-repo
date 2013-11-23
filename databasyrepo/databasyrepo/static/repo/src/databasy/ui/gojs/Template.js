mk = go.GraphObject.make;

databasy.ui.gojs.Templates = Class.extend({
    textColor:'#333333',
    titleFont:'bold 14px "Helvetica Neue",​ Helvetica, Arial, Sans-serif',

    tableColor:'#009acd',
    tableBackground:'#00bfff',
    columnFont:'14px "Helvetica Neue",​ Helvetica, Arial, Sans-serif',
    columnBackground:'#ffffff',
    highlightedColumnBackground:'#ddf3ff',
    columnIconColor:'#00a9e7',
    pkColumnIconColor:'#ffcb00',
    fkColumnIconColor:'#9f52ff',

    viewColor:'#c674d0',
    viewBackground:'#f599ff',

    discussionGeometryString:'FM15.985,5.972c-7.563,0-13.695,4.077-13.695,9.106c0,2.877,2.013,5.44,5.147,7.108c-0.446,1.479-1.336,3.117-3.056,4.566c0,0,4.015-0.266,6.851-3.143c0.163,0.04,0.332,0.07,0.497,0.107c-0.155-0.462-0.246-0.943-0.246-1.443c0-3.393,3.776-6.05,8.599-6.05c3.464,0,6.379,1.376,7.751,3.406c1.168-1.34,1.847-2.892,1.847-4.552C29.68,10.049,23.548,5.972,15.985,5.972zM27.68,22.274c0-2.79-3.401-5.053-7.599-5.053c-4.196,0-7.599,2.263-7.599,5.053c0,2.791,3.403,5.053,7.599,5.053c0.929,0,1.814-0.116,2.637-0.319c1.573,1.597,3.801,1.744,3.801,1.744c-0.954-0.804-1.447-1.713-1.695-2.534C26.562,25.293,27.68,23.871,27.68,22.274z',
    discussionColor:'#5d5d5d',
    hoverDiscussionColor:'#000000',
    discussionSize:new go.Size(16, 16),

    linkColor:'#000000',
    highlightedLinkColor:'#009acd',
    selectedLinkColor:'#6e53ff',


    createNodeTemplateMap:function () {
        var templates = new go.Map('string', go.Node);
        templates.add('table', this.tableTemplate());
        templates.add('view', this.viewTemplate());
        return templates;
    },

    createLinkTemplateMap:function () {
        var templates = new go.Map('string', go.Node);
        templates.add('', this.linkTemplate());
        return templates;
    },

    selectionAdornmentTemplate:function () {
        return mk(go.Adornment, "Auto",
            mk(go.Shape, "RoundedRectangle", {
                fill:null,
                stroke:"#4aa6ff",
                strokeWidth:1,
                parameter1:4,
                strokeDashArray:[2, 2]
            }),
            mk(go.Placeholder)
        )
    },

    resizeAdornmentTemplate:function () {
        return mk(go.Adornment, "Spot",
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
        )
    },

    mkDiscussionShape:function (additionalParams, bindings) {
        var that = this;
        var discussion = mk(go.Shape, {
                geometryString:this.discussionGeometryString,
                fill:this.discussionColor,
                stroke:null,
                desiredSize:this.discussionSize,
                mouseEnter:function (e, shape) {
                    shape.fill = that.hoverDiscussionColor;
                },
                mouseLeave:function (e, shape) {
                    shape.fill = that.discussionColor;
                }
            }
        );
        if (additionalParams) {
            $.each(additionalParams, function (name, value) {
                discussion[name] = value;
            })
        }
        if (bindings) {
            $.each(bindings, function (i, binding) {
                discussion.bind(binding);
            });
        }
        return discussion;
    },

    columnTemplate:function () {
        var that = this;

        return mk(go.Panel, 'Table', {
                stretch:go.GraphObject.Horizontal,
                defaultAlignment:go.Spot.Left,
                background:this.columnBackground,
                margin:new go.Margin(0, 0, 1, 0),
                padding:new go.Margin(2, 6, 0, 6),
                mouseEnter:function (e, panel) {
                    panel.diagram.startTransaction('tx');
                    panel.background = that.highlightedColumnBackground;
                    panel.diagram.commitTransaction('tx');
                },
                mouseLeave:function (e, panel) {
                    panel.background = that.columnBackground;
                }
            },
            new go.Binding('name', 'elementId'),
            new go.Binding('', 'hasOpenDiscussions', function (hasOpenDiscussions, panel) {
                panel.getColumnDefinition(2).width = hasOpenDiscussions ? 17 : 0;
            }),
            mk(go.RowColumnDefinition, { column:0, width:16 }),
            mk(go.RowColumnDefinition, { column:1}),
            mk(go.RowColumnDefinition, { column:2, width:17 }),
            mk(go.Shape, {
                    figure:'circle',
                    width:6,
                    height:6,
                    position:new go.Point(5, 5),
                    margin:4,
                    strokeWidth:2,
                    row:0,
                    column:0
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
                            return that.pkColumnIconColor;
                        case 'null':
                            return that.columnIconColor;
                        case 'not_null':
                            return that.columnIconColor;
                        case 'fk_null':
                            return that.fkColumnIconColor;
                        case 'fk_not_null':
                            return that.fkColumnIconColor;
                        default:
                        {
                            console.error('Unknown column icon "' + icon + '".');
                            return that.columnBackground;
                        }
                    }
                }),
                new go.Binding('fill', 'icon', function (icon) {
                    switch (icon) {
                        case 'pk':
                            return that.pkColumnIconColor;
                        case 'null':
                            return null;
                        case 'not_null':
                            return that.columnIconColor;
                        case 'fk_null':
                            return null;
                        case 'fk_not_null':
                            return that.fkColumnIconColor;
                        default:
                        {
                            console.error('Unknown column icon "' + icon + '".');
                            return null;
                        }
                    }
                })
            ),
            mk(go.Panel, 'Position', {
                    stretch:go.GraphObject.Horizontal,
                    row:0,
                    column:1,
                    padding:new go.Margin(0, 0, 0, 4)
                },
                mk(go.TextBlock, {
                        stroke:this.textColor,
                        font:this.columnFont,
                        editable:true,
                        isMultiline:false,
                        wrap:go.TextBlock.None
                    },
                    new go.Binding('text', '', function (col) {
                        return col.name + ' ' + col.type;
                    })
                )
            ),

            this.mkDiscussionShape({ row:0, column:2 })
        )
    },

    tableTemplate:function () {
        return mk(go.Node, 'Auto', {
                width:databasy.model.core.reprs.TableRepr.REPR_DEFAULT_WIDTH,
                minSize:new go.Size(databasy.model.core.reprs.TableRepr.REPR_MIN_WIDTH, 30),
                selectionAdornmentTemplate:this.selectionAdornmentTemplate(),
                resizeAdornmentTemplate:this.resizeAdornmentTemplate(),
                resizable:true,
                contextMenu: this.contextMenuTemplate(),
                fromSpot:go.Spot.AllSides,
                toSpot:go.Spot.AllSides
            },

            new go.Binding('position', 'position', function (pos) {
                return new go.Point(pos[0], pos[1]);
            }),
            new go.Binding('width', 'width'),

            // Background - rounded rectangle.
            mk(go.Shape, {
                    figure:'RoundedRectangle',
                    fill:this.tableBackground,
                    stroke:this.tableColor,
                    strokeWidth:2,
                    parameter1:8,
                    spot1:new go.Spot(0, 0, 2, 0)
                },
                new go.Binding('spot2', 'columns', function (columns) {
                    var yOff = columns.length == 0 ? 0 : -6;
                    return new go.Spot(1, 1, -2, yOff);
                })
            ),

            // Content panel.
            mk(go.Panel, 'Vertical', {
                    stretch:go.GraphObject.Fill,
                    minSize:new go.Size(1, 1)
                },

                // Title panel.
                mk(go.Panel, 'Table', {
                        name: 'titlePanel',
                        stretch:go.GraphObject.Horizontal,
                        defaultAlignment:go.Spot.Left,
                        padding:new go.Margin(4, 6, 4, 6)
                    },
                    new go.Binding('', 'hasOpenDiscussions', function (hasOpenDiscussions, panel) {
                        panel.getColumnDefinition(2).width = hasOpenDiscussions ? 17 : 0;
                    }),
                    mk(go.RowColumnDefinition, { column:0, width:16 }),
                    mk(go.RowColumnDefinition, { column:1}),
                    mk(go.RowColumnDefinition, { column:2, width:17 }),
                    mk(go.Picture, {
                        source:'/static/repo/src/img/sprites.png',
                        sourceRect:new go.Rect(66, 64, 16, 16),
                        row:0,
                        column:0
                    }),
                    mk(go.Panel, 'Position', {
                            stretch:go.GraphObject.Horizontal,
                            padding:new go.Margin(0, 0, 0, 4),
                            row:0,
                            column:1
                        },
                        mk(go.TextBlock, {
                                name: 'titleLabel',
                                position:new go.Point(0, 3),
                                stroke:this.textColor,
                                font:this.titleFont,
                                editable:true,
                                isMultiline:false,
                                wrap:go.TextBlock.None
                            },
                            new go.Binding('text', 'name')
                        )),
                    this.mkDiscussionShape({ row:0, column:2 })
                ),

                // Columns panel.
                mk(go.Panel, 'Vertical', {
                        name:'columnsPanel',
                        stretch:go.GraphObject.Fill,
                        background:this.columnBackground,
                        // Column panel.
                        itemTemplate:this.columnTemplate()
                    },
                    new go.Binding('itemArray', 'columns')
                )
            )
        )
    },

    viewTemplate:function () {
        return mk(go.Node, 'Auto', {
                width:databasy.model.core.reprs.TableRepr.REPR_DEFAULT_WIDTH, // TODO Replace with view's constants.
                minSize:new go.Size(databasy.model.core.reprs.TableRepr.REPR_MIN_WIDTH, 30), // TODO Replace with view's constants.
                selectionAdornmentTemplate:this.selectionAdornmentTemplate(),
                resizeAdornmentTemplate:this.resizeAdornmentTemplate(),
                resizable:true,
                contextMenu: this.contextMenuTemplate(),
            },

            new go.Binding('position', 'position', function (pos) {
                return new go.Point(pos[0], pos[1]);
            }),
            new go.Binding('width', 'width'),

            // Background - rounded rectangle.
            mk(go.Shape, {
                    figure:'RoundedRectangle',
                    fill:this.viewBackground,
                    stroke:this.viewColor,
                    strokeWidth:2,
                    parameter1:8,
                    spot1:new go.Spot(0, 0, 2, 0),
                    spot2:new go.Spot(1, 1, -2, 0)
                }
            ),

            // Content panel.
            mk(go.Panel, 'Vertical', {
                    stretch:go.GraphObject.Fill,
                    minSize:new go.Size(1, 1)
                },

                // Title panel.
                mk(go.Panel, 'Table', {
                        name: 'titlePanel',
                        stretch:go.GraphObject.Horizontal,
                        defaultAlignment:go.Spot.Left,
                        padding:new go.Margin(4, 6, 4, 6)
                    },
                    new go.Binding('', 'hasOpenDiscussions', function (hasOpenDiscussions, panel) {
                        panel.getColumnDefinition(2).width = hasOpenDiscussions ? 17 : 0;
                    }),
                    mk(go.RowColumnDefinition, { column:0, width:16 }),
                    mk(go.RowColumnDefinition, { column:1}),
                    mk(go.RowColumnDefinition, { column:2, width:17 }),
                    mk(go.Picture, {
                        source:'/static/repo/src/img/sprites.png',
                        sourceRect:new go.Rect(65, 263, 16, 16),
                        row:0,
                        column:0
                    }),
                    mk(go.Panel, 'Position', {
                            stretch:go.GraphObject.Horizontal,
                            padding:new go.Margin(0, 0, 0, 4),
                            row:0,
                            column:1
                        },
                        mk(go.TextBlock, {
                                name: 'titleLabel',
                                position:new go.Point(0, 3),
                                stroke:this.textColor,
                                font:this.titleFont,
                                editable:true,
                                isMultiline:false,
                                wrap:go.TextBlock.None
                            },
                            new go.Binding('text', 'name')
                        )),
                    this.mkDiscussionShape({ row:0, column:2 })
                )
            )
        )
    },

    fromLinkArrow:function (cardinality) {
        switch (cardinality) {
            case '0..1':
                return 'CircleLine';
            case '1..1':
                return 'DoubleLine';
            default:
                throw new Error('Unknown left cardinality');
        }
    },

    toLinkArrow:function (cardinality) {
        switch (cardinality) {
            case '0..1':
                return 'LineCircle';
            case '1..1':
                return 'DoubleLine';
            case '0..m':
                return 'CircleFork';
            case '1..m':
                return 'LineFork';
            default:
                throw new Error('Unknown right cardinality');
        }
    },

    highlightTableColumns:function (diagram, tableReprId, columnElementIds) {
        var color = this.highlightedColumnBackground;
        var tableNode = diagram.findNodeForKey(tableReprId);
        if (tableNode == null) {
            throw new Error('Table with repr ID ' + tableReprId + ' not exists in the diagram.');
        }
        var columnsPanel = tableNode.findObject('columnsPanel');
        $.each(columnElementIds, function (i, columnElementId) {
            var columnPanel = columnsPanel.findObject(columnElementId);
            columnPanel.background = color;
        });
    },

    removeHighlightingFromTableColumns:function (diagram, tableReprId) {
        var columnBackground = this.columnBackground;
        var tableNode = diagram.findNodeForKey(tableReprId);
        if (tableNode == null) {
            throw new Error('Table with repr ID ' + tableReprId + ' not exists in the diagram.');
        }
        var columnsPanel = tableNode.findObject('columnsPanel');
        var columnsIt = columnsPanel.elements;
        while (columnsIt.next()) {
            var columnPanel = columnsIt.value;
            columnPanel.background = columnBackground;
        }
    },

    linkTemplate:function () {
        var that = this;
        return mk(go.Link, {
                routing:go.Link.Orthogonal,
                layerName:'Background',
                contextMenu: this.contextMenuTemplate(),
                selectionAdornmentTemplate:mk(go.Adornment,
                    mk(go.Shape, {
                            isPanelMain:true,
                            strokeWidth:3,
                            stroke:this.selectedLinkColor,
                            mouseEnter:function (e, shape) {
                                var data = shape.part.data;
                                var diagram = shape.diagram;
                                that.highlightTableColumns(diagram, data.from, data.fromColumnElementIds);
                                that.highlightTableColumns(diagram, data.to, data.toColumnElementIds);
                            },
                            mouseLeave:function (e, shape) {
                                var data = shape.part.data;
                                var diagram = shape.diagram;
                                that.removeHighlightingFromTableColumns(diagram, data.from);
                                that.removeHighlightingFromTableColumns(diagram, data.to);
                            }
                        }
                    ),
                    mk(go.Shape, {
                            scale:1.3,
                            stroke:this.selectedLinkColor,
                            fill:'#ffffff'
                        },
                        new go.Binding('fromArrow', 'fromCardinality', this.fromLinkArrow)),
                    mk(go.Shape, {
                            scale:1.3,
                            stroke:this.selectedLinkColor,
                            fill:'#ffffff',
                            toArrow:'CircleFork'
                        },
                        new go.Binding('toArrow', 'toCardinality', this.fromLinkArrow)
                    ),
                    this.mkDiscussionShape(null, [
                        new go.Binding('visible', 'hasOpenDiscussions')
                    ])
                )
            },
            mk(go.Shape, {
                    strokeWidth:1,
                    contextMenu: this.contextMenuTemplate(),
                    mouseEnter:function (e, shape) {
                        shape.strokeWidth = 3;
                        shape.stroke = that.highlightedLinkColor;

                        var data = shape.part.data;
                        var diagram = shape.diagram;
                        that.highlightTableColumns(diagram, data.from, data.fromColumnElementIds);
                        that.highlightTableColumns(diagram, data.to, data.toColumnElementIds);
                    },
                    mouseLeave:function (e, shape) {
                        shape.strokeWidth = 1;
                        shape.stroke = that.linkColor;

                        var data = shape.part.data;
                        var diagram = shape.diagram;
                        that.removeHighlightingFromTableColumns(diagram, data.from);
                        that.removeHighlightingFromTableColumns(diagram, data.to);
                    }
                }
            ),
            mk(go.Shape, {
                    scale:1.3,
                    fill:'#ffffff'
                },
                new go.Binding('fromArrow', 'fromCardinality', this.fromLinkArrow)
            ),
            mk(go.Shape, {
                    scale:1.3,
                    fill:'#ffffff',
                    toArrow:'CircleFork'
                },
                new go.Binding('toArrow', 'toCardinality', this.toLinkArrow)
            ),
            this.mkDiscussionShape(null, [
                new go.Binding('visible', 'hasOpenDiscussions')
            ])
        )
    },

    contextMenuTemplate:function () {
        return mk(go.Adornment, 'Horizontal');
    }
});


