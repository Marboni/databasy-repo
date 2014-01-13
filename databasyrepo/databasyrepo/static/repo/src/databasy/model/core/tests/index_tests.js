test('index_tests : test_create', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);

    var index_id = databasy.model.utils.uuid();

    testutils.execute_command(model, databasy.model.core.commands.CreateIndex, {
        table_id: table.id(),
        index_id:index_id,
        name:'pk',
        type:'PRIMARY'
    });

    var index = model.node(index_id);
    deepEqual(index.val('table'), table.ref());
    deepEqual(index.val('name'), 'pk');
    deepEqual(index.val('type'), 'PRIMARY');
    deepEqual(index.val('index_columns'), []);

    index_id = databasy.model.utils.uuid();
    testutils.execute_command(model, databasy.model.core.commands.CreateIndex, {
        table_id: table.id(),
        index_id:index_id,
        name:'idx',
        type:'INDEX'
    });

    index = model.node(index_id);
    deepEqual(index.val('table'), table.ref());
    deepEqual(index.val('name'), 'idx');
    deepEqual(index.val('type'), 'INDEX');
    deepEqual(index.val('index_columns'), []);
});


test('index_tests : test_update', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var index = testutils.create_index(model, table, 'uq', 'UNIQUE');

    testutils.execute_command(model, databasy.model.core.commands.UpdateIndex, {
        index_id:index.id(),
        fields:['name', 'type'],
        name:'pk',
        type:'PRIMARY'
    });

    deepEqual(index.val('name'), 'pk');
    deepEqual(index.val('type'), 'PRIMARY');
});


test('index_tests : test_delete', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var index = testutils.create_index(model, table, 'uq', 'UNIQUE');

    testutils.execute_command(model, databasy.model.core.commands.DeleteIndex, {
        index_id:index.id()
    });

    deepEqual(table.items_count('indexes'), 0);
    ok(!model.exists(index.id()));
});


test('index_tests : test_impact', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var index = testutils.create_index(model, table, 'idx', 'INDEX');

    testutils.execute_command(model, databasy.model.core.commands.DeleteTable, {
        table_id:table.id()
    });

    ok(!model.exists(index.id()));
});