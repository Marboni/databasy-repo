databasy.ui.gojs.DiagramModel = Class.extend({
    init:function (diagram) {
        this.diagram = diagram;
        this.model = diagram.model;

        this._dataByReprId = {};
        this._tableDataByColumnElementId = {};
    },

    startTransaction:function () {
        this.diagram.startTransaction('tx');
    },

    commitTransaction:function () {
        this.diagram.commitTransaction('tx');
    },

    cursorViewPosition: function() {
        return this.diagram.lastInput.viewPoint;
    },

    cursorDocPosition: function() {
        return this.diagram.transformViewToDoc(this.cursorViewPosition())
    },

    select: function(reprId) {
        var node = this.diagram.findNodeForKey(reprId);
        if (!node) {
            throw new Error('Repr ID ' + reprId + ' not exists in the diagram.');
        }
        this.diagram.select(node);
    },

    selectedPartKeys: function() {
        var selectedKeys = [];
        var selectionIt = this.diagram.selection.iterator;
        while(selectionIt.next()) {
            var part = selectionIt.value;
            selectedKeys.push(part.data.key);
        }
        return selectedKeys;
    },

    setReadOnly:function (readOnly) {
        if (this.diagram.isReadOnly === readOnly) {
            return;
        }

        this.diagram.isReadOnly = readOnly;

        var canvasWrapper = $('#canvasWrapper');
        if (readOnly) {
            canvasWrapper.addClass('readonly');
        } else {
            canvasWrapper.removeClass('readonly');
        }

        var selectionIt = this.diagram.selection.iterator;
        while (selectionIt.next()) {
            selectionIt.value.updateAdornments();
        }
    },

    startTableNameEditing: function(tableReprId) {
//        var table = this.diagram.findNodeForKey(tableReprId);
//        if (table) {
//            var textEditingTool = this.diagram.toolManager.textEditingTool;
//            textEditingTool.textBlock = table.findObject('titleLabel');
//            textEditingTool.doActivate();
//        }
        // TODO
    },

    createTable:function (tableReprId, name, width, position) {
        var data = {
            key:tableReprId,
            name:name,
            position:position,
            width:width,
            hasOpenDiscussions:false,
            columns:[],
            category:'table'
        };

        if (this._dataExists(tableReprId)) {
            throw new Error('Table with repr ID ' + tableReprId + ' already exists in the diagram.');
        }

        this.model.addNodeData(data);
        this._dataByReprId[tableReprId] = data;
    },

    updateTable:function (tableReprId, props) {
        this._update(tableReprId, props);
    },

    deleteTable:function (tableReprId) {
        var data = this._findData(tableReprId);
        this.model.removeNodeData(data);

        var that = this;
        if (data.columns) {
            $.each(data.columns, function (i, column) {
                delete that._tableDataByColumnElementId[column.elementId];
            })
        }
        delete this._dataByReprId[tableReprId];
    },

    addColumn:function (tableReprId, columnElementId, icon, name, type) {
        var tableData = this._findData(tableReprId);
        var index = tableData.columns.length;
        this.insertColumn(tableReprId, index, columnElementId, icon, name, type);
    },

    insertColumn:function (tableReprId, index, columnElementId, icon, name, type) {
        this._validateColumnIcon(icon);

        var columnData = {
            elementId:columnElementId,
            icon:icon,
            name:name,
            hasOpenDiscussions:false,
            type:type
        };

        var tableData = this._findData(tableReprId);

        this.model.insertArrayItem(tableData.columns, index, columnData);
        this.model.updateTargetBindings(tableData, 'columns');

        this._tableDataByColumnElementId[columnElementId] = tableData;
    },

    moveColumn:function (columnElementId, newIndex) {
        var tableData = this._findTableDataByColumnElementId(columnElementId);
        var columnIndex = this._columnIndex(tableData, columnElementId);
        var columnData = tableData.columns[columnIndex];
        this.model.removeArrayItem(tableData.columns, columnIndex);
        this.model.insertArrayItem(tableData.columns, newIndex, columnData);
    },

    updateColumn:function (columnElementId, props) {
        if ('icon' in props) {
            this._validateColumnIcon(props.icon);
        }
        var tableData = this._findTableDataByColumnElementId(columnElementId);
        var columnIndex = this._columnIndex(tableData, columnElementId);
        var columnData = tableData.columns[columnIndex];
        for (var prop in props) {
            columnData[prop] = props[prop];
        }
        this.model.removeArrayItem(tableData.columns, columnIndex);
        this.model.insertArrayItem(tableData.columns, columnIndex, columnData);
    },

    deleteColumn:function (columnElementId) {
        var tableData = this._findTableDataByColumnElementId(columnElementId);
        var columnIndex = this._columnIndex(tableData, columnElementId);
        this.model.removeArrayItem(tableData.columns, columnIndex);
        this.model.updateTargetBindings(tableData, 'columns');
        delete this._tableDataByColumnElementId[columnElementId];
    },

    createView:function (viewReprId, name, width, position) {
        var data = {
            key:viewReprId,
            name:name,
            position:position,
            width:width,
            hasOpenDiscussions:false,
            category:'view'
        };

        if (this._dataExists(viewReprId)) {
            throw new Error('Repr ID ' + viewReprId + ' already exists in the diagram.');
        }

        this.model.addNodeData(data);

        this._dataByReprId[viewReprId] = data;
    },

    updateView:function (viewReprId, props) {
        this._update(viewReprId, props);
    },

    deleteView:function (viewReprId) {
        var data = this._findData(viewReprId);
        this.model.removeNodeData(data);
        delete this._dataByReprId[viewReprId];
    },

    createRelationship:function (relReprId, fromTableReprId, fromCardinality, fromColumnElementIds, toTableReprId, toCardinality, toColumnElementIds) {
        var data = {
            key:relReprId,
            from:fromTableReprId,
            fromCardinality:fromCardinality,
            fromColumnElementIds:fromColumnElementIds,
            to:toTableReprId,
            toCardinality:toCardinality,
            toColumnElementIds:toColumnElementIds,
            hasOpenDiscussions:false
        };

        if (this._dataExists(relReprId)) {
            throw new Error('Relationship with repr ID ' + relReprId + ' already exists in the diagram.');
        }

        this.model.addLinkData(data);

        this._dataByReprId[relReprId] = data;
    },

    updateRelationship:function (relReprId, props) {
        this._update(relReprId, props);
    },

    deleteRelationship:function (relReprId) {
        var data = this._findData(relReprId);
        this.model.removeLinkData(data);
        delete this._dataByReprId[relReprId];
    },

    _findData:function (reprId) {
        var data = this._dataByReprId[reprId];
        if (!data) {
            throw new Error('Repr ID ' + reprId + ' not exists in the diagram.');
        }
        return data;
    },

    _findTableDataByColumnElementId:function (columnElementId) {
        var data = this._tableDataByColumnElementId[columnElementId];
        if (!data) {
            throw new Error('Column with ID ' + columnElementId + ' not exists in the diagram.');
        }
        return data;
    },

    _dataExists:function (reprId) {
        return !!this._dataByReprId[reprId];
    },

    _update:function (reprId, props) {
        var data = this._findData(reprId);
        for (var prop in props) {
            this.model.setDataProperty(data, prop, props[prop]);
        }
    },

    _columnIndex:function (tableData, columnElementId) {
        for (var i = 0; i < tableData.columns.length; i++) {
            if (tableData.columns[i].elementId == columnElementId) {
                return i;
            }
        }
        throw new Error('Column with ID ' + columnElementId + ' exists in registry, but not found in the diagram\'s table.');
    },

    _validateColumnIcon:function (icon) {
        if ($.inArray(icon, databasy.ui.gojs.DiagramModel.COLUMN_ICONS) == -1) {
            throw new Error('Incorrect column icon: ' + icon + '.');
        }
    }
}, {
    COLUMN_ICONS:['pk', 'null', 'not_null', 'fk_null', 'fk_not_null']
});
