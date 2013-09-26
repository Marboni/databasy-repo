databasy.ui.utils.delegateContextMenu = function(fromFigure, toFigure) {
    databasy.ui.utils.delegate('onContextMenu', fromFigure, toFigure);
};
databasy.ui.utils.delegateDoubleClick = function(fromFigure, toFigure) {
    databasy.ui.utils.delegate('onDoubleClick', fromFigure, toFigure);
};
databasy.ui.utils.delegateMouseEnter = function(fromFigure, toFigure) {
    databasy.ui.utils.delegate('onMouseEnter', fromFigure, toFigure);
};
databasy.ui.utils.delegateMouseLeave = function(fromFigure, toFigure) {
    databasy.ui.utils.delegate('onMouseLeave', fromFigure, toFigure);
};

databasy.ui.utils.delegate = function(func, fromFigure, toFigure) {
    if (!fromFigure.hasOwnProperty(func)) {
        fromFigure[func] = $.proxy(toFigure[func], toFigure);
    }
};