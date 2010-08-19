/**
 * modified from ckeditor,editor class for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSY.add("editor", function(S) {
    var EventTarget = S.EventTarget,
        UA = S.UA,
        DOM = S.DOM,
        Node = S.Node,
        Event = S.Event,
        KE = KISSYEDITOR,
        DISPLAY = "display",
        WIDTH = "width",
        HEIGHT = "height",
        NONE = "none",

        VISIBILITY = "visibility",
        HIDDEN = "hidden",
        focusManager = KE.focusManager,
        tryThese = KE.Utils.tryThese,
        HTML5_DTD = '<!doctype html>',
        ke_textarea_wrap = ".ke-textarea-wrap",
        ke_editor_tools = ".ke-editor-tools",
        ke_editor_status = ".ke-editor-status",
        CSS_FILE = "kissyeditor-iframe.css";

    function prepareIFrameHtml() {
        return HTML5_DTD
            + "<html>"
            + "<head>"
            + "<title>kissy-editor</title>"
            + "<link href='"
            + KE.BASE_URL + CSS_FILE
            + "' rel='stylesheet'/>"
            + "</head>"
            + "<body class='ke-editor'>"
            //firefox 必须里面有东西，否则编辑前不能删除!
            + "&nbsp;"
            //使用 setData 加强安全性
            // + (textarea.value || "")
            + "</body>"
            + "<html>";
    }

    var INSTANCE_ID = 1,
        srcScript = 'document.open();' +
            'document.close();',
        editorHtml = "<div " +
            " class='ke-editor-wrap' " +
            //!!编辑器内焦点不失去,firefox?
            " onmousedown=' " +
            "return false;' " +
            " > " +
            "<div class='" + ke_editor_tools.substring(1) + "'></div>" +
            "<div class='" + ke_textarea_wrap.substring(1) + "'><iframe " +
            ' style="' + WIDTH + ':100%;' + HEIGHT + ':100%;border:none;" ' +
            ' ' + WIDTH + '="100%" ' +
            ' ' + HEIGHT + '="100%" ' +
            ' frameborder="0" ' +
            ' title="' + "kissy-editor" + '" ' +
            // With IE, the custom domain has to be taken care at first,
            // for other browsers, the 'src' attribute should be left empty to
            // trigger iframe's 'load' event.
            ' src="' + ( UA.ie ? 'javascript:void(function(){' + encodeURIComponent(srcScript) + '}())' : '' ) + '" ' +
            ' tabIndex="' + ( UA.webkit ? -1 : "$(tabIndex)" ) + '" ' +
            ' allowTransparency="true" ' +
            '></iframe></div>' +
            "<div class='" + ke_editor_status.substring(1) + "'></div>" +
            "</div>";

    function Editor(textarea) {

        if (!textarea[0]) textarea = new Node(textarea);
        var self = this,
            editorWrap = new Node(editorHtml.replace(/\$\(tabIndex\)/, textarea.attr("tabIndex")));
        self.editorWrap = editorWrap;
        self._UUID = INSTANCE_ID++;
        self.wrap = editorWrap.one(ke_textarea_wrap);
        self.iframe = self.wrap.one("iframe");
        self.toolBarDiv = editorWrap.one(ke_editor_tools);
        self.textarea = textarea;
        self.statusDiv = editorWrap.one(ke_editor_status);
        //ie 点击按钮不丢失焦点
        self.toolBarDiv._4e_unselectable();
        //可以直接调用插件功能
        self._commands = {};
        self._plugins = {};
        var tw = textarea._4e_style(WIDTH),th = textarea._4e_style(HEIGHT);
        if (tw) {
            editorWrap.css(WIDTH, tw);
            textarea.css(WIDTH, "100%");
        }
        self.textarea.css(DISPLAY, NONE);
        editorWrap.insertAfter(textarea);
        self.wrap[0].appendChild(textarea[0]);

        if (th) {
            self.wrap.css(HEIGHT, th);
            textarea.css(HEIGHT, "100%");
        }
        self._init();

    }

    S.augment(Editor, EventTarget, {
        addCommand:function(name, obj) {
            this._commands[name] = obj;
        },
        execCommand:function(name) {
            this._commands[name].exec(this);
        },
        getData:function() {
            if (KE.HtmlDataProcessor)
                return KE.HtmlDataProcessor.toHtml(this.document.body.innerHTML, "p");
            return this.document.body.innerHTML;
        } ,
        setData:function(data) {
            if (KE.HtmlDataProcessor)
                data = KE.HtmlDataProcessor.toDataFormat(data, "p");
            this.document.body.innerHTML = data;
        },
        sync:function() {
            this.textarea.val(this.getData());
        },
        //撤销重做时，不需要格式化代码，直接取自身
        _getRawData:function() {
            return this.document.body.innerHTML;
        },
        //撤销重做时，不需要格式化代码，直接取自身
        _setRawData:function(data) {
            this.document.body.innerHTML = data;
        },
        _hideSource:function() {
            var self = this;
            self.iframe.css(DISPLAY, "");
            self.textarea.css(DISPLAY, NONE);
            self.toolBarDiv.children().css(VISIBILITY, "");
            self.statusDiv.children().css(VISIBILITY, "");
        },

        _showSource:    function() {
            var self = this;
            self.textarea.css(DISPLAY, "");
            self.iframe.css(DISPLAY, NONE);
            self.toolBarDiv.children().css(VISIBILITY, HIDDEN);
            self.toolBarDiv.all(".ke-tool-editor-source").css(VISIBILITY, "");
            self.statusDiv.children().css(VISIBILITY, HIDDEN);
            //ie textarea height:100%不起作用
            if (UA.ie < 8) {
                self.textarea.css(HEIGHT, self.wrap.css(HEIGHT));
            }
        },
        _prepareIFrameHtml:prepareIFrameHtml,

        getSelection:function() {
            var sel = new KE.Selection(this.document);
            return ( !sel || sel.isInvalid ) ? null : sel;
        } ,
        focus:function() {
            var self = this,
                win = DOM._4e_getWin(self.document);
            UA.webkit && win && win.parent && win.parent.focus();
            //win && win.blur();
            //yiminghe note:firefox need this ,暂时使得iframe先失去焦点，触发 blinkCursor 补丁
            //if (UA.gecko)self.blur();
            //yiminghe note:webkit need win.focus

            win && win.focus();
            //ie and firefox need body focus
            self.document && self.document.body.focus();
            self.notifySelectionChange();
        } ,
        blur:function() {
            /*
             工具栏有焦点，iframe也有焦点？？
             this.toolBarDiv.children().each(function(el) {
             el[0].focus();
             });
             */
            var self = this,
                win = DOM._4e_getWin(self.document);
            win.blur();
            self.document && self.document.body.blur();
            //self.notifySelectionChange();

            //firefox 焦点相关，强制 mousedown 刷新光标
            //this.iframeFocus = false;
        },
        /**
         * 初始化iframe内容以及浏览器间兼容性处理
         */
        _initIFrame:function() {
            var self = this,
                iframe = self.iframe,
                KES = KE.SELECTION,
                textarea = self.textarea[0],
                data = prepareIFrameHtml(),
                win = iframe[0].contentWindow,
                doc = win.document;
            self.document = doc;
            iframe.detach();
            // Don't leave any history log in IE. (#5657)
            doc.open("text/html", "replace");
            doc.write(data);
            doc.close();
            var body = doc.body;

            if (UA.ie) {
                // Don't display the focus border.
                body.hideFocus = true;

                // Disable and re-enable the body to avoid IE from
                // taking the editing focus at startup. (#141 / #523)
                body.disabled = true;
                body.contentEditable = true;
                body.removeAttribute('disabled');
            } else {
                // Avoid opening design mode in a frame window thread,
                // which will cause host page scrolling.(#4397)
                setTimeout(function() {
                    // Prefer 'contentEditable' instead of 'designMode'. (#3593)
                    if (UA.gecko || UA.opera) {
                        body.contentEditable = true;
                    }
                    else if (UA.webkit)
                        body.parentNode.contentEditable = true;
                    else
                        doc.designMode = 'on';
                }, 0);
            }

            // Gecko need a key event to 'wake up' the editing
            // ability when document is empty.(#3864)
            //activateEditing 删掉，初始引起屏幕滚动了

            // IE, Opera and Safari may not support it and throw
            // errors.
            try {
                doc.execCommand('enableObjectResizing', false, true);
            } catch(e) {
            }
            try {
                doc.execCommand('enableInlineTableEditing', false, true);
            } catch(e) {
            }

            // Gecko/Webkit need some help when selecting control type elements. (#3448)
            //if (!( UA.ie || UA.opera)) {
            if (UA.webkit) {
                Event.on(doc, "mousedown", function(ev) {
                    var control = new Node(ev.target);
                    if (S.inArray(control._4e_name(), ['img', 'hr', 'input', 'textarea', 'select'])) {
                        self.getSelection().selectElement(control);
                    }
                });
            }

            // Webkit: avoid from editing form control elements content.
            if (UA.webkit) {
                Event.on(doc, "click", function(ev) {
                    var control = new Node(ev.target);
                    if (S.inArray(control._4e_name(), ['input', 'select'])) {
                        ev.preventDefault();
                    }
                });
                // Prevent from editig textfield/textarea value.
                Event.on(doc, "mouseup", function(ev) {
                    var control = new Node(ev.target);
                    if (S.inArray(control._4e_name(), ['input', 'textarea'])) {
                        ev.preventDefault();
                    }
                });
            }

            function blinkCursor(retry) {
                tryThese(
                    function() {
                        doc.designMode = 'on';
                        setTimeout(function () {
                            doc.designMode = 'off';
                            //console.log("path1");
                            body.focus();
                            // Try it again once..
                            if (!arguments.callee.retry) {
                                arguments.callee.retry = true;
                                //arguments.callee();
                            }
                        }, 50);
                    },
                    function() {
                        // The above call is known to fail when parent DOM
                        // tree layout changes may break design mode. (#5782)
                        // Refresh the 'contentEditable' is a cue to this.
                        doc.designMode = 'off';

                        DOM.attr(body, 'contentEditable', false);
                        DOM.attr(body, 'contentEditable', true);
                        // Try it again once..
                        !retry && blinkCursor(1);
                        //console.log("path2");
                    });
            }

            // Create an invisible element to grab focus.
            if (UA.gecko || UA.ie || UA.opera) {
                var focusGrabber;
                focusGrabber = new Node(DOM.insertAfter(new Node(
                    // Use 'span' instead of anything else to fly under the screen-reader radar. (#5049)
                    '<span ' +
                        //'tabindex="-1" ' +
                        'style="position:absolute; left:-10000"' +
                        //' role="presentation"' +
                        '></span>')[0], textarea));
                focusGrabber.on('focus', function() {
                    self.focus();
                });
                self.on('destroy', function() {
                });
            }

            // IE standard compliant in editing frame doesn't focus the editor when
            // clicking outside actual content, manually apply the focus. (#1659)
            if (UA.ie
                && doc.compatMode == 'CSS1Compat'
                || UA.gecko
                || UA.opera) {
                var htmlElement = new Node(doc.documentElement);
                htmlElement.on('mousedown', function(evt) {
                    // Setting focus directly on editor doesn't work, we
                    // have to use here a temporary element to 'redirect'
                    // the focus.

                    if (evt.target === htmlElement[0]) {
                        if (UA.gecko)
                            blinkCursor(false);
                        focusGrabber[0].focus();
                    }
                });
            }


            Event.on(win, 'focus', function() {
                //console.log(" i am  focus inner");
                /**
                 * yiminghe特别注意：firefox光标丢失bug
                 * blink后光标出现在最后，这就需要实现保存range
                 * focus后再恢复range
                 */
                if (UA.gecko)
                    blinkCursor(false);
                else if (UA.opera)
                    body.focus();

                // focus 后强制刷新自己状态
                self.notifySelectionChange();
            });


            if (UA.gecko) {
                /**
                 * firefox 焦点丢失后，再点编辑器区域焦点会移不过来，要点两下
                 */
                Event.on(self.document, "mousedown", function() {
                    if (!self.iframeFocus) {
                        //console.log("i am fixed");
                        blinkCursor(false);
                    }
                });
            }

            if (UA.ie) {
                //new Node(doc.documentElement).addClass(doc.compatMode);
                // Override keystrokes which should have deletion behavior
                //  on control types in IE . (#4047)
                Event.on(doc, 'keydown', function(evt) {
                    var keyCode = evt.keyCode;
                    // Backspace OR Delete.
                    if (keyCode in { 8 : 1, 46 : 1 }) {
                        var sel = self.getSelection(),
                            control = sel.getSelectedElement();
                        if (control) {
                            // Make undo snapshot.
                            self.fire('save');
                            // Delete any element that 'hasLayout' (e.g. hr,table) in IE8 will
                            // break up the selection, safely manage it here. (#4795)
                            var bookmark = sel.getRanges()[ 0 ].createBookmark();
                            // Remove the control manually.
                            control.remove();
                            sel.selectBookmarks([ bookmark ]);
                            self.fire('save');
                            evt.preventDefault();
                        }
                    }
                });

                // PageUp/PageDown scrolling is broken in document
                // with standard doctype, manually fix it. (#4736)
                if (doc.compatMode == 'CSS1Compat') {
                    var pageUpDownKeys = { 33 : 1, 34 : 1 };
                    Event.on(doc, 'keydown', function(evt) {
                        if (evt.keyCode in pageUpDownKeys) {
                            setTimeout(function () {
                                self.getSelection().scrollIntoView();
                            }, 0);
                        }
                    });
                }
            }

            // Adds the document body as a context menu target.

            setTimeout(function() {
                /*
                 * IE BUG: IE might have rendered the iframe with invisible contents.
                 * (#3623). Push some inconsequential CSS style changes to force IE to
                 * refresh it.
                 *
                 * Also, for some unknown reasons, short timeouts (e.g. 100ms) do not
                 * fix the problem. :(
                 */
                if (UA.ie) {
                    setTimeout(function() {
                        if (doc) {
                            body.runtimeStyle.marginBottom = '0px';
                            body.runtimeStyle.marginBottom = '';
                        }
                    }, 1000);
                }
            }, 0);

            setTimeout(function() {
                self.fire("dataReady");
            }, 10);
            //注意：必须放在这个位置，等iframe加载好再开始运行
            //加入焦点管理，和其他实例联系起来
            focusManager.add(self);
        },
        _init:function() {
            var self = this,
                iframe = self.iframe;

            self.on("dataReady", function() {
                self.detach("dataReady");
                //默认填充p标签?
                //监控enter按键！，文字必定有 p 包含
                self.setData(S.trim(self.textarea.val()) || "");
                KE.fire("instanceCreated", {editor:self});
            });
            // With FF, it's better to load the data on iframe.load. (#3894,#4058)
            if (UA.gecko) {
                iframe.on('load', self._initIFrame, self);
            } else {
                //webkit(chrome) load等不来！
                self._initIFrame();
            }
        } ,

        _monitor:function() {
            var self = this;
            if (self._monitorId) {
                clearTimeout(self._monitorId);
            }
            self._monitorId = setTimeout(function() {
                var selection = self.getSelection();
                if (selection && !selection.isInvalid) {
                    var startElement = selection.getStartElement(),
                        currentPath = new KE.ElementPath(startElement);
                    if (!self.previousPath || !self.previousPath.compare(currentPath)) {
                        self.previousPath = currentPath;
                        self.fire("selectionChange", { selection : self, path : currentPath, element : startElement });
                    }
                }
            }, 200);
        }
        ,
        /**
         * 强制通知插件更新状态，防止插件修改编辑器内容，自己反而得不到通知
         */
        notifySelectionChange:function() {
            this.previousPath = null;
            this._monitor();
        },

        insertElement:function(element) {
            var self = this;
            self.focus();

            var elementName = element._4e_name(),
                xhtml_dtd = KE.XHTML_DTD,
                KER = KE.RANGE,
                KEN = KE.NODE,
                isBlock = xhtml_dtd.$block[ elementName ],
                selection = self.getSelection(),
                ranges = selection.getRanges(),
                range,
                clone,
                lastElement,
                current, dtd;

            self.fire("save");
            for (var i = ranges.length - 1; i >= 0; i--) {
                range = ranges[ i ];
                // Remove the original contents.
                range.deleteContents();
                clone = !i && element || element._4e_clone(true);
                // If we're inserting a block at dtd-violated position, split
                // the parent blocks until we reach blockLimit.
                if (isBlock) {
                    while (( current = range.getCommonAncestor(false, true) )
                        && ( dtd = xhtml_dtd[ current._4e_name() ] )
                        && !( dtd && dtd [ elementName ] )) {
                        // Split up inline elements.
                        if (current._4e_name() in xhtml_dtd.span)
                            range.splitElement(current);
                        // If we're in an empty block which indicate a new paragraph,
                        // simply replace it with the inserting block.(#3664)
                        else if (range.checkStartOfBlock()
                            && range.checkEndOfBlock()) {
                            range.setStartBefore(current);
                            range.collapse(true);
                            current.remove();
                        }
                        else
                            range.splitBlock();
                    }
                }

                // Insert the new node.
                range.insertNode(clone);
                // Save the last element reference so we can make the
                // selection later.
                if (!lastElement)
                    lastElement = clone;
            }

            range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
            var next = lastElement._4e_nextSourceNode(true);
            if (next && next.type == KEN.NODE_ELEMENT)
                range.moveToElementEditablePosition(next);
            selection.selectRanges([ range ]);
            self.focus();
            //http://code.google.com/p/kissy/issues/detail?can=1&start=100&id=121
            clone && clone._4e_scrollIntoView();
            setTimeout(function() {
                self.fire("save");
            }, 10);
        },

        insertHtml:function(data) {
            if (KE.HtmlDataProcessor)
                data = KE.HtmlDataProcessor.toDataFormat(data);//, "p");
            /**
             * webkit insert html 有问题！会把标签去掉，算了直接用insertElement
             */
            if (UA.webkit) {
                var nodes = DOM.create(data, null, this.document);
                if (nodes.nodeType == 11) nodes = S.makeArray(nodes.childNodes);
                else nodes = [nodes];
                for (var i = 0; i < nodes.length; i++)
                    this.insertElement(new Node(nodes[i]));
                return;
            }
            var self = this;
            self.focus();
            self.fire("save");
            var selection = self.getSelection();
            if (UA.ie) {
                var $sel = selection.getNative();
                if ($sel.type == 'Control')
                    $sel.clear();
                $sel.createRange().pasteHTML(data);
            } else {
                self.document.execCommand('inserthtml', false, data);
            }

            self.focus();
            setTimeout(function() {
                self.fire("save");
            }, 10);
        }
    });

    S.Editor = Editor;
});