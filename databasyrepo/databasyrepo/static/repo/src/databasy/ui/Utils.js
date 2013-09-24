databasy.ui.utils.delegateContextMenu = function(fromFigure, toFigure) {
    fromFigure.onContextMenu = $.proxy(toFigure.onContextMenu, toFigure);
};
databasy.ui.utils.delegateDoubleClick = function(fromFigure, toFigure) {
    fromFigure.onDoubleClick = $.proxy(toFigure.onDoubleClick, toFigure);
};
databasy.ui.utils.delegateMouseEnter = function(fromFigure, toFigure) {
    fromFigure.onMouseEnter = $.proxy(toFigure.onMouseEnter, toFigure);
};
databasy.ui.utils.delegateMouseLeave = function(fromFigure, toFigure) {
    fromFigure.onMouseLeave = $.proxy(toFigure.onMouseLeave, toFigure);
};