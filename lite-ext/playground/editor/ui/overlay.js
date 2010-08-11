/**
 * simple overlay for kissy editor
 * @author yiminghe@gmail.com

 */
KISSYEDITOR.add("kissy-editor-overlay", function(KE) {

    var S = KISSY,Node = S.Node,
        DOM = S.DOM;

    /**
     * !TODO 有空改做重写方式
     * Overlay.create,初始化后重写掉
     */
    function Overlay() {

        Overlay.init && Overlay.init();

        var self = this;
        Overlay.superclass.constructor.apply(self, arguments);
        self._init();

        if (S.UA.ie === 6) {

            self.on("show", function() {
                var el = self.get("el");
                var bw = parseInt(el.css("width")),
                    bh = el[0].offsetHeight;
                d_iframe.css({
                    width: bw + "px",
                    height: bh + "px"
                });
                d_iframe.offset(self.get("el").offset());

            });
            self.on("hide", function() {
                d_iframe.offset({
                    left:-999,
                    top:-999
                });
            });
        }
        if (self.get("mask")) {
            self.on("show", function() {
                mask.css({"left":"0px","top":"0px"});
                if (S.UA.ie == 6)mask_iframe.css({"left":"0px","top":"0px"});
            });
            self.on("hide", function() {
                mask.css({"left":"-9999px",top:"-9999px"});
                if (S.UA.ie == 6)mask_iframe.css({"left":"-9999px",top:"-9999px"});
            });
        }
        self.hide();
    }

    Overlay.ATTRS = {
        title:{value:""},
        width:{value:"450px"},
        visible:{value:true},
        mask:{value:false}
    };

    S.extend(Overlay, S.Base, {
        _init:function() {
            //just manage container
            var self = this,el = self.get("el");

            self.on("afterVisibleChange", function(ev) {
                var v = ev.newVal;
                if (v) {
                    if (typeof v == "boolean") {
                        self.center();
                    } else el.offset(v);
                    self.fire("show");
                } else {
                    el.css({"left":"-9999px",top:"-9999px"});
                    self.fire("hide");
                }
            });

            if (el) {
                //焦点管理，显示时用a获得焦点
                el[0].appendChild(new Node("<a href='#' class='ke-focus' " +
                    "style='" +
                    "width:0;height:0;outline:none;font-size:0;'" +
                    "></a>")[0]);
                return;
            }

            //also gen html
            el = new Node("<div class='ke-dialog' style='width:" +
                self.get("width") +
                "'><div class='ke-hd clearfix'>" +
                "<div class='ke-hd-title'><h1>" +
                self.get("title") +
                "</h1></div>"
                + "<div class='ke-hd-x'><a class='ke-close' href='#'>X</a></div>"
                + "</div>" +
                "<div class='ke-bd'></div>" +
                "<div class='ke-ft'>" +
                "<a href='#' class='ke-focus'></a>" +
                "</div>" +
                "</div>");
            document.body.appendChild(el[0]);
            self.set("el", el);
            self.el = el;
            self.body = el.one(".ke-bd");
            self._close = el.one(".ke-close");
            self._title = el.one(".ke-hd-title").one("h1");
            self.on("titleChange", function(ev) {
                self._title.html(ev.newVal);
            });
            self.on("widthChange", function(ev) {
                self.el.css("width", ev.newVal);
            });
            self._close.on("click", function(ev) {
                ev.preventDefault();
                self.hide();
            });
        },
        center:function() {
            var el = this.get("el");
            var bw = parseInt(el.css("width")),
                bh = el[0].offsetHeight;
            var vw = DOM.viewportWidth(),
                vh = DOM.viewportHeight();
            var bl = (vw - bw) / 2 + DOM.scrollLeft(),
                bt = (vh - bh) / 2 + DOM.scrollTop();
            el.css({
                left: bl + "px",
                top: bt + "px"
            });
        }
        ,show:function(v) {
            var el = this.get("el");
            this.set("visible", v || true);
            el.one(".ke-focus")[0].focus();
        }
        ,hide:function() {
            var el = this.get("el");
            this.set("visible", false);
            el.one(".ke-focus")[0].blur();
        }
    });

    var mask ,loading, mask_iframe,d_iframe;

    Overlay.init = function() {
        d_iframe = new Node("<iframe class='ke-dialog-iframe'></iframe>");
        document.body.appendChild(d_iframe[0]);
        mask = new Node("<div class=\"ke-mask\">&nbsp;</div>");
        mask.css({"left":"-9999px",top:"-9999px"});
        mask.css({
            "width": "100%",
            "height": S.DOM.docHeight() + "px",
            "opacity": 0.4
        });

        mask.appendTo(document.body);
        if (S.UA.ie == 6) {
            mask_iframe = new Node("<iframe class='ke-mask'></iframe>");
            mask_iframe.css({"left":"-9999px",top:"-9999px"});
            mask_iframe.css({
                "width": "100%",
                "height": S.DOM.docHeight() + "px",
                "opacity": 0.4
            });
            mask_iframe.appendTo(document.body);
        }
        loading = new Node("<div class='ke-loading'>" +
            "loading ...." +
            "</div>");
        loading.appendTo(document.body);
        Overlay.init = null;
        Overlay.loading = new Overlay({el:loading,mask:true});
    };
    KE.SimpleOverlay = Overlay;

});