databasy.model.core.reprs.Canvas = databasy.model.core.nodes.Node.extend({
    fields:function() {
        return this._super().concat(
            'name',
            'reprs'
        )
    }
}, {
    CODE:"core.reprs.Canvas"
});

databasy.model.core.reprs.Repr = databasy.model.core.nodes.Node.extend({});

databasy.model.core.reprs.TableRepr = databasy.model.core.reprs.Repr.extend({
    fields:function() {
        return this._super().concat(
            'table',
            'position'
        )
    }
}, {
    CODE:"core.reprs.TableRepr"
});