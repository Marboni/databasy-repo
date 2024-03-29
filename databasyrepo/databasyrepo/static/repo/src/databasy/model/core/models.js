databasy.model.core.models.Model = databasy.model.core.nodes.Node.extend({
    init: function () {
        this._super();

        this.set('nodes', []);
        this.set('canvases', []);
        this.set('tables', []);

        this._node_register = {};
    },
    fields: function () {
        return this._super().concat(
            'model_id',
            'version',

            'nodes',
            'canvases',
            'tables',

            'revision_stack'
        )
    },
    checkers: function () {
        return [
        ]
    },
    set_nodes: function (value) {
        this.f['nodes'] = [];
        for (var i = 0; i < value.length; i++) {
            var node = value[i];
            this.register(node);
        }
    },
    version: function () {
        return this.val('version');
    },
    revision_stack: function () {
        return this.val('revision_stack');
    },
    register: function (node) {
        var node_id = node.id();
        if (this.exists(node_id)) {
            throw new Error('Node with ID ' + node_id + ' already exists in register.');
        }
        this._node_register[node_id] = node;
        this.val('nodes').push(node);
    },
    unregister: function (node_id) {
        var node = this.node(node_id);
        delete this._node_register[node_id];
        var nodes = this.val('nodes');
        var index = $.inArray(node, nodes);
        nodes.splice(index, 1);
        return node;
    },
    node: function (node_id, cls) {
        if (!this.exists(node_id)) {
            throw new Error('Node with ID ' + node_id + ' not exists in register.');
        }
        var node = this._node_register[node_id];
        if (cls !== undefined && !(node instanceof cls)) {
            throw new Error('Node with ID ' + node_id + ' has incorrect type.');
        }
        return node;
    },
    exists: function (node_id) {
        return this._node_register.hasOwnProperty(node_id);
    },
    execute_command: function (command, user_id) {
        var events = command.execute(this);
        var regular = !(command instanceof databasy.model.core.commands.Undo) && !(command instanceof databasy.model.core.commands.Redo);
        this.revision_stack().add(user_id, events, regular);
        return events;
    },

    deserialize: function (serialized_object) {
        this._super(serialized_object);
        this.revision_stack().inject_model(this);
    }
}, {
    CODE: "core.models.Model",
    createModel: function (model_id) {
        if (model_id === undefined) {
            throw new Error('model_id undefined.')
        }

        var model = new databasy.model.core.models.Model();

        model.set('model_id', model_id);

        model.set('version', 0);

        var revision_stack = new databasy.model.core.models.RevisionStack();
        revision_stack.inject_model(model);
        model.set('revision_stack', revision_stack);

        var canvas = new databasy.model.core.reprs.Canvas();
        canvas.set('name', 'Default');
        model.register(canvas);
        model.append_item('canvases', canvas.ref());

        model.set('version', 1);

        return model
    }
});

databasy.model.core.models.Revision = databasy.model.core.serializing.Serializable.extend({
    fields: function () {
        return this._super().concat(
            'source_version',
            'events'
        )
    }
}, {
    CODE: 'core.models.Revision'
});

databasy.model.core.models.RevisionStack = databasy.model.core.serializing.Serializable.extend({
        init: function (params) {
            this._super(params);

            this.set('revisions', []);
            this.set('undoable', []);
            this.set('redoable', []);

            this.versions_and_revisions = {};
        },
        fields: function () {
            return this._super().concat(
                'revisions',
                'undoable',
                'redoable'
            )
        },
        inject_model: function (model) {
            this._model = model;
        },
        set_revisions: function (value) {
            this.f['revisions'] = [];
            for (var i = value.length - 1; i >= 0; i--) {
                this._add_revision(value[i]);
            }
        },
        add: function (user_id, events, regular) {
            var revision = this._create_revision(events);
            this._add_revision(revision);

            if (regular) {
                this.val('undoable').unshift(this._model.version());
                this.set('redoable', []);
                this._control_size();
            }

            this._model.set('version', this._model.version() + 1);
        },

        can_undo: function () {
            return this.val('undoable').length > 0;
        },

        undo: function () {
            var undoable = this.val('undoable');
            var redoable = this.val('redoable');

            if (undoable.length == 0) {
                return null;
            }

            var revision_version = undoable.shift();
            redoable.unshift(revision_version);

            var revision_events = this.versions_and_revisions[revision_version].val('events');
            var undo_actions = [];
            for (var i = revision_events.length - 1; i >= 0; i--) {
                undo_actions.push(revision_events[i].undo_action())
            }
            return undo_actions;
        },

        can_redo: function () {
            return this.val('redoable').length > 0;
        },

        redo: function () {
            var undoable = this.val('undoable');
            var redoable = this.val('redoable');

            if (redoable.length == 0) {
                return null;
            }

            var revision_version = redoable.shift();
            undoable.unshift(revision_version);

            var revision_events = this.versions_and_revisions[revision_version].val('events');
            var redo_actions = [];
            for (var i = 0; i < revision_events.length; i++) {
                redo_actions.push(revision_events[i].do_action())
            }
            return redo_actions;
        },

        _create_revision: function (events) {
            var revision = new databasy.model.core.models.Revision();
            revision.set('source_version', this._model.version());
            revision.set('events', events);
            return revision;
        },
        _add_revision: function (revision) {
            this.val('revisions').unshift(revision);
            this.versions_and_revisions[revision.val('source_version')] = revision;
        },
        _remove_revision: function (revision) {
            var source_version = revision.val('source_version');
            delete this.versions_and_revisions[source_version];
            var revisions = this.val('revisions');
            revisions.splice($.inArray(revision, revisions), 1);
        },
        _control_size: function () {
            var undoable = this.val('undoable');
            var redoable = this.val('redoable');

            if (undoable.length > this.constructor.MAX_UNDO_ITEMS) {
                undoable.pop();
            }

            var revisions = this.val('revisions');
            for (var i = revisions.length - 1; i >= 0; i--) {
                var revision = revisions[i];
                var source_version = revision.val('source_version');

                if (this._model.version() - source_version > this.constructor.MAX_HISTORY_ITEMS &&
                    $.inArray(source_version, undoable) == -1 && $.inArray(source_version, redoable) == -1) {
                    this._remove_revision(revision);
                }
            }
        }
    },
    {
        CODE: 'core.models.RevisionStack',
        MAX_UNDO_ITEMS: 20,
        MAX_HISTORY_ITEMS: 20
    });