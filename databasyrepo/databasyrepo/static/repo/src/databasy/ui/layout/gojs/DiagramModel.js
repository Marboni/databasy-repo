databasy.ui.layout.gojs.DiagramModel = Class.extend({
    init: function(diagram) {
        this.diagram = diagram;

        this._tableDataByReprId = {};
        this._tableDataByColumnElementId = {};
    },


    createTable: function(tableReprId, name, position, width) {
        var data = {
            key: tableReprId,
            name: name,
            position: position,
            width: width,
            columns: [],
            category: 'table'
        };

        if (this._tableDataExists(tableReprId)) {
            throw new Error('Table with repr ID ' + tableReprId + ' already exists in the diagram.');
        }

        this._inTransaction(function(model) {
            model.addNodeData(data);
        });

        this._tableDataByReprId[tableReprId] = data;
    },

    modifyTable: function(tableReprId, props) {
        var data = this._findTableData(tableReprId);
        this._inTransaction(function(model) {
            for (var prop in props) {
                model.setDataProperty(data, prop, props[prop]);
            }
        });
    },

    removeTable: function(tableReprId) {
        var data = this._findTableData(tableReprId);
        this._inTransaction(function(model) {
            model.removeNodeData(data);
        });

        var that = this;
        if (data.columns) {
            $.each(data.columns, function(i, column) {
                delete that._tableDataByColumnElementId[column.elementId];
            })
        }
        delete this._tableDataByReprId[tableReprId];
    },

    addColumn: function(tableReprId, columnElementId, icon, name, type) {
        var tableData = this._findTableData(tableReprId);
        var index = tableData.columns.length;
        this.insertColumn(tableReprId, index, columnElementId, icon, name, type);
    },

    insertColumn: function(tableReprId, index, columnElementId, icon, name, type) {
        this._validateColumnIcon(icon);

        var columnData = {
            elementId: columnElementId,
            icon: icon,
            name: name,
            type: type
        };

        var tableData = this._findTableData(tableReprId);

        this._inTransaction(function(model) {
            model.insertArrayItem(tableData.columns, index, columnData);
        });

        this._tableDataByColumnElementId[columnElementId] = tableData;
    },

    moveColumn: function(columnElementId, newIndex) {
        var tableData = this._findTableDataByColumnElementId(columnElementId);
        var columnIndex = this._columnIndex(tableData, columnElementId);
        var columnData = tableData.columns[columnIndex];
        this._inTransaction(function(model) {
            model.removeArrayItem(tableData.columns, columnIndex);
            model.insertArrayItem(tableData.columns, newIndex, columnData);
        });
    },

    modifyColumn: function(columnElementId, props) {
        if ('icon' in props) {
            this._validateColumnIcon(props.icon);
        }
        var tableData = this._findTableDataByColumnElementId(columnElementId);
        var columnIndex = this._columnIndex(tableData, columnElementId);
        var columnData = tableData.columns[columnIndex];
        for (var prop in props) {
            columnData[prop] = props[prop];
        }
        this._inTransaction(function(model) {
            model.removeArrayItem(tableData.columns, columnIndex);
            model.insertArrayItem(tableData.columns, columnIndex, columnData);
        });
    },

    removeColumn: function(columnElementId) {
        var tableData = this._findTableDataByColumnElementId(columnElementId);
        var columnIndex = this._columnIndex(tableData, columnElementId);
        this._inTransaction(function(model) {
            model.removeArrayItem(tableData.columns, columnIndex);
        });
        delete this._tableDataByColumnElementId[columnElementId];
    },

    _findTableData: function(reprId) {
        var data = this._tableDataByReprId[reprId];
        if (!data) {
            throw new Error('Table with repr ID ' + reprId + ' not exists in the diagram.');
        }
        return data;
    },

    _findTableDataByColumnElementId: function(columnElementId) {
        var data = this._tableDataByColumnElementId[columnElementId];
        if (!data) {
            throw new Error('Column with ID ' + columnElementId + ' not exists in the diagram.');
        }
        return data;
    },

    _columnIndex: function(tableData, columnElementId) {
        for (var i = 0; i < tableData.columns.length; i++) {
            if (tableData.columns[i].elementId == columnElementId) {
                return i;
            }
        }
        throw new Error('Column with ID ' + columnElementId + ' exists in registry, but not found in the diagram\'s table.');
    },

    _tableDataExists: function(reprId) {
        return !!this._tableDataByReprId[reprId];
    },

    _validateColumnIcon: function(icon) {
        if ($.inArray(icon, databasy.ui.layout.gojs.DiagramModel.COLUMN_ICONS) == -1) {
            throw new Error('Incorrect column icon: ' + icon + '.');
        }
    },

    _inTransaction: function(func) {
        this.diagram.startTransaction('tx');
        func(this.diagram.model);
        this.diagram.commitTransaction('tx');
    }
}, {
    COLUMN_ICONS: ['pk', 'null', 'not_null', 'fk_null', 'fk_not_null']
});
