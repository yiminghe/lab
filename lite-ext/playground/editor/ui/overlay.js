/**
 * simple overlay for kissy editor
 * @author yiminghe@gmail.com

 */
KISSYEDITOR.add("kissy-editor-overlay", function(KE) {

    var S = KISSY,Node = S.Node,
        DOM = S.DOM;


    function Overlay() {
        var self = this;
        Overlay.superclass.constructor.apply(this, arguments);
        this._init();
        var body = new Node(document.body);
        if (S.UA.ie === 6) {
            var iframe = new Node("<iframe class='ke-dialog-iframe'></iframe>");
            body[0].appendChild(iframe[0]);
            this.on("show", function() {
                var el = this.get("el");
                var bw = parseInt(el.css("width")),
                    bh = el[0].offsetHeight;
                iframe.css({
                    width: bw + "px",
                    height: bh + "px"
                });
                iframe.offset(self.get("el").offset());

            }, this);
            this.on("hide", function() {
                iframe.offset({
                    left:-999,
                    top:-999
                });
            }, this);
        }
        if (this.get("mask")) {
            this.on("show", function() {
                mask.css({"left":"0px","top":"0px"});
            }, this);
            this.on("hide", function() {
                mask.css({"left":"-9999px",top:"-9999px"});
            }, this);
        }
    }

    Overlay.ATTRS = {
        title:{value:""},
        width:{value:"450px"},
        visible:{value:false},
        mask:{value:false}
    };

    S.extend(Overlay, S.Base, {
        _init:function() {
            //just manage container
            var el = this.get("el");

            this.on("afterVisibleChange", function(ev) {
                var v = ev.newVal;
                if (v) {
                    if (typeof v == "boolean")this.center();
                    else el.offset(v);
                    this.fire("show");
                } else {
                    el.css({"left":"-9999px",top:"-9999px"});
                    this.fire("hide");
                }
            }, this);

            if (el) {
                //焦点管理，显示时用a获得焦点
                el[0].appendChild(new Node("<a href='#' class='ke-focus' " +
                    "style='" +
                    "width:0;height:0;outline:none;font-size:0;'" +
                    "></a>")[0]);
                return;
            }

            //also gen html
            var el = new Node("<div class='ke-dialog' style='width:" +
                this.get("width") +
                "'><div class='ke-hd clearfix'>" +
                "<div class='ke-hd-title'><h1>" +
                this.get("title") +
                "</h1></div>"
                + "<div class='ke-hd-x'><a class='ke-close' href='#'>X</a></div>"
                + "</div>" +
                "<div class='ke-bd'></div>" +
                "<div class='ke-ft'>" +
                "<a href='#' class='ke-focus'></a>" +
                "</div>" +
                "</div>");
            document.body.appendChild(el[0]);
            this.set("el", el);
            this.body = el.one(".ke-bd");
            this._close = el.one(".ke-close");
            this._title = el.one(".ke-hd-title").one("h1");
            this.on("titleChange", function(ev) {
                this._title.html(ev.newVal);
            }, this);
            this.on("widthChange", function(ev) {
                this.el.css("width", ev.newVal);
            }, this);
            this._close.on("click", function(ev) {
                ev.preventDefault();
                this.hide();
            }, this);
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
            window.focus();
            el.one(".ke-focus")[0].focus();
        }
        ,hide:function() {
            this.set("visible", false);
        }
    });

    var mask = new Node("<div class=\"ke-mask\">&nbsp;</div>");
    S.ready(function() {
        mask.css({"left":"-9999px",top:"-9999px"});
        mask.css({
            "width": "100%",
            "height": S.DOM.docHeight() + "px",
            "opacity": 0.4
        });
        mask.appendTo(document.body);
        var loading = new Node("<div class='ke-loading'>" +
            "loading ...." +
            "</div>");
        loading.appendTo(document.body);
        Overlay.loading = new Overlay({el:loading,mask:true});
    });

    KE.SimpleOverlay = Overlay;
});