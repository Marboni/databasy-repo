(function () {
    var defaults = {
        resizable:false,
        closable:false,
        spacing_open:5,
        spacing_closed:5
    };
    $('body').layout({
        applyDefaultStyles: true,
        defaults: defaults,
        north: {
            paneSelector: '#menuPanel',
            size: 40
        },
        east: {
            paneSelector: '#chatPanel',
            closable:true
        },
        west: {
            paneSelector: '#propertyPanel',
            closable:true
        },
        center: {
            paneSelector: '#contentPanel',
            childOptions:{
                applyDefaultStyles: true,
                defaults:defaults,
                west: {
                    paneSelector:"#toolbox",
                    spacing_open:1,
                    spacing_closed:1,
                    size: 30
                },
                center: {
                    paneSelector:"#canvas"
                }
            }
        }
    });
})();