test('column_tests : test_create', function() {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var table_id = table.id();

    var column_1_id = databasy.model.utils.uuid();
    var column_2_id = databasy.model.utils.uuid();
    var column_3_id = databasy.model.utils.uuid();

    var column_type = 'VARCHAR';

    testutils.execute_command(model, databasy.model.core.commands.CreateColumn, {
        table_id:table_id,
        column_id:column_2_id,
        type: column_type,
        name: 'Column2',
        position:0
    });

    testutils.execute_command(model, databasy.model.core.commands.CreateColumn, {
        table_id:table_id,
        column_id:column_1_id,
        type: column_type,
        name: 'Column1',
        position:0
    });

    testutils.execute_command(model, databasy.model.core.commands.CreateColumn, {
        table_id:table_id,
        column_id:column_3_id,
        type: column_type,
        name: 'Column3',
        position:2
    });

    var column1 = testutils.query_node(model, {
        _id:column_1_id,
        _code:databasy.model.core.elements.Column.CODE,
        table:table.ref(),
        name:'Column1'
    });

    var column2 = testutils.query_node(model, {
        _id:column_2_id,
        _code:databasy.model.core.elements.Column.CODE,
        table:table.ref(),
        name:'Column2'
    });

    var column3 = testutils.query_node(model, {
        _id:column_3_id,
        _code:databasy.model.core.elements.Column.CODE,
        table:table.ref(),
        name:'Column3'
    });

    var columns = table.val('columns');
    equal(3, columns.length);
    deepEqual(columns[0], column1.ref());
    deepEqual(columns[1], column2.ref());
    deepEqual(columns[2], column3.ref());
});

test('column_tests : test_update', function() {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var column = testutils.create_column(model, table);

    ok(column.val('null'));
    equal(column.val('default'), null);

    testutils.execute_command(model, databasy.model.core.commands.UpdateColumn, {
        column_id:column.id(),
        fields:['name', 'type', 'null', 'default'],
        name: 'NewName',
        type: 'INT',
        null: true,
        default:'1'
    });

    equal('NewName', column.val('name'));
    equal('INT', column.val('type'));
    ok(column.val('null'));
    equal('1', column.val('default'));
});

test('column_tests : test_delete', function() {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var column = testutils.create_column(model, table);

    testutils.execute_command(model, databasy.model.core.commands.DeleteColumn, {
        column_id:column.id()
    });

    equal(0, table.items_count('columns'));
    ok(!model.exists(column.id()));
});

test('column_tests : test_impact', function() {
    var model = testutils.create_model();
    var table = testutils.create_table(model);
    var column = testutils.create_column(model, table);

    testutils.execute_command(model, databasy.model.core.commands.DeleteTable, {
        table_id:table.id()
    });

    ok(!model.exists(column.id()));
});