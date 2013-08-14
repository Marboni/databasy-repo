databasy.ui.layout.property.TablePropertyPanel = Class.extend({
    init:function (gateway, table) {
        this.gateway = gateway;
        this.gateway.addListener(this);

        this.table = table;

        this.createPanel();

        this.setEditable(this.gateway.runtime.isEditor());
    },

    createPanel:function () {
        this.panel = $('<div class="tableProperties"></div>');
        $('#propertyPanel').append(this.panel);

        this.createTitle();
    },

    createTitle:function () {
        var that = this;

        this.titlePanel = $('<div class="titlePanel"></div>');
        this.panel.append(this.titlePanel);

        this.title = $('<span class="title">' + this.table.val('name') + '</span>');
        this.bindEditor(this.title, function (value) {
            var command = new databasy.model.core.commands.RenameTable({
                table_id:that.table.id(),
                new_name:value
            });
            that.gateway.executeCommand(command);
        });
        this.titlePanel.append(this.title);
    },

    bindEditor:function (domNode, callback) {
        domNode.addClass('editable');
        domNode.editable(function (value, settings) {
            callback(value);
        }, {
            width:'100px',
            select: true
        })
    },

    setEditable:function (editable) {
        if (editable) {
            this.title.editable('enable');
        } else {
            this.title.editable('disable');
        }
    },

    onRuntimeChanged:function (event) {
        var editable = event.runtime.isEditor();
        this.setEditable(editable);
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        if (modelEvent instanceof databasy.model.core.events.PropertyChanged &&
            modelEvent.val('node_id') === this.table.id() &&
            modelEvent.val('field') === 'name') {
            // Table name changed.
            var newName = modelEvent.val('new_value');
            this.title.text(newName);
        }
    },

    destroy:function () {
        this.gateway.removeListener(this);
    }
});