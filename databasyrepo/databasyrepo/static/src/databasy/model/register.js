databasy.model.register.Register = Class.extend({
    init:function (pkg, field) {
        this.findAndReg(pkg, field);
    },

    findAndReg:function (obj, field) {
        if (obj instanceof Object) {
            if (field in obj) {
                this[obj[field]] = obj;
            } else {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p) && typeof(obj[p] === 'object')) {
                        this.findAndReg(obj[p], field);
                    }
                }
            }
        }
    },
    exists:function (key) {
        return this.hasOwnProperty(key);
    },
    by_key:function (key) {
        if (!this.exists(key)) {
            throw new Error(key + ' not registered.')
        }
        return this[key];
    }
});

databasy.model.register.register = new databasy.model.register.Register(databasy.model, 'CODE');

