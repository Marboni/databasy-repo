test('index_column_tests : test_create', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var column = testutils.create_column(model, table, 'col1');
    var index = testutils.create_index(model, table, 'idx', 'INDEX');

    var index_column_id = databasy.model.utils.uuid();
    testutils.execute_command(model, databasy.model.core.commands.CreateIndexColumn, {
        index_column_id: index_column_id,
        index_id:index.id(),
        column_id:column.id(),
        order:'ASC'
    });

    var index_column = model.node(index_column_id);
    deepEqual(index_column.val('index'), index.ref());
    deepEqual(index_column.val('column'), column.ref());
    deepEqual(index_column.val('order'), 'ASC');
});


test('index_column_tests : test_update', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var column1 = testutils.create_column(model, table, 'col1');
    var column2 = testutils.create_column(model, table, 'col2');
    var index = testutils.create_index(model, table, 'idx', 'INDEX');

    var index_column = testutils.create_index_column(model, index, column1);
    testutils.execute_command(model, databasy.model.core.commands.UpdateIndexColumn, {
        index_column_id: index_column.id(),
        fields:['column', 'order'],
        column:column2.ref(),
        order:'DESC'
    });

    deepEqual(index_column.val('column'), column2.ref());
    deepEqual(index_column.val('order'), 'DESC');
});


test('index_column_tests : test_delete', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var column = testutils.create_column(model, table, 'col1');
    var index = testutils.create_index(model, table, 'idx', 'INDEX');
    var index_column = testutils.create_index_column(model, index, column);

    testutils.execute_command(model, databasy.model.core.commands.DeleteIndexColumn, {
        index_column_id: index_column.id()
    });

    deepEqual(index.items_count('index_columns'), 0);
    ok(!model.exists(index_column.id()));
});


test('index_column_tests : test_affect', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var column = testutils.create_column(model, table, 'col1');

    // Removing index.
    var index = testutils.create_index(model, table, 'idx', 'INDEX');
    var index_column = testutils.create_index_column(model, index, column);

    testutils.execute_command(model, databasy.model.core.commands.DeleteIndex, {
        index_id: index.id()
    });
    ok(!model.exists(index_column.id()));

    // Removing column.
    index = testutils.create_index(model, table, 'idx', 'INDEX');
    index_column = testutils.create_index_column(model, index, column);

    testutils.execute_command(model, databasy.model.core.commands.DeleteColumn, {
        column_id: column.id()
    });
    ok(!model.exists(index_column.id()));
});

