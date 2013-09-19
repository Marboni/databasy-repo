databasy.ui.widgets.InplaceEditor = draw2d.ui.LabelEditor.extend({
    NAME:"databasy.ui.widgets.InplaceEditor",

    init:function (listener) {
        this._super();
        this.listener = $.extend({
            onCommit:function () {
            },
            onCancel:function () {
            }
        }, listener);
    },

    start:function (label) {
        if (!databasy.gw.runtime.isEditor()) {
            return;
        }

        this.label = label;
        var text = label.getParent().getText();

        this.commitCallback = $.proxy(this.commit, this);

        var body = $("body");
        body.bind("click", this.commitCallback);

        this.html = $('<input id="inplaceeditor">');
        this.html.val(text);
        this.html.hide();

        body.append(this.html);

        this.html.autoResize({animate:false});

        this.html.bind("keyup", $.proxy(function (e) {
            switch (e.which) {
                case 13:
                    this.commit();
                    break;
                case 27:
                    this.cancel();
                    break;
            }
        }, this));

        this.html.bind("blur", this.commitCallback);

        this.html.bind("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
        });

        this.label.setText(text);

        var canvas = this.label.getCanvas();
        var bb = this.label.getBoundingBox();

        bb.setPosition(canvas.fromCanvasToDocumentCoordinate(bb.x, bb.y));

        var scrollDiv = canvas.getScrollArea();
        if (scrollDiv.is(body)) {
            bb.translate(canvas.getScrollLeft(), canvas.getScrollTop());
        }

        bb.translate(-1, -1);
        bb.resize(2, 2);

        this.html.css({position:"absolute", top:bb.y, left:bb.x, "min-width":bb.w, height:bb.h});
        this.html.fadeIn($.proxy(function () {
            this.html.focus();
        }, this));
        this.html.select();
    },

    commit:function () {
        this.html.unbind("blur", this.commitCallback);
        $("body").unbind("click", this.commitCallback);
        var text = this.html.val();
        this.label.getParent().setText(text);
        this.html.fadeOut($.proxy(function () {
            this.html.remove();
            this.html = null;
            this.listener.onCommit(text);
        }, this));
    },

    cancel:function () {
        this.html.unbind("blur", this.commitCallback);
        $("body").unbind("click", this.commitCallback);
        this.html.fadeOut($.proxy(function () {
            this.html.remove();
            this.html = null;
            this.listener.onCancel();
        }, this));
    }
});