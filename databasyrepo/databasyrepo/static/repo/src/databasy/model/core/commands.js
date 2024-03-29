databasy.model.core.commands.Command = databasy.model.core.serializing.Serializable.extend({
    fields: function () {
        return this._super().concat(
            'source_version'
        )
    },
    do: function (executor) {
        throw new Error('Not implemented');
    },
    execute: function (model) {
        var executor = new databasy.model.core.actions.Executor(model);
        this.do(executor);
        if (this.require_checks()) {
            this._check(executor);
        }
        return executor.events;
    },
    require_checks: function () {
        return true;
    },
    _check: function (executor) {
        var checkers = executor.model.checkers();
        for (var i = 0; i < checkers.length; i++) {
            checkers[i](executor).modify_errors();
        }
    }
});

databasy.model.core.commands.UpdateCommand = databasy.model.core.commands.Command.extend({
    obj_id_field: function () {
        throw new Error('Not implemented');
    },

    obj_changeable_fields: function () {
        throw new Error('Not implemented');
    },

    fields: function () {
        return this._super().
            concat('fields').concat(this.obj_id_field()).concat(this.obj_changeable_fields())
    },

    do: function (executor) {
        var fields = this.val('fields');
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var obj_id = this.val(this.obj_id_field());
            var value = this.val(field);
            executor.execute(new databasy.model.core.actions.Set({node_id: obj_id, field: field, value: value}));
        }
    }
});


databasy.model.core.commands.HistoryCommand = databasy.model.core.commands.Command.extend({
    require_checks: function () {
        return false;
    }
});

databasy.model.core.commands.Undo = databasy.model.core.commands.HistoryCommand.extend({
    do: function (executor) {
        var actions = executor.model.revision_stack().undo();
        $.each(actions, function (i, action) {
            executor.execute(action);
        })
    }
}, {
    CODE: 'core.commands.Undo'
});

databasy.model.core.commands.Redo = databasy.model.core.commands.HistoryCommand.extend({
    do: function (executor) {
        var actions = executor.model.revision_stack().redo();
        $.each(actions, function (i, action) {
            executor.execute(action);
        })
    }
}, {
    CODE: 'core.commands.Redo'
});

databasy.model.core.commands.CreateTable = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'table_id',
            'default_table_repr_id',
            'name',
            'canvas_id',
            'position'
        )
    },
    do: function (executor) {
        var core = databasy.model.core;

        var table = new core.elements.Table({
            _id: this.val('table_id'),
            name: this.val('name')
        });
        executor.execute(new core.actions.Register({node: table}));
        executor.execute(new core.actions.AppendItem({field: 'tables', item: table}));

        new core.commands.CreateTableRepr({
            table_repr_id: this.val('default_table_repr_id'),
            canvas_id: this.val('canvas_id'),
            table_id: table.id(),
            position: this.val('position')
        }).do(executor);
    }
}, {
    CODE: 'core.commands.CreateTable'
});

databasy.model.core.commands.RenameTable = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'table_id',
            'new_name'
        )
    },
    do: function (executor) {
        executor.execute(new databasy.model.core.actions.Set({
            node_id: this.val('table_id'),
            field: 'name',
            value: this.val('new_name')
        }));
    }
}, {
    CODE: 'core.commands.RenameTable'
});

databasy.model.core.commands.DeleteTable = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'table_id'
        )
    },
    do: function (executor) {
        var core = databasy.model.core;
        var model = executor.model;

        var table_id = this.val('table_id');
        var table = model.node(table_id);

        // Delete table reprs.
        var canvases = model.val_as_node('canvases', model);
        $.each(canvases, function (index, canvas) {
            var reprs = canvas.val_as_node('reprs', model);
            //noinspection FunctionWithInconsistentReturnsJS
            $.each(reprs, function (index, repr) {
                if (table_id == repr.val('table').val('ref_id')) {
                    new core.commands.DeleteTableRepr({
                        table_repr_id: repr.id()
                    }).do(executor);
                    return false;
                }
            });
        });

        // Delete columns.
        $.each(table.val('columns'), function (i, column_ref) {
            new databasy.model.core.commands.DeleteColumn({
                column_id: column_ref.ref_id()
            }).do(executor);
        });

        // Delete indexes.
        $.each(table.val('indexes'), function (i, index_ref) {
            new databasy.model.core.commands.DeleteIndex({
                index_id: index_ref.ref_id()
            }).do(executor);
        });

        executor.execute(new core.actions.FindAndDeleteItem({field: 'tables', item: table}));
        executor.execute(new core.actions.Unregister({node_id: table_id}));
    }
}, {
    CODE: 'core.commands.DeleteTable'
});


