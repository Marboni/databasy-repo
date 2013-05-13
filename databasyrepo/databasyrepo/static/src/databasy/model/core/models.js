databasy.model.core.models.Model = databasy.model.core.nodes.Node.extend({
    init:function () {
        this._super();
        this._node_register = {};
    },
    fields:function () {
        return this._super().concat(
            'model_id',
            'version',

            'nodes',
            'canvases',
            'tables',

            'revision_stack'
        )
    },
    commands:function () {
        return [
            databasy.model.core.commands.CreateTable,
            databasy.model.core.commands.MoveTableRepr
        ]
    },
    checkers:function () {
        return [
        ]
    },
    set_nodes:function (value) {
        this.f['nodes'] = [];
        for (var i = 0; i < value.length; i++) {
            var node = value[i];
            this.register(node);
        }
    },
    version:function () {
        return this.val('version');
    },
    revision_stack:function () {
        return this.val('revision_stack');
    },
    register:function (node) {
        var node_id = node.id();
        if (this.exists(node_id)) {
            throw new Error('Node with ID ' + node_id + ' already exists in register.');
        }
        this._node_register[node_id] = node;
        this.val('nodes').push(node);
    },
    unregister:function (node_id) {
        var node = this.node(node_id);
        delete this._node_register[node_id];
        var nodes = this.val('nodes');
        var index = $.inArray(node, nodes);
        nodes.splice(index, 1);
    },
    node:function (node_id, cls) {
        if (!this.exists(node_id)) {
            throw new Error('Node with ID ' + node_id + ' not exists in register.');
        }
        var node = this._node_register[node_id];
        if (cls !== undefined && !(node instanceof cls)) {
            throw new Error('Node with ID ' + node_id + ' has incorrect type.');
        }
        return node;
    },
    exists:function (node_id) {
        return this._node_register.hasOwnProperty(node_id);
    },
    execute_command:function (command) {
        var events = command.execute(this);
        this.revision_stack().add(1, events, true); // TODO User ID
    },
    deserialize:function (serialized_object) {
        this._super(serialized_object);
        this.revision_stack().inject_model(this);
    }
});

databasy.model.core.models.Revision = databasy.model.core.serializing.Serializable.extend({
    fields:function () {
        return this._super().concat(
            'source_version',
            'events'
        )
    }
}, {
    CODE:'core.models.Revision'
});

databasy.model.core.models.RevisionStack = databasy.model.core.serializing.Serializable.extend({
        init:function (params) {
            this._super(params);
            this.versions_and_revisions = {};
        },
        fields:function () {
            return this._super().concat(
                'revisions',
                'undoable',
                'redoable'
            )
        },
        inject_model:function (model) {
            this._model = model;
        },
        set_revisions:function (value) {
            this.f['revisions'] = [];
            for (var i = value.length - 1; i >= 0; i--) {
                this._add_revision(value[i]);
            }
        },
        add:function (user_id, events, regular) {
            var revision = this._create_revision(events);
            this._add_revision(revision);

            if (regular) {
                this.val('undoable').unshift(this._model.version() + 1);
                this.set('redoable', []);
                this._control_size();
            }

            this._model.set('version', this._model.version() + 1);
        },
        _create_revision:function (events) {
            var revision = new databasy.model.core.models.Revision();
            revision.set('source_version', this._model.version());
            revision.set('events', events);
            return revision;
        },
        _add_revision:function (revision) {
            this.val('revisions').unshift(revision);
            this.versions_and_revisions[revision.val('source_version')] = revision;
        },
        _remove_revision:function (revision) {
            var source_version = revision.val('source_version');
            delete this.versions_and_revisions[source_version];
            var revisions = this.val('revisions');
            revisions.splice($.inArray(revision, revisions), 1);
        },
        _control_size:function () {
            var undoable = this.val('undoable');
            var redoable = this.val('redoable');

            if (undoable.length > this.constructor.MAX_UNDO_ITEMS) {
                undoable.pop();
            }

            var revisions = this.val('revisions');
            for (var i = revisions.length - 1; i <= 0; i--) {
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
        CODE:'core.models.RevisionStack',
        MAX_UNDO_ITEMS:20,
        MAX_HISTORY_ITEMS:20
    });