var testutils = {
    USER_ID: 1,
    MODEL_ID: 10,

    execute_command: function (model, command_cls, params) {
        if (!params) {
            params = {};
        }
        if (params.source_version === undefined) {
            params.source_version = model.version;
        }
        model.execute_command(new command_cls(params), this.USER_ID);
    },

    default_canvas: function (model) {
        return model.val_as_node('canvases', model)[0];
    },

    query_node: function (model, params) {
        var nodes = model.val('nodes');
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var pass = true;

            for (var field in params) {
                var value = params[field];
                try {
                    var node_value = node.val(field);
                } catch (e) {
                    if (e.name === 'ReferenceError') {
                        pass = false;
                        break;
                    }
                }
                if (!databasy.model.utils.deepCompare(value, node_value)) {
                    pass = false;
                    break;
                }
            }
            if (pass) {
                return node;
            }
        }
        return null;
    },

    create_model: function () {
        return databasy.model.core.models.Model.createModel(this.MODEL_ID);
    },

    create_table: function (model) {
        var canvas = this.default_canvas(model);
        var table_id = databasy.model.utils.uuid();
        var table_repr_id = databasy.model.utils.uuid();

        this.execute_command(model, databasy.model.core.commands.CreateTable, {
            table_id: table_id,
            default_table_repr_id: table_repr_id,
            name: 'Table',
            canvas_id: canvas.id(),
            position: [1, 2]
        });

        return model.node(table_id);
    },

    create_column: function(model, table, name) {
        if (!name) {
            name = 'Column';
        }

        var column_id = databasy.model.utils.uuid();
        this.execute_command(model, databasy.model.core.commands.CreateColumn, {
            table_id: table.id(),
            column_id: column_id,
            name: name,
            type: 'VARCHAR',
            position: table.items_count('columns')
        });

        return model.node(column_id);
    }
};

//def create_index(model, table, name, type):
//    index_id = str(uuid4())
//
//    execute_command(model, CreateIndex,
//                    table_id=table.id,
//                    index_id=index_id,
//                    name=name,
//                    type=type
//    )
//
//    return model.node(index_id)
//
//
//def create_index_column(model, index, column, order='ASC'):
//    index_column_id = str(uuid4())
//
//    execute_command(model, CreateIndexColumn,
//                    index_column_id=index_column_id,
//                    index_id=index.id,
//                    column_id=column.id,
//                    order=order
//    )
//
//    return model.node(index_column_id)

