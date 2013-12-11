test('history_tests : test_undo_redo', function () {
    var model = testutils.create_model();

    // v1 - Empty model.
    var nodes_v1 = model.copy().val('nodes');

    testutils.create_table(model);

    // v2 - Model with table.
    var nodes_v2 = model.copy().val('nodes');

    testutils.execute_command(model, databasy.model.core.commands.Undo);

    // v3 = v1 - Empty model.
    deepEqual(nodes_v1, model.val('nodes'));

    testutils.execute_command(model, databasy.model.core.commands.Redo);

    // v4 = v2 - Model with table.
    deepEqual(nodes_v2, model.val('nodes'))
});

//def test_undo_redo(self):
//        model = create_model()
//        # v1 - Empty model.
//        canvas = default_canvas(model)
//
//        nodes_v1 = model.copy().val('nodes')
//
//        execute_command(model, CreateTable,
//            table_id=str(uuid4()),
//            default_table_repr_id=str(uuid4()),
//            name='Table',
//            canvas_id=canvas.id,
//            position=[1, 2]
//        )
//        # v2 - Model with table.
//        nodes_v2 = model.copy().val('nodes')
//
//        with self.assertRaises(IllegalCommand):
//            # Nothing to redo.
//            execute_command(model, Redo)
//
//        execute_command(model, Undo)
//        # v3 = v1 - Empty model.
//        self.assertEqual(nodes_v1, model.val('nodes'))
//
//        with self.assertRaises(IllegalCommand):
//            # Nothing to undo.
//            execute_command(model, Undo)
//
//        execute_command(model, Redo)
//        # v4 = v2 - Model with table.
//        self.assertEqual(nodes_v2, model.val('nodes'))