databasy.utils.preloader.openPreloader = function(hideAll) {
    if (databasy.utils.preloader._preloader !== undefined) {
        return
    }
    var opacity;
    if (hideAll) {
        opacity = 100;
    } else {
        opacity = 50;
    }
    databasy.utils.preloader._preloader = $.modal('', {
        opacity: opacity,
        overlayCss: {background: "#fff"},
        containerCss: {
            background: 'transparent url("/static/src/css/databasy/loading.gif")',
            zIndex: 1002,
            height: 64,
            width: 64
        }
    });
};

databasy.utils.preloader.closePreloader = function() {
    $.modal.close();
    databasy.utils.preloader._preloader = undefined;
};