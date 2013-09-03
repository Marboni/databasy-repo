databasy.ui.layout.overview.SchemaTreePanel = Class.extend({
    init:function (gateway) {
        this.gateway = gateway;
        gateway.addListener(this);

        this.createSchemaTreePanel();
        this.createSchemaTree();
    },

    createSchemaTreePanel:function () {
        this.schemaTreePanel = $('<div id="schemaTreePanel"></div>');
        $('#overviewPanel').append(this.schemaTreePanel);
    },

    createSchemaTree:function () {
        var that = this;

        this.schemaTree = $('<div id="schemaTree"></div>');
        this.schemaTreePanel.append(this.schemaTree);

        var initialTree = this.modelToNode();

        this.schemaTree
            .bind("loaded.jstree", function (event, data) {
                that.initSchemaTree();
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
                    data:initialTree
                },
                sort:this.compareNodes,
                types:{
                    types:{
                        schema:{
                            icon:{
                                image:'/static/repo/src/img/schema16x16.png'
                            }
                        },
                        table:{
                            icon:{
                                image:'/static/repo/src/img/table16x16.png'
                            }
                        }
                    }
                }
            });
    },

    initSchemaTree:function () {
        this.initContextMenus();
        this.initDblClickListener();
        this.initTableNodes();
    },

    initTableNodes:function () {
        var that = this;

        var tables = this.gateway.model.val_as_node('tables', this.gateway.model);
        if (tables.length > 0) {
            $.each(tables, function (index, table) {
                that.createTableNode(table);
            });
            that.schemaTree.jstree('open_node', '#schemaTreeTables');
        }
    },

    initDblClickListener:function () {
        var that = this;

        this.schemaTree.on('dblclick', 'li', function () {
            // Open/close node on double click.
            if (!that.schemaTree.jstree('is_leaf', this)) {
                that.schemaTree.jstree('toggle_node', this);
            }

            // Show properties for model elements.
            var elementId = $(this).data('elementid');
            if (elementId !== null) {
                var canvas = that.gateway.layout.canvas;
                var propertyPanel = that.gateway.layout.propertyPanel;

                var element = that.gateway.model.node(elementId);
                var component = canvas.figureByElementId(elementId);
                if (component) {
                    propertyPanel.refreshProperties(element);
                    canvas.scrollToFigure(component);
                }
            }

            return false;
        });
    },

    initContextMenus:function () {
        var that = this;
        this.contextMenusByNodeType = {};

        this.createContextMenu('table', {
            deleteTable:{
                name:'Delete Table',
                handler:function (table) {
                    var command = new databasy.model.core.commands.DeleteTable({
                        table_id:table.id()
                    });
                    that.gateway.executeCommand(command);
                }
            }
        });
    },

    createContextMenu:function (nodeType, items) {
        var that = this;
        var menuId = 'schemaTree' + nodeType.charAt(0).toUpperCase() + nodeType.slice(1) + 'Cm';

        var menu = $('<ul id="' + menuId + '" class="jeegoocontext cm_default"></ul>');
        for (var code in items) {
            var opts = items[code];
            $('<li code="' + code + '">' + opts.name + '</li>').appendTo(menu);
        }
        menu.appendTo('body');

        this.contextMenusByNodeType[nodeType] = {
            menuId:menuId,
            items:items
        }
    },

    bindContextMenu:function (treeNode) {
        var that = this;
        var contextMenu = this.contextMenusByNodeType[treeNode.attr('rel')];

        treeNode.jeegoocontext(contextMenu.menuId, {
            onShow:function (e, context) {
                return that.gateway.runtime.isEditor();
            },
            onSelect:function (e, context) {
                var code = $(e.currentTarget).attr('code');
                var elementId = $(context).data('elementid');
                var modelNode = that.gateway.model.node(elementId);
                contextMenu.items[code].handler(modelNode);
            }
        });
    },

    compareNodes:function (a, b) {
        if ($(a).hasClass('notSortable') || $(b).hasClass('notSortable')) {
            return 0; // Saving initial order.
        }
        return this.get_text(a) > this.get_text(b) ? 1 : -1;
    },

    modelToNode:function () {
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

        return {
            data:'Schema',
            attr:{
                id:'schemaTreeRoot',
                class:'openOnDblClick',
                rel:'schema'
            },
            state:'open',
            children:[
                tablesNode,
                viewsNode
            ]
        };
    },

    createTableNode:function (table) {
        var tableId = table.id();
        var tableName = table.val('name');
        var tableNode = {
            data:{
                title:tableName
            },
            attr:{
                rel:'table'
            },
            children:null
        };
        var node = this.schemaTree.jstree('create', '#schemaTreeTables', 'last', tableNode, false, true);
        node.data('elementid', tableId);
        this.bindContextMenu(node);
    },

    treeNode:function (modelNodeId) {
        return this.schemaTree.find('li[data-elementid="' + modelNodeId + '"]');
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        if (modelEvent instanceof databasy.model.core.events.ItemInserted &&
            modelEvent.val('node_id') === null &&
            modelEvent.val('field') === 'tables') {

            // Table inserted to the model.
            var table = modelEvent.val('item').ref_node(this.gateway.model);
            this.createTableNode(table);
        } else if (modelEvent instanceof databasy.model.core.events.PropertyChanged &&
            modelEvent.val('field') === 'name') {

            var node = this.gateway.model.node(modelEvent.val('node_id'));
            if (node instanceof databasy.model.core.elements.Table) {
                // Table name changed.
                var newName = modelEvent.val('new_value');
                var treeNode = this.treeNode(node.id());
                this.schemaTree.jstree('rename_node', treeNode, newName);
            }
        } else if (modelEvent instanceof databasy.model.core.events.ItemDeleted &&
            modelEvent.val('node_id') === null &&
            modelEvent.val('field') === 'tables') {

            // Table deleted.
            var tableId = modelEvent.val('item').ref_id();
            this.schemaTree.jstree('delete_node', this.treeNode(tableId));
        }
    }
});
