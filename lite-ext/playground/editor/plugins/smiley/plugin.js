/**
 * smiley icon from wangwang for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-smiley", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        Event = S.Event,
        Node = S.Node,
        Overlay = KE.SimpleOverlay,
        TripleButton = KE.TripleButton,
        smiley_markup = "<div class='ke-popup-wrap'>" +
            "<div class='ke-smiley-sprite'>";

    for (var i = 0; i <= 98; i++) {
        smiley_markup += "<a href='#' data-icon='http://a.tbcdn.cn/sys/wangwang/smiley/48x48/" + i + ".gif'></a>"
    }

    smiley_markup += "</div></div>";

    function Smiley(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(Smiley, {
        _init:function() {
            var self = this,editor = self.editor;
            self.el = new TripleButton({
                //text:"smiley",
                contentCls:"ke-toolbar-smiley",
                title:"插入表情",
                container:editor.toolBarDiv
            });
            self.el.on("offClick", this._show, this);
            KE.Utils.lazyRun(this, "_prepare", "_real");
        },
        _hidePanel:function(ev) {
            var self = this,t = ev.target;
            //多窗口管理
            if (DOM._4e_ascendant(ev.target, function(node) {
                return  node[0] === self.el.el[0];
            }))return;

            this.smileyWin.hide();
        },
        _selectSmiley:function(ev) {
            ev.halt();
            var self = this,editor = self.editor;
            var t = ev.target,icon;
            if (DOM._4e_name(t) == "a" && (icon = DOM.attr(t, "data-icon"))) {
                var img = new Node("<img src='" + icon + "'/>", null, editor.document);
                editor.insertElement(img);
                editor.focus();
                this.smileyWin.hide();
            }
        },
        _prepare:function() {
            var self = this,editor = self.editor;
            this.smileyPanel = new Node(smiley_markup);
            this.smileyWin = new Overlay({
                el:this.smileyPanel,
                mask:false
            });
            document.body.appendChild(this.smileyPanel[0]);
            this.smileyPanel.on("click", this._selectSmiley, this);
            Event.on(document, "click", this._hidePanel, this);
            Event.on(editor.document, "click", this._hidePanel, this);
        },
        _real:function() {
            var xy = this.el.el.offset();
            xy.top += this.el.el.height() + 5;
            if (xy.left + this.smileyPanel.width() > DOM.viewportWidth()-60) {
                xy.left = DOM.viewportWidth() - this.smileyPanel.width()-60;
            }
            this.smileyWin.show(xy);
        },
        _show:function(ev) {
            var self = this;
            self._prepare(ev);
        }
    });

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new Smiley(editor);
    });
});