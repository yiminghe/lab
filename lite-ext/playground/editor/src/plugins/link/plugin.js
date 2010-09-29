/**
 * link editor support for kissy editor ,innovation from google doc and ckeditor
 * @author: yiminghe@gmail.com
 */
KISSY.Editor.add("link", function(editor) {
    var KE = KISSY.Editor;

    if (!KE.Link) {
        (function() {
            var S = KISSY,
                TripleButton = KE.TripleButton,
                KEStyle = KE.Style,
                Node = S.Node,
                KERange = KE.Range,
                Overlay = KE.SimpleOverlay ,
                BubbleView = KE.BubbleView,
                link_Style = {
                    element : 'a',
                    attributes:{
                        "href":"#(href)",
                        target:"#(target)"
                    }
                },
                /**
                 * bubbleview/tip 初始化，所有共享一个 tip
                 */
                tipHtml = '前往链接： '
                    + ' <a ' +
                    'href="" '
                    + ' target="_blank" ' +
                    'class="ke-bubbleview-url">' +
                    '</a> - '
                    + ' <span ' +
                    'class="ke-bubbleview-link ke-bubbleview-change">' +
                    '编辑' +
                    '</span> - '
                    + ' <span ' +
                    'class="ke-bubbleview-link ke-bubbleview-remove">' +
                    '去除' +
                    '</span>',
                bodyHtml = "<div>" +
                    "<p>" +
                    "<label>" +
                    "<span " +
                    "style='color:#0066CC;font-weight:bold;'>" +
                    "网址： " +
                    "</span>" +
                    "<input " +
                    " data-verify='^https?://[^\\s]+$' " +
                    " data-warning='网址格式为：http://' " +
                    "class='ke-link-url' " +
                    "style='width:220px' " +
                    "value='http://'/>" +
                    "</label>" +
                    "</p>" +
                    "<p " +
                    "style='margin-top: 5px;padding-left:45px'>" +
                    "<label>" +
                    "<input " +
                    "class='ke-link-blank' " +
                    "type='checkbox'/>" +
                    " &nbsp; 在新窗口打开链接" +
                    "</label>" +
                    "</p>" +

                    "</div>",
                footHtml = "<button class='ke-link-ok'>确定</button> " +
                    "<button class='ke-link-cancel'>取消</button>";


            function Link(editor) {
                this.editor = editor;
                this._init();
            }


            /**
             * 所有编辑器实例共享同一功能窗口
             */
            Link.init = function() {
                var self = this,
                    d = new Overlay({
                        title:"链接属性",
                        mask:true,
                        width:"300px"
                    });
                self.dialog = d;
                d.body.html(bodyHtml);
                d.foot.html(footHtml);
                d.urlEl = d.body.one(".ke-link-url");
                d.targetEl = d.body.one(".ke-link-blank");
                var cancel = d.foot.one(".ke-link-cancel"),
                    ok = d.foot.one(".ke-link-ok");
                ok.on("click", function(ev) {
                    var link = d.link;
                    link._link();
                    ev.halt();
                }, this);
                cancel.on("click", function(ev) {
                    d.hide();
                    ev.halt();
                }, self);
                Link.init = null;
            };

            function checkLink(lastElement) {
                return lastElement._4e_ascendant(function(node) {
                    return node._4e_name() === 'a' && (!!node.attr("href"));
                }, true);
            }

            BubbleView.register({
                pluginName:"link",
                func:checkLink,
                init:function() {
                    var bubble = this,el = bubble.el;
                    el.html(tipHtml);
                    var tipurl = el.one(".ke-bubbleview-url"),
                        tipchange = el.one(".ke-bubbleview-change"),
                        tipremove = el.one(".ke-bubbleview-remove");
                    //ie focus not lose
                    tipchange._4e_unselectable();
                    tipurl._4e_unselectable();
                    tipremove._4e_unselectable();
                    tipchange.on("click", function(ev) {
                        bubble._plugin.show();
                        ev.halt();
                    });
                    tipremove.on("click", function(ev) {
                        var link = bubble._plugin;
                        link._removeLink(bubble._selectedEl);
                        link.editor.notifySelectionChange();
                        ev.halt();
                    });

                    bubble.on("afterVisibleChange", function() {

                        var a = bubble._selectedEl;
                        if (!a)return;
                        tipurl.html(a.attr("href"));
                        tipurl.attr("href", a.attr("href"));
                    });
                }
            });


            S.augment(Link, {
                _init:function() {
                    var self = this,editor = self.editor;
                    self.el = new TripleButton({
                        container:editor.toolBarDiv,
                        contentCls:"ke-toolbar-link",
                        title:"插入链接 "
                    });
                    self.el.on("offClick", self.show, self);
                    BubbleView.attach({
                        pluginName:"link",
                        pluginInstance:self
                    });
                    KE.Utils.sourceDisable(editor, self);
                },
                disable:function() {
                    this.el.set("state", TripleButton.DISABLED);
                },
                enable:function() {
                    this.el.set("state", TripleButton.OFF);
                },

                _removeLink:function(a) {
                    var editor = this.editor,
                        attr = {
                            href:a.attr("href")
                        };
                    if (a._4e_hasAttribute("target")) {
                        attr.target = a.attr("target");
                    }
                    var linkStyle = new KEStyle(link_Style, attr);
                    editor.fire("save");
                    linkStyle.remove(editor.document);
                    editor.fire("save");
                },


                //得到当前选中的 link a
                _getSelectedLink:function() {
                    var self = this,
                        editor = this.editor,
                        //ie焦点很容易丢失,tipwin没了
                        selection = editor.getSelection(),
                        common = selection && selection.getStartElement();
                    if (common) {
                        common = checkLink(common);
                    }
                    return common;
                },

                _link:function() {
                    var self = this,range,
                        editor = this.editor,
                        d = Link.dialog,
                        url = d.urlEl.val(),
                        link,
                        attr,
                        a,
                        linkStyle;

                    if (!KE.Utils.verifyInputs(d.el.all("input"))) {
                        return;
                    }
                    d.hide();
                    link = self._getSelectedLink();
                    //是修改行为
                    if (link) {
                        range = new KERange(editor.document);
                        range.selectNodeContents(link);
                        editor.getSelection().selectRanges([range]);
                        self._removeLink(link);
                    }
                    attr = {
                        href:url
                    };
                    if (d.targetEl[0].checked) {
                        attr.target = "_blank";
                    } else {
                        attr.target = "_self";
                    }

                    range = editor.getSelection().getRanges()[0];
                    //没有选择区域时直接插入链接地址
                    if (range.collapsed) {
                        a = new Node("<a href='" + url +
                            "' target='" + attr.target + "'>" + url + "</a>", null, editor.document);
                        editor.insertElement(a);
                    } else {
                        editor.fire("save");
                        linkStyle = new KEStyle(link_Style, attr);
                        linkStyle.apply(editor.document);
                        editor.fire("save");
                    }

                    editor.notifySelectionChange();
                },
                _prepare:function() {
                    Link.init && Link.init();
                },
                _real:function() {
                    var self = this,
                        d = Link.dialog,
                        link = self._getSelectedLink();
                    d.link = this;
                    //是修改行为
                    if (link) {
                        d.urlEl.val(link.attr("href"));
                        d.targetEl[0].checked = (link.attr("target") == "_blank");
                    }
                    d.show();
                },
                show:function() {
                    this._prepare();
                }
            });
            KE.Utils.lazyRun(Link.prototype, "_prepare", "_real");
            KE.Link = Link;
        })();
    }
    editor.addPlugin(function() {
        new KE.Link(editor);
    });
});