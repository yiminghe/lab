KISSYEDITOR.add("editor-plugin-flash", function(KE) {
    var S = KISSY,
        Node = S.Node,
        TripleButton = KE.TripleButton,
        Overlay = KE.SimpleOverlay,
        flashFilenameRegex = /\.swf(?:$|\?)/i,
        dataProcessor = KE.HtmlDataProcessor,
        htmlFilter = dataProcessor && dataProcessor.htmlFilter,
        dataFilter = dataProcessor && dataProcessor.dataFilter;

    function isFlashEmbed(element) {
        var attributes = element.attributes;
        return ( attributes.type == 'application/x-shockwave-flash' || flashFilenameRegex.test(attributes.src || '') );
    }


    dataFilter && dataFilter.addRules({
        elements : {
            'object' : function(element) {
                var attributes = element.attributes,
                    classId = attributes.classid && String(attributes.classid).toLowerCase();
                if (!classId) {
                    // Look for the inner <embed>
                    for (var i = 0; i < element.children.length; i++) {
                        if (element.children[ i ].name == 'embed') {
                            if (!isFlashEmbed(element.children[ i ]))
                                return null;
                            return dataProcessor.createFakeParserElement(element, 'ke_flash', 'flash', true);
                        }
                    }
                    return null;
                }

                return dataProcessor.createFakeParserElement(element, 'ke_flash', 'flash', true);
            },

            'embed' : function(element) {
                if (!isFlashEmbed(element))
                    return null;
                return dataProcessor.createFakeParserElement(element, 'ke_flash', 'flash', true);
            }
        }}, 5);

    var html = "<div style='margin:10px;'><p><label>地址：<input class='ke-flash-url' size='50' /></label></p>" +
        "<p style='margin:5px 0'><label>宽度：<input class='ke-flash-width' size='18' /></label>" +
        "&nbsp;&nbsp;<label>高度：<input class='ke-flash-height' size='18' /></label></p>" +

        "<p style='margin:5px 0;text-align:right;'><button>确定</button></p></div>";

    function Flash(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(Flash, {
        _init:function() {
            var self = this,editor = self.editor;
            self.el = new TripleButton({
                container:editor.toolBarDiv,
                text:"flash",
                title:"Flash"
            });

            self.el.on("click", self._showConfig, this);

            KE.Utils.lazyRun(this, "_prepareShow", "_realShow");
        },
        _prepareShow:function() {
            var self = this;
            this._initDialogOk = true;
            self.d = new Overlay({
                title:"编辑flash",
                width:"350px",
                mask:true
            });
            self.d.body.html(html);
            self._initD();
        },
        _realShow:function() {
            this.d.show();
        },
        _showConfig:function() {
            this._prepareShow();
        },
        _initD:function() {
            var self = this,editor = self.editor,d = self.d;
            self.dHeight = d.el.one(".ke-flash-height");
            self.dWidth = d.el.one(".ke-flash-width");
            self.dUrl = d.el.one(".ke-flash-url");
            var action = d.el.one("button");
            action.on("click", self._gen, self);
        },

        _gen: function() {
            var self = this,editor = self.editor;
            var url = self.dUrl.val();
            if (!url)return;
            var real = new Node('<object ' +
                (parseInt(self.dWidth.val()) ? " width='" + parseInt(self.dWidth.val()) + "' " : ' ') +
                (parseInt(self.dHeight.val()) ? " height='" + parseInt(self.dHeight.val()) + "' " : ' ') +
                'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
                'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">' +
                '<param name="quality" value="high" />' +
                '<param name="movie" value="' + url + '" />' +
                '<embed ' +
                (parseInt(self.dWidth.val()) ? " width='" + parseInt(self.dWidth.val()) + "' " : ' ') +
                (parseInt(self.dHeight.val()) ? " height='" + parseInt(self.dHeight.val()) + "' " : ' ') + 'pluginspage="http://www.macromedia.com/go/getflashplayer" quality="high" ' +
                'src="' + url + '" ' +
                'type="application/x-shockwave-flash">' +
                '</embed>' +
                '</object>');

            var substitute = editor.createFakeElement(real, 'ke_flash', 'flash', true);
            editor.insertElement(substitute);
            self.d.hide();
        }
    });
    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new Flash(editor);
    });

});