databasy.ui.utils.delegateContextMenu = function(fromFigure, toFigure) {
    fromFigure.onContextMenu = $.proxy(toFigure.onContextMenu, toFigure);
};
databasy.ui.utils.delegateDoubleClick = function(fromFigure, toFigure) {
    fromFigure.onDoubleClick = $.proxy(toFigure.onDoubleClick, toFigure);
};