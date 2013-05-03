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
    validate_predicates:function(model) {
        if ($.inArray(this.constructor, model.commands()) == -1) {
            throw new Error('Command ' + this.code() + ' can not be executed on model ' + model.code() + '.')
        }
    },
    do:function (executor) {
        throw new Error('Not implemented');
    },
    execute:function(model) {
        this.validate_predicates(model);
        var executor = databasy.model.core.actions.Executor(model);
        this.do(executor);
        if (this.require_checks()) {
            this._check(executor);
        }
        return executor.events;
    },
    require_checks:function() {
        return true;
    },
    _check:function(executor) {
        var checkers = executor.model.checkers();
        for (var i = 0; i < checkers.length; i++) {
            checkers[i](executor).modify_errors();
        }
    }
});

databasy.model.core.commands.CreateTable = databasy.model.core.commands.Command.extend({
    fields:function () {
        return this._super().concat(
            'name',
            'canvas_id',
            'position'
        )
    },
    do:function (executor) {
        var core = databasy.model.core;

        var table = core.elements.Table();
        executor.execute(core.actions.Register({node:table}));
        executor.execute(core.actions.AppendItem({field:'tables', item:table}));
        executor.execute(core.actions.Set({node_id:table.id(), field:'name', value:this.val('name')}));

        core.commands.CreateTableRepr({
            canvas_id:this.val('canvas_id'), table_id:table.id(), position:this.val('position')
        }).do(executor);
    }
}, {
    CODE:'core.commands.CreateTable'
});


databasy.model.core.commands.CreateTableRepr = databasy.model.core.commands.Command.extend({
    fields:function () {
        return this._super().concat(
            'canvas_id',
            'table_id',
            'position'
        )
    },
    do:function (executor) {
        var core = databasy.model.core;

        var table = executor.model.node(this.val('table_id'), core.elements.Table);
        var canvas = executor.model.node(this.val('canvas_id'), core.reprs.Canvas);

        var table_repr = new core.reprs.TableRepr();
        executor.execute(core.actions.Register({node:table_repr}));
        executor.execute(core.actions.AppendItem({node_id:canvas.id(), field:'reprs', item:table_repr}));
        executor.execute(core.actions.Set({node_id:table_repr.id(), field:'table', value:table}));
        executor.execute(core.actions.Set({node_id:table_repr.id(), field:'position', value:this.val('position')}));
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
        executor.execute(databasy.model.core.actions.Set({node_id:table_repr_id, field:'position', value:new_position}));
    }
}, {
    CODE:'core.commands.MoveTableRepr'
});