databasy.model.core.reprs.Canvas = databasy.model.core.nodes.Node.extend({
    fields:function() {
        return this._super().concat(
            'name',
            'reprs'
        )
    }
}, {
    CODE:'core.reprs.Canvas'
});

databasy.model.core.reprs.Repr = databasy.model.core.nodes.Node.extend({
    elementId:function() {
        throw new Error('Not implemented');
    }
});

databasy.model.core.reprs.TableRepr = databasy.model.core.reprs.Repr.extend({
    fields:function() {
        return this._super().concat(
            'table',
            'position'
        )
    },
    elementId: function() {
        return this.val('table').val('ref_id');
    }
}, {
    CODE:'core.reprs.TableRepr'
});