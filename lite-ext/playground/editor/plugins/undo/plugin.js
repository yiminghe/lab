/**
 * undo,redo manager for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-undo", function(KE) {
    var S = KISSY,
        arrayCompare = KE.Utils.arrayCompare,
        UA = S.UA,
        Event = S.Event;

    /**
     * 当前编辑区域状态，包括html与选择区域
     * @param editor
     */
    function Snapshot(editor) {
        var contents = editor.getData(),selection = contents && editor.getSelection();
        //内容html
        this.contents = contents;
        //选择区域书签标志
        this.bookmarks = selection && selection.createBookmarks2(true);
    }


    S.augment(Snapshot, {
        /**
         * 编辑状态间是否相等
         * @param otherImage
         */
        equals:function(otherImage) {
            var thisContents = this.contents,
                otherContents = otherImage.contents;
            if (thisContents != otherContents)
                return false;
            var bookmarksA = this.bookmarks,
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
     * 键盘输入做延迟处理
     * @param s
     * @param fn
     * @param scope
     */
    function BufferTimer(s, fn, scope) {
        this.s = s;
        this.fn = fn;
        this.scope = scope || window;
        this.bufferTimer = null;
    }

    S.augment(BufferTimer, {
        run:function() {
            if (this.bufferTimer) {
                clearTimeout(this.bufferTimer);
                this.bufferTimer = null;
            }
            var self = this;

            this.bufferTimer = setTimeout(function() {
                self.fn.call(self.scope);
            }, this.s);
        }
    });
    var LIMIT = 30;


    /**
     * 通过编辑器的save与restore事件，编辑器实例的历史栈管理，与键盘监控
     * @param editor
     */
    function UndoManager(editor) {
        //redo undo history stack
        /**
         * 编辑器状态历史保存
         */
        this.history = [];
        this.index = 0;
        this.editor = editor;
        this.bufferTimer = new BufferTimer(500, this.save, this);
        this._init();
    }

    var editingKeyCodes = { /*Backspace*/ 8:1, /*Delete*/ 46:1 },
        modifierKeyCodes = { /*Shift*/ 16:1, /*Ctrl*/ 17:1, /*Alt*/ 18:1 },
        navigationKeyCodes = { 37:1, 38:1, 39:1, 40:1 },// Arrows: L, T, R, B
        zKeyCode = 90,
        yKeyCode = 89;


    S.augment(UndoManager, {
        /**
         * 监控键盘输入，buffer处理
         * @param ev
         */
        _keyMonitor:function(ev) {
            var self = this,editor = self.editor,doc = editor.document;
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
            var self = this,editor = self.editor;
            //外部通过editor触发save|restore,管理器捕获事件处理
            editor.on("save", function(ev) {
                if (ev.buffer)
                //键盘操作需要缓存
                    self.bufferTimer.run();
                else {
                    //其他立即save
                    self.save();
                }
            });
            editor.on("restore", this.restore, this);
            self._keyMonitor();
            //先save一下
            self.save();
        },

        /**
         * 保存历史
         */
        save:function() {
            //前面的历史抛弃
            if (this.history.length > this.index + 1)
                this.history.splice(this.index + 1, this.history.length - this.index - 1);

            var self = this,
                editor = self.editor,
                last = self.history.length > 0 ? self.history[self.history.length - 1] : null,
                current = new Snapshot(self.editor);

            if (!last || !last.equals(current)) {
                if (self.history.length === LIMIT) {
                    self.history.shift();
                }
                self.history.push(current);
                this.index = self.history.length - 1;
                editor.fire("afterSave", {history:self.history,index:this.index});
            }
        },

        /**
         *
         * @param ev
         * ev.d ：1.向前撤销 ，-1.向后重做
         */
        restore:function(ev) {
            var d = ev.d,self = this,editor = self.editor,
                snapshot = self.history.length > 0 ? self.history[this.index + d] : null;
            if (snapshot) {
                editor.setData(snapshot.contents);
                if (snapshot.bookmarks)
                    self.editor.getSelection().selectBookmarks(snapshot.bookmarks);
                else if (UA.ie) {
                    // IE BUG: If I don't set the selection to *somewhere* after setting
                    // document contents, then IE would create an empty paragraph at the bottom
                    // the next time the document is modified.
                    var $range = this.editor.document.body.createTextRange();
                    $range.collapse(true);
                    $range.select();
                }
                this.index += d;
                editor.fire("afterRestore", {
                    history:self.history,
                    index:this.index
                });
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
    function RestoreUI(editor, text) {
        this.editor = editor;
        this.text = text;
        this._init();
    }

    S.augment(RestoreUI, {
        _init:function() {
            var self = this,editor = self.editor;
            self.el = new TripleButton({
                text:self.text,
                container:editor.toolBarDiv
            });
            this.el.set("state", TripleButton.DISABLED);
            /**
             * save,restore完，更新工具栏状态
             */
            editor.on("afterSave", this._respond, this);
            editor.on("afterRestore", this._respond, this);

            /**
             * 触发重做或撤销动作，都是restore，方向不同
             */
            self.el.on("click", function() {
                editor.fire("restore", {
                    d:RedoMap[self.text]
                });
            });
        },

        _respond:function(ev) {
            var self = this,history = ev.history,
                index = ev.index;
            self.updateUI(history, index);
        },

        updateUI:function(history, index) {
            if (this.text == "undo") {
                if (index > 0 && history.length > 0) {
                    this.el.set("state", TripleButton.OFF);
                } else {
                    this.el.set("state", TripleButton.DISABLED);
                }
            } else if (this.text == "redo") {
                if (index < history.length - 1) {
                    this.el.set("state", TripleButton.OFF);
                } else {
                    this.el.set("state", TripleButton.DISABLED);
                }
            }
        }
    });


    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;

        /**
         * 编辑器历史中央管理
         */
        new UndoManager(editor);

        /**
         * 撤销工具栏按钮
         */
        new RestoreUI(editor, "undo");
        /**
         * 重做工具栏按钮
         */
        new RestoreUI(editor, "redo");
    });


});