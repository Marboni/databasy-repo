databasy.ui.general.OverviewPanel = Class.extend({
    init:function () {
        this.overviewPanel = $('#overviewPanel');
        this.createZoomPanel();
        this.createOverviewPanel();
    },

    createZoomPanel:function () {
        var zoomPanel = $('<div id="zoomPanel"/>').css({
            width:30,
            height:148,
            position: 'relative',
            float:'right'
        });
        this.overviewPanel.append(zoomPanel);

        // Zoom In.
        this.zoomInBtn = $('<button id="zoomInBtn" class="btn btn-mini"><i class="icon-plus14"></i></button>').css({
            position: 'absolute',
            top:1,
            right:1
        });
        zoomPanel.append(this.zoomInBtn);

        // Spinner.
        this.zoomSlider = $('<input id="zoomSlider"/>');
        zoomPanel.append(this.zoomSlider);

        this.zoomSlider.slider({
            max:190,
            step:10,
            min:10,
            value:databasy.gw.layout.canvas.diagram.scale * 100,
            orientation:'vertical',
            selection:'none',
            tooltip: 'hide'
        });

        zoomPanel.find('.slider').css({
            position: 'absolute',
            height:86,
            top:31,
            right:5
        });
        zoomPanel.find('.slider-handle').css({
            marginLeft:-3,
            marginTop:-8,
            borderRadius:16,
            height:16,
            width:16
        });

        // Zoom Out.
        this.zoomOutBtn = $('<button id="zoomOutBtn" class="btn btn-mini"><i class="icn icon-minus14"></i></button>').css({
            position: 'absolute',
            bottom:1,
            right:1
        });
        zoomPanel.append(this.zoomOutBtn);


        this.addListeners();
    },

    addListeners: function() {
        var that = this;
        var diagram = databasy.gw.layout.canvas.diagram;

        var setScale = function(newScale) {
            if (diagram.scale != newScale) {
                diagram.scale = newScale;
            }
        };

        var changeScale = function(diff) {
            diagram.scale = diagram.scale + diff;
        };

        this.zoomInBtn.click(function() {
            changeScale(0.1);
        });

        this.zoomSlider.on('slide', function(e) {
            var newScale = (200 - e.value) / 100;
            setScale(newScale);
        });

        diagram.addDiagramListener('ViewportBoundsChanged', function(e) {
            var sliderValue = 200 - diagram.scale * 100;
            that.zoomSlider.slider('setValue', sliderValue);
        });

        this.zoomOutBtn.click(function() {
            changeScale(-0.1);
        });
    },

    createOverviewPanel:function () {
        var overviewDiagramPanel = $('<div id="overviewDiagram"/>').css({
            height:146,
            overflow: 'hidden',
            border: '1px solid #f0f8ff'
        });
        this.overviewPanel.append(overviewDiagramPanel);

        var overviewDiagram = new go.Overview('overviewDiagram');
        overviewDiagram.observed = databasy.gw.layout.canvas.diagram;
    }
});
