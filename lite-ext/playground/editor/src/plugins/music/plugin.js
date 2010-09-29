/**
 * insert music for kissy editor
 * @author: yiminghe@gmail.com
 */
KISSY.Editor.add("music", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        DOM = S.DOM,
        UA = S.UA,
        Event = S.Event,
        Flash = KE.Flash,
        CLS_MUSIC = "ke_music",
        TYPE_MUSIC = 'music',
        MUSIC_PLAYER = "niftyplayer.swf",
        dataProcessor = editor.htmlDataProcessor,
        dataFilter = dataProcessor && dataProcessor.dataFilter,
        TIP = "请输入如 http://xxx.com/xx.mp3";


    function music(src) {
        return src.indexOf(MUSIC_PLAYER) != -1;
    }

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,i,
                    classId = attributes['classid'] &&
                        String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        if (element.children[ i ].name == 'embed') {
                            if (!Flash.isFlashEmbed(element.children[ i ]))
                                return null;
                            if (music(element.children[ i ].attributes.src)) {
                                return dataProcessor.createFakeParserElement(element, CLS_MUSIC, TYPE_MUSIC, true);
                            }

                        }
                    }
                    return null;
                }

                for (i = 0; i < element.children.length; i++) {
                    var c = element.children[ i ];
                    if (c.name == 'param' && c.attributes.name == "movie") {
                        if (music(c.attributes.value)) {
                            return dataProcessor.createFakeParserElement(element, CLS_MUSIC, TYPE_MUSIC, true);
                        }
                    }
                }

            },

            'embed' : function(element) {
                if (!Flash.isFlashEmbed(element))
                    return null;
                if (music(element.attributes.src)) {
                    return dataProcessor.createFakeParserElement(element, CLS_MUSIC, TYPE_MUSIC, true);
                }

            }
            //4 比 flash 的优先级 5 高！
        }}, 4);

    //重构，和flash结合起来，抽象
    if (!KE.MusicInserter) {
        (function() {
            var MUSIC_PLAYER_CODE = KE.Config.base + 'plugins/music/niftyplayer.swf?file=#(music)',
                bodyHtml = "" +
                    "<p>" +
                    "<label>" +
                    "<span style='color:#0066CC;font-weight:bold;'>网址： " +
                    "</span>" +
                    "<input " +
                    " data-verify='^https?://[^\\s]+$' " +
                    " data-warning='网址格式为：http://' " +
                    "class='ke-music-url' style='width:230px' " +
                    "value='"
                    + TIP
                    + "'/>" +
                    "</label>" +
                    "</p>" +
                    "<p style='margin:5px 0'>" +
                    "<label>对" +
                    KE.Utils.duplicateStr("&nbsp;", 8) + "齐： " +
                    "<select class='ke-music-align'>" +
                    "<option value=''>无</option>" +
                    "<option value='left'>左对齐</option>" +
                    "<option value='right'>右对齐</option>" +
                    "</select>" +
                    "" +
                    KE.Utils.duplicateStr("&nbsp;", 1) +
                    "<label>间距： " +
                    "</span> <input " +
                    " data-verify='^\\d+(.\\d+)?$' " +
                    " data-warning='间距请输入非负数字' " +
                    "class='ke-music-margin' style='width:60px' value='"
                    + 5 + "'/> 像素" +
                    "</label>" +
                    "<p>",
                footHtml = "<button class='ke-music-ok'>确定</button> " +
                    "<button class='ke-music-cancel'>取消</button>",
                music_reg = /#\(music\)/g,
                flashRules = ["img." + CLS_MUSIC];

            function MusicInserter(editor) {
                MusicInserter.superclass.constructor.apply(this, arguments);
                //只能ie能用？，目前只有firefox,ie支持图片缩放
                var disableObjectResizing = editor.cfg.disableObjectResizing;
                if (!disableObjectResizing) {
                    Event.on(editor.document.body, UA.ie ? 'resizestart' : 'resize', function(evt) {
                        //console.log(evt.target);
                        if (DOM.hasClass(evt.target, CLS_MUSIC))
                            evt.preventDefault();
                    });
                }
            }

            function checkMusic(node) {
                return node._4e_name() === 'img' && (!!node.hasClass(CLS_MUSIC)) && node;
            }


            S.extend(MusicInserter, Flash, {
                _config:function() {
                    var self = this,
                        editor = self.editor;
                    self._cls = CLS_MUSIC;
                    self._type = TYPE_MUSIC;
                    self._title = "音乐属性";
                    self._bodyHtml = bodyHtml;
                    self._footHtml = footHtml;
                    self._contentCls = "ke-toolbar-music";
                    self._tip = "插入音乐";
                    self._contextMenu = contextMenu;
                    self._flashRules = flashRules;
                },
                _initD:function() {
                    var self = this,
                        editor = self.editor,
                        d = self.d;
                    self.dUrl = d.el.one(".ke-music-url");
                    self.dAlign = d.el.one(".ke-music-align");
                    self.dMargin = d.el.one(".ke-music-margin");
                    var action = d.el.one(".ke-music-ok"),
                        cancel = d.el.one(".ke-music-cancel");
                    action.on("click", self._gen, self);
                    cancel.on("click", function() {
                        self.d.hide();
                    });
                },

                _getDInfo:function() {
                    var self = this;

                    return {
                        url: MUSIC_PLAYER_CODE.replace(music_reg, self.dUrl.val()),
                        attrs:{
                            width:165,
                            height:37,
                            align:self.dAlign.val(),
                            style:"margin:" + (parseInt(self.dMargin.val()) || 0) + "px;"
                        }
                    };
                },

                _getFlashUrl:function(r) {
                    return   getMusicUrl(MusicInserter.superclass._getFlashUrl.call(this, r));
                },
                _updateD:function() {
                    var self = this,
                        editor = self.editor,
                        f = self.selectedFlash;
                    if (f) {
                        var r = editor.restoreRealElement(f);
                        self.dUrl.val(self._getFlashUrl(r));
                        self.dAlign.val(f.attr("align"));
                        self.dMargin.val(parseInt(r._4e_style("margin")) || 0);
                    } else {
                        self.dUrl.val(TIP);
                        self.dAlign.val("");
                        self.dMargin.val("5");
                    }
                }
            });
            function getMusicUrl(url) {
                return url.replace(/^.+niftyplayer\.swf\?file=/, "");
            }

            Flash.registerBubble("music", "音乐网址： ", checkMusic);
            KE.MusicInserter = MusicInserter;
            var contextMenu = {
                "音乐属性":function(editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement(),
                        flash = startElement && checkMusic(startElement),
                        flashUI = editor._toolbars[TYPE_MUSIC];
                    if (flash) {
                        flashUI.show(null, flash);
                    }
                }
            };
        })();
    }


    editor.addPlugin(function() {
        new KE.MusicInserter(editor);
    });

});