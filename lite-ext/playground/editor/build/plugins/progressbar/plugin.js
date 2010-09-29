KISSY.Editor.add("progressbar", function() {
    var S = KISSY,KE = S.Editor;
    if (KE.ProgressBar) return;

    (function() {
        var DOM = S.DOM,Node = S.Node;
        DOM.addStyleSheet("" +
            "" +
            ".ke-progressbar {" +
            "border:1px solid #8F8F73;" +
            "position:relative;" +
            "margin-left:auto;margin-right:auto;" +
            "}" +
            "" +
            ".ke-progressbar-inner {" +
            "background-color:#4f8ed2;" +
            "height:100%;" +
            "}" +
            "" +
            ".ke-progressbar-title {" +
            "width:30px;" +
            "top:0;" +
            "left:50%;" +
            "position:absolute;" +
            "}" +
            "", "ke_progressbar");
        function ProgressBar() {
            ProgressBar.superclass.constructor.apply(this, arguments);
            this._init();
        }

        ProgressBar.ATTRS = {
            container:{},
            width:{},
            height:{},
            //0-100
            progress:{value:0}
        };
        S.extend(ProgressBar, S.Base, {
            destroy:function() {
                var self = this;
                self.detach();
                self.el._4e_remove();
            },
            _init:function() {
                var self = this,el = new Node("<div" +
                    " class='ke-progressbar' " +
                    "style='width:" + self.get("width") + ";" +
                    "height:"
                    + self.get("height") + ";'" +
                    ">"),
                    container = self.get("container"),
                    p = new Node("<div class='ke-progressbar-inner'>").appendTo(el),
                    title = new Node("<span class='ke-progressbar-title'>").appendTo(el);
                if (container)
                    el.appendTo(container);
                self.el = el;
                self._title = title;
                self._p = p;
                self.on("afterProgressChange", self._progressChange, self);
                self._progressChange({newVal:self.get("progress")});
            },

            _progressChange:function(ev) {
                var self = this,v = ev.newVal;
                //console.log("_progressChange:" + v);
                self._p.css("width", v + "%");
                self._title.html(v + "%");
            }
        });
        KE.ProgressBar = ProgressBar;
    })();

});