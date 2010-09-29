/**
 * flash base for all flash-based plugin
 * @author:yiminghe@gmail.com
 */
KISSY.Editor.add("flashsupport", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        UA = S.UA,
        Event = S.Event,
        ContextMenu = KE.ContextMenu,
        Node = S.Node,
        BubbleView = KE.BubbleView,
        TripleButton = KE.TripleButton,
        Overlay = KE.SimpleOverlay,
        dataProcessor = editor.htmlDataProcessor,
        CLS_FLASH = 'ke_flash',
        TYPE_FLASH = 'flash',
        flashUtils = KE.Utils.flash,
        dataFilter = dataProcessor && dataProcessor.dataFilter,
        TIP = "请输入如 http://www.xxx.com/xxx.swf";


    if (!KE.Flash) {

        (function() {
            var flashFilenameRegex = /\.swf(?:$|\?)/i,
                bodyHtml = "<table>" +
                    "<tr>" +
                    "<td colspan='2'>" +
                    "<label>网址： " +
                    "<input " +
                    " data-verify='^https?://[^\\s]+$' " +
                    " data-warning='网址格式为：http://' " +
                    "class='ke-flash-url' style='width:280px' value='"
                    + TIP
                    + "'/></label>" +
                    "</td></tr>" +
                    "<tr>" +
                    "<td>" +
                    "<label>宽度： " +
                    "<input " +
                    " data-verify='^(?!0$)\\d+(.\\d+)?$' " +
                    " data-warning='宽度请输入正数' " +
                    "class='ke-flash-width' style='width:60px' /> 像素 </label>" +
                    "</td>" +
                    "<td>" +
                    "<label>高度：<input " +
                    " data-verify='^(?!0$)\\d+(.\\d+)?$' " +
                    " data-warning='高度请输入正数' " +
                    "class='ke-flash-height' " +
                    "style='width:60px' /> 像素 </label></td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    "<label>对齐： " +
                    "<select class='ke-flash-align'>" +
                    "<option value=''>无</option>" +
                    "<option value='left'>左对齐</option>" +
                    "<option value='right'>右对齐</option>" +
                    "</select>" +
                    "</td>" +
                    "<td>" +
                    "<label>间距：" +
                    "<input " +
                    " data-verify='^\\d+(.\\d+)?$' " +
                    " data-warning='间距请输入非负数字' "
                    + "class='ke-flash-margin' style='width:60px' value='"
                    + 5 + "'/> 像素" +
                    "</label>" +
                    "</td></tr>" +
                    "</table>",

                footHtml = "<button class='ke-flash-ok'>确定</button> " +
                    "<button class='ke-flash-cancel'>取消</button>";

            /**
             * 所有基于 flash 的插件基类，使用 template 模式抽象
             * @param editor
             */
            function Flash(editor) {
                var self = this;
                self.editor = editor;
                self._init();
            }

            Flash.isFlashEmbed = function (element) {
                var attributes = element.attributes;
                return (
                    attributes.type == 'application/x-shockwave-flash'
                        ||
                        flashFilenameRegex.test(attributes.src || '')
                    );
            };

            S.augment(Flash, {

                /**
                 * 配置信息，用于子类覆盖
                 * @override
                 */
                _config:function() {
                    var self = this;
                    self._cls = CLS_FLASH;
                    self._type = TYPE_FLASH;
                    self._title = "Flash属性";
                    self._bodyHtml = bodyHtml;
                    self._footHtml = footHtml;
                    self._contentCls = "ke-toolbar-flash";
                    self._tip = "插入Flash";
                    self._contextMenu = contextMenu;
                    self._flashRules = ["img." + CLS_FLASH];
                },
                _init:function() {
                    this._config();
                    var self = this,
                        editor = self.editor,
                        myContexts = {},
                        contextMenu = self._contextMenu;

                    //注册属于编辑器的功能实例
                    editor._toolbars = editor._toolbars || {};
                    editor._toolbars[self._type] = self;

                    //生成编辑器工具按钮
                    self.el = new TripleButton({
                        container:editor.toolBarDiv,
                        contentCls:self._contentCls,
                        title:self._tip
                    });
                    self.el.on("offClick", self.show, this);


                    //右键功能关联到编辑器实例
                    if (contextMenu) {
                        for (var f in contextMenu) {
                            (function(f) {
                                myContexts[f] = function() {
                                    contextMenu[f](editor);
                                }
                            })(f);
                        }
                    }
                    //注册右键，contextmenu时检测
                    ContextMenu.register(editor.document, {
                        rules:self._flashRules,
                        width:"120px",
                        funcs:myContexts
                    });


                    //注册泡泡，selectionChange时检测
                    BubbleView.attach({
                        pluginName:self._type,
                        pluginInstance:self
                    });

                    //注册双击，双击时检测
                    Event.on(editor.document, "dblclick", self._dbclick, self);
                    KE.Utils.lazyRun(this, "_prepareShow", "_realShow");
                    KE.Utils.sourceDisable(editor, self);
                },
                disable:function() {
                    this.el.set("state", TripleButton.DISABLED);
                },
                enable:function() {
                    this.el.set("state", TripleButton.OFF);
                },

                /**
                 * 子类覆盖，如何从flash url得到合适的应用表示地址
                 * @override
                 * @param r flash 元素
                 */
                _getFlashUrl:function(r) {
                    return flashUtils.getUrl(r);
                },
                /**
                 * 更新泡泡弹出的界面，子类覆盖
                 * @override
                 * @param tipurl
                 * @param selectedFlash
                 */
                _updateTip:function(tipurl, selectedFlash) {
                    var self = this,
                        editor = self.editor,
                        r = editor.restoreRealElement(selectedFlash);
                    if(!r) return;
                    var url = self._getFlashUrl(r);
                    tipurl.html(url);
                    tipurl.attr("href", url);
                },

                //根据图片标志触发本插件应用
                _dbclick:function(ev) {
                    var self = this,t = new Node(ev.target);
                    if (t._4e_name() === "img" && t.hasClass(self._cls)) {
                        self.show(null, t);
                        ev.halt();
                    }
                },

                //建立弹出窗口
                _prepareShow:function() {
                    var self = this,
                        d = new Overlay({
                            title:self._title,
                            width:self._config_dwidth || "350px",
                            mask:true
                        });
                    d.body.html(self._bodyHtml);
                    d.foot.html(self._footHtml);
                    self.d = d;
                    self._initD();
                },
                _realShow:function() {
                    //显示前就要内容搞好
                    this._updateD();
                    this.d.show();
                },

                /**
                 * 触发前初始化窗口 field，子类覆盖
                 * @override
                 */
                _updateD:function() {
                    var self = this,
                        editor = self.editor,
                        f = self.selectedFlash;
                    if (f) {
                        var r = editor.restoreRealElement(f);
                        if(!r) return;
                        if (r.attr("width")) {
                            self.dWidth.val(parseInt(r.attr("width")));
                        }
                        if (r.attr("height")) {
                            self.dHeight.val(parseInt(r.attr("height")));
                        }
                        self.dAlign.val(r.attr("align"));
                        self.dUrl.val(self._getFlashUrl(r));
                        self.dMargin.val(parseInt(r._4e_style("margin")) || 0);
                    } else {
                        self.dUrl.val(TIP);
                        self.dWidth.val("");
                        self.dHeight.val("");
                        self.dAlign.val("");
                        self.dMargin.val("5");
                    }
                },
                show:function(ev, _selectedEl) {
                    var self = this;
                    self.selectedFlash = _selectedEl;
                    self._prepareShow();
                },


                /**
                 * 映射窗口field，子类覆盖
                 * @override
                 */
                _initD:function() {
                    var self = this,editor = self.editor,d = self.d;
                    self.dHeight = d.el.one(".ke-flash-height");
                    self.dWidth = d.el.one(".ke-flash-width");
                    self.dUrl = d.el.one(".ke-flash-url");
                    self.dAlign = d.el.one(".ke-flash-align");
                    self.dMargin = d.el.one(".ke-flash-margin");
                    var action = d.el.one(".ke-flash-ok"),
                        cancel = d.el.one(".ke-flash-cancel");
                    action.on("click", self._gen, self);
                    cancel.on("click", function() {
                        self.d.hide();
                    });
                },

                /**
                 * 应用子类覆盖，提供 flash 元素的相关信息
                 * @override
                 */
                _getDInfo:function() {
                    var self = this;
                    return {
                        url:  self.dUrl.val(),
                        attrs:{
                            width:self.dWidth.val(),
                            height:self.dHeight.val(),
                            align:self.dAlign.val(),
                            style:"margin:" + (parseInt(self.dMargin.val()) || 0) + "px"
                        }
                    };
                },
                /**
                 * 真正产生 flash 元素
                 */
                _gen: function() {
                    //debugger
                    var self = this,
                        editor = self.editor,
                        dinfo = self._getDInfo(),
                        url = dinfo && S.trim(dinfo.url),
                        attrs = dinfo && dinfo.attrs,
                        re = KE.Utils.verifyInputs(self.d.el.all("input"));
                    if (!re || !dinfo) return;
                    var nodeInfo = flashUtils.createSWF(url, {attrs:attrs}, editor.document),
                        real = nodeInfo.el,
                        substitute = editor.createFakeElement ?
                            editor.createFakeElement(real,
                                self._cls,
                                self._type,
                                true,
                                nodeInfo.html,
                                attrs) :
                            real;
                    substitute = editor.insertElement(substitute);
                    //如果是修改，就再选中
                    if (self.selectedFlash) {
                        editor.getSelection().selectElement(substitute);
                    }
                    self.d.hide();
                }
            });

            KE.Flash = Flash;

            /**
             * tip初始化，所有共享一个tip
             */
            var tipHtml = ' '
                + ' <a class="ke-bubbleview-url" target="_blank" href="#"></a> - '
                + '    <span class="ke-bubbleview-link ke-bubbleview-change">编辑</span> - '
                + '    <span class="ke-bubbleview-link ke-bubbleview-remove">删除</span>'
                + '';

            /**
             * 泡泡判断是否选择元素符合
             * @param node
             */
            function checkFlash(node) {
                return node._4e_name() === 'img' && (!!node.hasClass(CLS_FLASH)) && node;
            }

            /**
             * 注册一个泡泡
             * @param pluginName
             * @param label
             * @param checkFlash
             */
            Flash.registerBubble = function(pluginName, label, checkFlash) {

                BubbleView.register({
                    pluginName:pluginName,
                    func:checkFlash,
                    init:function() {
                        var bubble = this,
                            el = bubble.el;
                        el.html(label + tipHtml);
                        var tipurl = el.one(".ke-bubbleview-url"),
                            tipchange = el.one(".ke-bubbleview-change"),
                            tipremove = el.one(".ke-bubbleview-remove");
                        //ie focus not lose
                        tipchange._4e_unselectable();
                        tipurl._4e_unselectable();
                        tipremove._4e_unselectable();


                        tipchange.on("click", function(ev) {
                            //回调show，传入选中元素
                            bubble._plugin.show(null, bubble._selectedEl);
                            ev.halt();
                        });
                        tipremove.on("click", function(ev) {
                            var flash = bubble._plugin;
                            //chrome remove 后会没有焦点
                            if (UA.webkit) {
                                var r = flash.editor.getSelection().getRanges();
                                r && r[0] && (r[0].collapse(true) || true) && r[0].select();
                            }
                            bubble._selectedEl._4e_remove();
                            bubble.hide();
                            flash.editor.notifySelectionChange();
                            ev.halt();
                        });

                        /*
                         位置变化，在显示前就设置内容，防止ie6 iframe遮罩不能正确大小
                         */
                        bubble.on("beforeVisibleChange", function(ev) {
                            var v = ev.newVal,a = bubble._selectedEl,
                                flash = bubble._plugin;
                            if (!v || !a)return;
                            flash._updateTip(tipurl, a);
                        });
                    }
                });
            };


            Flash.registerBubble("flash", "Flash 网址： ", checkFlash);
            Flash.checkFlash = checkFlash;

            //右键功能列表
            var contextMenu = {
                "Flash属性":function(editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement(),
                        flash = checkFlash(startElement),
                        flashUI = editor._toolbars[TYPE_FLASH];
                    if (flash) {
                        flashUI.show(null, flash);
                    }
                }
            };

            Flash.CLS_FLASH = CLS_FLASH;
            Flash.TYPE_FLASH = TYPE_FLASH;
        })();
    }

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,i,
                    classId = attributes['classid'] && String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        if (element.children[ i ].name == 'embed') {
                            if (!KE.Flash.isFlashEmbed(element.children[ i ]))
                                return null;
                            return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
                        }
                    }
                    return null;
                }
                return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
            },

            'embed' : function(element) {
                if (!KE.Flash.isFlashEmbed(element))
                    return null;
                return dataProcessor.createFakeParserElement(element, CLS_FLASH, TYPE_FLASH, true);
            }
        }}, 5);
});
