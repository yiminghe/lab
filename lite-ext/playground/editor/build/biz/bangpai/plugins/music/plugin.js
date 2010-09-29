/**
 * biz plugin , xiami music intergration for bangpai
 * @author:yiminghe@gmail.com
 */
KISSY.Editor.add("bangpai-music", function(editor) {
    var S = KISSY,
        UA = S.UA,
        Event = S.Event,
        KE = S.Editor,
        DOM = S.DOM,
        Node = S.Node,
        loading = KE.Config.base + "theme/loading.gif",
        Flash = KE.Flash,
        CLS_XIAMI = "ke_xiami",
        TYPE_XIAMI = "bangpai-music",
        dataProcessor = editor.htmlDataProcessor,
        dataFilter = dataProcessor && dataProcessor.dataFilter,
        BTIP = "搜 索 ",
        TIP = "输入歌曲名、专辑名、艺人名";

    function checkXiami(url) {
        return /xiami\.com/i.test(url);
    }

    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,
                    //增加音乐名字提示
                    title = element.attributes.title,
                    i,
                    c,
                    classId = attributes['classid']
                        && String(attributes['classid']).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (i = 0; i < element.children.length; i++) {
                        c = element.children[ i ];
                        if (c.name == 'embed') {
                            if (!Flash.isFlashEmbed(c))
                                return null;
                            if (checkXiami(c.attributes.src)) {
                                return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
                                    title:title
                                });
                            }
                        }
                    }
                    return null;
                }
                for (i = 0; i < element.children.length; i++) {
                    c = element.children[ i ];
                    if (c.name == 'param' && c.attributes.name == "movie") {
                        if (checkXiami(c.attributes.value)) {
                            return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
                                title:title
                            });
                        }
                    }
                }
            },

            'embed' : function(element) {
                if (!Flash.isFlashEmbed(element))
                    return null;
                if (checkXiami(element.attributes.src)) {
                    return dataProcessor.createFakeParserElement(element, CLS_XIAMI, TYPE_XIAMI, true, {
                        title:element.attributes.title
                    });
                }
            }
            //4 比 flash 的优先级 5 高！
        }}, 4);

    if (!KE.BangPaiMusic) {
        (function() {

            var css = '' +
                '.ke-xiami-list {' +
                'margin-top:10px;' +
                '}' +
                '' +
                '' +
                '.ke-xiami-list li{' +
                'border:1px dotted gray;' +
                'border-width:0 0 1px 0;' +
                'overflow:hidden;' +
                'zoom:1;' +
                'padding:2px;' +
                '}\n' +
                '' +
                '' +
                '.ke-xiami-list .ke-xiami-add {' +
                'float:right;' +
                '}\n' +
                '' +
                '' +
                '' +
                '.ke-xiami-list .ke-xiami-song {' +
                'float:left;' +
                'width:300px;' +
                'white-space:nowrap;' +
                'overflow:hidden;' +
                '}\n' +
                '' +
                '' +
                '.ke-xiami-paging a{' +
                'display: inline-block;'
                + ' zoom: 1; '
                + ' *display: inline; ' +
                'border:1px solid gray;' +
                'padding:0 5px;' +
                'margin:0 2px;' +
                '}\n' +
                '' +
                '' +
                '.ke-xiami-paging a:hover,.ke-xiami-paging a.ke-xiami-curpage {' +
                'background-color:orange;' +
                '}\n' +
                '' +
                '' +
                '.ke-xiami-paging {' +
                'text-align:center;' +
                'margin-top:10px;' +
                '}\n';
            DOM.addStyleSheet(css, "BangPaiMusic");
            window.bangpai_xiami = function(data) {
                var self = bangpai_xiami.instance;
                data.page = bangpai_xiami.page;
                self._listSearch(data);
            };

            function limit(str, l) {
                if (str.length > l)
                    str = str.substring(0, l) + "...";
                return str;
            }

            var bodyHtml = "" +
                "<form action='#' class='ke-xiami-form'>" +
                "<p class='ke-xiami-title'>" +
                "" +
                "</p>" +
                "<p class='ke-xiami-url-wrap'>" +
                "<input class='ke-xiami-url ke-input' " +
                "style='width:300px;vertical-align:middle;'" +
                "/> &nbsp; " +
                " <button " +
                "class='ke-xiami-submit'" +
                ">"
                + BTIP + "</button>" +
                "</p>" +
                "<p " +
                "style='margin:10px 0'>" +
                "<label>对 齐： " +
                "<select " +
                "class='ke-xiami-align'>" +
                "<option value=''>无</option>" +
                "<option value='left'>左对齐</option>" +
                "<option value='right'>右对齐</option>" +
                "</select>" +
                "<label style='margin-left:45px;'>间距： " +
                "</span> " +
                "<input " +
                "" +
                " data-verify='^\\d+(.\\d+)?$' " +
                " data-warning='间距请输入非负数字' " +
                "class='ke-xiami-margin ke-input' style='width:60px' value='"
                + 5 + "'/> 像素" +
                "</label>" +
                "</p>" +
                "</form>" +
                "<div " +
                "class='ke-xiami-list'>" +
                "</div>" +
                "",
                footHtml = "<button class='ke-xiami-ok ke-button'>确&nbsp;定</button>" +
                    "<button class='ke-xiami-cancel ke-button' style='margin-left:20px;'>取&nbsp;消</button>";


            function BangPaiMusic(editor) {
                BangPaiMusic.superclass.constructor.apply(this, arguments);
                //只能ie能用？，目前只有firefox,ie支持图片缩放
                var disableObjectResizing = editor.cfg.disableObjectResizing;
                if (!disableObjectResizing) {
                    Event.on(editor.document.body, UA.ie ? 'resizestart' : 'resize', function(evt) {
                        //console.log(evt.target);
                        if (DOM.hasClass(evt.target, CLS_XIAMI))
                            evt.preventDefault();
                    });
                }
            }

            var xiami_url = "http://www.xiami.com/app/nineteen/search/key/${key}/page/${page}?" +
                "random=${random}&callback=bangpai_xiami";

            function getXiamiUrl(params) {
                return xiami_url.replace(/\${([^}]+)}/g, function(m, m1) {
                    return params[m1]
                });
            }

            S.extend(BangPaiMusic, Flash, {
                _config:function() {
                    var self = this;
                    self._cls = CLS_XIAMI;
                    self._type = TYPE_XIAMI;
                    self._title = "虾米属性";
                    self._bodyHtml = bodyHtml;
                    self._footHtml = footHtml;
                    self._contentCls = "ke-toolbar-music";
                    self._tip = "插入虾米音乐";
                    self._contextMenu = contextMenu;
                    self._flashRules = ["img." + CLS_XIAMI];
                    self._config_dwidth = "430px";
                },
                _updateTip:function(tipurl, selectedFlash) {
                    var self = this,
                        editor = self.editor,
                        r = editor.restoreRealElement(selectedFlash);
                    if (!r)return;
                    tipurl.html(selectedFlash.attr("title"));
                    tipurl.attr("href", self._getFlashUrl(r));
                },
                _initD:function() {
                    var self = this,
                        editor = self.editor,
                        d = self.d,
                        action = d.el.one(".ke-xiami-form"),
                        input = d.el.one(".ke-xiami-url");
                    self.dAlign = KE.Select.decorate(d.el.one(".ke-xiami-align"));
                    self._xiami_input = input;
                    KE.Utils.placeholder(input, TIP);
                    self._xiamia_list = d.el.one(".ke-xiami-list");
                    self._xiami_submit = new KE.TripleButton({
                        el:d.el.one(".ke-xiami-submit"),
                        cls:'ke-button',
                        text:"搜&nbsp;索"
                    });
                    self._xiami_submit.on("offClick", function() {
                        loadRecordsByPage(1);
                    });
                    input.on("keydown", function(ev) {
                        if (ev.keyCode === 13) {
                            loadRecordsByPage(1);
                        }
                    });
                    self.dMargin = d.el.one(".ke-xiami-margin");
                    self._xiami_url_wrap = d.el.one(".ke-xiami-url-wrap");
                    self._xiamia_title = d.el.one(".ke-xiami-title");

                    var _xiami_ok = d.foot.one(".ke-xiami-ok");
                    d.foot.one(".ke-xiami-cancel").on("click", function() {
                        d.hide();
                    });
                    _xiami_ok.on("click", function() {
                        var f = self.selectedFlash,
                            r = editor.restoreRealElement(f);
                        self._dinfo = {
                            url:self._getFlashUrl(r),
                            attrs:{
                                title:f.attr("title"),
                                align:self.dAlign.val(),
                                style:
                                    "margin:" +
                                        (parseInt(self.dMargin.val()) || 0)
                                        + "px;"
                            }
                        };
                        self._gen();
                    }, self);

                    function loadRecordsByPage(page) {
                        var query = input.val();
                        if (query.replace(/[^\x00-\xff]/g, "@@").length > 30) {
                            alert("长度上限30个字符（1个汉字=2个字符）");
                            return;
                        } else if (!S.trim(query)) {
                            alert("不能为空！");
                            return;
                        }
                        self._xiami_submit.disable();
                        var params = {
                            key:encodeURIComponent(input.val()),
                            page:page,
                            random:(new Date().valueOf())
                        };
                        var req = getXiamiUrl(params);
                        bangpai_xiami.instance = self;
                        bangpai_xiami.page = page;
                        self._xiamia_list.html("<img style='" +
                            "display:block;" +
                            "width:108px;" +
                            "margin:5px auto 0 auto;" +
                            "'src='" + loading + "'/>");
                        var node = S.getScript(req, {
                            timeout:10,
                            success:function() {
                            },
                            error:function() {
                                node.src = '';
                                self._xiami_submit.enable();
                                var html = "<p style='text-align:center;margin:10px 0;'>" +
                                    "不好意思，超时了，请重试！" +
                                    "</p>";
                                self._xiamia_list.html(html);
                            }
                        });


                    }

                    self._xiamia_list.on("click", function(ev) {
                        ev.preventDefault();
                        var t = new Node(ev.target),
                            add = t._4e_ascendant(function(node) {
                                return self._xiamia_list._4e_contains(node) && node.hasClass("ke-xiami-add");
                            }, true),
                            paging = t._4e_ascendant(function(node) {
                                return self._xiamia_list._4e_contains(node) && node.hasClass("ke-xiami-page-item");
                            }, true);
                        if (add) {
                            self._dinfo = {
                                url:("http://www.xiami.com/widget/" +
                                    add.attr("data-value")
                                    + "/singlePlayer.swf"),
                                attrs:{
                                    title:add.attr("title"),
                                    align:self.dAlign.val(),
                                    style:
                                        "margin:" +
                                            (parseInt(self.dMargin.val()) || 0)
                                            + "px;"
                                }
                            };
                            self._gen();
                        } else if (paging) {
                            loadRecordsByPage(parseInt(paging.attr("data-value")));
                        }
                    });
                },
                _listSearch:function(data) {
                    var self = this,
                        i,
                        re = data.results,
                        html = "";
                    //xiami 返回结果自动trim了
                    if (data.key == S.trim(self._xiami_input.val())) {
                        self._xiami_submit.enable();
                        if (re && re.length) {
                            html = "<ul>";
                            for (i = 0; i < re.length; i++) {
                                var r = re[i],d = getDisplayName(r);
                                html += "<li " +
                                    "title='" + d + "'>" +
                                    "<span class='ke-xiami-song'>"
                                    + limit(d, 35) +
                                    "</span>" +
                                    "" +
                                    "" +
                                    //album_id_song_id
                                    "<a href='#' " +
                                    "title='" + d + "' " +
                                    "class='ke-xiami-add' data-value='" +
                                    (
                                        r.album_id
                                            + "_"
                                            + r.song_id
                                        )
                                    + "'>选择</a>" +
                                    "</li>"
                            }
                            html += "</ul>";

                            var page = data.page,
                                totalpage = Math.floor(data.total / 8),
                                start = page - 3,
                                end = page + 3;

                            if (totalpage > 1) {
                                if (start <= 2) {
                                    end = Math.min(2 - start + end, totalpage - 1);
                                    start = 2;
                                }
                                end = Math.min(end, totalpage - 1);
                                if (end == totalpage - 1) {
                                    start = Math.max(2, end - 6);
                                }

                                html += "<p class='ke-xiami-paging'>" +
                                    getXiamiPaging(page, 1, "1" + (start != 2 ? "..." : ""));
                                for (i = start; i <= end; i++) {
                                    html += getXiamiPaging(page, i);
                                }
                                if (end != totalpage) {
                                    html += getXiamiPaging(page, totalpage, (end != totalpage - 1 ? "..." : "") + totalpage);
                                }
                                html += "</p>";
                            }

                        } else {
                            html = "<p style='text-align:center;margin:10px 0;'>不好意思，没有找到结果！</p>";
                        }
                        self._xiamia_list.html(html);
                    }
                },
                _updateD : function() {
                    var self = this,
                        f = self.selectedFlash;
                    if (f) {
                        self._xiami_input.val(f.attr("title"));
                        self._xiamia_title.html(f.attr("title"));
                        self.dAlign.val(f.attr("align"));
                        self.dMargin.val(parseInt(f._4e_style("margin")) || 0);
                        self._xiami_url_wrap.hide();
                        self.d.foot.show();
                        self._xiamia_title.show();
                    } else {
                        KE.Utils.resetInput(self._xiami_input);
                        self.dAlign.val("");
                        self.dMargin.val("5");
                        self._xiami_url_wrap.show();
                        self.d.foot.hide();
                        self._xiamia_title.hide();
                    }
                    //self._xiami_submit.disable();
                    self._xiamia_list.html("");
                },

                _getDInfo:function() {
                    var self = this;
                    S.mix(self._dinfo.attrs, {
                        width:257,
                        height:33
                    });
                    return self._dinfo;
                }
            });
            function getXiamiPaging(page, i, s) {
                return "<a class='ke-xiami-page-item" +
                    ((page == i) ? " ke-xiami-curpage" : "") +
                    "' data-value='" + i + "' href='#'>" + (s || i) + "</a>";
            }

            function getDisplayName(r) {
                return decodeURIComponent(r.song_name) + " - " + decodeURIComponent(r.artist_name);
            }

            function checkXiami(node) {
                return node._4e_name() === 'img' &&
                    (!!node.hasClass(CLS_XIAMI)) &&
                    node;
            }

            var contextMenu = {
                "虾米属性":function(editor) {
                    var selection = editor.getSelection(),
                        startElement = selection && selection.getStartElement(),
                        flash = checkXiami(startElement),
                        flashUI = editor._toolbars[TYPE_XIAMI];
                    if (flash) {
                        flashUI.show(null, flash);
                    }
                }
            };

            Flash.registerBubble(TYPE_XIAMI, "虾米音乐： ", checkXiami);

            KE.BangPaiMusic = BangPaiMusic;
        })();
    }
    editor.addPlugin(function() {
        new KE.BangPaiMusic(editor);
    });
},
{
    attach:false,
    requires : ["flashsupport"]
});