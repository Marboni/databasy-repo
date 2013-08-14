databasy.model.core.serializing.Serializable = Class.extend({
        init:function (params) {
            this.f = {};
            this.f['_code'] = this.constructor.CODE;
            var fields = this.fields();
            for (var i = 0; i < fields.length; i++) {
                this.f[fields[i]] = null;
            }
            if (params !== undefined) {
                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        this.set(key, params[key])
                    }
                }
            }
        },
        code:function() {
            return this.constructor.CODE;
        },
        fields:function () {
            return [];
        },
        type:function() {
            return this.val('_code');
        },
        val:function (key) {
            return this.f[key];
        },
        val_as_node: function(key, model) {
            var ref_or_obj = function(value, model) {
                if (value instanceof databasy.model.core.nodes.NodeRef) {
                    return value.ref_node(model);
                }
                return value;
            };

            var value = this.val(key);
            if (Object.prototype.toString.call(value) === '[object Array]') {
                var result = [];
                for (var i = 0; i < value.length; i++) {
                    var item = value[i];
                    result.push(ref_or_obj(item, model));
                }
                return result;
            } else {
                return ref_or_obj(value, model);
            }
        },
        set:function (f_name, f_value) {
            var setter_name = 'set_' + f_name;
            if (this[setter_name] === undefined) {
                this.f[f_name] = f_value;
            } else {
                this[setter_name](f_value);
            }
        },
        _serialized_value:function(value) {
            if (value instanceof databasy.model.core.serializing.Serializable) {
                value = value.serialize();
            }
            return value;
        },
        serialize:function() {
            var serialized = {};
            var fields = this.f;
            for (var field in fields) {
                if (fields.hasOwnProperty(field)) {
                    var value = this._serialized_value(fields[field]);
                    if (Object.prototype.toString.call(value) === '[object Array]') {
                        var list_value = [];
                        for (var i=0; i < value.length; i++) {
                            var item = this._serialized_value(value[i]);
                            list_value.push(item);
                        }
                        value = list_value;
                    }
                    serialized[field] = value;
                }
            }
            return serialized;
        },
        deserialize:function (serialized_object) {
            for (var field in this.f) {
                if (this.f.hasOwnProperty(field)) {
                    var val = databasy.model.core.serializing.Serializable.deserialize(serialized_object[field]);
                    this.set(field, val);
                }
            }
        },
        copy:function() {
            return databasy.model.core.serializing.Serializable.deserialize(this);
        },
        toString:function() {
            return JSON.stringify(this.serialize());
        }
    },
    {
        deserialize:function (value) {
            var deserializeValue = function (value) {
                if (value instanceof Object && value.hasOwnProperty('_code')) {
                    // Value is object.
                    var type = value['_code'];
                    var register = databasy.model.register.register;
                    var ObjClass = register.by_key(type);
                    var obj = new ObjClass();
                    obj.deserialize(value);
                    value = obj;
                }
                return value;
            };
            if (Object.prototype.toString.call(value) === '[object Array]') {
                var result = [];
                for (var i = 0; i < value.length; i++) {
                    result.push(databasy.model.core.serializing.Serializable.deserialize(value[i]))
                }
                return result
            } else {
                return deserializeValue(value)
            }
        }
    }
);