databasy.model.core.commands.CreateColumn = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'table_id',
            'column_id',
            'name',
            'type',
            'position'
        )
    },
    do: function (executor) {
        var core = databasy.model.core;

        var table = executor.model.node(this.val('table_id'), core.elements.Table);

        var column = new core.elements.Column({
            _id: this.val('column_id'),
            name: this.val('name'),
            type: this.val('type'),
            table: table.ref()
        });

        executor.execute(new core.actions.Register({node: column}));
        executor.execute(new core.actions.InsertItem({node_id: table.id(), field: 'columns', index: this.val('position'), item: column}));
    }
}, {
    CODE: 'core.commands.CreateColumn'
});

databasy.model.core.commands.UpdateColumn = databasy.model.core.commands.UpdateCommand.extend({
    obj_id_field: function () {
        return 'column_id';
    },

    obj_changeable_fields: function () {
        return [
            'name',
            'type',
            'null',
            'default'
        ]
    }
}, {
    CODE: 'core.commands.UpdateColumn'
});

databasy.model.core.commands.DeleteColumn = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'column_id'
        )
    },
    do: function (executor) {
        var core = databasy.model.core;
        var model = executor.model;

        var column_id = this.val('column_id');
        var column = model.node(column_id);

        var table = column.val_as_node('table', executor.model);
        $.each(table.val_as_node('indexes', executor.model), function(i, index) {
            $.each(index.val('index_columns'), function(i, index_column_ref) {
                new databasy.model.core.commands.DeleteIndexColumn({
                    index_column_id:index_column_ref.ref_id()
                }).do(executor);
            });
        });

        executor.execute(new core.actions.FindAndDeleteItem({node_id: column.val('table').ref_id(), field: 'columns', item: column}));
        executor.execute(new core.actions.Unregister({node_id: column_id}));
    }
}, {
    CODE: 'core.commands.DeleteColumn'
});

databasy.model.core.commands.CreateIndex = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'table_id',
            'index_id',
            'name',
            'type'
        )
    },
    do: function (executor) {
        var table_id = this.val('table_id');
        var table = executor.model.node(table_id);

        var index = new databasy.model.core.elements.Index({
            _id:this.val('index_id'),
            name: this.val('name'),
            type: this.val('type'),
            table: table.ref()
        });

        executor.execute(new databasy.model.core.actions.Register({node: index}));
        executor.execute(new databasy.model.core.actions.AppendItem({node_id: table_id, field: 'indexes', item: index}));
    }
}, {
    CODE: 'core.commands.CreateIndex'
});

databasy.model.core.commands.UpdateIndex = databasy.model.core.commands.UpdateCommand.extend({
    obj_id_field: function () {
        return 'index_id';
    },

    obj_changeable_fields: function () {
        return [
            'name',
            'type'
        ]
    }
}, {
    CODE: 'core.commands.UpdateIndex'
});

databasy.model.core.commands.DeleteIndex = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'index_id'
        )
    },
    do: function (executor) {
        var core = databasy.model.core;
        var model = executor.model;

        var index_id = this.val('index_id');
        var index = model.node(index_id);

        $.each(index.val('index_columns'), function(i, index_column_ref) {
            new databasy.model.core.commands.DeleteIndexColumn({
                index_column_id: index_column_ref.ref_id()
            }).do(executor);
        });

        executor.execute(new core.actions.FindAndDeleteItem({node_id: index.val('table').ref_id(), field: 'indexes', item: index}));
        executor.execute(new core.actions.Unregister({node_id: index_id}));
    }
}, {
    CODE: 'core.commands.DeleteIndex'
});


