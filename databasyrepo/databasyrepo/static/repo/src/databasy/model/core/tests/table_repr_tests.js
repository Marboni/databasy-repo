test('table_repr_tests : test_create', function () {
    var model = testutils.create_model();
    var canvas = testutils.default_canvas(model);

    var table_id = databasy.model.utils.uuid();
    var table_repr_id = databasy.model.utils.uuid();

    // Can't create table without repr, so creating table, then removing repr to initialize test.
    testutils.execute_command(model, databasy.model.core.commands.CreateTable, {
        table_id: table_id,
        default_table_repr_id: table_repr_id,
        name: 'Table',
        canvas_id: canvas.id(),
        position: [1, 2]
    });

    testutils.execute_command(model, databasy.model.core.commands.DeleteTableRepr, {
        table_repr_id: table_repr_id
    });

    var reprs = canvas.val_as_node('reprs', model);
    equal(reprs.length, 0);

    table_repr_id = databasy.model.utils.uuid();
    testutils.execute_command(model, databasy.model.core.commands.CreateTableRepr, {
        table_repr_id: table_repr_id,
        canvas_id: canvas.id(),
        table_id: table_id,
        position: [10, 20]
    });

    var table_repr = model.node(table_repr_id, databasy.model.core.reprs.TableRepr);
    deepEqual(table_repr.val_as_node('table', model).id(), table_id);
    deepEqual(table_repr.val('position'), [10, 20]);
    deepEqual(table_repr.val('width'), databasy.model.core.reprs.TableRepr.DEFAULT_REPR_WIDTH);

    reprs = canvas.val_as_node('reprs', model);
    equal(reprs.length, 1);
    equal(reprs[0].id(), table_repr_id);
});

test('table_repr_tests : test_update', function () {
    var model = testutils.create_model();
    testutils.create_table(model);

    var table_repr = testutils.query_node(model, {_code: databasy.model.core.reprs.TableRepr.CODE});

    // Position.
    testutils.execute_command(model, databasy.model.core.commands.UpdateTableRepr, {
        table_repr_id: table_repr.id(),
        fields: ['position'],
        position: [10, 20]
    });
    deepEqual([10,20], table_repr.val('position'));

    // Width.
    testutils.execute_command(model, databasy.model.core.commands.UpdateTableRepr, {
        table_repr_id: table_repr.id(),
        fields: ['width'],
        width: 200
    });
    deepEqual(200, table_repr.val('width'));
});

test('table_repr_tests : test_delete', function () {
    var model = testutils.create_model();
    testutils.create_table(model);

    var canvas = testutils.default_canvas(model);
    var table_repr = testutils.query_node(model, {_code: databasy.model.core.reprs.TableRepr.CODE});

    var reprs = canvas.val_as_node('reprs', model);
    deepEqual(reprs.length, 1);
    ok(reprs[0].id(), table_repr.id());

    testutils.execute_command(model, databasy.model.core.commands.DeleteTableRepr, {
        table_repr_id: table_repr.id()
    });

    reprs = canvas.val_as_node('reprs', model);
    deepEqual(reprs.length, 0);
    ok(!model.exists(table_repr.id()));
});

test('table_repr_tests : test_impact', function () {
    var model = testutils.create_model();
    var canvas = testutils.default_canvas(model);
    var table = testutils.create_table(model);

    var table_repr = testutils.query_node(model, {_code: databasy.model.core.reprs.TableRepr.CODE});
    deepEqual(canvas.val('reprs').length, 1);

    // Remove repr if table removed.
    testutils.execute_command(model, databasy.model.core.commands.DeleteTable, {
        table_id: table.id()
    });

    deepEqual(canvas.val('reprs').length, 0);
    ok(!model.exists(table_repr.id()));
});