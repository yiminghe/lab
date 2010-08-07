/**
 * modified from ckeditor core plugin : selection
 * @modifier:yiminghe@gmail.com(chengyu)
 */
KISSYEDITOR.add("editor-selection", function(KE) {
    KE.SELECTION = {};
    var S = KISSY,
        UA = S.UA,
        DOM = S.DOM,
        Event = S.Event,
        tryThese = KE.Utils.tryThese,
        Node = S.Node,
        KES = KE.SELECTION,
        KER = KE.RANGE,
        KEN = KE.NODE,
        //EventTarget = S.EventTarget,
        Walker = KE.Walker,
        //ElementPath = KE.ElementPath,
        KERange = KE.Range;
    /**
     * No selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_NONE )
     *     alert( 'Nothing is selected' );
     */
    KES.SELECTION_NONE = 1;

    /**
     * Text or collapsed selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_TEXT )
     *     alert( 'Text is selected' );
     */
    KES.SELECTION_TEXT = 2;

    /**
     * Element selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_ELEMENT )
     *     alert( 'An element is selected' );
     */
    KES.SELECTION_ELEMENT = 3;
    function KESelection(document) {
        var self = this;
        self.document = document;
        self._ = {
            cache : {}
        };

        /**
         * IE BUG: The selection's document may be a different document than the
         * editor document. Return null if that's the case.
         */
        if (UA.ie) {
            var range = self.getNative().createRange();
            if (!range
                || ( range.item && range.item(0).ownerDocument != document )
                || ( range.parentElement && range.parentElement().ownerDocument != document )) {
                self.isInvalid = true;
            }
        }
    }

    var styleObjectElements = {
        img:1,hr:1,li:1,table:1,tr:1,td:1,th:1,embed:1,object:1,ol:1,ul:1,
        a:1, input:1, form:1, select:1, textarea:1, button:1, fieldset:1, thead:1, tfoot:1
    };

    S.augment(KESelection, {


        /**
         * Gets the native selection object from the browser.
         * @function
         * @returns {Object} The native selection object.
         * @example
         * var selection = editor.getSelection().<b>getNative()</b>;
         */
        getNative :
            UA.ie ?
                function() {
                    return this._.cache.nativeSel || ( this._.cache.nativeSel = this.document.selection );
                }
                :
                function() {
                    return this._.cache.nativeSel || ( this._.cache.nativeSel = DOM._4e_getWin(this.document).getSelection() );
                },

        /**
         * Gets the type of the current selection. The following values are
         * available:
         * <ul>
         *        <li> SELECTION_NONE (1): No selection.</li>
         *        <li> SELECTION_TEXT (2): Text is selected or
         *            collapsed selection.</li>
         *        <li> SELECTION_ELEMENT (3): A element
         *            selection.</li>
         * </ul>
         * @function
         * @returns {Number} One of the following constant values:
         *         SELECTION_NONE,  SELECTION_TEXT or
         *         SELECTION_ELEMENT.
         * @example
         * if ( editor.getSelection().<b>getType()</b> == SELECTION_TEXT )
         *     alert( 'Text is selected' );
         */
        getType :
            UA.ie ?
                function() {
                    var cache = this._.cache;
                    if (cache.type)
                        return cache.type;

                    var type = KES.SELECTION_NONE;

                    try {
                        var sel = this.getNative(),
                            ieType = sel.type;

                        if (ieType == 'Text')
                            type = KES.SELECTION_TEXT;

                        if (ieType == 'Control')
                            type = KES.SELECTION_ELEMENT;

                        // It is possible that we can still get a text range
                        // object even when type == 'None' is returned by IE.
                        // So we'd better check the object returned by
                        // createRange() rather than by looking at the type.
                        if (sel.createRange().parentElement)
                            type = KES.SELECTION_TEXT;
                    }
                    catch(e) {
                    }

                    return ( cache.type = type );
                }
                :
                function() {
                    var cache = this._.cache;
                    if (cache.type)
                        return cache.type;

                    var type = KES.SELECTION_TEXT,
                        sel = this.getNative();

                    if (!sel)
                        type = KES.SELECTION_NONE;
                    else if (sel.rangeCount == 1) {
                        // Check if the actual selection is a control (IMG,
                        // TABLE, HR, etc...).

                        var range = sel.getRangeAt(0),
                            startContainer = range.startContainer;

                        if (startContainer == range.endContainer
                            && startContainer.nodeType == KEN.NODE_ELEMENT
                            && ( range.endOffset - range.startOffset ) === 1
                            && styleObjectElements[ startContainer.childNodes[ range.startOffset ].nodeName.toLowerCase() ]) {
                            type = KES.SELECTION_ELEMENT;
                        }
                    }

                    return ( cache.type = type );
                },

        getRanges :
            UA.ie ?
                ( function() {
                    // Finds the container and offset for a specific boundary
                    // of an IE range.
                    var getBoundaryInformation = function(range, start) {
                        // Creates a collapsed range at the requested boundary.
                        range = range.duplicate();
                        range.collapse(start);

                        // Gets the element that encloses the range entirely.
                        var parent = range.parentElement(), siblings = parent.childNodes,
                            testRange;

                        for (var i = 0; i < siblings.length; i++) {
                            var child = siblings[ i ];
                            //console.log("child:" + child.nodeType == KEN.NODE_ELEMENT ?
                            //    ("el: " + child.innerHTML) : ("text:" + child.nodeValue));
                            if (child.nodeType == KEN.NODE_ELEMENT) {
                                testRange = range.duplicate();

                                testRange.moveToElementText(child);

                                var comparisonStart = testRange.compareEndPoints('StartToStart', range),
                                    comparisonEnd = testRange.compareEndPoints('EndToStart', range);

                                testRange.collapse();
                                //中间有其他标签
                                if (comparisonStart > 0)
                                    break;
                                // When selection stay at the side of certain self-closing elements, e.g. BR,
                                // our comparison will never shows an equality. (#4824)
                                else if (!comparisonStart
                                    || comparisonEnd == 1 && comparisonStart == -1)
                                    return { container : parent, offset : i };
                                else if (!comparisonEnd)
                                    return { container : parent, offset : i + 1 };

                                testRange = null;
                            }
                        }

                        if (!testRange) {
                            testRange = range.duplicate();
                            testRange.moveToElementText(parent);
                            testRange.collapse(false);
                        }

                        testRange.setEndPoint('StartToStart', range);
                        // IE report line break as CRLF with range.text but
                        // only LF with textnode.nodeValue, normalize them to avoid
                        // breaking character counting logic below. (#3949)
                        var distance = testRange.text.replace(/(\r\n|\r)/g, '\n').length;

                        try {
                            while (distance > 0)
                                //bug? 可能不是文本节点 nodeValue undefined
                                //永远不会出现 textnode<img/>textnode
                                //停止时，前面一定为textnode
                                distance -= siblings[ --i ].nodeValue.length;
                        }
                            // Measurement in IE could be somtimes wrong because of <select> element. (#4611)
                        catch(e) {
                            distance = 0;
                        }


                        if (distance === 0) {
                            return {
                                container : parent,
                                offset : i
                            };
                        }
                        else {
                            return {
                                container : siblings[ i ],
                                offset : -distance
                            };
                        }
                    };

                    return function() {
                        var cache = this._.cache;
                        if (cache.ranges)
                            return cache.ranges;

                        // IE doesn't have range support (in the W3C way), so we
                        // need to do some magic to transform selections into
                        // CKEDITOR.dom.range instances.

                        var sel = this.getNative(),
                            nativeRange = sel && sel.createRange(),
                            type = this.getType(),
                            range;

                        if (!sel)
                            return [];

                        if (type == KES.SELECTION_TEXT) {
                            range = new KERange(this.document);
                            var boundaryInfo = getBoundaryInformation(nativeRange, true);
                            range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
                            boundaryInfo = getBoundaryInformation(nativeRange);
                            range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
                            return ( cache.ranges = [ range ] );
                        }
                        else if (type == KES.SELECTION_ELEMENT) {
                            var retval = this._.cache.ranges = [];

                            for (var i = 0; i < nativeRange.length; i++) {
                                var element = nativeRange.item(i),
                                    parentElement = element.parentNode,
                                    j = 0;

                                range = new KERange(this.document);

                                for (; j < parentElement.childNodes.length && parentElement.childNodes[j] != element; j++) { /*jsl:pass*/
                                }

                                range.setStart(new Node(parentElement), j);
                                range.setEnd(new Node(parentElement), j + 1);
                                retval.push(range);
                            }

                            return retval;
                        }

                        return ( cache.ranges = [] );
                    };
                })()
                :
                function() {
                    var cache = this._.cache;
                    if (cache.ranges)
                        return cache.ranges;

                    // On browsers implementing the W3C range, we simply
                    // tranform the native ranges in CKEDITOR.dom.range
                    // instances.

                    var ranges = [], sel = this.getNative();

                    if (!sel)
                        return [];

                    for (var i = 0; i < sel.rangeCount; i++) {
                        var nativeRange = sel.getRangeAt(i), range = new KERange(this.document);

                        range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
                        range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
                        ranges.push(range);
                    }

                    return ( cache.ranges = ranges );
                },

        /**
         * Gets the DOM element in which the selection starts.
         * @returns {Node} The element at the beginning of the
         *        selection.
         * @example
         * var element = editor.getSelection().<b>getStartElement()</b>;
         * alert( element.getName() );
         */
        getStartElement : function() {
            var cache = this._.cache;
            if (cache.startElement !== undefined)
                return cache.startElement;

            var node,
                sel = this.getNative();

            switch (this.getType()) {
                case KES.SELECTION_ELEMENT :
                    return this.getSelectedElement();

                case KES.SELECTION_TEXT :

                    var range = this.getRanges()[0];

                    if (range) {
                        if (!range.collapsed) {
                            range.optimize();

                            // Decrease the range content to exclude particial
                            // selected node on the start which doesn't have
                            // visual impact. ( #3231 )
                            while (true) {
                                var startContainer = range.startContainer,
                                    startOffset = range.startOffset;
                                // Limit the fix only to non-block elements.(#3950)
                                if (startOffset == ( startContainer[0].childNodes ?
                                    startContainer[0].childNodes.length : startContainer[0].nodeValue.length )
                                    && !startContainer._4e_isBlockBoundary())
                                    range.setStartAfter(startContainer);
                                else break;
                            }

                            node = range.startContainer;

                            if (node[0].nodeType != KEN.NODE_ELEMENT)
                                return node.parent();

                            node = new Node(node[0].childNodes[range.startOffset]);

                            if (!node[0] || node[0].nodeType != KEN.NODE_ELEMENT)
                                return range.startContainer;

                            var child = node[0].firstChild;
                            while (child && child.nodeType == KEN.NODE_ELEMENT) {
                                node = new Node(child);
                                child = child.firstChild;
                            }
                            return node;
                        }
                    }

                    if (UA.ie) {
                        range = sel.createRange();
                        range.collapse(true);
                        node = range.parentElement();
                    }
                    else {
                        node = sel.anchorNode;
                        if (node && node.nodeType != KEN.NODE_ELEMENT)
                            node = node.parentNode;
                    }
            }

            return cache.startElement = ( node ? new Node(node) : null );
        },

        /**
         * Gets the current selected element.
         * @returns {Node} The selected element. Null if no
         *        selection is available or the selection type is not
         *       SELECTION_ELEMENT.
         * @example
         * var element = editor.getSelection().<b>getSelectedElement()</b>;
         * alert( element.getName() );
         */
        getSelectedElement : function() {
            var cache = this._.cache;
            if (cache.selectedElement !== undefined)
                return cache.selectedElement;

            var self = this, node = tryThese(
                // Is it native IE control type selection?
                function() {
                    return self.getNative().createRange().item(0);
                },
                // Figure it out by checking if there's a single enclosed
                // node of the range.
                function() {
                    var range = self.getRanges()[ 0 ],
                        enclosed,
                        selected;

                    // Check first any enclosed element, e.g. <ul>[<li><a href="#">item</a></li>]</ul>
                    for (var i = 2; i && !( ( enclosed = range.getEnclosedNode() )
                        && ( enclosed[0].nodeType == KEN.NODE_ELEMENT )
                        && styleObjectElements[ enclosed._4e_name() ]
                        && ( selected = enclosed ) ); i--) {
                        // Then check any deep wrapped element, e.g. [<b><i><img /></i></b>]
                        range.shrink(KER.SHRINK_ELEMENT);
                    }

                    return  selected[0];
                });

            return cache.selectedElement = ( node ? new Node(node) : null );
        },



        reset : function() {
            this._.cache = {};
        },

        selectElement : function(element) {
            var range;
            if (UA.ie) {
                this.getNative().empty();
                try {
                    // Try to select the node as a control.
                    range = this.document.body.createControlRange();
                    range.addElement(element[0]);
                    range.select();
                }
                catch(e) {
                    // If failed, select it as a text range.
                    range = this.document.body.createTextRange();
                    range.moveToElementText(element[0]);
                    range.select();
                }
                finally {
                    //this.document.fire('selectionchange');
                }
                this.reset();
            }
            else {
                // Create the range for the element.
                range = this.document.createRange();
                range.selectNode(element[0]);
                // Select the range.
                var sel = this.getNative();
                sel.removeAllRanges();
                sel.addRange(range);
                this.reset();
            }
        },

        selectRanges : function(ranges) {

            if (UA.ie) {
                // IE doesn't accept multiple ranges selection, so we just
                // select the first one.
                if (ranges[ 0 ])
                    ranges[ 0 ].select();

                this.reset();
            }
            else {
                var sel = this.getNative();
                sel.removeAllRanges();

                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[ i ], nativeRange = this.document.createRange(),startContainer = range.startContainer;

                    // In FF2, if we have a collapsed range, inside an empty
                    // element, we must add something to it otherwise the caret
                    // will not be visible.
                    if (range.collapsed &&
                        ( UA.gecko && UA.gecko < 1.0900 ) &&
                        startContainer[0].nodeType == KEN.NODE_ELEMENT &&
                        !startContainer[0].childNodes.length) {
                        startContainer[0].appendChild(this.document.createTextNode(""));
                    }
                    nativeRange.setStart(startContainer[0], range.startOffset);
                    nativeRange.setEnd(range.endContainer[0], range.endOffset);
                    // Select the range.
                    sel.addRange(nativeRange);
                }
                this.reset();
            }
        },
        createBookmarks2 : function(normalized) {
            var bookmarks = [],
                ranges = this.getRanges();

            for (var i = 0; i < ranges.length; i++)
                bookmarks.push(ranges[i].createBookmark2(normalized));

            return bookmarks;
        },
        createBookmarks : function(serializable) {
            var retval = [],
                ranges = this.getRanges(),
                length = ranges.length,
                bookmark;
            for (var i = 0; i < length; i++) {
                retval.push(bookmark = ranges[ i ].createBookmark(serializable, true));

                serializable = bookmark.serializable;

                var bookmarkStart = serializable ? S.one("#" + bookmark.startNode) : bookmark.startNode,
                    bookmarkEnd = serializable ? S.one("#" + bookmark.endNode) : bookmark.endNode;

                // Updating the offset values for rest of ranges which have been mangled(#3256).
                for (var j = i + 1; j < length; j++) {
                    var dirtyRange = ranges[ j ],
                        rangeStart = dirtyRange.startContainer,
                        rangeEnd = dirtyRange.endContainer;

                    rangeStart[0] === bookmarkStart.parent()[0] && dirtyRange.startOffset++;
                    rangeStart[0] === bookmarkEnd.parent()[0] && dirtyRange.startOffset++;
                    rangeEnd[0] === bookmarkStart.parent()[0] && dirtyRange.endOffset++;
                    rangeEnd[0] === bookmarkEnd.parent()[0] && dirtyRange.endOffset++;
                }
            }

            return retval;
        },

        selectBookmarks : function(bookmarks) {
            var ranges = [];
            for (var i = 0; i < bookmarks.length; i++) {
                var range = new KERange(this.document);
                range.moveToBookmark(bookmarks[i]);
                ranges.push(range);
            }
            this.selectRanges(ranges);
            return this;
        },

        getCommonAncestor : function() {
            var ranges = this.getRanges(),
                startNode = ranges[ 0 ].startContainer,
                endNode = ranges[ ranges.length - 1 ].endContainer;
            return startNode._4e_commonAncestor(endNode);
        },

        // Moving scroll bar to the current selection's start position.
        scrollIntoView : function() {
            // If we have split the block, adds a temporary span at the
            // range position and scroll relatively to it.
            var start = this.getStartElement();
            start.scrollIntoView();
        }
    });


    KE.Selection = KESelection;
    var nonCells = { table:1,tbody:1,tr:1 }, notWhitespaces = Walker.whitespaces(true), fillerTextRegex = /\ufeff|\u00a0/;
    KERange.prototype.select = UA.ie ?
        // V2
        function(forceExpand) {
            var self = this,
                collapsed = self.collapsed,isStartMarkerAlone,dummySpan;

            // IE doesn't support selecting the entire table row/cell, move the selection into cells, e.g.
            // <table><tbody><tr>[<td>cell</b></td>... => <table><tbody><tr><td>[cell</td>...
            if (self.startContainer[0].nodeType == KEN.NODE_ELEMENT && self.startContainer._4e_name() in nonCells
                || self.endContainer[0].nodeType == KEN.NODE_ELEMENT && self.endContainer._4e_name() in nonCells) {
                self.shrink(KEN.NODE_ELEMENT, true);
            }

            var bookmark = self.createBookmark(),

                // Create marker tags for the start and end boundaries.
                startNode = bookmark.startNode,endNode;
            if (!collapsed)
                endNode = bookmark.endNode;

            // Create the main range which will be used for the selection.
            var ieRange = this.document.body.createTextRange();

            // Position the range at the start boundary.

            ieRange.moveToElementText(startNode[0]);

            ieRange.moveStart('character', 1);

            if (endNode) {
                // Create a tool range for the end.
                var ieRangeEnd = self.document.body.createTextRange();

                // Position the tool range at the end.
                ieRangeEnd.moveToElementText(endNode[0]);

                // Move the end boundary of the main range to match the tool range.
                ieRange.setEndPoint('EndToEnd', ieRangeEnd);
                ieRange.moveEnd('character', -1);
            }
            else {
                // The isStartMarkerAlone logic comes from V2. It guarantees that the lines
                // will expand and that the cursor will be blinking on the right place.
                // Actually, we are using this flag just to avoid using this hack in all
                // situations, but just on those needed.
                var next = startNode[0].nextSibling;
                while (next && !notWhitespaces(next)) {
                    next = next.nextSibling;
                }
                isStartMarkerAlone =
                    ( !( next && next.nodeValue && next.nodeValue.match(fillerTextRegex) )     // already a filler there?
                        && ( forceExpand || !startNode[0].previousSibling ||
                        ( startNode[0].previousSibling && startNode[0].previousSibling.nodeName.toLowerCase() == 'br' ) ) );

                // Append a temporary <span>&#65279;</span> before the selection.
                // This is needed to avoid IE destroying selections inside empty
                // inline elements, like <b></b> (#253).
                // It is also needed when placing the selection right after an inline
                // element to avoid the selection moving inside of it.
                dummySpan = self.document.createElement('span');
                dummySpan.innerHTML = '&#65279;';	// Zero Width No-Break Space (U+FEFF). See #1359.
                dummySpan = new Node(dummySpan);

                DOM.insertBefore(dummySpan[0], startNode[0]);

                if (isStartMarkerAlone) {
                    // To expand empty blocks or line spaces after <br>, we need
                    // instead to have any char, which will be later deleted using the
                    // selection.
                    // \ufeff = Zero Width No-Break Space (U+FEFF). (#1359)
                    DOM.insertBefore(self.document.createTextNode('\ufeff'), startNode[0]);
                }
            }

            // Remove the markers (reset the position, because of the changes in the DOM tree).
            self.setStartBefore(startNode);
            startNode.remove();

            if (collapsed) {
                if (isStartMarkerAlone) {
                    // Move the selection start to include the temporary \ufeff.
                    ieRange.moveStart('character', -1);
                    ieRange.select();
                    // Remove our temporary stuff.
                    self.document.selection.clear();
                } else
                    ieRange.select();
                this.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
                dummySpan.remove();
            }
            else {
                self.setEndBefore(endNode);
                endNode.remove();
                ieRange.select();
            }

            // this.document.fire('selectionchange');
        } : function() {
        var self = this,startContainer = self.startContainer;

        // If we have a collapsed range, inside an empty element, we must add
        // something to it, otherwise the caret will not be visible.
        if (self.collapsed && startContainer[0].nodeType == KEN.NODE_ELEMENT && !startContainer[0].childNodes.length)
            startContainer[0].appendChild(self.document.createTextNode(""));

        var nativeRange = self.document.createRange();
        nativeRange.setStart(startContainer[0], self.startOffset);

        try {
            nativeRange.setEnd(self.endContainer[0], self.endOffset);
        } catch (e) {
            // There is a bug in Firefox implementation (it would be too easy
            // otherwise). The new start can't be after the end (W3C says it can).
            // So, let's create a new range and collapse it to the desired point.
            if (e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0) {
                self.collapse(true);
                nativeRange.setEnd(self.endContainer[0], self.endOffset);
            }
            else
                throw( e );
        }

        var selection = getSelection(self.document).getNative();
        selection.removeAllRanges();
        selection.addRange(nativeRange);
    };


    function getSelection(doc) {
        var sel = new KESelection(doc);
        return ( !sel || sel.isInvalid ) ? null : sel;
    }


    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;

        var doc = editor.document,
            body = new Node(doc.body);

        if (UA.ie) {
            //wokao,ie 焦点管理不行啊
            // Other browsers don't loose the selection if the
            // editor document loose the focus. In IE, we don't
            // have support for it, so we reproduce it here, other
            // than firing the selection change event.

            var savedRange,
                saveEnabled;

            // "onfocusin" is fired before "onfocus". It makes it
            // possible to restore the selection before click
            // events get executed.
            body.on('focusin', function(evt) {
                // If there are elements with layout they fire this event but
                // it must be ignored to allow edit its contents #4682
                if (evt.target.nodeName.toUpperCase() != 'BODY')
                    return;

                // If we have saved a range, restore it at this
                // point.
                if (savedRange) {
                    // Well not break because of this.
                    try {
                        savedRange.select();
                    }
                    catch (e) {
                    }

                    savedRange = null;
                }
            });

            body.on('focus', function() {
                // Enable selections to be saved.
                saveEnabled = true;
                saveSelection();
            });

            body.on('beforedeactivate', function(evt) {
                // Ignore this event if it's caused by focus switch between
                // internal editable control type elements, e.g. layouted paragraph. (#4682)
                if (evt.relatedTarget)
                    return;

                // Disable selections from being saved.
                saveEnabled = false;
            });

            // IE before version 8 will leave cursor blinking inside the document after
            // editor blurred unless we clean up the selection. (#4716)
            if (UA.ie < 8) {
                Event.on(DOM._4e_getWin(doc), 'blur', function(evt) {
                    doc.selection.empty();
                });
            }

            // IE fires the "selectionchange" event when clicking
            // inside a selection. We don't want to capture that.
            body.on('mousedown', disableSave);
            body.on('mouseup', function() {
                saveEnabled = true;
                setTimeout(function() {
                    saveSelection(true);
                },
                    0);
            });

            body.on('keydown', disableSave);
            body.on('keyup', function() {
                saveEnabled = true;
                saveSelection();
            });


            // IE is the only to provide the "selectionchange"
            // event.
            Event.on(doc, 'selectionchange', saveSelection);

            function disableSave() {
                saveEnabled = false;
            }

            function saveSelection(testIt) {
                if (saveEnabled) {
                    var doc = editor.document,
                        sel = editor.getSelection(),
                        nativeSel = sel && sel.getNative();

                    // There is a very specific case, when clicking
                    // inside a text selection. In that case, the
                    // selection collapses at the clicking point,
                    // but the selection object remains in an
                    // unknown state, making createRange return a
                    // range at the very start of the document. In
                    // such situation we have to test the range, to
                    // be sure it's valid.
                    if (testIt && nativeSel && nativeSel.type == 'None') {
                        // The "InsertImage" command can be used to
                        // test whether the selection is good or not.
                        // If not, it's enough to give some time to
                        // IE to put things in order for us.
                        if (!doc.queryCommandEnabled('InsertImage')) {
                            setTimeout(function() {
                                saveSelection(true);
                            }, 50);
                            return;
                        }
                    }

                    // Avoid saving selection from within text input. (#5747)
                    var parentTag;
                    if (nativeSel && nativeSel.type == 'Text'
                        && ( parentTag = nativeSel.createRange().parentElement().nodeName.toLowerCase() )
                        && parentTag in { input: 1, textarea : 1 }) {
                        return;
                    }
                    savedRange = nativeSel && sel.getRanges()[ 0 ];
                    editor._monitor();
                }
            }


        } else {
            // In other browsers, we make the selection change
            // check based on other events, like clicks or keys
            // press.
            Event.on(doc, 'mouseup', editor._monitor, editor);
            Event.on(doc, 'keyup', editor._monitor, editor);
        }

    });
});