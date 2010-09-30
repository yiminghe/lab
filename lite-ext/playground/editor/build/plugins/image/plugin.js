/**
 * insert image for kissy editor
 * @author: yiminghe@gmail.com
 */
KISSY.Editor.add("image", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        DOM = S.DOM,
        UA = S.UA,
        JSON = S.JSON,
        Node = S.Node,
        Event = S.Event,
        TYPE_IMG = 'image',
        BubbleView = KE.BubbleView,
        Overlay = KE.SimpleOverlay,
        TIP = "http://",
        DTIP = "自动";
    //!TODO 需要重构，flashsupport ,image 类似，再抽离？
    if (!KE.ImageInserter) {
        (function() {

            var checkImg = function (node) {
                return node._4e_name() === 'img' && (!/(^|\s+)ke_/.test(node[0].className)) && node;
            },
                labelStyle = "<label><span>";

            function ImageInserter(cfg) {
                ImageInserter.superclass.constructor.call(this, cfg);
                this._init();
            }

            DOM.addStyleSheet(".ke-image-tabs {" +
                "padding-left:10px;" +
                "border-bottom:1px solid #CCCCCC;" +
                "}" +
                ".ke-image-tabs li {" +
                "background-color:#F6F6F6;" +
                "border-color:#CCCCCC #CCCCCC -moz-use-text-color;" +
                "border-style:solid solid none;" +
                "border-width:1px 1px medium;" +
                "cursor:pointer;" +
                "float:left;" +
                "height:21px;" +
                "line-height:21px;" +
                "margin-left:5px;" +
                "position:relative;" +
                "text-align:center;" +
                "top:1px;" +
                "width:60px;" +
                "}" +
                "li.ke-image-tab-selected {" +
                "border-bottom:1px solid #FFFFFF;" +
                "border-color:#CCCCCC #CCCCCC #FFFFFF;" +
                "cursor:default;" +
                "}", "ke-image");

            var TripleButton = KE.TripleButton,
                bodyHtml = "" +
                    "<ul class='ke-image-tabs ks-clear'>" +
                    "<li class='ke-image-tab-selected' rel='remote'>网络图片" +
                    "</li>" +
                    "<li rel='local'>本地上传" +
                    "</li>" +
                    "</ul>" +
                    "" +
                    "<div style='" +
                    "padding:10px 0 0 0;'>" +
                    "<table>" +
                    "<tr>" +
                    "<td colspan='2'>" +
                    "<label>" +
                    "<span " +
                    "class='ke-image-title'" +
                    "style='color:#0066CC;font-weight:bold;'>" + "图片网址： " +
                    "</span>" +
                    "<input " +
                    " data-verify='^https?://[^\\s]+$' " +
                    " data-warning='网址格式为：http://' " +
                    "class='ke-img-url' " +
                    "style='width:150px;margin-right:5px;' " +
                    "value='" + TIP + "'/>" +
                    "</label>" +
                    "<button class='ke-image-up' style='visibility:hidden;'>浏览...</button>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    labelStyle + "高度： " +
                    "</span>" +
                    "<input " +
                    "" +
                    "" +
                    " data-verify='^" + DTIP + "|((?!0$)\\d+(.\\d+)?)$' " +
                    " data-warning='高度请输入正数' " +
                    "class='ke-img-height' style='width:60px' " +
                    "value='" + DTIP + "'/> 像素 </label>" +
                    "</td>" +
                    "<td>" +
                    "<label>" +
                    "<span>" + "宽度： " +
                    "</span>" +
                    "<input " +
                    " data-verify='^" + DTIP + "|((?!0$)\\d+(.\\d+)?)$' " +
                    " data-warning='宽度请输入正数' " +
                    "class='ke-img-width' style='width:60px' value='" +
                    DTIP + "'/> 像素 </label>" +
                    "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" +
                    labelStyle + "对齐： " +
                    "</span>" +
                    "<select class='ke-img-align'>" +
                    "<option value='none'>无</option>" +
                    "<option value='left'>左对齐</option>" +
                    "<option value='right'>右对齐</option>" +
                    "</select>" +
                    "</td>" +
                    "<td>" +
                    labelStyle + "间距： " +
                    "</span> " +
                    "<input " +
                    "" +
                    " data-verify='^\\d+(.\\d+)?$' " +
                    " data-warning='间距请输入非负数字' " +
                    "class='ke-img-margin' style='width:60px' value='"
                    + 5 + "'/> 像素" +
                    "</label>" +
                    "</td>" +
                    "</tr>" +
                    "</table>" +
                    "</div>",
                footHtml = "<button class='ke-img-insert'>确定</button> " +
                    "<button class='ke-img-cancel'>取消</button>";

            ImageInserter.ATTRS = {
                editor:{}
            };
            var contextMenu = {
                "图片属性":function(editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement(),
                        flash = checkImg(startElement),
                        flashUI = editor._toolbars[TYPE_IMG];
                    if (flash) {
                        flashUI.show(null, flash);
                    }
                }
            };
            S.extend(ImageInserter, S.Base, {
                _init:function() {
                    var self = this,
                        editor = self.get("editor"),
                        toolBarDiv = editor.toolBarDiv,
                        myContexts = {};
                    self.editor = editor;
                    self.el = new TripleButton({
                        contentCls:"ke-toolbar-image",
                        title:"插入图片",
                        container:toolBarDiv
                    });
                    self.el.on("offClick", self.show, self);
                    Event.on(editor.document, "dblclick", self._dblclick, self);
                    KE.Utils.lazyRun(self, "_prepare", "_real");
                    editor._toolbars = editor._toolbars || {};
                    editor._toolbars[TYPE_IMG] = self;
                    if (contextMenu) {
                        for (var f in contextMenu) {
                            (function(f) {
                                myContexts[f] = function() {
                                    contextMenu[f](editor);
                                }
                            })(f);
                        }
                    }
                    KE.ContextMenu.register(editor.document, {
                        rules:[checkImg],
                        width:"120px",
                        funcs:myContexts
                    });


                    BubbleView.attach({
                        pluginName:TYPE_IMG,
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
                _dblclick:function(ev) {
                    var self = this,t = new Node(ev.target);
                    if (checkImg(t)) {
                        self.show(null, t);
                        ev.halt();
                    }
                },
                _prepare:function() {
                    var self = this,editor = self.get("editor");
                    self.d = new Overlay({
                        title:"图片属性",
                        mask:true,
                        width:"350px"
                    });
                    var d = self.d;
                    d.body.html(bodyHtml);
                    d.foot.html(footHtml);
                    self.content = d.el;
                    var content = self.content;
                    var cancel = content.one(".ke-img-cancel"),
                        ok = content.one(".ke-img-insert");
                    self.imgUrl = content.one(".ke-img-url");
                    self.imgHeight = content.one(".ke-img-height");
                    self.imgWidth = content.one(".ke-img-width");
                    self.imgAlign = content.one(".ke-img-align");
                    self.imgMargin = content.one(".ke-img-margin");
                    cancel.on("click", function(ev) {
                        self.d.hide();
                        ev.halt();
                    });
                    ok.on("click", function() {
                        self._insert();
                    });
                    var cfg = (editor.cfg["pluginConfig"]["image"] || {})["upload"] || {};


                    var tab = content.one("ul"),lis = tab.all("li"),
                        ke_image_title = content.one(".ke-image-title"),
                        ke_image_up = content.one(".ke-image-up");
                    if (cfg) {

                        tab.on("click", function(ev) {
                            var li = new Node(ev.target);
                            if (li = li._4e_ascendant(function(n) {
                                return n._4e_name() === "li" && tab._4e_contains(n);
                            }, true)) {
                                lis.removeClass("ke-image-tab-selected");
                                var rel = li.attr("rel");
                                li.addClass("ke-image-tab-selected");
                                if (rel == "local") {
                                    ke_image_title.html("上传图片：");
                                    ke_image_up.css("visibility", "");
                                    flashPos.css("visibility", "");
                                } else {
                                    ke_image_title.html("图片网址：");
                                    ke_image_up.css("visibility", "hidden");
                                    flashPos.css("visibility", "hidden");
                                }

                            }
                        });
                        var flashPos = new Node("<div style='" +
                            ("position:absolute;" +
                                "width:" + (ke_image_up.width() + 8) + "px;" +
                                "height:" + (ke_image_up.height() + 8) + "px;" +
                                "z-index:9999;")
                            + "'>").appendTo(content);
                        flashPos.offset(ke_image_up.offset());
                        var movie = KE.Config.base + KE.Utils.debugUrl("plugins/uploader/uploader.swf"),
                            uploader = new KE.FlashBridge({
                                movie:movie,
                                methods:["removeFile",
                                    "cancel",
                                    "clearFileList",
                                    "removeFile",
                                    "disable",
                                    "enable",
                                    "upload",
                                    "setAllowMultipleFiles",
                                    "setFileFilters",
                                    "uploadAll"],
                                holder:flashPos,
                                attrs:{
                                    width:ke_image_up.width() ,
                                    height:ke_image_up.height()
                                },
                                params:{
                                    wmode:"transparent"
                                },
                                flashVars:{
                                    allowedDomain : location.hostname,
                                    menu:true
                                }
                            });
                        ke_image_up[0].disabled = true;
                        uploader.on("swfReady", function() {
                            ke_image_up[0].disabled = false;
                            flashPos.css("visibility", "hidden");
                            uploader.setAllowMultipleFiles(false);
                            uploader.setFileFilters([
                                {
                                    extensions:"*.jpeg;*.jpg;*.png;*.gif",
                                    description:"图片文件( png,jpg,jpeg,gif )"

                                }
                            ]);
                        });
                        var sizeLimit = (cfg.sizeLimit) || (Number.MAX_VALUE);

                        uploader.on("fileSelect", function(ev) {
                            var fileList = ev.fileList;
                            for (var f in fileList) {
                                var file = fileList[f],
                                    size = Math.floor(file.size / 1000);
                                if (size > sizeLimit) {
                                    alert("最大上传大小上限：" + (sizeLimit) + "KB");
                                    uploader.clearFileList();
                                    return;
                                }
                            }

                            uploader.uploadAll(cfg.serverUrl, "POST",
                                cfg.serverParams,
                                cfg.fileInput);
                            d.loading();
                        });

                        uploader.on("uploadCompleteData", function(ev) {
                            var data = S.trim(ev.data).replace(/\\r||\\n/g, "");
                            d.unloading();
                            if (!data) return;
                            data = JSON.parse(data);
                            if (data.error) {
                                alert(data.error);
                                return;
                            }
                            self.imgUrl.val(data.imgUrl);

                        });
                        uploader.on("uploadError", function(ev) {
                            d.unloading();
                            alert(ev.status);
                        });
                    }
                    else {
                        tab.hide();
                    }

                },
                _updateTip:function(tipurl, a) {
                    tipurl.html(a.attr("src"));
                    tipurl.attr("href", a.attr("src"));
                },

                _real:function() {
                    this.d.show();
                },
                _insert:function() {
                    var self = this,
                        url = self.imgUrl.val(),re;

                    re = KE.Utils.verifyInputs(self.d.el.all("input"));
                    if (!re) return;
                    var height = parseInt(self.imgHeight.val()),
                        editor = self.get("editor"),
                        width = parseInt(self.imgWidth.val()),
                        align = self.imgAlign.val(),
                        margin = parseInt(self.imgMargin.val()),
                        style = '';
                    if (height) {
                        style += "height:" + height + "px;";
                    }
                    if (width) {
                        style += "width:" + width + "px;";
                    }
                    if (align) {
                        style += "float:" + align + ";";
                    }
                    if (!isNaN(margin)) {
                        style += "margin:" + margin + "px;";
                    }
                    if (style) {
                        style = " style='" + style + "' ";
                    }
                    var img = new Node("<img " +
                        style +
                        "src='" + url + "' alt='' />", null, editor.document);
                    img = editor.insertElement(img, (height || width) ? null : function(el) {
                        el.on("load", function() {
                            el.detach();
                            el.css({
                                width:el.width() + "px",
                                height:el.height() + "px"
                            });
                        });
                    });
                    if (self._selectedEl) {
                        editor.getSelection().selectElement(img);
                    }
                    self.d.hide();
                    editor.notifySelectionChange();
                }
                ,
                _updateD:function(_selectedEl) {
                    var self = this;
                    self._selectedEl = _selectedEl;
                    if (_selectedEl) {
                        self.imgUrl.val(_selectedEl.attr("src"));
                        self.imgHeight.val(_selectedEl.height());
                        self.imgWidth.val(_selectedEl.width());
                        self.imgAlign.val(_selectedEl.css("float"));
                        var margin = parseInt(_selectedEl._4e_style("margin")) || 0;
                        self.imgMargin.val(margin);
                    } else {
                        self.imgUrl.val(TIP);
                        self.imgHeight.val(DTIP);
                        self.imgWidth.val(DTIP);
                        self.imgAlign.val("");
                        self.imgMargin.val("5");

                    }
                }
                ,
                show:function(ev, _selectedEl) {
                    var self = this;
                    self._prepare();
                    self._updateD(_selectedEl);
                }
            }
                )
                ;
            KE.ImageInserter = ImageInserter;


            var tipHtml = ' '
                + ' <a class="ke-bubbleview-url" target="_blank" href="#"></a> - '
                + '    <span class="ke-bubbleview-link ke-bubbleview-change">编辑</span> - '
                + '    <span class="ke-bubbleview-link ke-bubbleview-remove">删除</span>'
                + '';

            (function(pluginName, label, checkFlash) {

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
                            bubble._plugin.show(null, bubble._selectedEl);
                            ev.halt();
                        });
                        tipremove.on("click", function(ev) {
                            var flash = bubble._plugin;
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
                         位置变化
                         */
                        bubble.on("afterVisibleChange", function(ev) {
                            var v = ev.newVal,a = bubble._selectedEl,
                                flash = bubble._plugin;
                            if (!v || !a)return;
                            flash._updateTip(tipurl, a);
                        });
                    }
                });
            })(TYPE_IMG, "图片网址： ", checkImg);
        })();
    }

    editor.addPlugin(function() {
        new KE.ImageInserter({
            editor:editor
        });

    });

})
    ;