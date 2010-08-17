/**
 * insert image for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-image", function(KE) {
    var S = KISSY,
        Node = S.Node,
        DOM = S.DOM,
        Event = S.Event,
        Overlay = KE.SimpleOverlay;

    function ImageInserter(cfg) {
        ImageInserter.superclass.constructor.call(this, cfg);
        this._init();
    }

    var TripleButton = KE.TripleButton,html = "<div class='ke-popup-wrap' style='width:250px;padding:10px;'>" +
        "<p style='margin:0 0 10px'><label>请输入图片地址：<br/>" +
        "<input value='http://' style='width: 250px;' class='ke-img-url'/>" +
        "</label></p>" +
        "<p>" +
        "<button class='ke-img-insert'>插入</button>&nbsp;<a href='#' class='ke-img-cancel'>取消</a>" +
        "</p>" +
        "</div>";

    ImageInserter.ATTRS = {
        editor:{}
    };

    S.extend(ImageInserter, S.Base, {
        _init:function() {
            var editor = this.get("editor"),toolBarDiv = editor.toolBarDiv;

            this.el = new TripleButton({
                contentCls:"ke-toolbar-image",
                //text:"img",
                title:"图像",
                container:toolBarDiv
            });

            this.el.on("offClick", this.show, this);
            KE.Utils.lazyRun(this, "_prepare", "_real");

        },
        _prepare:function() {
            var self = this,editor = this.get("editor");
            this.content = new Node(html);
            this.d = new Overlay({
                el:this.content
            });
            document.body.appendChild(this.content[0]);
            var cancel = this.content.one(".ke-img-cancel"),ok = this.content.one(".ke-img-insert");
            this.imgUrl = this.content.one(".ke-img-url");
            cancel.on("click", function(ev) {
                this.d.hide();
                ev.halt();
            }, this);
            Event.on(document, "click", this.hide, this);
            Event.on(editor.document, "click", this.hide, this);
            ok.on("click", function() {
                self._insert();
            });
        },
        hide:function(ev) {
            var self = this;

            if (DOM._4e_ascendant(ev.target, function(node) {
                return node[0] === self.content[0] || node[0] === self.el.el[0];
            }, true))return;
            this.d.hide();
        },
        _real:function() {
            var xy = this.el.el.offset();
            xy.top += this.el.el.height() + 5;
            console.log(this.content.width(),xy.left,DOM.viewportWidth() );
            if (xy.left + this.content.width() > DOM.viewportWidth()-60) {
                xy.left = DOM.viewportWidth() - this.content.width()-60;
            }
            this.d.show(xy);
        },
        _insert:function() {
            var editor = this.get("editor");
            var url = this.imgUrl.val();
            if (!url) return;
            var img = new Node("<img src='" + url + "'/>", null, editor.document);
            editor.insertElement(img);
            this.d.hide();
        },
        show:function() {
            this._prepare();
        }
    });

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new ImageInserter({
            editor:editor
        });

    });

});