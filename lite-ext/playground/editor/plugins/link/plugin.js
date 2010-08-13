/**
 * link editor support for kissy editor ,innovation from google doc and ckeditor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-link", function(KE) {
    var S = KISSY,
        DOM = S.DOM,
        Event = S.Event,
        TripleButton = KE.TripleButton,
        KEStyle = KE.Style,
        Node = S.Node,
        KERange = KE.Range,
        Overlay = KE.SimpleOverlay ,
        dataProcessor = KE.HtmlDataProcessor,
        //htmlFilter = dataProcessor && dataProcessor.htmlFilter,
        dataFilter = dataProcessor && dataProcessor.dataFilter;

    dataFilter && dataFilter.addRules({
        elements : {
            a:function(element) {
                for (var a in element.attributes) {
                    if (a == "href" || a == "target") continue;
                    delete element.attributes[a];
                }
            }
        }
    });


    var link_Style = {
        element : 'a',
        attributes:{
            "href":"#(href)",
            target:"#(target)"
        }
    };


    function Link(editor) {
        this.editor = editor;
        this._init();
    }


    /**
     * 所有编辑器实例共享同一功能窗口
     */
    Link.init = function() {
        var self = this;
        self.d = new Overlay({
            title:"编辑超链接",
            mask:true,
            width:"300px"
        });
        self.d.body.html(html);
        self.urlEl = self.d.body.one(".ke-link-url");
        self.targetEl = self.d.body.one(".ke-link-blank");
        var cancel = self.d.body.one(".ke-link-cancel");
        self.ok = self.d.body.one(".ke-link-ok");
        Link.ok.on("click", function(ev) {
            var link = Link.d.link;
            link._link();
            ev.halt();
        }, this);
        cancel.on("click", function(ev) {
            self.d.hide();
            ev.halt();
        }, self);
        Link.init = null;
    };
    /**
     * tip初始化，所有共享一个tip
     */
    var tipHtml = '<div class="ke-bubbleview-bubble" onmousedown="return false;">前往链接： '
        + ' <a href="" '
        + ' target="_blank" class="ke-bubbleview-url"></a> - '
        + '    <span class="ke-bubbleview-link ke-bubbleview-change">编辑</span> - '
        + '    <span class="ke-bubbleview-link ke-bubbleview-remove">去除</span>'
        + '</div>';
    Link.tip = function() {
        var el = new Node(tipHtml);
        el._4e_unselectable();
        this.tipwin = new Overlay({el:el});
        document.body.appendChild(el[0]);
        this.tipurl = el.one(".ke-bubbleview-url");
        var tipchange = el.one(".ke-bubbleview-change");
        var tipremove = el.one(".ke-bubbleview-remove");
        tipchange.on("click", function(ev) {
            Link.tipwin.link.show();
            ev.halt();
        });
        tipremove.on("click", function(ev) {
            var link = Link.tipwin.link;
            link._removeLink();
            ev.halt();
        });
        Link.tip = null;
    };

    var html = "<div style='padding: 10px;'>" +
        "<p>" +
        "<label>URL：<input class='ke-link-url' style='width:230px' value='http://'/></label>" +
        "</p>" +
        "<p style='margin-top: 5px;padding-left:35px'>" +
        "<label><input class='ke-link-blank' type='checkbox'/> &nbsp; 在新窗口打开链接</label>" +
        "</p>" +
        "<p style='margin-top: 5px;'>" +
        "<label><button class='ke-link-ok'>确定</button>&nbsp;" +
        "<a href='#' class='ke-link-cancel'>取消</a></label>" +
        "</p>" +
        "</div>";
    S.augment(Link, {
        _init:function() {
            var self = this,editor = self.editor;
            self.el = new TripleButton({
                container:editor.toolBarDiv,
                text:'link',
                title:'插入编辑超链接'
            });
            self.el.on("click", self.show, self);
            editor.on("selectionChange", self._selectionChange, self);

        },
        _prepareTip:function() {
            Link.tip && Link.tip();
        },
        _realTip:function(a) {
            var xy = a._4e_getOffset(document);
            xy.top += a.height() + 5;
            Link.tipwin.show(xy);
            this._a = a;
            Link.tipwin.link = this;
            Link.tipurl.html(a.attr("href"));
            Link.tipurl.attr("href", a.attr("href"));
        },
        _showTip:function(a) {
            this._prepareTip(a);
        },
        _hideTip:function() {
            Link.tipwin && Link.tipwin.hide();
        },

        _removeLink:function() {
            var a = this._a,editor = this.editor;
            //ie6先要focus
            editor.focus();
            var attr = {
                href:a.attr("href")
            };
            if (a._4e_hasAttribute("target")) {
                attr.target = a.attr("target");
            }
            var linkStyle = new KEStyle(link_Style, attr);
            editor.fire("save");
            linkStyle.remove(editor.document);
            editor.fire("save");
            this._hideTip();
            editor.focus();
            editor.notifySelectionChange();
        },
        //借鉴google doc tip提示显示
        _selectionChange:function(ev) {
            var elementPath = ev.path,
                //editor = this.editor,
                elements = elementPath.elements;

            if (elementPath && elements) {
                var lastElement = elementPath.lastElement;
                var a = lastElement._4e_ascendant(function(node) {
                    return node._4e_name() === 'a' && (!!node.attr("href"));
                }, true);

                if (a) {
                    this._showTip(a);
                } else {
                    this._hideTip();
                }
            }
        },
        hide:function() {
            Link.d.hide();
        },

        //得到当前选中的 link a
        _getSelectedLink:function() {
            var self = this;
            var editor = this.editor;
            if (Link.tipwin && Link.tipwin.get("visible")) {
                var range = editor.getSelection().getRanges()[0];
                var common = range.getCommonAncestor();
                common && (common = common._4e_ascendant(function(node) {
                    return node._4e_name() == 'a' && (!!node.attr("href"));
                }, true));
                if (common && common[0] == Link.tipwin.link._a[0]) {
                    return common;
                }
            }
        },

        _link:function() {
            var self = this;
            var editor = this.editor,url = Link.urlEl.val();
            //ie6 先要focus
            editor.focus();
            if (!S.trim(url)) {
                return;
            }
            var link = self._getSelectedLink();
            //是修改行为
            if (link) {
                var range = new KERange(editor.document);
                range.selectNodeContents(link);
                editor.getSelection().selectRanges([range]);
                self._removeLink();
            }
            var attr = {
                href:url
            };
            if (Link.targetEl[0].checked) {
                attr.target = "_blank";
            } else {
                attr.target = "_self";
            }
            var linkStyle = new KEStyle(link_Style, attr);
            editor.fire("save");
            linkStyle.apply(editor.document);
            editor.fire("save");
            self.hide();
            editor.focus();
            editor.notifySelectionChange();
        },
        _prepare:function() {
            var self = this;
            Link.init && Link.init();
        },
        _real:function() {
            var self = this;
            Link.d.link = this;

            var link = self._getSelectedLink();
            //是修改行为

            if (link) {
                Link.urlEl.val(link.attr("href"));
                Link.targetEl[0].checked = link.attr("target") == "_blank";
            }
            Link.d.show();
        },
        show:function() {
            var self = this;
            self._prepare();
        }
    });
    KE.Utils.lazyRun(Link.prototype, "_prepare", "_real");
    KE.Utils.lazyRun(Link.prototype, "_prepareTip", "_realTip");
    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new Link(editor);
        var win = DOM._4e_getWin(editor.document);
        Event.on(win, "scroll", function() {
            Link.tipwin && Link.tipwin.hide();
        });
    });
});