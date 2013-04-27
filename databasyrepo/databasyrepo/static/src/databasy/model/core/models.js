databasy.model.core.models.Model = databasy.model.core.nodes.Node.extend({
        init:function () {
            this._super();
            this.version = null;
        },
        fields:function () {
            return this._super().concat(
                'model_id'
            )
        },
        dbms_type:function() {
            throw new Error('Not implemented');
        },
        dbms_version:function() {
            throw new Error('Not implemented');
        }
    });