databasy.model.core.nodes.Node = databasy.model.core.serializing.Serializable.extend({
    init:function (params) {
        this._super(params);
    },
    fields:function () {
        return this._super().concat(
            '_id'
        )
    },
    id:function () {
        return this.val('_id');
    },
    insert_item:function (field, index, item) {
        var lst = this._iter_val(field);
        lst.splice(index, 0, item);
    },
    append_item:function (field, item) {
        var lst = this._iter_val(field);
        lst.splice(this.items_count(field), 0, item);
    },
    delete_item:function (field, index) {
        var lst = this._iter_val(field);
        var item_to_delete = lst[index];
        lst.splice(index, 1);
        return item_to_delete;
    },
    item_index:function (field, item) {
        var lst = this._iter_val(field);
        var index = -1;
        //noinspection FunctionWithInconsistentReturnsJS
        $.each(lst, function (i, list_item) {
            if (item === list_item) {
                index = i;
                return false;
            } else if (item instanceof databasy.model.core.nodes.NodeRef &&
                item.ref_code() === list_item.ref_code() &&
                item.ref_id() === list_item.ref_id()) {
                index = i;
                return false;
            }
        });
        if (index == -1) {
            throw new Error('Item not found in the list "' + field + '".')
        } else {
            return index;
        }
    },
    items_count:function (field) {
        var lst = this._iter_val(field);
        return lst.length;
    },
    _iter_val:function (field) {
        var value = this.val(field);
        if (Object.prototype.toString.call(value) !== '[object Array]') {
            throw new Error('Field "' + field + '" is not iterable.');
        }
        return value;
    },
    ref:function () {
        return new databasy.model.core.nodes.NodeRef({ref_id:this.id(), ref_code:this.code()})
    }
});


databasy.model.core.nodes.NodeRef = databasy.model.core.serializing.Serializable.extend({
    fields:function () {
        return this._super().concat(
            'ref_id',
            'ref_code'
        )
    },
    ref_id:function () {
        return this.val('ref_id');
    },
    ref_code:function() {
        return this.val('ref_code');
    },
    ref_node:function (model) {
        return model.node(this.val('ref_id'));
    }
}, {
    CODE:'core.nodes.NodeRef'
});