databasy.model.core.commands.CreateIndexColumn = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'index_column_id',
            'index_id',
            'column_id',
            'order'
        )
    },
    do: function (executor) {
        var core = databasy.model.core;

        var index_id = this.val('index_id');
        var index = executor.model.node(index_id);

        var column_id = this.val('column_id');
        var column = executor.model.node(column_id);

        var index_column = new core.elements.IndexColumn({
            _id: this.val('index_column_id'),
            index: index.ref(),
            column: column.ref(),
            order: this.val('order')
        });

        executor.execute(new core.actions.Register({node: index_column}));
        executor.execute(new core.actions.AppendItem({node_id: index_id, field: 'index_columns', item: index_column}));
    }
}, {
    CODE: 'core.commands.CreateIndexColumn'
});


databasy.model.core.commands.UpdateIndexColumn = databasy.model.core.commands.UpdateCommand.extend({
    obj_id_field: function () {
        return 'index_column_id';
    },

    obj_changeable_fields: function () {
        return [
            'column',
            'order'
        ]
    }
}, {
    CODE: 'core.commands.UpdateIndexColumn'
});


databasy.model.core.commands.DeleteIndexColumn = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'index_column_id'
        )
    },
    do: function (executor) {
        var core = databasy.model.core;
        var model = executor.model;

        var index_column_id = this.val('index_column_id');
        var index_column = model.node(index_column_id);

        executor.execute(new core.actions.FindAndDeleteItem({node_id: index_column.val('index').ref_id(), field: 'index_columns', item: index_column}));
        executor.execute(new core.actions.Unregister({node_id: index_column_id}));
    }
}, {
    CODE: 'core.commands.DeleteIndex'
});


databasy.model.core.commands.CreateTableRepr = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'table_repr_id',
            'canvas_id',
            'table_id',
            'position'
        )
    },
    do: function (executor) {
        var core = databasy.model.core;

        var table = executor.model.node(this.val('table_id'), core.elements.Table);
        var canvas = executor.model.node(this.val('canvas_id'), core.reprs.Canvas);

        var table_repr = new core.reprs.TableRepr({
            _id: this.val('table_repr_id'),
            table: table.ref(),
            position: this.val('position'),
            width: core.reprs.TableRepr.DEFAULT_REPR_WIDTH
        });
        executor.execute(new core.actions.Register({node: table_repr}));
        executor.execute(new core.actions.AppendItem({node_id: canvas.id(), field: 'reprs', item: table_repr}));
    }
}, {
    CODE: 'core.commands.CreateTableRepr'
});

databasy.model.core.commands.UpdateTableRepr = databasy.model.core.commands.UpdateCommand.extend({
    obj_id_field: function () {
        return 'table_repr_id';
    },

    obj_changeable_fields: function () {
        return ['position', 'width']
    }
}, {
    CODE: 'core.commands.UpdateTableRepr'
});

databasy.model.core.commands.DeleteTableRepr = databasy.model.core.commands.Command.extend({
    fields: function () {
        return this._super().concat(
            'table_repr_id'
        )
    },
    do: function (executor) {
        var model = executor.model;
        var table_repr_id = this.val('table_repr_id');

        var deleted = false;

        var canvases = model.val_as_node('canvases', model);
        //noinspection FunctionWithInconsistentReturnsJS
        $.each(canvases, function (index, canvas) {
            var repr_refs = canvas.val('reprs');
            //noinspection FunctionWithInconsistentReturnsJS
            $.each(repr_refs, function (index, repr_ref) {
                if (table_repr_id == repr_ref.ref_id()) {
                    executor.execute(new databasy.model.core.actions.DeleteItem({node_id: canvas.id(), field: 'reprs', index: index}));
                    executor.execute(new databasy.model.core.actions.Unregister({node_id: table_repr_id}));
                    deleted = true;
                    return false;
                }
            });
            if (deleted) {
                return false;
            }
        });

        if (!deleted) {
            throw new Error('Table repr with ID ' + table_repr_id + ' was not removed.')
        }
    }
}, {
    CODE: 'core.commands.DeleteTableRepr'
});