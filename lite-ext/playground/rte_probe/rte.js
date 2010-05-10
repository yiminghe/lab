YUI({
    //filter: "DEBUG"
}).use("node", "stylesheet", "substitute", "event-simulate", "event", "event-custom", "dump", function (Y) {
    if (!window.console) {
        window.console = {
            log: function () {}
        };
    }
    var RTE = {
        id: "rte",
        container: "#rteContainer",
        _docType: '<!DOCTYPE HTML PUBLIC "-/' + '/W3C/' + '/DTD HTML 4.01/' + '/EN" "http:/' + '/www.w3.org/TR/html4/strict.dtd">',
        css: 'html { height: 95%; } body { padding: 7px; background-color: #fff; font: 13px/1.22 arial,helvetica,clean,sans-serif;*font-size:small;*font:x-small; } a, a:visited, a:hover { color: blue !important; text-decoration: underline !important; cursor: text !important; } .warning-localfile { border-bottom: 1px dashed red !important; } .yui-busy { cursor: wait !important; } img.selected { border: 2px dotted #808080; } img { cursor: pointer !important; border: none; } body.ptags.webkit div.yui-wk-p { margin: 11px 0; } body.ptags.webkit div.yui-wk-div { margin: 0; }',
        get: function (prop) {
            return this[prop] || {};
        },
        _createIframe: function () {
            var ifrmDom = document.createElement('iframe');
            ifrmDom.id = this.get('id') + '_editor';
            var config = {
                border: '0',
                frameBorder: '0',
                marginWidth: '0',
                marginHeight: '0',
                leftMargin: '0',
                topMargin: '0',
                allowTransparency: 'true',
                width: '100%'
            };
            for (var i in config) {
                if (config.hasOwnProperty(i)) {
                    ifrmDom.setAttribute(i, config[i]);
                }
            }
            var isrc = 'javascript:;';
            if (Y.UA.ie) {
                //isrc = 'about:blank';
                //TODO - Check this, I have changed it before..
                isrc = 'javascript:false;';
            }
            ifrmDom.setAttribute('src', isrc);
            ifrmDom.style.visibility = 'hidden';
            return ifrmDom;
        },
        _isElement: function (el, tag) {
            try {
                if (el._node) el = el._node;
            } catch(e) {}
            if (el && el.tagName && (el.tagName.toLowerCase() == tag)) {
                return true;
            }
            if (el && el.getAttribute && (el.getAttribute('tag') == tag)) {
                return true;
            }
            return false;
        },
        _getDoc: function () {
            var value = false;
            try {
                if (this.get('iframe').contentWindow.document) {
                    value = this.get('iframe').contentWindow.document;
                    return value;
                }
            } catch(e) {
                return false;
            }
        },
        _getWindow: function () {
            return this.get('iframe').contentWindow;
        },
        _hasSelection: function () {
            var sel = this._getSelection();
            var range = this._getRange();
            var hasSel = false;
            if (!sel || !range) {
                return hasSel;
            }
            //Internet Explorer
            if (Y.UA.ie || Y.UA.opera) {
                if (range.text) {
                    hasSel = true;
                }
                if (range.html) {
                    hasSel = true;
                }
            } else {
                if (Y.UA.webkit) {
                    if (sel + '' !== '') {
                        hasSel = true;
                    }
                } else {
                    if (sel && (sel.toString() !== '') && (sel !== undefined)) {
                        hasSel = true;
                    }
                }
            }
            return hasSel;
        },
        _getSelection: function () {
            var _sel = null;
            if (this._getDoc() && this._getWindow()) {
                if (this._getDoc().selection) {
                    _sel = this._getDoc().selection;
                } else {
                    _sel = this._getWindow().getSelection();
                }
                //Handle Safari's lack of Selection Object
                if (Y.UA.webkit) {
                    if (_sel.baseNode) {
                        this._selection = {};
                        this._selection.baseNode = _sel.baseNode;
                        this._selection.baseOffset = _sel.baseOffset;
                        this._selection.extentNode = _sel.extentNode;
                        this._selection.extentOffset = _sel.extentOffset;
                    } else if (this._selection !== null) {
                        _sel = this._getWindow().getSelection();
                        _sel.setBaseAndExtent(
                        this._selection.baseNode, this._selection.baseOffset, this._selection.extentNode, this._selection.extentOffset);
                        this._selection = null;
                    }
                }
            }
            return _sel;
        },
        _selectNode: function (node, collapse) {
            if (!node) {
                return false;
            }
            var sel = this._getSelection(),
                range = null;
            if (Y.UA.ie) {
                try {
                    //IE freaks out here sometimes..
                    range = this._getDoc().body.createTextRange();
                    range.moveToElementText(node);
                    range.select();
                } catch(e) {
                    console.log('IE failed to select element: ' + node.tagName, 'warn', 'SimpleEditor');
                }
            } else if (Y.UA.webkit) {
                if (collapse) {
                    sel.setBaseAndExtent(node, 1, node, node.innerText.length);
                } else {
                    sel.setBaseAndExtent(node, 0, node, node.innerText.length);
                }
            } else if (Y.UA.opera) {
                sel = this._getWindow().getSelection();
                range = this._getDoc().createRange();
                range.selectNode(node);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                range = this._getDoc().createRange();
                range.selectNodeContents(node);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        },
        _getRange: function () {
            var sel = this._getSelection();
            if (sel === null) {
                return null;
            }
            if (Y.UA.webkit && !sel.getRangeAt) {
                var _range = this._getDoc().createRange();
                try {
                    _range.setStart(sel.anchorNode, sel.anchorOffset);
                    _range.setEnd(sel.focusNode, sel.focusOffset);
                } catch(e) {
                    _range = this._getWindow().getSelection() + '';
                }
                return _range;
            }
            if (Y.UA.ie || Y.UA.opera) {
                try {
                    return sel.createRange();
                } catch(e2) {
                    return null;
                }
            }
            if (sel.rangeCount > 0) {
                return sel.getRangeAt(0);
            }
            return null;
        },
        _initEditorEvents: function () {
            //Setup Listeners on iFrame
            var doc = Y.one(this._getDoc()),
                win = Y.one(this._getWindow());
            doc.on('mouseup', this._handleMouseUp, this);
            doc.on('mousedown', this._handleMouseDown, this);
            doc.on('click', this._handleClick, this);
            //doc.on('dblclick', this._handleDoubleClick, this);
            doc.on('keypress', this._handleKeyPress, this);
            doc.on('keyup', this._handleKeyUp, this);
            doc.on('keydown', this._handleKeyDown, this);
        },
        _setInitialContent: function (raw) {
            console.log('Populating editor body with contents of the text area', 'info', 'SimpleEditor');
            var value = this.value || "",
                doc = null;
            if (value === '') {
                value = '<br>';
            }
            var html = Y.substitute(this.get('html'), {
                TITLE: this.STR_TITLE || "test",
                CONTENT: value,
                CSS: this.get('css'),
                HIDDEN_CSS: ((this.get('hiddencss')) ? this.get('hiddencss') : '/* No Hidden CSS */'),
                EXTRA_CSS: ((this.get('extracss')) ? this.get('extracss') : '/* No Extra CSS */')
            });
            if (document.compatMode != 'BackCompat') {
                console.log('Adding Doctype to editable area', 'info', 'SimpleEditor');
                html = this._docType + "\n" + html;
            } else {
                console.log('DocType skipped because we are in BackCompat Mode.', 'warn', 'SimpleEditor');
            }
            if (Y.UA.ie || Y.UA.webkit || Y.UA.opera || (navigator.userAgent.indexOf('Firefox/1.5') != -1)) {
                //Firefox 1.5 doesn't like setting designMode on an document created with a data url
                try {
                    //Adobe AIR Code
                    doc = this._getDoc();
                    doc.open();
                    doc.write(html);
                    doc.close();
                } catch(e) {
                    console.log('Setting doc failed.. (_setInitialContent)', 'error', 'SimpleEditor');
                    //Safari will only be here if we are hidden
                }
            } else {
                //This keeps Firefox 2 from writing the iframe to history preserving the back buttons functionality
                this.get('iframe').src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
            }
            Y.one(this.get('iframe')).setStyle('visibility', '');
        },
        _getSelectedElement: function () {
            var doc = this._getDoc(),
                range = null,
                sel = null,
                elm = null,
                check = true;
            if (Y.UA.ie) {
                if (this._getWindow().event) this.currentEvent = Y.Event.getEvent(this._getWindow().event);
                else this.currentEvent = null;
                //Event utility assumes window.event, so we need to reset it to this._getWindow().event;
                range = this._getRange();
                if (range) {
                    elm = range.item ? range.item(0) : range.parentElement();
                    if (this._hasSelection()) {
                        //TODO
                        //WTF.. Why can't I get an element reference here?!??!
                    }
                    if (elm === doc.body) {
                        elm = null;
                    }
                }
                if ((this.currentEvent !== null) && (this.currentEvent._event.keyCode === 0)) {
                    elm = this.currentEvent.target._node;
                }
            } else {
                sel = this._getSelection();
                range = this._getRange();
                if (!sel || !range) {
                    return null;
                }
                //TODO
                if (!this._hasSelection() && Y.UA.webkit3) {
                    //check = false;
                }
                if (Y.UA.gecko) {
                    //Added in 2.6.0
                    if (range.startContainer) {
                        if (range.startContainer.nodeType === 3) {
                            elm = range.startContainer.parentNode;
                        } else if (range.startContainer.nodeType === 1) {
                            elm = range.startContainer;
                        }
                        //Added in 2.7.0
                        if (this.currentEvent) {
                            var tar = this.currentEvent.target._node;
                            if (!this._isElement(tar, 'html')) {
                                if (elm !== tar) {
                                    elm = tar;
                                }
                            }
                        }
                    }
                }
                if (check) {
                    if (sel.anchorNode && (sel.anchorNode.nodeType == 3)) {
                        if (sel.anchorNode.parentNode) {
                            //next check parentNode
                            elm = sel.anchorNode.parentNode;
                        }
                        if (sel.anchorNode.nextSibling != sel.focusNode.nextSibling) {
                            elm = sel.anchorNode.nextSibling;
                        }
                    }
                    if (this._isElement(elm, 'br')) {
                        elm = null;
                    }
                    if (!elm) {
                        elm = range.commonAncestorContainer;
                        if (!range.collapsed) {
                            if (range.startContainer == range.endContainer) {
                                if (range.startOffset - range.endOffset < 2) {
                                    if (range.startContainer.hasChildNodes()) {
                                        elm = range.startContainer.childNodes[range.startOffset];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.currentEvent !== null) {
                try {
                    switch (this.currentEvent._event.type) {
                    case 'click':
                    case 'mousedown':
                    case 'mouseup':
                        if (Y.UA.webkit) {
                            elm = this.currentEvent.target._node;
                        }
                        break;
                    default:
                        //Do nothing
                        break;
                    }
                } catch(e) {
                    console.log('Firefox 1.5 errors here: ' + e, 'error', 'SimpleEditor');
                }
            } else if ((this.currentElement && this.currentElement[0]) && (!Y.UA.ie)) {
                //TODO is this still needed?
                //elm = this.currentElement[0];
            }
            if (Y.UA.opera || Y.UA.webkit) {
                if (this.currentEvent && !elm) {
                    elm = this.currentEvent.target._node;
                }
            }
            if (!elm || !elm.tagName) {
                elm = doc.body;
            }
            if (this._isElement(elm, 'html')) {
                //Safari sometimes gives us the HTML node back..
                elm = doc.body;
            }
            if (this._isElement(elm, 'body')) {
                //make sure that body means this body not the parent..
                elm = doc.body;
            }
            if (elm && !elm.parentNode) {
                //Not in document
                elm = doc.body;
            }
            if (elm === undefined) {
                elm = null;
            }
            return elm;
        },
        _setCurrentEvent: function (ev) {
            this.currentEvent = ev;
        },
        _handleClick: function (ev) {
            this._setCurrentEvent(ev);
            if (Y.UA.webkit) {
                var tar = ev.target;
                if (this._isElement(tar, 'a') || this._isElement(tar.parentNode, 'a')) {
                    ev.halt();
                }
            } else {}
        },
        _handleMouseUp: function (ev) {},
        _handleMouseDown: function (ev) {
            this._setCurrentEvent(ev);
            var sel = ev.target;
            if (Y.UA.webkit && this._hasSelection()) {
                var _sel = this._getSelection();
                if (Y.UA.webkit != 3) {
                    _sel.collapse(true);
                } else {
                    _sel.collapseToStart();
                }
            }
            if (Y.UA.webkit && this._lastImage) {
                this._lastImage.removeClass('selected');
                this._lastImage = null;
            }
            if (this._isElement(sel, 'img') || this._isElement(sel, 'a')) {
                if (Y.UA.webkit) {
                    ev.halt();
                    if (this._isElement(sel, 'img')) {
                        sel.addClass('selected');
                        this._lastImage = sel;
                    }
                }
            }
        },
        _handleKeyUp: function (ev) {
            this._setCurrentEvent(ev);
        },
        _handleKeyPress: function (ev) {
            this._setCurrentEvent(ev);
        },
        _handleKeyDown: function (ev) {
            this._setCurrentEvent(ev);
        },
        _checkLoaded: function () {
            if (this._contentTimer) {
                clearTimeout(this._contentTimer);
            }
            var init = false;
            try {
                if (this._getDoc() && this._getDoc().body) {
                    if (Y.UA.ie) {
                        if (this._getDoc().body.readyState == 'complete') {
                            init = true;
                        }
                    } else {
                        if (this._getDoc().body._rteLoaded === true) {
                            init = true;
                        }
                    }
                }
            } catch(e) {
                init = false;
                console.log('checking body (e)' + e, 'error', 'SimpleEditor');
            }
            if (init === true) {
                //The onload event has fired, clean up after ourselves and fire the _initEditor method
                console.log('Firing _initEditor', 'info', 'SimpleEditor');
                this._editable();
            } else {
                var self = this;
                this._contentTimer = setTimeout(function () {
                    self._checkLoaded();
                },
                20);
            }
        },
        html: '<html><head><title>{TITLE}</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><base href="' + this._baseHREF + '"><style>{CSS}</style><style>{HIDDEN_CSS}</style><style>{EXTRA_CSS}</style></head><body onload="document.body._rteLoaded = true;">{CONTENT}</body></html>',
        _editable: function () {
            this._initEditorEvents();
            try {
                this._getDoc().designMode = 'on';
                this.focus();
            } catch(e) {
                console.log(e);
            }
        },
        init: function () {
            this.container = Y.one(this.container);
            this.iframe = this._createIframe();
            this.container.append(this.iframe);
            this._setInitialContent();
            this._checkLoaded();
        },
        setHtml: function (html) {
            this._getDoc().body.innerHTML = Y.Lang.trim(html);
        },
        focus: function () {
            var self = this;
            setTimeout(function () {
                self._getWindow().focus();
            },
            400);
        }
    };
    RTE.init();
    var hrun = Y.one("#hrun");
    var htext = Y.one("#htext");
    hrun.on("click", function () {
        RTE.setHtml(htext.get("value"));
        RTE.focus();
    });
    setTimeout(function () {
        Y.Event.simulate(hrun._node, "click");
    },
    200);
    //Y.Event.simulate(hrun._node,"click");
    //hrun.simulate("click");
    var srun = Y.one("#srun");
    var status = Y.one("#status");
    srun.on("click", function () {
        console.log("************************************************");
        var selection = "{}" || Y.dump(RTE._getSelection());
        if (selection == "{}") selection = RTE._getSelection() + "";
        console.log("selection:", RTE._getSelection());
        var selectedElement = Y.dump(RTE._getSelectedElement());
        console.log("selectedElement:", RTE._getSelectedElement());
        var range = "{}" || Y.dump(RTE._getRange());
        if (range == "{}") range = RTE._getRange() + "";
        console.log("range:", RTE._getRange());
        status.setContent("<p>selection :" + selection + "</p>" + "<p>selectedElement :" + selectedElement + "</p>" + "<p>range :" + range + "</p>");
    });
});