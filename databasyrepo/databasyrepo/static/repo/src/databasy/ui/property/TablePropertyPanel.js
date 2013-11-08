databasy.ui.property.TablePropertyPanel = Class.extend({
    init:function (tableId) {
        this.tableId = tableId;

        this.createPanel();

        databasy.gw.addListener(this);

        this.setEditable(databasy.gw.runtime.isEditor());
    },

    createPanel:function () {
        this.panel = $('<div class="tableProperties"></div>');
        this.createTitlePanel();

        $('#propertyPanel').append(this.panel);

        this.render();
    },

    render: function() {
        var table = databasy.gw.model.node(this.tableId);
        this.setName(table.val('name'));
    },

    createTitlePanel:function () {
        this.titlePanel = $('<div class="titlePanel"></div>');
        this.panel.append(this.titlePanel);

        this.name = $('<span class="name"></span>');
        var that = this;
        this.bindEditor(this.name, function (value) {
            databasy.service.renameTable(that.tableId, value);
        });
        this.titlePanel.append(this.name);
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

    setName: function(name) {
        this.name.text(name);
    },

    setEditable:function (editable) {
        if (editable) {
            this.panel.removeClass('readonly');
            this.name.editable('enable');
        } else {
            this.panel.addClass('readonly');
            this.name.editable('disable');
        }
    },

    onRuntimeChanged:function (event) {
        var editable = event.runtime.isEditor();
        this.setEditable(editable);
    },

    onModelChanged:function (event) {
        var modelEvent = event.modelEvent;
        var eventTypes = databasy.model.core.events;

        if (event.matches(eventTypes.PropertyChanged, {node_id:this.tableId, field:'name'})) {
            // Table name changed.
            this.setName(modelEvent.val('new_value'));
        }
    },

    destroy:function () {
        databasy.gw.removeListener(this);
    }
});