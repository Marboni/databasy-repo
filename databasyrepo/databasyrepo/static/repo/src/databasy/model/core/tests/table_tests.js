test('table_tests : test_create', function () {
    var model = testutils.create_model();
    var canvas = testutils.default_canvas(model);

    testutils.execute_command(model, databasy.model.core.commands.CreateTable, {
        table_id: databasy.model.utils.uuid(),
        default_table_repr_id: databasy.model.utils.uuid(),
        name: 'Table',
        canvas_id: canvas.id(),
        position: [1, 2]
    });

    var table = testutils.query_node(model, {_code: databasy.model.core.elements.Table.CODE, name: 'Table', columns: []});
    ok(table !== null);
    deepEqual(model.val('tables').length, 1);
    deepEqual(model.val('tables')[0], table.ref());

    var table_repr = testutils.query_node(model, {_code: databasy.model.core.reprs.TableRepr.CODE, table: table.ref(), position: [1, 2], width: databasy.model.core.reprs.TableRepr.DEFAULT_REPR_WIDTH});
    deepEqual(canvas.val('reprs').length, 1);
    deepEqual(canvas.val('reprs')[0], table_repr.ref());
});

test('table_tests : test_rename', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);

    var new_name = 'NewName';
    testutils.execute_command(model, databasy.model.core.commands.RenameTable, {
        table_id: table.id(),
        new_name: new_name
    });
    deepEqual(table.val('name'), new_name);
});

test('table_tests : test_delete', function () {
    var model = testutils.create_model();
    var table = testutils.create_table(model);

    testutils.execute_command(model, databasy.model.core.commands.DeleteTable, {
        table_id: table.id()
    });
    ok(!model.exists(table.id()));
    deepEqual(model.val('tables'), []);
});