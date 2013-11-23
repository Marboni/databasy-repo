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

    var renameMenuItem = function(idPrefix, name) {
        $('#' + idPrefix + 'CmItem').find('a').text(name);
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
            clearMenuItems();
            addMenuItem('createTable', 'Create Table', function () {
                var cursorDocPosition = diagramModel.cursorDocPosition();
                var tableInfo = databasy.service.createTable(canvas.canvasId, [cursorDocPosition.x, cursorDocPosition.y]);
                diagramModel.startTransaction();
                diagramModel.select(tableInfo.reprId);
                diagramModel.startTableNameEditing(tableInfo.reprId);
                diagramModel.commitTransaction();
            });
            addMenuItem('delete', 'Delete', function () {
                var selectedReprIds = diagramModel.selectedPartKeys();
                $.each(selectedReprIds, function (i, reprId) {
                    var selectedNode = databasy.gw.model.node(reprId);
                    if (selectedNode instanceof databasy.model.core.reprs.TableRepr) {
                        databasy.service.deleteTable(selectedNode.val('table').ref_id());
                    }
                });
            });

            var selectedPartCount = diagramModel.selectedPartKeys().length;
            if (selectedPartCount == 0) {
                disableMenuItem('delete');
            } else if (selectedPartCount > 1) {
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
