/**
 * maximize editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-maximize", function(KE) {
    var S = KISSY,
        UA = S.UA,
        Node = S.Node,
        Event = S.Event,
        TripleButton = KE.TripleButton,
        DOM = S.DOM,iframe = new Node("<iframe style='position:absolute;top:-9999px;left:-9999px;' frameborder='0'></iframe>");
    S.ready(function() {
        document.body.appendChild(iframe[0]);
    });

    function Maximize(editor) {
        this.editor = editor;
        this._init();
    }

    S.augment(Maximize, {
        _init:function() {
            var self = this,editor = self.editor;
            self.el = new TripleButton({
                container:editor.toolBarDiv,
                text:"maximize"
            });

            self.el.on("offClick", self.maximize, self);

            self.el.on("onClick", self.restore, self);
        },
        restore:function() {
            var self = this,
                editor = self.editor;
            Event.remove(window, "resize", self._maximize, self);
            //editor.focus();

            this._saveEditorStatus();
            editor.iframe.css({
                width: self.iframeWidth,
                height:self.iframeHeight
            });
            editor.textarea.css({
                width: self.textareaWidth,
                height:self.textareaHeight
            });
            new Node(document.body).css({
                width:"",
                height:"",
                overflow:""
            });
            editor.editorWrap.css({
                position:"static",
                width:self.editorWrapWidth
            });
            iframe.css({
                left:"-99999px",
                top:"-99999px"
            });
            window.scrollTo(self.scrollLeft, self.scrollTop);
            self.el.set("state", TripleButton.OFF);
            //firefox 必须timeout
            setTimeout(function() {
                //editor.focus();
                self._restoreEditorStatus();
            }, 0);
        },

        _saveSate:function() {
            var self = this,
                editor = self.editor;
            self.iframeWidth = editor.iframe._4e_style("width");
            self.iframeHeight = editor.iframe._4e_style("height");
            self.editorWrapWidth = editor.editorWrap._4e_style("width");
            self.textareaWidth = editor.textarea._4e_style("width");
            self.textareaHeight = editor.textarea._4e_style("height");
            //主窗口滚动条也要保存哦
            self.scrollLeft = DOM.scrollLeft();
            self.scrollTop = DOM.scrollTop();
            window.scrollTo(0, 0);
        },

        _saveEditorStatus:function() {
            var self = this,
                editor = self.editor;
            var sel = editor.getSelection();
            //firefox 光标丢失bug,focus后位置丢失，所以这里保存下
            self.savedRanges = sel && sel.getRanges();
        },

        _restoreEditorStatus:function() {
            var self = this,
                editor = self.editor;
            var sel = editor.getSelection();
            self.savedRanges && sel && sel.selectRanges(self.savedRanges);
            if (sel) {
                var element = sel.getStartElement();
                //使用原生不行的，会使主窗口滚动
                //element[0] && element[0].scrollIntoView(true);
                element && element[0] && element.scrollIntoView(editor.document, false);
            }
        },
        _maximize:function() {
            var self = this,
                editor = self.editor;
            var viewportHeight = DOM.viewportHeight(),
                viewportWidth = DOM.viewportWidth(),
                statusHeight = editor.statusDiv ? editor.statusDiv.height() : 0,
                toolHeight = editor.toolBarDiv.height();
            editor.iframe.css({
                width:(viewportWidth - 5) + "px"
            });

            editor.textarea.css({
                width:(viewportWidth - 5) + "px"
            });
            if (!UA.ie)
                new Node(document.body).css({
                    width:0,
                    height:0,
                    overflow:"hidden"
                });
            else
                document.body.style.overflow = "hidden";
            editor.editorWrap.css({
                position:"absolute",
                zIndex:9999,
                width:viewportWidth + "px"
            });
            iframe.css({
                zIndex:9998,
                height:viewportHeight + "px",
                width:viewportWidth + "px"
            });
            editor.editorWrap.offset({
                left:0,
                top:0
            });
            iframe.css({
                left:0,
                top:0
            });
            editor.iframe.css({
                height:(viewportHeight - statusHeight - toolHeight - 6) + "px"
            });
            editor.textarea.css({
                height:(viewportHeight - toolHeight - 4) + "px"
            });
        },
        maximize:function() {
            var self = this,
                editor = self.editor;
            //editor.focus();
            this._saveEditorStatus();
            this._saveSate();
            this._maximize();
            //firefox第一次最大化bug，重做一次
            if (true || UA.gecko) {
                this._maximize();
            }
            Event.on(window, "resize", self._maximize, self);
            this.el.set("state", TripleButton.ON);
            //editor.focus();
            this._restoreEditorStatus();
        }
    });

    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;
        new Maximize(editor);
    });

});