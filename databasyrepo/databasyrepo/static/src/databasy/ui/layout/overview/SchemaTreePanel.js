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
        this.schemaTree = $('<div id="schemaTree"></div>');
        this.schemaTreePanel.append(this.schemaTree);

        var initialTree = this.modelToNode();

        this.schemaTree.jstree({
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
            state:'open',
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

        var rootNode = {
            data:'Schema',
            attr:{
                id:'schemaTreeRoot',
                rel:'schema'
            },
            state:'open',
            children:[
                tablesNode,
                viewsNode
            ]
        };

        var that = this;
        var tables = this.gateway.model.val_as_node('tables', this.gateway.model);
        $.each(tables, function (index, table) {
            tablesNode.children.push(that.tableToNode(table));
        });

        return rootNode;
    },

    tableToNode:function (table) {
        var tableId = table.id();
        var tableName = table.val('name');
        return {
            data:{
                title:tableName
            },
            attr:{
                id:'schemaTreeTable_' + tableId,
                rel:'table'
            },
            children:null
        };
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        if (modelEvent instanceof databasy.model.core.events.ItemInserted &&
            modelEvent.val('node_id') === null &&
            modelEvent.val('field') === 'tables') {
            // Table inserted to the model.
            var table = modelEvent.val('item');
            var tableNode = this.tableToNode(table);
            this.schemaTree.jstree('create', '#schemaTreeTables', 'last', tableNode, false, true);
        }
    }
});
