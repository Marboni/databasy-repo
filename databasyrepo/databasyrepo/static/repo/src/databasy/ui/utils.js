databasy.ui.utils.executeSequentially = function (functions) {
    if (functions.length == 0) {
        return;
    }
    setTimeout(function () {
        functions[0]();
        functions.splice(0, 1);
        databasy.ui.utils.executeSequentially(functions);
    }, 0);
};

databasy.ui.utils.initContextMenu = function () {
    var canvas = databasy.gw.layout.canvas;
    var diagram = canvas.diagram;
    var diagramModel = databasy.gw.layout.canvas.diagramModel;
    var diagramContextMenuTool = diagram.toolManager.contextMenuTool;

    var body = $('body');

    body.append(
        '<div id="contextMenu" class="dropdown">' +
            '    <ul id="contextMenuItems" class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu" ' +
            '        style="display:block;"></ul>' +
            '</div>'
    );

    var contextMenuItems = $("#contextMenuItems");

    // --- Menu actions ---
    var clearMenuItems = function () {
        contextMenuItems.empty();
    };

    var addMenuItem = function (idPrefix, name, onClick) {
        var item = $('<li id="' + idPrefix + 'CmItem"><a tabindex="-1" href="#">' + name + '</a></li>');
        contextMenuItems.append(item);

        item.click(onClick);
    };

    var disableMenuItem = function (idPrefix) {
        $('#' + idPrefix + 'CmItem').addClass('disabled');
    };

    var renameMenuItem = function (idPrefix, name) {
        $('#' + idPrefix + 'CmItem').find('a').text(name);
    };

    var addMenuDivider = function () {
        contextMenuItems.append('<li class="divider"></li>');
    };

    var openMenu = function () {
        var contextMenu = $('#contextMenu');

        contextMenuItems.css('position', 'static'); // To be able to calculate width and height.

        var canvasWrapperOffset = $('#canvasWrapper').offset();
        var cursorViewPosition = diagramModel.cursorViewPosition();

        var menuLeft = canvasWrapperOffset.left + cursorViewPosition.x;
        var menuTop = canvasWrapperOffset.top + cursorViewPosition.y;

        var menuWidth = contextMenu.width();
        var menuHeight = contextMenu.height();

        var menuRight = menuLeft + menuWidth;
        var menuBottom = menuTop + menuHeight;

        var doc = $(document);
        var docWidth = doc.width();
        var docHeight = doc.height();

        if (docWidth < menuRight) {
            menuLeft = menuLeft - menuWidth;
        }
        if (docHeight < menuBottom) {
            menuTop = menuTop - menuHeight;
        }

        contextMenuItems.css('position', 'absolute');

        contextMenu.css({
            display:'block',
            left:menuLeft,
            top:menuTop
        });
        return contextMenu;
    };

    var closeMenu = function () {
        $('#contextMenu').hide();
    };

    // --- Menu actions end ---

    var openDiagramMenu = function () {
        if (databasy.gw.runtime.isEditor()) {
            var model = databasy.gw.model;
            var cursorDocPosition = diagramModel.cursorDocPosition();
            var selectedPartCount = diagramModel.selectedPartCount();
            var part = diagramModel.findPartAt(cursorDocPosition);
            // Repr under cursor.
            var targetRepr = part != null ? model.node(part.data.key) : null;

            clearMenuItems();

            if (targetRepr == null) {
                // Background context menu.

                diagramModel.unselectAll();
                selectedPartCount = 0;

                addMenuItem('createTable', 'Create table', function () {
                    var position = [Math.round(cursorDocPosition.x), Math.round(cursorDocPosition.y)];
                    var tableInfo = databasy.service.createTable(canvas.canvasId, position);
                    diagramModel.startTransaction();
                    diagramModel.select(tableInfo.reprId);
                    diagramModel.startTableNameEditing(tableInfo.reprId);
                    diagramModel.commitTransaction();

                    databasy.gw.layout.propertyPanel.show(tableInfo.elementId);
                });
            } else if (selectedPartCount == 1) {
                // Context menu for single item.

                if (targetRepr instanceof databasy.model.core.reprs.TableRepr) {
                    var table = targetRepr.val_as_node('table', model);
                    var index = 0;

                    var column = null;
                    var dataPanel = diagramModel.findDataPanelAt(cursorDocPosition);
                    if (dataPanel != null && dataPanel.data.entity == 'column') {
                        column = model.node(dataPanel.data.key);
                        index = table.item_index('columns', column) + 1;
                    }

                    addMenuItem('createColumn', 'Create column', function () {
                        var columnId = databasy.service.createColumn(table.id(), index);
                        diagramModel.startTransaction();
                        diagramModel.startColumnEditing(columnId);
                        diagramModel.commitTransaction();
                    });

                    if (column) {
                        addMenuItem('deleteColumn', 'Delete column "' + column.val('name') + '"', function () {
                            databasy.service.deleteColumn(column.id());
                        });
                    }
                }
            }

            // Common context menu.
            addMenuItem('delete', 'Delete', function () {
                databasy.service.deleteReprElements(diagramModel.selectedPartKeys());
            });

            // Menu modifications.
            if (selectedPartCount == 0) {
                disableMenuItem('delete');
            } else if (selectedPartCount == 1) {
                if (targetRepr instanceof databasy.model.core.reprs.TableRepr) {
                    renameMenuItem('delete', 'Delete table "' + targetRepr.val_as_node('table', model).val('name') + '"');
                }
            } else {
                renameMenuItem('delete', 'Delete (' + selectedPartCount + ' items)');
            }

            openMenu();
            return true;
        } else {
            return false;
        }
    };

    body.click(function () {
        diagramContextMenuTool.stopTool();
    });

    body.on('contextmenu', function () {
        if (diagramContextMenuTool.currentContextMenu != null) {
            closeMenu();
            openDiagramMenu();
            return false;
        }
        return true;
    });

    diagramContextMenuTool.showContextMenu = function (contextmenu, obj) {
        var opened = openDiagramMenu();
        if (opened) {
            diagramContextMenuTool.currentContextMenu = $('contextMenu');
        } else {
            diagramContextMenuTool.stopTool();
        }
    };

    diagramContextMenuTool.hideContextMenu = function (contextmenu, obj) {
        closeMenu();
        diagramContextMenuTool.currentContextMenu = null;
    };
};
