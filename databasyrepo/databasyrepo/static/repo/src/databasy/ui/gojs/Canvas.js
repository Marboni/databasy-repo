databasy.ui.gojs.Canvas = Class.extend({
    init:function (domElementId) {
        databasy.gw.addListener(this);

        this.canvasId = this.getDefaultCanvasNode().id();

        this.initGo(domElementId);
        this.renderFigures();

        this.diagramModel.setReadOnly(true);
    },

    initGo:function (domElementId) {
        this.diagram = new go.Diagram(domElementId);
        this.diagram.initialContentAlignment = go.Spot.Center;
        this.diagram.padding = 300;

        var templates = new databasy.ui.gojs.Templates();
        this.diagram.contextMenu = templates.contextMenuTemplate();
        this.diagram.nodeTemplateMap = templates.createNodeTemplateMap();
        this.diagram.linkTemplateMap = templates.createLinkTemplateMap();

        this.diagramModel = new databasy.ui.gojs.DiagramModel(this.diagram);

        this.addDiagramActionHandlers();
    },

    renderFigures:function () {
        var that = this;
        var functions = [];

        var canvas = databasy.gw.model.node(this.canvasId);
        var reprs = canvas.val_as_node('reprs', databasy.gw.model);
        $.each(reprs, function (index, repr) {
            functions.push($.proxy(that.renderFigure, that, repr));
        });

        functions.push(function () {
            databasy.gw.layout.canvasInitialized = true;
        });

        databasy.ui.utils.executeSequentially(functions);
    },

    renderFigure:function (repr) {
        var code = repr.code();
        switch (code) {
            case databasy.model.core.reprs.TableRepr.CODE:
                this.renderTable(repr);
                break;
            default:
                throw new Error('Unknown representation code.')
        }
    },

    renderTable:function (tableRepr) {
        var model = databasy.gw.model;

        var tableReprId = tableRepr.id();
        var tableId = tableRepr.val('table').ref_id();
        var table = model.node(tableId);

        this.diagramModel.startTransaction();

        this.diagramModel.createTable(tableReprId, table.val('name'), tableRepr.val('width'), tableRepr.val('position'));
        var columns = table.val_as_node('columns', model);
        $.each(columns, $.proxy(function (i, column) {
            this.diagramModel.addColumn(tableReprId, column.id(), 'null', column.val('name'), column.val('type'))
        }, this));

        this.diagramModel.commitTransaction();
    },

    getDefaultCanvasNode:function () {
        var model = databasy.gw.model;
        return model.val_as_node('canvases', model)[0]
    },

    findTableRepr:function (tableId) {
        var model = databasy.gw.model;
        var canvas = model.node(this.canvasId);

        var foundRepr = null;
        $.each(canvas.val_as_node('reprs', model), function (i, repr) {
            if (repr instanceof databasy.model.core.reprs.TableRepr && repr.val('table').ref_id() === tableId) {
                foundRepr = repr;
                return false;
            }
            return true;
        });
        return foundRepr;
    },

    onModelChanged:function (event) {
        var diagramModel = this.diagramModel;
        var modelEvent = event.modelEvent;
        var model = databasy.gw.model;

        if (event.isNodeItemInserted(this.canvasId, 'reprs')) {
            this.renderFigure(modelEvent.val('item').ref_node(model));

        } else if (event.isNodeTypePropertyChanged(databasy.model.core.reprs.TableRepr, 'width', model)) {
            diagramModel.startTransaction();
            diagramModel.updateTable(modelEvent.val('node_id'), {
                width:modelEvent.val('new_value')
            });
            diagramModel.commitTransaction();

        } else if (event.isNodeTypePropertyChanged(databasy.model.core.reprs.TableRepr, 'position', model)) {
            diagramModel.startTransaction();
            diagramModel.updateTable(modelEvent.val('node_id'), {
                position:modelEvent.val('position')
            });
            diagramModel.commitTransaction();

        } else if (event.isNodeTypePropertyChanged(databasy.model.core.elements.Table, 'name', model)) {
            //noinspection JSDuplicatedDeclaration
            var tableRepr = this.findTableRepr(modelEvent.val('node_id'));
            if (tableRepr == null) {
                return;
            }
            diagramModel.startTransaction();
            diagramModel.updateTable(tableRepr.id(), {name:modelEvent.val('new_value')});
            diagramModel.commitTransaction();

        } else if (event.isNodeItemDeleted(this.canvasId, 'reprs')) {
            var reprRef = modelEvent.val('item');
            diagramModel.startTransaction();
            if (reprRef.ref_code() == databasy.model.core.reprs.TableRepr.CODE) {
                diagramModel.deleteTable(reprRef.ref_id());
            }
            diagramModel.commitTransaction();

        } else if (event.isNodeTypeItemInserted(databasy.model.core.elements.Table, 'columns', model)) {
            var tableReprId = this.findTableRepr(modelEvent.val('node_id')).id();
            var column = modelEvent.val('item').ref_node(model);
            var index = modelEvent.val('index');
            diagramModel.startTransaction();
            diagramModel.insertColumn(tableReprId, index, column.id(), 'null', column.val('name'), column.val('type'));
            diagramModel.commitTransaction();

        } else if (event.isNodeTypePropertyChanged(databasy.model.core.elements.Column, 'name', model)) {
            diagramModel.startTransaction();
            diagramModel.updateColumn(modelEvent.val('node_id'), {name:modelEvent.val('new_value')});
            diagramModel.commitTransaction();

        } else if (event.isNodeTypePropertyChanged(databasy.model.core.elements.Column, 'type', model)) {
            diagramModel.startTransaction();
            diagramModel.updateColumn(modelEvent.val('node_id'), {type:modelEvent.val('new_value')});
            diagramModel.commitTransaction();

        } else if (event.isNodeTypeItemDeleted(databasy.model.core.elements.Table, 'columns', model)) {
            var tableId = modelEvent.val('node_id');
            //noinspection JSDuplicatedDeclaration
            var tableRepr = this.findTableRepr(tableId);
            if (tableRepr) {
                var columnRef = modelEvent.val('item');
                diagramModel.startTransaction();
                diagramModel.deleteColumn(columnRef.ref_id());
                diagramModel.commitTransaction();
            }
        }
    },

    onRuntimeChanged:function (event) {
        var rt = event.runtime;
        var editable = rt.isEditor();

        this.diagramModel.setReadOnly(!editable);
    },

    addDiagramActionHandlers: function() {
        this.diagram.addDiagramListener('PartResized', function (diagramEvent) {
            if (!databasy.gw.runtime.isEditor()) {
                return;
            }
            var part = diagramEvent.subject;
            var data = part.data;
            switch (data.entity) {
                case 'table':
                {
                    databasy.service.updateTableReprWidth(data.key, part.width);
                    break;
                }
            }
        });

        this.diagram.addDiagramListener('SelectionMoved', function (diagramEvent) {
            if (!databasy.gw.runtime.isEditor()) {
                return;
            }
            var movedPartsIt = diagramEvent.diagram.selection.iterator;
            while (movedPartsIt.next()) {
                var part = movedPartsIt.value;
                var position = part.position;
                var data = part.data;
                switch (data.entity) {
                    case 'table':
                    {
                        databasy.service.updateTableReprPosition(data.key, Math.round(position.x), Math.round(position.y));
                        break;
                    }
                }
            }
        });

        this.diagram.addDiagramListener('TextEdited', $.proxy(function (diagramEvent) {
            var editedTextBlock = diagramEvent.subject;
            var newValue = $.trim(editedTextBlock.text);
            var data = this.diagramModel.findData(editedTextBlock);
            switch (data.entity) {
                case 'table':
                {
                    var tableReprId = data.key;
                    var tableRepr = databasy.gw.model.node(tableReprId);
                    var tableId = tableRepr.val('table').ref_id();
                    databasy.service.renameTable(tableId, newValue);
                    break;
                }
                case 'column':
                {
                    var columnId = data.key;

                    var firstSpaceIndex = newValue.indexOf(' ');
                    if (firstSpaceIndex == -1) {
                        throw new Error('Column label doesn\'t contain field type.');
                    } else {
                        databasy.service.updateColumn(columnId, {
                            name:newValue.substr(0, firstSpaceIndex),
                            type:newValue.substr(firstSpaceIndex + 1)
                        });
                    }
                }
            }
        }, this));

        // Redirect mouse clicks to toolbar to execute actions of currently selected tool..
        var toolbar = databasy.gw.layout.toolbar;
        this.diagram.click = $.proxy(toolbar.handleClick, toolbar);

        // Select text in in-place editor on opening.
        $('#canvasWrapper').on('focus', '.start', function () {
            $(this).select();
        })
    }
});