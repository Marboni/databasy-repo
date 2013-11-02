mk = go.GraphObject.make;

databasy.ui.layout.gojs.Templates = Class.extend({
    tableColor:'#009acd',
    tableBackground:'#00bfff',
    viewColor:'#c674d0',
    viewBackground:'#f599ff',
    titleFont:'bold 14px "Helvetica Neue",​ Helvetica, Arial, Sans-serif',
    columnFont:'14px "Helvetica Neue",​ Helvetica, Arial, Sans-serif',
    columnBackground:'#ffffff',
    highlightedColumnBackground:'#ddf3ff',
    columnIconColor:'#00a9e7',
    pkColumnIconColor:'#ffcb00',
    fkColumnIconColor:'#9f52ff',
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

    columnTemplate:function () {
        var that = this;

        return mk(go.Panel, 'Vertical', {
                stretch:go.GraphObject.Fill,
                background:this.columnBackground,
                margin:new go.Margin(0, 0, 1, 0),
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
                mk(go.TextBlock, {
                        position:new go.Point(22, 1),
                        font:this.columnFont,
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

    tableTemplate:function () {
        return mk(go.Node, 'Auto', {
                width:databasy.model.core.reprs.TableRepr.REPR_DEFAULT_WIDTH,
                minSize:new go.Size(databasy.model.core.reprs.TableRepr.REPR_MIN_WIDTH, 30),
                selectionAdornmentTemplate:this.selectionAdornmentTemplate(),
                resizeAdornmentTemplate:this.resizeAdornmentTemplate(),
                resizable:true,
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
                            font:this.titleFont,
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
                        name:'columnsPanel',
                        stretch:go.GraphObject.Fill,
                        background:this.columnBackground,
                        // Column panel.
                        itemTemplate:this.columnTemplate()
                    },
                    new go.Binding('itemArray', 'columns'),
                    new go.Binding('maxSize', 'desiredSize', function (s) {
                        return new go.Size(s.width - 4, s.height); // 2*2 (bounds)
                    }).ofObject()
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
                resizable:true
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
                            font:this.titleFont,
                            editable:true,
                            isMultiline:false,
                            wrap:go.TextBlock.None
                        },
                        new go.Binding('text', 'name')
                    ),
                    new go.Binding('maxSize', 'desiredSize', function (s) {
                        return new go.Size(s.width - 4, s.height); // 2*2 (bounds)
                    }).ofObject()
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
                    )
                )
            },
            mk(go.Shape, {
                    strokeWidth:1,
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
            )
        )
    }
});
