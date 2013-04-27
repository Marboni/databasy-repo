databasy.model.core.serializing.Serializable = Class.extend({
        init:function () {
            this.f = {};
            this.f["_code"] = this.constructor.CODE;
            var fields = this.fields();
            for (var i = 0; i < fields.length; i++) {
                this.f[fields[i]] = undefined;
            }
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
        set:function (key, value) {
            this.f[key] = value;
        },
        deserializeObject:function (serializedObject) {
            for (var field in this.f) {
                if (this.f.hasOwnProperty(field)) {
                    var val = databasy.model.core.serializing.Serializable.deserialize(serializedObject[field]);
                    this.set(field, val);
                }
            }
        }
    },
    {
        deserialize:function (value) {
            var deserializeValue = function (value) {
                if (value instanceof Object && value.hasOwnProperty('_code')) {
                    // Value is object.
                    var type = value['_code'];
                    var register = databasy.runtime.register;
                    if (register.exists(type)) {
                        var ObjClass = register.byType(type);
                        var obj = new ObjClass();
                        obj.deserializeObject(value);
                        value = obj;
                    } else {
                        value = "NA";
                    }
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