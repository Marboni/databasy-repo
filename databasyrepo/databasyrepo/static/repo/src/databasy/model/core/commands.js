databasy.model.core.commands.Command = databasy.model.core.serializing.Serializable.extend({
    init:function (values) {
        this._super();
        for (var field in values) {
            if (values.hasOwnProperty(field)) {
                this.set(field, values[field]);
            }
        }
    },
    fields:function () {
        return this._super().concat(
            'source_version'
        )
    },
    pre_validation:function (model) {
        if ($.inArray(this.constructor, model.commands()) == -1) {
            throw new Error('Command ' + this.code() + ' can not be executed on model ' + model.code() + '.')
        }
    },
    do:function (executor) {
        throw new Error('Not implemented');
    },
    execute:function (model) {
        this.pre_validation(model);
        var executor = new databasy.model.core.actions.Executor(model);
        this.do(executor);
        if (this.require_checks()) {
            this._check(executor);
        }
        return executor.events;
    },
    require_checks:function () {
        return true;
    },
    _check:function (executor) {
        var checkers = executor.model.checkers();
        for (var i = 0; i < checkers.length; i++) {
            checkers[i](executor).modify_errors();
        }
    }
});

databasy.model.core.commands.CreateTable = databasy.model.core.commands.Command.extend({
    fields:function () {
        return this._super().concat(
            'table_id',
            'default_table_repr_id',
            'name',
            'canvas_id',
            'position'
        )
    },
    do:function (executor) {
        var core = databasy.model.core;

        var table = new core.elements.Table({
            _id: this.val('table_id'),
            name: this.val('name')
        });
        executor.execute(new core.actions.Register({node:table}));
        executor.execute(new core.actions.AppendItem({field:'tables', item:table}));

        new core.commands.CreateTableRepr({
            table_repr_id: this.val('default_table_repr_id'),
            canvas_id:this.val('canvas_id'),
            table_id:table.id(),
            position:this.val('position')
        }).do(executor);
    }
}, {
    CODE:'core.commands.CreateTable'
});

databasy.model.core.commands.RenameTable = databasy.model.core.commands.Command.extend({
    fields:function () {
        return this._super().concat(
            'table_id',
            'new_name'
        )
    },
    do:function (executor) {
        executor.execute(new databasy.model.core.actions.Set({
            node_id:this.val('table_id'),
            field:'name',
            value:this.val('new_name')
        }));
    }
}, {
    CODE:'core.commands.RenameTable'
});

databasy.model.core.commands.DeleteTable = databasy.model.core.commands.Command.extend({
    fields:function () {
        return this._super().concat(
            'table_id'
        )
    },
    do:function (executor) {
        var core = databasy.model.core;
        var model = executor.model;

        var table_id = this.val('table_id');
        var table = model.node(table_id);

        var canvases = model.val_as_node('canvases', model);
        $.each(canvases, function(index, canvas) {
            var reprs = canvas.val_as_node('reprs', model);
            //noinspection FunctionWithInconsistentReturnsJS
            $.each(reprs, function(index, repr) {
                if (table_id == repr.val('table').val('ref_id')) {
                    new core.commands.DeleteTableRepr({
                        table_repr_id: repr.id()
                    }).do(executor);
                    return false;
                }
            });
        });

        executor.execute(new core.actions.FindAndDeleteItem({field:'tables', item:table}));
        executor.execute(new core.actions.Unregister({node_id:table_id}));
    }
}, {
    CODE:'core.commands.DeleteTable'
});

databasy.model.core.commands.CreateTableRepr = databasy.model.core.commands.Command.extend({
    fields:function () {
        return this._super().concat(
            'table_repr_id',
            'canvas_id',
            'table_id',
            'position'
        )
    },
    do:function (executor) {
        var core = databasy.model.core;

        var table = executor.model.node(this.val('table_id'), core.elements.Table);
        var canvas = executor.model.node(this.val('canvas_id'), core.reprs.Canvas);

        var table_repr = new core.reprs.TableRepr({
            _id: this.val('table_repr_id'),
            table: table.ref(),
            position: this.val('position')
        });
        executor.execute(new core.actions.Register({node:table_repr}));
        executor.execute(new core.actions.AppendItem({node_id:canvas.id(), field:'reprs', item:table_repr}));
    }
}, {
    CODE:'core.commands.CreateTableRepr'
});

databasy.model.core.commands.MoveTableRepr = databasy.model.core.commands.Command.extend({
    fields:function () {
        return this._super().concat(
            'table_repr_id',
            'new_position'
        )
    },
    do:function (executor) {
        var table_repr_id = this.val('table_repr_id');
        var new_position = this.val('new_position');
        executor.execute(new databasy.model.core.actions.Set({node_id:table_repr_id, field:'position', value:new_position}));
    }
}, {
    CODE:'core.commands.MoveTableRepr'
});

databasy.model.core.commands.DeleteTableRepr = databasy.model.core.commands.Command.extend({
    fields:function () {
        return this._super().concat(
            'table_repr_id'
        )
    },
    do:function (executor) {
        var model = executor.model;
        var table_repr_id = this.val('table_repr_id');

        var deleted = false;

        var canvases = model.val_as_node('canvases', model);
        //noinspection FunctionWithInconsistentReturnsJS
        $.each(canvases, function(index, canvas) {
            var repr_refs = canvas.val('reprs');
            //noinspection FunctionWithInconsistentReturnsJS
            $.each(repr_refs, function(index, repr_ref) {
                if (table_repr_id == repr_ref.ref_id()) {
                    executor.execute(new databasy.model.core.actions.DeleteItem({node_id:canvas.id(), field:'reprs', index:index}));
                    executor.execute(new databasy.model.core.actions.Unregister({node_id:table_repr_id}));
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
    CODE:'core.commands.DeleteTableRepr'
});