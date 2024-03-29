databasy.ui.general.SchemaTreePanel = Class.extend({
    init:function () {
        databasy.gw.addListener(this);

        this.schemaTreePanel = $('#schemaTreePanel');

        this.createSchemaTree();
    },

    createSchemaTree:function () {
        var that = this;

        this.schemaTree = $('<div id="schemaTree"></div>');
        this.schemaTreePanel.append(this.schemaTree);

        var treeNodes = this.createTreeNodes();

        this.schemaTree
            .bind("loaded.jstree", function (event, data) {
                //that.initContextMenus();
                //that.bindContextMenuToTableNodes();
                that.initDblClickListener();
                that.openTableNode();
                databasy.gw.layout.schemaTreeInitialized = true;
            })
            .jstree({
                plugins:['themes', 'json_data', 'ui', 'crrm', 'sort', 'types'],
                initially_open:['schemaTreeRoot'],
                core:{
                    animation:0
                },
                themes:{
                    theme:'default',
                    dots:false
                },
                json_data:{
                    data:treeNodes
                },
                sort:this.compareNodes,
                types:{
                    types:{
                        general:{
                            icon:{
                                image:'/static/repo/src/img/sprites.png',
                                position:'-17px -265px'
                            }
                        },
                        dir:{
                            icon:{
                                image:'/static/repo/src/img/sprites.png',
                                position:'-17px -214px'
                            }
                        },
                        table:{
                            icon:{
                                image:'/static/repo/src/img/sprites.png',
                                position:'-22px -116px'
                            }
                        }
                    }
                }
            });
    },

    createTreeNodes:function () {
        var tablesNode = {
            data:'Tables',
            attr:{
                id:'schemaTreeTables',
                class:'notSortable',
                rel:'dir'
            },
            children:[

            ]
        };

        var viewsNode = {
            data:'Views',
            attr:{
                id:'schemaTreeViews',
                class:'notSortable',
                rel:'dir'
            },
            children:[

            ]
        };

        var that = this;
        var tables = databasy.gw.model.val_as_node('tables', databasy.gw.model);
        if (tables.length > 0) {
            $.each(tables, function (index, table) {
                tablesNode.children.push(that.createTableNode(table));
            });
        }

        return {
            data:'Schema',
            attr:{
                id:'schemaTreeRoot',
                class:'openOnDblClick',
                rel:'general'
            },
            state:'open',
            children:[
                tablesNode,
                viewsNode
            ]
        };
    },

    createTableNode: function(table) {
        var tableId = table.id();
        var tableName = table.val('name');
        return {
            data:{
                title:tableName
            },
            attr:{
                rel:'table',
                elementid: tableId
            },
            children:null
        };
    },

    renderTableNode:function (table) {
        var tn = this.createTableNode(table);
        var node = this.schemaTree.jstree('create', '#schemaTreeTables', 'last', tn, false, true);
        //this.bindContextMenu(node);
    },

//    initContextMenus:function () {
//        this.contextMenusByNodeType = {};
//
//        this.createContextMenu('table', {
//            deleteTable:{
//                name:'Delete Table',
//                handler:function (tableId) {
//                    databasy.service.deleteTable(tableId);
//                }
//            }
//        });
//    },
//
//    createContextMenu:function (nodeType, items) {
//        var menuId = 'schemaTree' + nodeType.charAt(0).toUpperCase() + nodeType.slice(1) + 'Cm';
//
//        var menu = $('<ul id="' + menuId + '" class="jeegoocontext cm_default"></ul>');
//        for (var code in items) {
//            var opts = items[code];
//            $('<li code="' + code + '">' + opts.name + '</li>').appendTo(menu);
//        }
//        menu.appendTo('body');
//
//        this.contextMenusByNodeType[nodeType] = {
//            menuId:menuId,
//            items:items
//        }
//    },

//    bindContextMenu:function (treeNode) {
//        var contextMenu = this.contextMenusByNodeType[treeNode.attr('rel')];
//
//        treeNode.jeegoocontext(contextMenu.menuId, {
//            onShow:function (e, context) {
//                return databasy.gw.runtime.isEditor();
//            },
//            onSelect:function (e, context) {
//                var code = $(e.currentTarget).attr('code');
//                var elementId = $(context).attr('elementid');
//                contextMenu.items[code].handler(elementId);
//            }
//        });
//    },

//    bindContextMenuToTableNodes: function() {
//        var that = this;
//        $('li[rel=table]').each(function() {
//            that.bindContextMenu($(this));
//        });
//    },

    initDblClickListener:function () {
        var that = this;

        this.schemaTree.on('dblclick', 'li', function () {
            // Open/close node on double click.
            if (!that.schemaTree.jstree('is_leaf', this)) {
                that.schemaTree.jstree('toggle_node', this);
            }

            // Show properties for model elements.
            var elementId = $(this).attr('elementid');
            if (elementId !== null) {
                var layout = databasy.gw.layout;
                var canvas = layout.canvas;
                var figure = canvas.getFigureByElementId(elementId);
                if (figure) {
                    canvas.scrollToFigure(figure);

                    databasy.ui.utils.selectSingleFigure(canvas, figure);

                    layout.openPropertyPanel();
                }
            }

            return false;
        });
    },

    openTableNode:function () {
        this.schemaTree.jstree('open_node', '#schemaTreeTables');
    },

    compareNodes:function (a, b) {
        if ($(a).hasClass('notSortable') || $(b).hasClass('notSortable')) {
            return 0; // Saving initial order.
        }
        return this.get_text(a) > this.get_text(b) ? 1 : -1;
    },

    renameNode:function (elementId, name) {
        var treeNode = this.treeNode(elementId);
        this.schemaTree.jstree('rename_node', treeNode, name);
    },

    deleteNode:function (elementId) {
        var treeNode = this.treeNode(elementId);
        this.schemaTree.jstree('delete_node', treeNode);
    },

    treeNode:function (elementId) {
        return this.schemaTree.find('li[elementid="' + elementId + '"]');
    },

    onModelChanged:function (event) {
        var model = databasy.gw.model;
        var modelEvent = event.modelEvent;

        if (event.isItemInsertedByNodeId(null, 'tables')) {
            // Table inserted to the model.
            var table = modelEvent.val('item').ref_node(model);
            this.renderTableNode(table);

        } else if (event.isPropertyChangedByNodeType(databasy.model.core.elements.Table, 'name', model)) {
            // Table renamed.
            var node = model.node(modelEvent.val('node_id'));
            var newName = modelEvent.val('new_value');
            this.renameNode(node.id(), newName);

        } else if (event.isItemDeletedByNodeId(null, 'tables')) {
            // Table deleted.
            var tableId = modelEvent.val('item').ref_id();
            this.deleteNode(tableId);
        }
    }
});
