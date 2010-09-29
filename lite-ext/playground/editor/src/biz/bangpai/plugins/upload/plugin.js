KISSY.Editor.add("bangpai-upload", function(editor) {
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
});