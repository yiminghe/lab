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
});KISSY.Editor.add("bangpai-upload", function(editor) {
    var S = KISSY,KE = S.Editor;

    if (KE.BangPaiUpload) return;
    (function() {

        function BangPaiUpload(editor) {
            var self = this;
            self.editor = editor;
            self._init();
        }

        var DOM = S.DOM,
            JSON = S.JSON,
            PIC_NUM_LIMIT = 15,
            PIC_NUM_LIMIT_WARNING = "系统将只保留15张",
            PIC_SIZE_LIMIT = 1000,
            PIC_SIZE_LIMIT_WARNING = "图片不能超过1M",
            Node = S.Node,
            holder = [],
            movie = KE.Config.base + KE.Utils.debugUrl("plugins/uploader/uploader.swf"),
            progressBars = {};
        name = "ke-bangpai-upload";

        DOM.addStyleSheet("" +
            ".ke-upload-list {" +
            "width:100%;" +
            "" +
            "}" +

            ".ke-upload-list th {" +
            "border-top:1px solid #c1c8d1;" +
            "background-color:#EBEDF1;" +
            "}" +
            ".ke-upload-list td,.ke-upload-list th {" +
            "padding:0.5em;" +
            "text-align:center;" +
            "border-bottom:1px solid #c1c8d1;" +
            "}" +
            "", "ke-BangPaiUpload"
            )
            ;

        S.augment(BangPaiUpload, S.EventTarget, {
            _init:function() {
                var self = this,
                    editor = self.editor,
                    bangpaiCfg = editor.cfg["pluginConfig"]["bangpai-upload"],
                    holderEl = bangpaiCfg.holder,
                    bangpaiUploaderHolder = S.isString(holderEl) ?
                        S.one(holderEl) :
                        holderEl,
                    flashHolder = new Node("<div style='position:relative;" +
                        "margin:10px;'>批量上传图片：" +
                        "</div>")
                        .appendTo(bangpaiUploaderHolder),
                    listWrap = new Node("<div style='display:none'>")
                        .appendTo(bangpaiUploaderHolder),
                    btn = new Node("<button disabled='disabled'>浏览</button>")
                        .appendTo(flashHolder),
                    boffset = btn.offset(),
                    flashHolderOffset = flashHolder.offset(),
                    flashPos = new Node("<div style='" +
                        ("position:absolute;" +
                            "width:" + (btn.width() + 8) + "px;" +
                            "height:" + (btn.height() + 8) + "px;" +
                            "z-index:9999;")
                        + "'>").appendTo(flashHolder),
                    list = new Node("<div>" +
                        "<table class='ke-upload-list'>" +
                        "<thead>" +
                        "<tr>" +
                        "<th>" +
                        "序号" +
                        "</th>" +
                        "<th>" +
                        "图片" +
                        "</th>" +
                        "<th>" +
                        "大小" +
                        "</th>" +
                        "<th>" +
                        "上传进度" +
                        "</th>" +
                        "<th>" +
                        "图片操作" +
                        "</th>" +
                        "</tr>" +
                        "</thead>" +
                        "<tbody>" +
                        "</tbody>" +
                        "</table>" +
                        "</div>").appendTo(listWrap)
                        .one("tbody"),
                    up = new Node("<p " +
                        "style='margin:10px;" +
                        "text-align:right;'>" +
                        "<button>确定上传</button>" +
                        "</p>")
                        .appendTo(listWrap).one("button"),
                    fid = S.guid(name);
                holder[fid] = self;
                self.btn = btn;
                self.up = up;

                //swfready 要求可见
                flashPos.offset(boffset);

                var uploader = new KE.FlashBridge({
                    movie:movie,
                    methods:["removeFile",
                        "cancel",
                        "removeFile",
                        "disable",
                        "enable",
                        "setAllowMultipleFiles",
                        "setFileFilters",
                        "uploadAll"],
                    holder:flashPos,
                    attrs:{
                        width:btn.width() ,
                        height:btn.height()
                    },
                    params:{
                        wmode:"transparent"
                    },
                    flashVars:{
                        allowedDomain : location.hostname,
                        menu:true
                    }
                });

                self.uploader = uploader;
                self._list = list;
                self._listWrap = listWrap;
                self._ds = bangpaiCfg.serverUrl;
                self._dsp = bangpaiCfg.serverParams || {};
                self._fileInput = bangpaiCfg.fileInput || "Filedata";

                list.on("click", function(ev) {
                    var target = new Node(ev.target),tr;
                    ev.halt();
                    if (target.hasClass("ke-upload-insert")) {
                        tr = target.parent("tr"),url = tr.attr("url");
                        editor.insertElement(new Node("<img src='" +
                            url + "'/>", null, editor.document));
                    } else if (target.hasClass("ke-upload-delete")) {
                        tr = target.parent("tr"),fid = tr.attr("fid");
                        try {
                            uploader.cancel(fid);
                        } catch(e) {
                        }
                        uploader.removeFile(fid);
                        progressBars[fid].destroy();
                        delete progressBars[fid];
                        tr._4e_remove();
                        self.enable();
                        self._seqPics();
                    }
                });

                uploader.on("fileSelect", self._onSelect, self);
                uploader.on("uploadStart", self._onUploadStart, self);
                uploader.on("uploadProgress", self._onProgress, self);
                uploader.on("uploadComplete", self._onComplete, self);
                uploader.on("uploadCompleteData", self._onUploadCompleteData, self);
                uploader.on("swfReady", self._ready, self);
                uploader.on("uploadError", self._uploadError, self);
            },
            _uploadError:function(ev) {
                var self = this,
                    id = ev.id,
                    tr = self._getFileTr(id),
                    bar = progressBars[id];
                if (tr) {
                    bar && bar.destroy();
                    tr.one(".ke-upload-progress").html("<span style='color:red'>" +
                        ev.status +
                        "</span>");
                }
            },
            _getFileTr:function(id) {
                var self = this,
                    list = self._list,
                    trs = list.all("tr");
                for (var i = 0; i < trs.length; i++) {
                    var tr = new Node(trs[i]);
                    if (tr.attr("fid") == id) {
                        return tr;
                    }
                }
            },
            _onUploadStart:function(ev) {
                //console.log("_onUploadStart", ev);
                var id = ev.id,uploader = this.uploader;
                uploader.removeFile(id);
            },
            _onComplete:function() {
                //console.log("_onComplete", ev);
            },
            _onUploadCompleteData:function(ev) {
                var self = this,
                    data = S.trim(ev.data).replace(/\\r||\\n/g, ""),
                    id = ev.id;
                if (!data) return;
                data = JSON.parse(data);
                if (data.error) {
                    self._uploadError({
                        id:id,
                        status:data.error
                    });
                    return;
                }
                var tr = self._getFileTr(id);
                if (tr) {
                    tr.one(".ke-upload-insert").show();
                    tr.attr("url", data.imgUrl);
                }

            },
            _onProgress:function(ev) {
                //console.log("_onProgress", ev);
                var fid = ev.id,
                    progess = Math.floor(ev.bytesLoaded * 100 / ev.bytesTotal),
                    bar = progressBars[fid];
                bar && bar.set("progress", progess);

            },
            disable:function() {
                var self = this;
                self.uploader.disable();
                self.btn[0].disabled = true;
            },
            enable:function() {
                var self = this;
                self.uploader.enable();
                self.btn[0].disabled = false;
            },
            _seqPics:function() {
                var self = this, list = self._list,seq = 1;
                list.all(".ke-upload-seq").each(function(n) {
                    n.html(seq++);
                });
            },
            _getFilesSize:function(files) {
                var n = 0;
                for (var i in files) n++;
                return n;
            },
            _onSelect:function(ev) {
                var self = this,
                    uploader = self.uploader,
                    list = self._list,
                    curNum = 0,
                    files = ev.fileList,
                    available = PIC_NUM_LIMIT - list.all("tr").length;
                if (files) {
                    var l = self._getFilesSize(files);

                    if (l > available) {
                        alert(PIC_NUM_LIMIT_WARNING);
                    }
                    if (l >= available) {
                        self.disable();

                    }
                    self._listWrap.show();
                    for (var i in files) {
                        if (!files.hasOwnProperty(i)) continue;
                        var f = files[i];
                        if (self._getFileTr(f.id)) continue;
                        var size = Math.floor(f.size / 1000),id = f.id;
                        curNum ++;
                        if (curNum > available) {
                            uploader.removeFile(id);
                            continue;
                        }
                        var n = new Node("<tr fid='" + id + "'>"
                            + "<td class='ke-upload-seq'>"
                            + "</td>"
                            + "<td>"
                            + f.name
                            + "</td>"
                            + "<td>"
                            + size
                            + "k</td>" +
                            "<td class='ke-upload-progress'>" +
                            "</td>" +
                            "<td>" +
                            "<a href='#' " +
                            "class='ke-upload-insert' " +
                            "style='display:none'>" +
                            "[插入]</a> &nbsp; " +
                            "<a href='#' class='ke-upload-delete'>[删除]</a> &nbsp; "
                            +
                            "</td>"
                            + "</tr>").appendTo(list);
                        var prog = n.one(".ke-upload-progress");
                        if (size > PIC_SIZE_LIMIT) {
                            self._uploadError({
                                id:id,
                                status:PIC_SIZE_LIMIT_WARNING
                            });
                            uploader.removeFile(id);

                        } else {
                            progressBars[id] = new KE.ProgressBar({
                                container:n.one(".ke-upload-progress") ,
                                width:"100px",
                                height:"18px"
                            });
                        }
                    }
                    self._seqPics();
                }


            },

            _ready:function() {

                var self = this,
                    uploader = self.uploader,
                    up = self.up,
                    btn = self.btn;
                //self.flashPos.offset(self.boffset);
                btn[0].disabled = false;
                uploader.setAllowMultipleFiles(true);
                uploader.setFileFilters([
                    {
                        extensions:"*.jpeg;*.jpg;*.png;*.gif",
                        description:"图片文件( png,jpg,jpeg,gif )"

                    }
                ]);
                up.on("click", function(ev) {
                    ev.halt();
                    uploader.uploadAll(self._ds, "POST",
                        self._dsp,
                        self._fileInput);
                })

            }
        });

        KE.BangPaiUpload = BangPaiUpload;
    })();
    editor.addPlugin(function() {
        new KE.BangPaiUpload(editor);
    });
},
{
    attach:false,
    requires : ["flashutils","progressbar","flashbridge"]
});/**
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