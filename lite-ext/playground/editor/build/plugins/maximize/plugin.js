/**
 * maximize editor
 * @author:yiminghe@gmail.com
 * @note:firefox 焦点完全完蛋了，这里全是针对firefox
 */
KISSY.Editor.add("maximize", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        UA = S.UA,
        Node = S.Node,
        Event = S.Event,
        TripleButton = KE.TripleButton,
        DOM = S.DOM,
        iframe;

    if (!KE.Maximize) {
        (function() {
            function Maximize(editor) {
                var self = this;
                self.editor = editor;
                self._init();
            }

            Maximize.init = function() {
                iframe = new Node("<" + "iframe " +
                    "style='" +
                    "position:absolute;" +
                    "top:-9999px;" +
                    "left:-9999px;" +
                    "' " +
                    "frameborder='0'>" +
                    "</iframe>").appendTo(document.body);
                Maximize.init = null;
            };
            S.augment(Maximize, {
                _init:function() {
                    var self = this,
                        editor = self.editor,
                        el = new TripleButton({
                            container:editor.toolBarDiv,
                            title:"全屏",
                            contentCls:"ke-toolbar-maximize"
                        });
                    self.el = el;
                    el.on("offClick", self.maximize, self);
                    el.on("onClick", self.restore, self);
                    KE.Utils.lazyRun(self, "_prepare", "_real");
                },

                restore:function() {
                    var self = this,
                        doc = document,
                        editor = self.editor;
                    //body overflow 变化也会引起 resize 变化！！！！先去除
                    Event.remove(window, "resize", self._maximize, self);
                    self._saveEditorStatus();
                    self._restoreState();
                    self.el.set("state", TripleButton.OFF);

                    //firefox 必须timeout
                    setTimeout(function() {
                        self._restoreEditorStatus();
                        editor.notifySelectionChange();
                    }, 30);
                },

                /**
                 * 从内存恢复最大化前的外围状态信息到编辑器实际动作，
                 * 包括编辑器位置以及周围元素，浏览器窗口
                 */
                _restoreState:function() {
                    var self = this,
                        doc = document,
                        editor = self.editor,
                        //恢复父节点的position原状态 bugfix:最大化被父元素限制
                        _savedParents = self._savedParents;
                    if (_savedParents) {
                        for (var i = 0; i < _savedParents.length; i++) {
                            var po = _savedParents[i];
                            po.el.css("position", po.position);
                        }
                    }
                    //如果没有失去焦点，重新获得当前选取元素
                    //self._saveEditorStatus();
                    editor.wrap.css({
                        height:self.iframeHeight
                    });
                    new Node(doc.body).css({
                        width:"",
                        height:"",
                        overflow:""
                    });
                    doc.documentElement.style.overflow = "";
                    editor.editorWrap.css({
                        position:"static",
                        width:self.editorWrapWidth
                    });
                    iframe.css({
                        left:"-99999px",
                        top:"-99999px"
                    });
                    window.scrollTo(self.scrollLeft, self.scrollTop);
                },
                /**
                 * 保存最大化前的外围状态信息到内存，
                 * 包括编辑器位置以及周围元素，浏览器窗口
                 */
                _saveSate:function() {
                    var self = this,
                        editor = self.editor,
                        _savedParents = [],
                        editorWrap = editor.editorWrap;
                    self.iframeHeight = editor.wrap._4e_style("height");
                    self.editorWrapWidth = editorWrap._4e_style("width");
                    //主窗口滚动条也要保存哦
                    self.scrollLeft = DOM.scrollLeft();
                    self.scrollTop = DOM.scrollTop();
                    window.scrollTo(0, 0);

                    //将父节点的position都改成static并保存原状态 bugfix:最大化被父元素限制
                    var p = editorWrap.parent();
                    while (p) {
                        if (p.css("position") != "static") {
                            _savedParents.push({
                                el:p,
                                position:p.css("position")
                            });
                            p.css("position", "static");
                        }
                        p = p.parent();
                    }
                    self._savedParents = _savedParents;
                },

                /**
                 *  编辑器自身核心状态保存，每次最大化最小化都要save,restore，
                 *  firefox修正，iframe layout变化时，range丢了
                 */
                _saveEditorStatus:function() {
                    var self = this,
                        editor = self.editor;
                    if (!UA.gecko || !editor.iframeFocus) return;
                    var sel = editor.getSelection();
                    //firefox 光标丢失bug,位置丢失，所以这里保存下
                    self.savedRanges = sel && sel.getRanges();
                },

                /**
                 * 编辑器自身核心状态恢复，每次最大化最小化都要save,restore，
                 * 维持编辑器核心状态不变
                 */
                _restoreEditorStatus:function() {
                    var self = this,
                        editor = self.editor,
                        sel = editor.getSelection(),
                        savedRanges = self.savedRanges;

                    //firefox焦点bug
                    if (UA.gecko && editor.iframeFocus) {
                        //原来是聚焦，现在刷新designmode
                        //firefox 先失去焦点才行
                        self.el.el[0].focus();
                        editor.focus();
                        if (savedRanges && sel) {
                            sel.selectRanges(savedRanges);
                        }

                    }
                    //firefox 有焦点时才重新聚焦
                    if (editor.iframeFocus && sel) {
                        var element = sel.getStartElement();
                        //使用原生不行的，会使主窗口滚动
                        //element[0] && element[0].scrollIntoView(true);
                        element && element[0] && element._4e_scrollIntoView();
                    }
                },

                /**
                 * 将编辑器最大化-实际动作
                 */
                _maximize:function() {
                    var self = this,
                        editor = self.editor,
                        editorWrap = editor.editorWrap,
                        viewportHeight = DOM.viewportHeight(),
                        viewportWidth = DOM.viewportWidth(),
                        statusHeight = editor.statusDiv ? editor.statusDiv.height() : 0,
                        toolHeight = editor.toolBarDiv.height();

                    if (!UA.ie) {
                        new Node(document.body).css({
                            width:0,
                            height:0,
                            overflow:"hidden"
                        });
                    }
                    else {
                        document.documentElement.style.overflow = "hidden";
                        document.body.style.overflow = "hidden";
                    }
                    editorWrap.css({
                        position:"absolute",
                        zIndex:990,
                        width:viewportWidth + "px"
                    });
                    iframe.css({
                        zIndex:985,
                        height:viewportHeight + "px",
                        width:viewportWidth + "px"
                    });
                    editorWrap.offset({
                        left:0,
                        top:0
                    });
                    iframe.css({
                        left:0,
                        top:0
                    });
                    editor.wrap.css({
                        height:(viewportHeight - statusHeight - toolHeight - 8) + "px"
                    });
                },
                _real:function() {
                    var self = this,
                        editor = self.editor;

                    self._saveEditorStatus();
                    self._saveSate();
                    self._maximize();
                    //firefox第一次最大化bug，重做一次
                    //if (true
                    //|| UA.gecko
                    //   ) {
                    self._maximize();
                    //}
                    Event.on(window, "resize", self._maximize, self);
                    self.el.set("state", TripleButton.ON);
                    setTimeout(function() {
                        self._restoreEditorStatus();
                        editor.notifySelectionChange();
                    }, 30);
                },
                _prepare:function() {
                    Maximize.init && Maximize.init();
                },
                maximize:function() {
                    this._prepare();
                }
            });

            KE.Maximize = Maximize;
        })();
    }
    editor.addPlugin(function() {
        new KE.Maximize(editor);
    });
});