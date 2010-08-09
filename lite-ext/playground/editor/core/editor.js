/**
 * modified from ckeditor,editor class for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSY.add("editor", function(S) {
    var EventTarget = S.EventTarget,
        UA = S.UA,
        Node = S.Node,
        Event = S.Event,
        KE = KISSYEDITOR,
        DISPLAY = "display",
        NONE = "none",
        tryThese = KE.Utils.tryThese,
        DOM = S.DOM,
        DTD = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
        HTML5_DTD = '<!doctype html>',
        CSS_FILE = "kissyeditor-iframe.css";
    (function() {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            if (script.src.indexOf("kissyeditor.js") != -1) {
                var start = script.src.indexOf("kissyeditor.js");
                //var prefix = script.src.substring(0, start);
                KE.BASE_URL = script.src.substring(0, start);
                break;
            }
        }
    })();

    function Editor(textarea) {
        if (!textarea[0]) textarea = new Node(textarea);
        var self = this,
            editorWrap = new Node("<div class='ke-editor-wrap'></div>"),
            wrap = new Node("<div class='ke-textarea-wrap'></div>");
        self.toolBarDiv = new Node("<div class='ke-editor-tools'></div>");
        editorWrap.css("width", textarea.css("width"));
        wrap.css("height", textarea.css("height"));
        editorWrap[0].appendChild(self.toolBarDiv[0]);
        editorWrap[0].appendChild(wrap[0]);
        document.body.insertBefore(editorWrap[0], textarea[0]);
        wrap[0].appendChild(textarea[0]);
        self.textarea = textarea;
        self._init();
    }

    S.augment(Editor, EventTarget, {
        setData:function(data) {
            this.document.body.innerHTML = data;
        },
        _hideSource:function() {
            var self = this;
            self.iframe.css(DISPLAY, "");
            self.textarea.css(DISPLAY, NONE);
            self.toolBarDiv.children().css(DISPLAY, "");
            self.focus();
        },

        _showSource:    function() {
            var self = this;
            self.textarea.css(DISPLAY, "");
            self.iframe.css(DISPLAY, NONE);
            self.toolBarDiv.children().css(DISPLAY, NONE);
            self.textarea[0].focus();
        },
        getData:function() {
            if (KE.HtmlDataProcessor)
                return KE.HtmlDataProcessor.toDataFormat(this.document.body.innerHTML, "p");
            return this.document.body.innerHTML;
        } ,
        getSelection:function() {
            return new KE.Selection(this.document);
        } ,
        focus:function() {
            var self = this,
                win = DOM._4e_getWin(self.document);
            //win.parent && win.parent.blur();
            //yiminghe note:webkit need win.focus
            win && win.focus();
            //ie and firefox need body focus
            self.document && self.document.body.focus();
            self.notifySelectionChange();
        } ,
        _init:function() {
            var iframe,
                frameLoaded,
                self = this,
                KER = KE.RANGE,
                KERange = KE.Range,
                KES = KE.SELECTION,
                textarea = self.textarea[0],
                createIFrame = function(data) {
                    if (iframe)
                        iframe.remove();
                    var srcScript =
                        'document.open();' +
                            'document.close();';

                    iframe = new Node('<iframe' +
                        ' style="width:100%;height:100%"' +
                        ' frameBorder="0"' +
                        ' title="' + "kissy-editor" + '"' +
                        // With IE, the custom domain has to be taken care at first,
                        // for other browsers, the 'src' attribute should be left empty to
                        // trigger iframe's 'load' event.
                        ' src="' + ( UA.ie ? 'javascript:void(function(){' + encodeURIComponent(srcScript) + '}())' : '' ) + '"' +
                        ' tabIndex="' + ( UA.webkit ? -1 : textarea.tabIndex ) + '"' +
                        ' allowTransparency="true"' +
                        '></iframe>');

                    // With FF, it's better to load the data on iframe.load. (#3894,#4058)
                    iframe.on('load', function() {
                        frameLoaded = 1;
                        iframe.detach();
                        var win = iframe[0].contentWindow,doc = win.document;
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
                        if (UA.gecko && !body.childNodes.length) {
                            setTimeout(function() {
                                // Simulating keyboard character input by dispatching a keydown of white-space text.
                                var keyEventSimulate = doc.createEvent("KeyEvents");
                                keyEventSimulate.initKeyEvent('keypress', true, true, win, false,
                                    false, false, false, 0, 32);
                                doc.dispatchEvent(keyEventSimulate);
                                // Restore the original document status by placing the cursor before a bogus br created (#5021).
                                body.appendChild(new Node("<br _moz_editor_bogus_node='true' _moz_dirty=''/>")[0]);
                                var nativeRange = new KERange(doc);
                                nativeRange.setStartAt(new Node(body), KER.POSITION_AFTER_START);
                                nativeRange.select();
                            }, 0);
                        }

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
                        self.document = doc;
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
                                        doc.body.focus();
                                    }, 50);
                                },
                                function() {
                                    // The above call is known to fail when parent DOM
                                    // tree layout changes may break design mode. (#5782)
                                    // Refresh the 'contentEditable' is a cue to this.
                                    doc.designMode = 'off';
                                    var body = new Node(doc.body);
                                    body.attr('contentEditable', false);
                                    body.attr('contentEditable', true);
                                    // Try it again once..
                                    !retry && blinkCursor(1);
                                });
                        }

                        // Create an invisible element to grab focus.
                        if (UA.gecko || UA.ie || UA.opera) {
                            var focusGrabber;
                            focusGrabber = new Node(DOM.insertAfter(new Node(
                                // Use 'span' instead of anything else to fly under the screen-reader radar. (#5049)
                                '<span tabindex="-1" style="position:absolute; left:-10000" role="presentation"></span>')[0], textarea));
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
                                        blinkCursor();
                                    focusGrabber[0].focus();
                                }
                            });
                        }


                        Event.on(win, 'focus', function() {
                            var doc = self.document;

                            if (UA.gecko)
                                blinkCursor();
                            else if (UA.opera)
                                doc.body.focus();
                            else if (false && UA.webkit) {
                                /*
                                 加上这段，chrome有问题，iframe内滚动条问题*/
                                // Selection will get lost after move focus
                                // to document element, save it first.
                                var sel = self.getSelection(),
                                    type = sel.getType(),
                                    range = ( type != KES.SELECTION_NONE ) && sel.getRanges()[ 0 ];

                                doc.documentElement.focus();
                                range && range.select();
                            }
                        });

                        if (UA.ie) {
                            new Node(doc.documentElement).addClass(doc.compatMode);
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
                                        //editor.fire('saveSnapshot');
                                        // Delete any element that 'hasLayout' (e.g. hr,table) in IE8 will
                                        // break up the selection, safely manage it here. (#4795)
                                        var bookmark = sel.getRanges()[ 0 ].createBookmark();
                                        // Remove the control manually.
                                        control.remove();
                                        sel.selectBookmarks([ bookmark ]);
                                        //editor.fire('saveSnapshot');
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
                                    if (self.document) {
                                        var $body = self.document.body;
                                        $body.runtimeStyle.marginBottom = '0px';
                                        $body.runtimeStyle.marginBottom = '';
                                    }
                                }, 1000);
                            }
                        }, 0);

                        setTimeout(function() {
                            self.fire("dataReady");
                        }, 10);
                    });

                    DOM.insertAfter(iframe[0], textarea);
                    self.textarea.css(DISPLAY, NONE);
                };


            var data = HTML5_DTD
                + "<html>"
                + "<head>"
                + "<title>kissy-editor</title>"
                + "<link href='"
                + KE.BASE_URL + CSS_FILE
                + "' rel='stylesheet'/>"
                + "</head>"
                + "<body>"
                + (textarea.value || "")
                + "</body>"
                + "<html>";

            createIFrame(data);
            self.iframe = iframe;
            self.on("dataReady", function() {
                KE.fire("instanceCreated", {editor:self});
            });
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
        }
        ,

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
            setTimeout(function() {
                self.fire("save");
            }, 10);
        }
        ,
        insertHtml:function(data) {
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

            //if (selection.dataProcessor)
            //    data = selection.dataProcessor.toHtml(data);

            if (UA.ie) {
                var $sel = selection.getNative();
                if ($sel.type == 'Control')
                    $sel.clear();
                $sel.createRange().pasteHTML(data);
            }
            else {
                self.document.execCommand('inserthtml', false, data);
            }
            self.focus();
            setTimeout(function() {
                self.fire("save");
            }, 10);
        }
    });

    S.Editor = Editor;


})
    ;