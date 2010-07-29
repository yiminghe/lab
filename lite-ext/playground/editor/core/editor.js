KISSY.app("KISSYEDITOR", KISSY.EventTarget);
KISSY.add("editor", function(S) {
    var EventTarget = S.EventTarget,UA = S.UA,Node = S.Node,Event = S.Event,DOM = S.DOM;

    function Editor(textarea, toolBarDiv) {
        this.textarea = textarea[0] || textarea;
        this.toolBarDiv = toolBarDiv;
        this._init();

    }

    S.augment(Editor, EventTarget, {
        getData:function() {
            return this.document.body.innerHTML;
        },
        getSelection:function() {
            return new S.Selection(this.document);
        },
        focus:function() {
            var self = this;
            setTimeout(function() {
                DOM._4e_getWin(self.document).focus();
            }, 10);
        },
        _init:function() {
            var iframe,frameLoaded,self = this,KER = KISSYEDITOR.RANGE,KERange = S.Range,KES = KISSYEDITOR.SELECTION;
            var createIFrame = function(data) {
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
                    // for other browers, the 'src' attribute should be left empty to
                    // trigger iframe's 'load' event.
                    ' src="' + ( UA.ie ? 'javascript:void(function(){' + encodeURIComponent(srcScript) + '}())' : '' ) + '"' +
                    ' tabIndex="' + ( UA.webkit ? -1 : self.textarea.tabIndex ) + '"' +
                    ' allowTransparency="true"' +
                    '></iframe>');

                // With FF, it's better to load the data on iframe.load. (#3894,#4058)
                iframe.on('load', function(ev) {
                    frameLoaded = 1;
                    iframe.detach();
                    var win = this[0].contentWindow,doc = win.document;
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
                            console.log(control._4e_name());
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
                            '<span tabindex="-1" style="position:absolute; left:-10000" role="presentation"></span>')[0], self.textarea));

                        focusGrabber.on('focus', function() {
                            self.focus();
                        });

                        self.on('destroy', function() {
                            focusGrabber.clearCustomData();
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
                        else if (UA.webkit) {
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
                    },
                        0);


                    setTimeout(function() {
                        self.fire("dataReady");
                    }, 10);
                });
                self.textarea.style.display = "none";
                DOM.insertAfter(iframe[0], self.textarea);
            };


            var data = "<!doctype html>"
                + "<html>"
                + "<head>"
                + "<title>kissy-editor</title>"
                + "</head>"
                + "<body>"
                + (this.textarea.value || "")
                + "</body>"
                + "<html>";

            createIFrame(data);
            self.on("dataReady", function() {
                self._monitor();
                KISSYEDITOR.fire("instanceCreated", {editor:self});
            });
        },

        _monitor:function() {
            var self = this,previousPath;
            setTimeout(function() {
                var selection = self.getSelection();
                if (!selection.isInvalid) {
                    var startElement = selection.getStartElement(),
                        currentPath = new S.ElementPath(startElement);

                    if (!previousPath || !previousPath.compare(currentPath)) {
                        self.fire("selectionChange", { selection : self, path : currentPath, element : startElement });
                    }
                }
                setTimeout(arguments.callee, 200);
            }, 200);
        }
    });
    function tryThese() {
        var returnValue;
        for (var i = 0, length = arguments.length; i < length; i++) {
            var lambda = arguments[i];
            try {
                returnValue = lambda();
                break;
            }
            catch (e) {
            }
        }
        return returnValue;
    }

    S.Editor = Editor;

});