/**
 * undo,redo manager for kissy editor
 * @author: yiminghe@gmail.com
 */
KISSY.Editor.add("undo", function(editor) {
    var S = KISSY,
        KE = S.Editor,
        arrayCompare = KE.Utils.arrayCompare,
        UA = S.UA,
        Event = S.Event,
        LIMIT = 30;
    if (!KE.UndoManager) {
        (function() {
            /**
             * 当前编辑区域状态，包括html与选择区域
             * @param editor
             */
            function Snapshot(editor) {
                var contents = editor._getRawData(),
                    self = this,
                    selection = contents && editor.getSelection();
                //内容html
                self.contents = contents;
                //选择区域书签标志
                self.bookmarks = selection && selection.createBookmarks2(true);
            }


            S.augment(Snapshot, {
                /**
                 * 编辑状态间是否相等
                 * @param otherImage
                 */
                equals:function(otherImage) {
                    var self = this,
                        thisContents = self.contents,
                        otherContents = otherImage.contents;
                    if (thisContents != otherContents)
                        return false;
                    var bookmarksA = self.bookmarks,
                        bookmarksB = otherImage.bookmarks;

                    if (bookmarksA || bookmarksB) {
                        if (!bookmarksA || !bookmarksB || bookmarksA.length != bookmarksB.length)
                            return false;

                        for (var i = 0; i < bookmarksA.length; i++) {
                            var bookmarkA = bookmarksA[ i ],
                                bookmarkB = bookmarksB[ i ];

                            if (
                                bookmarkA.startOffset != bookmarkB.startOffset ||
                                    bookmarkA.endOffset != bookmarkB.endOffset ||
                                    !arrayCompare(bookmarkA.start, bookmarkB.start) ||
                                    !arrayCompare(bookmarkA.end, bookmarkB.end)) {
                                return false;
                            }
                        }
                    }

                    return true;
                }
            });

            /**
             * 通过编辑器的save与restore事件，编辑器实例的历史栈管理，与键盘监控
             * @param editor
             */
            function UndoManager(editor) {
                //redo undo history stack
                /**
                 * 编辑器状态历史保存
                 */
                var self = this;
                self.history = [];
                //当前所处状态对应的历史栈内下标
                self.index = -1;
                self.editor = editor;
                //键盘输入做延迟处理
                self.bufferRunner = KE.Utils.buffer(self.save, self, 500);
                self._init();
            }

            var editingKeyCodes = { /*Backspace*/ 8:1, /*Delete*/ 46:1 },
                modifierKeyCodes = { /*Shift*/ 16:1, /*Ctrl*/ 17:1, /*Alt*/ 18:1 },
                navigationKeyCodes = { 37:1, 38:1, 39:1, 40:1,33:1,34:1 },// Arrows: L, T, R, B
                zKeyCode = 90,
                yKeyCode = 89;


            S.augment(UndoManager, {
                /**
                 * 监控键盘输入，buffer处理
                 */
                _keyMonitor:function() {
                    var self = this,
                        editor = self.editor,
                        doc = editor.document;
                    Event.on(doc, "keydown", function(ev) {
                        var keycode = ev.keyCode;
                        if (keycode in navigationKeyCodes
                            || keycode in modifierKeyCodes
                            )
                            return;
                        //ctrl+z，撤销
                        if (keycode === zKeyCode && (ev.ctrlKey || ev.metaKey)) {
                            editor.fire("restore", {d:-1});
                            ev.halt();
                            return;
                        }
                        //ctrl+y，重做
                        if (keycode === yKeyCode && (ev.ctrlKey || ev.metaKey)) {
                            editor.fire("restore", {d:1});
                            ev.halt();
                            return;
                        }
                        editor.fire("save", {buffer:1});
                    });
                },

                _init:function() {
                    var self = this,
                        editor = self.editor;
                    //外部通过editor触发save|restore,管理器捕获事件处理
                    editor.on("save", function(ev) {
                        if (ev.buffer) {
                            //键盘操作需要缓存
                            self.bufferRunner();
                        } else {
                            //其他立即save
                            self.save();
                        }
                    });
                    editor.on("restore", self.restore, self);
                    self._keyMonitor();
                    //先save一下,why??
                    //0913:初始状态保存，放在use回调中
                    //self.save();
                },

                /**
                 * 保存历史
                 */
                save:function() {
                    var self = this,
                        history = self.history,
                        index = self.index;

                    //前面的历史抛弃
                    if (history.length > index + 1)
                        history.splice(index + 1, history.length - index - 1);

                    var editor = self.editor,
                        last = history[history.length - 1],
                        current = new Snapshot(editor);

                    if (!last || !last.equals(current)) {
                        if (history.length === LIMIT) {
                            history.shift();
                        }
                        history.push(current);
                        self.index = index = history.length - 1;
                        editor.fire("afterSave", {history:history,index:index});
                    }
                },

                /**
                 *
                 * @param ev
                 * ev.d ：1.向前撤销 ，-1.向后重做
                 */
                restore:function(ev) {
                    var d = ev.d,
                        self = this,
                        history = self.history,
                        editor = self.editor,
                        snapshot = history[self.index + d];
                    if (snapshot) {
                        editor._setRawData(snapshot.contents);
                        if (snapshot.bookmarks)
                            editor.getSelection().selectBookmarks(snapshot.bookmarks);
                        else if (UA.ie) {
                            // IE BUG: If I don't set the selection to *somewhere* after setting
                            // document contents, then IE would create an empty paragraph at the bottom
                            // the next time the document is modified.
                            var $range = editor.document.body.createTextRange();
                            $range.collapse(true);
                            $range.select();
                        }
                        self.index += d;
                        editor.fire("afterRestore", {
                            history:history,
                            index:self.index
                        });
                        editor.notifySelectionChange();
                    }
                }
            });


            var TripleButton = KE.TripleButton,RedoMap = {
                "redo":1,
                "undo":-1
            };

            /**
             * 工具栏重做与撤销的ui功能
             * @param editor
             * @param text
             */
            function RestoreUI(editor, text, title, contentCls) {
                var self = this;
                self.editor = editor;
                self.title = title;
                self.text = text;
                self.contentCls = contentCls;
                self._init();
            }

            S.augment(RestoreUI, {
                _init:function() {
                    var self = this,
                        editor = self.editor;

                    self.el = new TripleButton({
                        contentCls:self.contentCls,
                        title:self.title,
                        container:editor.toolBarDiv
                    });
                    var el = self.el;
                    el.set("state", TripleButton.DISABLED);
                    /**
                     * save,restore完，更新工具栏状态
                     */
                    editor.on("afterSave afterRestore", self._respond, self);

                    /**
                     * 触发重做或撤销动作，都是restore，方向不同
                     */
                    el.on("offClick", function() {
                        editor.fire("restore", {
                            d:RedoMap[self.text]
                        });
                    });
                    KE.Utils.sourceDisable(editor, self);
                },
                disable:function() {
                    this._saveState = this.el.get("state");
                    this.el.set("state", TripleButton.DISABLED);
                },
                enable:function() {
                    this.el.set("state", this._saveState);
                },

                _respond:function(ev) {
                    this.updateUI(ev.history, ev.index);
                },

                updateUI:function(history, index) {
                    var self = this,
                        el = self.el,
                        text = self.text;
                    if (text == "undo") {
                        //有状态可退
                        if (index > 0) {
                            el.set("state", TripleButton.OFF);
                        } else {
                            el.set("state", TripleButton.DISABLED);
                        }
                    } else if (text == "redo") {
                        //有状态可前进
                        if (index < history.length - 1) {
                            el.set("state", TripleButton.OFF);
                        } else {
                            el.set("state", TripleButton.DISABLED);
                        }
                    }
                }
            });
            KE.UndoManager = UndoManager;
            KE.RestoreUI = RestoreUI;
        })();
    }

    editor.addPlugin(function() {

        /**
         * 编辑器历史中央管理
         */
        new KE.UndoManager(editor);

        /**
         * 撤销工具栏按钮
         */
        new KE.RestoreUI(editor, "undo", "撤销", "ke-toolbar-undo");
        /**
         * 重做工具栏按钮
         */
        new KE.RestoreUI(editor, "redo", "重做", "ke-toolbar-redo");
    });


});
