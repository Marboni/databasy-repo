test('basic_tests : test_register', function() {
    var register = databasy.model.register.register;
    var model_class = register.by_key(databasy.model.core.models.Model.CODE);
    equal(databasy.model.core.models.Model, model_class);

    throws(function() {
        register.by_key('non.existent.code')
    });
});

test('basic_tests : test_serialization', function() {
    var model = databasy.model.core.models.Model.createModel(1, 10);
    var serialized_model = model.serialize();
    var deserialized_model = databasy.model.core.serializing.Serializable.deserialize(serialized_model);

    deepEqual(deserialized_model, model);
});