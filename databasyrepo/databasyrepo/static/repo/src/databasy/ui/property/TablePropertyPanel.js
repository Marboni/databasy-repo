databasy.ui.property.TablePropertyPanel = databasy.ui.property.BasePropertyPanel.extend({
    init: function(elementId, pillIndex) {
        this.createColumnsPanel();
        this.createIndexesPanel();
        this.createForeignKeysPanel();
        this.createExtraQueriesPanel();

        this._super(elementId, pillIndex);
    },

    createTitlePanel:function () {
        this._super();

        var icon = $('<i class="icon-table16"></i>').css({
            float:'left',
            margin:'8px 0'
        });
        this.titlePanel.append(icon);

        var that = this;
        this.tableLabel = $('<input type="text"></input>').css({
                fontWeight:'bold'
            }
        ).keyup(function (e) {
                if (e.keyCode == 13) {
                    $(this).blur();
                }
            }
        ).blur(function () {
                databasy.service.renameTable(that.elementId, $(this).val())
            }
        );
        this.titlePanel.append(this.tableLabel);
    },

    createColumnsPanel: function() {
        this.columnsPanel = $('<div id="columnsPanel">Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br>Columns panel</br></div>');
    },

    createIndexesPanel: function() {
        this.indexesPanel = $('<div id="indexesPanel">Indexes panel</div>');
    },

    createForeignKeysPanel: function() {
        this.foreignKeysPanel = $('<div id="foreignKeysPanel">Foreign keys panel</div>');
    },

    createExtraQueriesPanel: function() {
        this.extraQueriesPanel = $('<div id="extraQueriesPanel">Extra queries panel</div>');
    },

    render:function () {
        var table = databasy.gw.model.node(this.elementId);
        this.tableLabel.val(table.val('name'));
    },

    navPillItems:function () {
        return {
            'Columns':this.columnsPanel,
            'Indexes':this.indexesPanel,
            'Foreign Keys':this.foreignKeysPanel,
            'Extra Queries':this.extraQueriesPanel
        };
    },

    onModelChanged:function (event) {
        this._super(event);

        var modelEvent = event.modelEvent;

        if (event.isPropertyChangedByNodeId(this.elementId, 'name')) {
            // Table renamed.
            var newName = modelEvent.val('new_value');
            this.tableLabel.val(newName);
        }
    }
});