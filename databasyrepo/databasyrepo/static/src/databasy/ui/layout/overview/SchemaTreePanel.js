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
                                image:'/static/src/css/overview/schema.png'
                            }
                        },
                        table:{
                            icon:{
                                image:'/static/src/css/overview/table.png'
                            }
                        }
                    }
                }
            });
    },

    initSchemaTree:function() {
        var that = this;

        var tables = this.gateway.model.val_as_node('tables', this.gateway.model);
        if (tables.length > 0) {
            $.each(tables, function (index, table) {
                that.createTableNode(table);
            });
            that.schemaTree.jstree('open_node', '#schemaTreeTables');
        }

        
        this.schemaTree.find('li').on('dblclick', function () {
            // Open/close node on double click.
            if (!that.schemaTree.jstree('is_leaf', this)) {
                that.schemaTree.jstree('toggle_node', this);
            }
            var elementId = $(this).attr('elementId');
            var element = that.gateway.model.node(elementId);

            if (elementId !== undefined) {
                var canvas = that.gateway.layout.canvas;
                var propertyPanel = that.gateway.layout.propertyPanel;

                var component = canvas.componentByElementId(elementId);
                if (component !== undefined) {
                    propertyPanel.refreshProperties(element);
                    canvas.scrollToComponent(component);
                }
            }
            return false;
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
                elementId:tableId,
                rel:'table'
            },
            children:null
        };
        this.schemaTree.jstree('create', '#schemaTreeTables', 'last', tableNode, false, true);
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        if (modelEvent instanceof databasy.model.core.events.ItemInserted &&
            modelEvent.val('node_id') === null &&
            modelEvent.val('field') === 'tables') {
            // Table inserted to the model.
            var table = modelEvent.val('item');
            this.createTableNode(table);
        }
    }
});
