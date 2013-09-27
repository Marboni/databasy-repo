databasy.ui.widget.InplaceEditor = draw2d.ui.LabelEditor.extend({
    NAME:"databasy.ui.widget.InplaceEditor",

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
        var canvasWrapper = $('#canvasWrapper');

        body.bind("click", this.commitCallback);

        this.html = $('<input id="inplaceeditor">');
        if (this.label.bold) {
            this.html.css('font-weight', 'bold');
        }
        this.html.css('font-family', this.label.font);
        this.html.css('font-size', this.label.fontSize + 'px');
        this.html.css('width', this.label.getParent().width + 'px');
        this.html.css('height', this.label.fontSize + 'pt');
        this.html.val(text);
        this.html.hide();

        canvasWrapper.append(this.html);

        this.html.autoResize({animate:true});

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

        var bb = this.label.getBoundingBox();
        bb.translate(-1, -1);
        bb.resize(2, 2);

        this.html.css({position:"absolute", top:bb.y, left:bb.x});
        this.html.fadeIn($.proxy(function () {
            this.html.focus();
        }, this));
        this.html.select();

        var that = this;
        canvasWrapper.scroll(function() {
            var bb = that.label.getBoundingBox();
            var inplaceEditor = $('#inplaceeditor');

            var left = bb.x;
            var top = bb.y;

            inplaceEditor.css({position:"absolute", top:top, left:left});
        });
    },

    commit:function () {
        this.html.unbind("blur", this.commitCallback);
        $("body").unbind("click", this.commitCallback);
        var labelWidget = this.label.getParent();
        var text = this.html.val();
        if (!(labelWidget.restoreTextWhenEmpty && text === "")) {
            labelWidget.setText(text);
        }
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