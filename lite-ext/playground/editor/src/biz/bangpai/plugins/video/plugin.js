/**
 * biz plugin , video about ku6,youku,tudou for bangpai
 * @author:yiminghe@gmail.com
 */
KISSY.Editor.add("bangpai-video", function(editor) {
    var S = KISSY,
        KE = S.Editor,
        CLS_VIDEO = "ke_video",
        TYPE_VIDEO = "bangpai-video",
        Flash = KE.Flash,
        DTIP = "自动",
        dataProcessor = editor.htmlDataProcessor,
        dataFilter = dataProcessor && dataProcessor.dataFilter,
        TIP = "http://";

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {

                var attributes = element.attributes,i,
                    classId = attributes['classid'] && String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        if (element.children[ i ].name == 'embed') {
                            if (!Flash.isFlashEmbed(element.children[ i ]))
                                return null;
                            if (getProvider(element.children[ i ].attributes.src)) {
                                return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
                            }
                        }
                    }
                    return null;
                }
                for (i = 0; i < element.children.length; i++) {
                    var c = element.children[ i ];
                    if (c.name == 'param' && c.attributes.name == "movie") {
                        if (getProvider(c.attributes.value)) {
                            return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
                        }
                    }
                }

            },

            'embed' : function(element) {
                if (!Flash.isFlashEmbed(element))
                    return null;
                if (getProvider(element.attributes.src)) {
                    return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
                }

            }
            //4 比 flash 的优先级 5 高！
        }}, 4);

    function getProvider(url) {
        for (var i = 0; i < provider.length; i++) {
            var p = provider[i];
            if (p.reg.test(url)) {
                return p;
            }
        }
        return undefined;
    }

    var provider = [
        {
            reg:/youku\.com/i,
            width:480,
            height:400,
            detect:function(url) {
                var m = url.match(/id_([^.]+)\.html$/);
                if (m) {
                    return "http://player.youku.com/player.php/sid/" + m[1] + "/v.swf";
                }
                m = url.match(/v_playlist\/([^.]+)\.html$/);
                if (m) {
                    //return "http://player.youku.com/player.php/sid/" + m[1] + "/v.swf";
                }
                return url;
            }
        },
        {
            reg:/tudou\.com/i,
            width:480,
            height:400,
            detect:function(url) {
                return url;
            }
        },
        {
            reg:/ku6\.com/i,
            width:480,
            height:400,
            detect:function(url) {
                var m = url.match(/show[^\/]*\/([^.]+)\.html$/);
                if (m) {
                    return "http://player.ku6.com/refer/" + m[1] + "/v.swf";
                }
                return url;
            }
        }
    ];

    if (!KE.BangPaiVideo) {
        (function() {
            var bodyHtml = "" +
                "<table>" +
                "<tr><td colspan='2'>" +
                "需要分享的视频链接：支持 土豆，优酷，ku6 视频分享" +
                "</td></tr>" +
                "<tr><td colspan='2'>" +
                "<label><span style='color:#0066CC;font-weight:bold;'>视频链接： " +
                "</span><input " +

                "class='ke-video-url' style='width:230px' value='"
                + TIP
                + "'/></label>" +
                "</td></tr>" +
                "<tr><td>" +
                "<label>宽度： " +
                "</span> <input " +
                "" +
                " data-verify='^" + DTIP + "|((?!0$)\\d+(.\\d+)?)$' " +
                " data-warning='宽度请输入正数' " +
                "class='ke-video-width' style='width:60px' value='"
                + DTIP + "'/> 像素 " +
                "</label>" +
                "</td>" +
                "<td>" +
                "<label> 高度： " +
                "</span> <input " +
                "" +
                " data-verify='^" + DTIP + "|((?!0$)\\d+(.\\d+)?)$' " +
                " data-warning='高度请输入正数' " +
                "class='ke-video-height' style='width:60px' value='"
                + DTIP + "'/> 像素 " +
                "</label>" +

                "</td></tr>" +
                "<tr>" +
                "<td>" +
                "<label>对齐： " +
                "<select class='ke-video-align'>" +
                "<option value=''>无</option>" +
                "<option value='left'>左对齐</option>" +
                "<option value='right'>右对齐</option>" +
                "</select>" +
                "</td>" +
                "<td>" +

                "<label>间距： " +
                "</span> <input " +
                "" +
                " data-verify='^\\d+(.\\d+)?$' " +
                " data-warning='间距请输入非负数字' " +
                "class='ke-video-margin' style='width:60px' value='"
                + 5 + "'/> 像素" +
                "</label>" +
                "</td></tr>" +
                "</table>",
                footHtml = "<button class='ke-video-ok'>确定</button> " +
                    "<button class='ke-video-cancel'>取消</button>",
                flashRules = ["img." + CLS_VIDEO];


            function BangPaiVideo(editor) {
                BangPaiVideo.superclass.constructor.apply(this, arguments);
            }

            S.extend(BangPaiVideo, Flash, {
                _config:function() {
                    var self = this,
                        editor = self.editor,
                        cfg = editor.cfg.pluginConfig;
                    self._cls = CLS_VIDEO;
                    self._type = TYPE_VIDEO;
                    self._title = "视频属性";
                    self._bodyHtml = bodyHtml;
                    self._footHtml = footHtml;
                    self._contentCls = "ke-toolbar-video";
                    self._tip = "插入视频";
                    self._contextMenu = contextMenu;
                    self._flashRules = flashRules;
                    self.urlCfg = cfg["bangpai-video"] &&
                        cfg["bangpai-video"].urlCfg;
                },
                _initD:function() {
                    var self = this,
                        editor = self.editor,
                        d = self.d;
                    self.dUrl = d.el.one(".ke-video-url");
                    self.dAlign = d.el.one(".ke-video-align");
                    self.dMargin = d.el.one(".ke-video-margin");
                    self.dWidth = d.el.one(".ke-video-width");
                    self.dHeight = d.el.one(".ke-video-height");
                    var action = d.el.one(".ke-video-ok"),
                        cancel = d.el.one(".ke-video-cancel");
                    action.on("click", self._gen, self);
                    cancel.on("click", function() {
                        self.d.hide();
                    });
                },

                _getDInfo:function() {

                    var self = this,
                        url = self.dUrl.val(),p = getProvider(url);
                    if (!p) {
                        alert("不支持该链接来源!");
                    } else {
                        var re = p.detect(url);
                        if (!re) {
                            alert(TIP);
                            return;
                        }
                        return {
                            url:re,
                            attrs:{
                                height:parseInt(self.dHeight.val()) || p.height,
                                width:parseInt(self.dWidth.val()) || p.width,
                                align: self.dAlign.val(),
                                style:"margin:" + (parseInt(self.dMargin.val()) || 0) + "px;"
                            }
                        };
                    }
                },

                _gen:function() {
                    var self = this,
                        url = self.dUrl.val(),
                        urlCfg = self.urlCfg;
                    if (urlCfg) {
                        for (var i = 0; i < urlCfg.length; i++) {
                            var c = urlCfg[i];
                            if (c.reg.test(url)) {
                                self.d.loading();
                                BangPaiVideo.dynamicUrl.origin = url;
                                BangPaiVideo.dynamicUrl.instance = self;
                                S.getScript(c.url
                                    .replace(/@url@/, encodeURIComponent(url))
                                    .replace(/@callback@/,
                                    encodeURIComponent("KISSY.Editor.BangPaiVideo.dynamicUrl"))
                                    //.replace(/@rand@/,
                                    //(new Date().valueOf()))
                                    );
                                return;
                            }
                        }
                    }
                    BangPaiVideo.superclass._gen.call(self);
                },

                _dynamicUrlPrepare:function(re) {
                    var self = this;
                    self.dUrl.val(re);
                    self.d.unloading();
                    BangPaiVideo.superclass._gen.call(self);
                },

                _updateD:function() {
                    var self = this,
                        editor = self.editor,
                        f = self.selectedFlash;
                    if (f) {
                        var r = editor.restoreRealElement(f);
                        self.dUrl.val(self._getFlashUrl(r));
                        self.dAlign.val(r.attr("align"));
                        self.dMargin.val(parseInt(r._4e_style("margin")) || 0);
                        self.dWidth.val(r.attr("width"));
                        self.dHeight.val(r.attr("height"));
                    } else {
                        self.dUrl.val(TIP);
                        self.dAlign.val("");
                        self.dMargin.val("5");
                        self.dWidth.val(DTIP);
                        self.dHeight.val(DTIP);
                    }
                }
            });
            BangPaiVideo.dynamicUrl = function(origin, re) {
                if (origin !== BangPaiVideo.dynamicUrl.origin) return;
                BangPaiVideo.dynamicUrl.instance._dynamicUrlPrepare(re);
            };
            function checkVideo(node) {
                return node._4e_name() === 'img' && (!!node.hasClass(CLS_VIDEO)) && node;
            }

            Flash.registerBubble("bangpai-video", "视频链接： ", checkVideo);
            KE.BangPaiVideo = BangPaiVideo;
            var contextMenu = {
                "视频属性":function(editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement(),
                        flash = startElement && checkVideo(startElement),
                        flashUI = editor._toolbars[TYPE_VIDEO];
                    if (flash) {
                        flashUI.show(null, flash);
                    }
                }
            };
        })();
    }
    editor.addPlugin(function() {
        new KE.BangPaiVideo(editor);
    });
}, {
    attach:false,
    requires:["flashsupport"]
});