/**
 * modified from ckeditor,range implementation across browsers for kissy editor
 * @modifier:yiminghe@gmail.com(chengyu)
 */
KISSYEDITOR.add("editor-range", function(KE) {
    var S = KISSY;
    KE.RANGE = {
        POSITION_AFTER_START:1,// <element>^contents</element>		"^text"
        POSITION_BEFORE_END:2,// <element>contents^</element>		"text^"
        POSITION_BEFORE_START:3,// ^<element>contents</element>		^"text"
        POSITION_AFTER_END:4,// <element>contents</element>^		"text"
        ENLARGE_ELEMENT:1,
        ENLARGE_BLOCK_CONTENTS:2,
        ENLARGE_LIST_ITEM_CONTENTS:3,
        START:1,
        END:2,
        STARTEND:3,
        SHRINK_ELEMENT:1,
        SHRINK_TEXT:2
    };

    var KEN = KE.NODE,
        KER = KE.RANGE,
        KEP = KE.POSITION,
        Walker = KE.Walker,
        DOM = S.DOM,
        UA = S.UA,
        dtd = KE.XHTML_DTD,
        ElementPath = KE.ElementPath,
        Node = S.Node,
        EMPTY = {area:1,base:1,br:1,col:1,hr:1,img:1,input:1,link:1,meta:1,param:1};

    function KERange(document) {
        this.startContainer = null;
        this.startOffset = null;
        this.endContainer = null;
        this.endOffset = null;
        this.collapsed = true;
        this.document = document;
    }

    KERange.prototype.toString = function() {
        var s = [];
        s.push((this.startContainer[0].id || this.startContainer[0].nodeName) + ":" + this.startOffset);
        s.push((this.endContainer[0].id || this.endContainer[0].nodeName) + ":" + this.endOffset);
        return s.join("<br/>");
    };
    S.augment(KERange, {

        updateCollapsed:function() {
            var self = this;
            self.collapsed = (
                self.startContainer &&
                    self.endContainer &&
                    self.startContainer[0] == self.endContainer[0] &&
                    self.startOffset == self.endOffset );
        },
        /**
         * Transforms the startContainer and endContainer properties from text
         * nodes to element nodes, whenever possible. This is actually possible
         * if either of the boundary containers point to a text node, and its
         * offset is set to zero, or after the last char in the node.
         */
        optimize : function() {
            var container = this.startContainer;
            var offset = this.startOffset;

            if (container[0].nodeType != KEN.NODE_ELEMENT) {
                if (!offset)
                    this.setStartBefore(container);
                else if (offset >= container[0].nodeValue.length)
                    this.setStartAfter(container);
            }

            container = this.endContainer;
            offset = this.endOffset;

            if (container[0].nodeType != KEN.NODE_ELEMENT) {
                if (!offset)
                    this.setEndBefore(container);
                else if (offset >= container[0].nodeValue.length)
                    this.setEndAfter(container);
            }
        },
        setStartAfter : function(node) {
            this.setStart(node.parent(), node._4e_index() + 1);
        },

        setStartBefore : function(node) {
            this.setStart(node.parent(), node._4e_index());
        },

        setEndAfter : function(node) {
            this.setEnd(node.parent(), node._4e_index() + 1);
        },

        setEndBefore : function(node) {
            this.setEnd(node.parent(), node._4e_index());
        },
        optimizeBookmark: function() {
            var startNode = this.startContainer,
                endNode = this.endContainer;

            if (startNode && startNode._4e_name() == 'span'
                && startNode.attr('_ke_bookmark'))
                this.setStartAt(startNode, KER.POSITION_BEFORE_START);
            if (endNode && endNode._4e_name() == 'span'
                && endNode.attr('_ke_bookmark'))
                this.setEndAt(endNode, KER.POSITION_AFTER_END);
        },
        /**
         * Sets the start position of a Range.
         * @param {CKEDITOR.dom.node} startNode The node to start the range.
         * @param {Number} startOffset An integer greater than or equal to zero
         *        representing the offset for the start of the range from the start
         *        of startNode.
         */
        setStart : function(startNode, startOffset) {
            // W3C requires a check for the new position. If it is after the end
            // boundary, the range should be collapsed to the new start. It seams
            // we will not need this check for our use of this class so we can
            // ignore it for now.

            // Fixing invalid range start inside dtd empty elements.
            if (startNode[0].nodeType == KEN.NODE_ELEMENT
                && EMPTY[ startNode._4e_name() ])
                startNode = startNode.parent(),startOffset = startNode._4e_index();

            this.startContainer = startNode;
            this.startOffset = startOffset;

            if (!this.endContainer) {
                this.endContainer = startNode;
                this.endOffset = startOffset;
            }

            this.updateCollapsed();
        },

        /**
         * Sets the end position of a Range.
         * @param {CKEDITOR.dom.node} endNode The node to end the range.
         * @param {Number} endOffset An integer greater than or equal to zero
         *        representing the offset for the end of the range from the start
         *        of endNode.
         */
        setEnd : function(endNode, endOffset) {
            // W3C requires a check for the new position. If it is before the start
            // boundary, the range should be collapsed to the new end. It seams we
            // will not need this check for our use of this class so we can ignore
            // it for now.

            // Fixing invalid range end inside dtd empty elements.
            if (endNode[0].nodeType == KEN.NODE_ELEMENT
                && EMPTY[ endNode._4e_name() ])
                endNode = endNode.parent(),endOffset = endNode._4e_index() + 1;

            this.endContainer = endNode;
            this.endOffset = endOffset;

            if (!this.startContainer) {
                this.startContainer = endNode;
                this.startOffset = endOffset;
            }

            this.updateCollapsed();
        },
        setStartAt : function(node, position) {
            switch (position) {
                case KER.POSITION_AFTER_START :
                    this.setStart(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType == KEN.NODE_TEXT)
                        this.setStart(node, node[0].nodeValue.length);
                    else
                        this.setStart(node, node[0].childNodes.length);
                    break;

                case KER.POSITION_BEFORE_START :
                    this.setStartBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    this.setStartAfter(node);
            }

            this.updateCollapsed();
        },

        setEndAt : function(node, position) {
            switch (position) {
                case KER.POSITION_AFTER_START :
                    this.setEnd(node, 0);
                    break;

                case KER.POSITION_BEFORE_END :
                    if (node[0].nodeType == KEN.NODE_TEXT)
                        this.setEnd(node, node[0].nodeValue.length);
                    else
                        this.setEnd(node, node[0].childNodes.length);
                    break;

                case KER.POSITION_BEFORE_START :
                    this.setEndBefore(node);
                    break;

                case KER.POSITION_AFTER_END :
                    this.setEndAfter(node);
            }

            this.updateCollapsed();
        },
        execContentsAction:    function(action, docFrag) {

            this.optimizeBookmark();

            var startNode = this.startContainer;
            var endNode = this.endContainer;

            var startOffset = this.startOffset;
            var endOffset = this.endOffset;

            var removeStartNode;
            var removeEndNode;

            // For text containers, we must simply split the node and point to the
            // second part. The removal will be handled by the rest of the code .
            if (endNode[0].nodeType == KEN.NODE_TEXT)
                endNode = endNode._4e_splitText(endOffset);
            else {
                // If the end container has children and the offset is pointing
                // to a child, then we should start from it.
                if (endNode[0].childNodes.length > 0) {
                    // If the offset points after the last node.
                    if (endOffset >= endNode[0].childNodes.length) {
                        // Let's create a temporary node and mark it for removal.
                        endNode = new Node(endNode[0].appendChild(this.document.createTextNode("")));
                        removeEndNode = true;
                    }
                    else
                        endNode = new Node(endNode[0].childNodes[endOffset]);
                }
            }

            // For text containers, we must simply split the node. The removal will
            // be handled by the rest of the code .
            if (startNode[0].nodeType == KEN.NODE_TEXT) {
                startNode._4e_splitText(startOffset);
                // In cases the end node is the same as the start node, the above
                // splitting will also split the end, so me must move the end to
                // the second part of the split.
                if (startNode[0] === endNode[0])
                    endNode = new Node(startNode[0].nextSibling);
            }
            else {
                // If the start container has children and the offset is pointing
                // to a child, then we should start from its previous sibling.

                // If the offset points to the first node, we don't have a
                // sibling, so let's use the first one, but mark it for removal.
                if (!startOffset) {
                    // Let's create a temporary node and mark it for removal.
                    var t = new Node(this.document.createTextNode(""));
                    DOM.insertBefore(t[0], startNode[0].firstChild);
                    startNode = t;
                    removeStartNode = true;
                }
                else if (startOffset >= startNode[0].childNodes.length) {
                    // Let's create a temporary node and mark it for removal.
                    //startNode = startNode[0].appendChild(this.document.createTextNode(''));
                    var t = new Node(this.document.createTextNode(""));
                    startNode[0].appendChild(t[0]);
                    startNode = t;
                    removeStartNode = true;
                } else
                    startNode = new Node(startNode[0].childNodes[startOffset].previousSibling);
            }

            // Get the parent nodes tree for the start and end boundaries.
            var startParents = startNode._4e_parents();
            var endParents = endNode._4e_parents();

            // Compare them, to find the top most siblings.
            var i, topStart, topEnd;

            for (i = 0; i < startParents.length; i++) {
                topStart = startParents[ i ];
                topEnd = endParents[ i ];

                // The compared nodes will match until we find the top most
                // siblings (different nodes that have the same parent).
                // "i" will hold the index in the parents array for the top
                // most element.
                if (topStart[0] !== topEnd[0])
                    break;
            }

            var clone = docFrag, levelStartNode, levelClone, currentNode, currentSibling;

            // Remove all successive sibling nodes for every node in the
            // startParents tree.
            for (var j = i; j < startParents.length; j++) {
                levelStartNode = startParents[j];

                // For Extract and Clone, we must clone this level.
                if (clone && levelStartNode[0] !== startNode[0])        // action = 0 = Delete
                    levelClone = clone.appendChild(levelStartNode._4e_clone()[0]);

                currentNode = levelStartNode[0].nextSibling;

                while (currentNode) {
                    // Stop processing when the current node matches a node in the
                    // endParents tree or if it is the endNode.
                    if ((endParents[ j ] && currentNode == endParents[ j ][0]) || currentNode == endNode[0])
                        break;

                    // Cache the next sibling.
                    currentSibling = currentNode.nextSibling;

                    // If cloning, just clone it.
                    if (action == 2)    // 2 = Clone
                        clone.appendChild(currentNode.cloneNode(true));
                    else {
                        // Both Delete and Extract will remove the node.
                        currentNode.parentNode.removeChild(currentNode);

                        // When Extracting, move the removed node to the docFrag.
                        if (action == 1)    // 1 = Extract
                            clone.appendChild(currentNode);
                    }

                    currentNode = currentSibling;
                }
                //ckeditor这里错了，当前节点的路径所在父节点不能clone(true)，要在后面深入子节点处理
                if (levelClone)
                    clone = levelClone;
            }

            clone = docFrag;

            // Remove all previous sibling nodes for every node in the
            // endParents tree.
            for (var k = i; k < endParents.length; k++) {
                levelStartNode = endParents[ k ];

                // For Extract and Clone, we must clone this level.
                if (action > 0 && levelStartNode[0] !== endNode[0])        // action = 0 = Delete
                    levelClone = clone.appendChild(levelStartNode._4e_clone()[0]);

                // The processing of siblings may have already been done by the parent.
                if (!startParents[ k ] || levelStartNode[0].parentNode !== startParents[ k ][0].parentNode) {
                    currentNode = levelStartNode[0].previousSibling;
                    while (currentNode) {
                        // Stop processing when the current node matches a node in the
                        // startParents tree or if it is the startNode.
                        if ((startParents[ k ] && currentNode == startParents[ k ][0]) || currentNode === startNode[0])
                            break;

                        // Cache the next sibling.
                        currentSibling = currentNode.previousSibling;

                        // If cloning, just clone it.
                        if (action == 2) {    // 2 = Clone
                            clone.insertBefore(currentNode.cloneNode(true), clone.firstChild);
                        }

                        else {
                            // Both Delete and Extract will remove the node.
                            currentNode.parentNode.removeChild(currentNode);

                            // When Extracting, mode the removed node to the docFrag.
                            if (action == 1)    // 1 = Extract
                                clone.insertBefore(currentNode, clone.firstChild);
                        }

                        currentNode = currentSibling;
                    }
                }

                if (levelClone)
                    clone = levelClone;
            }

            if (action == 2) {   // 2 = Clone.

                // No changes in the DOM should be done, so fix the split text (if any).

                var startTextNode = this.startContainer[0];
                if (startTextNode.nodeType == KEN.NODE_TEXT) {
                    startTextNode.data += startTextNode.nextSibling.data;
                    startTextNode.parentNode.removeChild(startTextNode.nextSibling);
                }

                var endTextNode = this.endContainer[0];
                if (endTextNode.nodeType == KEN.NODE_TEXT && endTextNode.nextSibling) {
                    endTextNode.data += endTextNode.nextSibling.data;
                    endTextNode.parentNode.removeChild(endTextNode.nextSibling);
                }
            }
            else {
                // Collapse the range.

                // If a node has been partially selected, collapse the range between
                // topStart and topEnd. Otherwise, simply collapse it to the start. (W3C specs).
                if (topStart && topEnd && ( startNode[0].parentNode != topStart[0].parentNode || endNode[0].parentNode != topEnd[0].parentNode )) {
                    var endIndex = topEnd._4e_index();

                    // If the start node is to be removed, we must correct the
                    // index to reflect the removal.
                    if (removeStartNode && topEnd[0].parentNode == startNode[0].parentNode)
                        endIndex--;

                    this.setStart(topEnd.parent(), endIndex);
                }

                // Collapse it to the start.
                this.collapse(true);
            }

            // Cleanup any marked node.
            if (removeStartNode)
                startNode.remove();

            if (removeEndNode && endNode[0].parentNode)
                endNode.remove();
        },

        collapse : function(toStart) {
            if (toStart) {
                this.endContainer = this.startContainer;
                this.endOffset = this.startOffset;
            } else {
                this.startContainer = this.endContainer;
                this.startOffset = this.endOffset;
            }
            this.collapsed = true;
        },

        clone : function() {
            var clone = new KERange(this.document);

            clone.startContainer = this.startContainer;
            clone.startOffset = this.startOffset;
            clone.endContainer = this.endContainer;
            clone.endOffset = this.endOffset;
            clone.collapsed = this.collapsed;

            return clone;
        },
        getEnclosedNode : function() {
            var walkerRange = this.clone();

            // Optimize and analyze the range to avoid DOM destructive nature of walker. (#
            walkerRange.optimize();
            if (walkerRange.startContainer[0].nodeType != KEN.NODE_ELEMENT
                || walkerRange.endContainer[0].nodeType != KEN.NODE_ELEMENT)
                return null;

            var current = walkerRange.startContainer[0].childNodes[walkerRange.startOffset];

            var
                isNotBookmarks = bookmark(true),
                isNotWhitespaces = whitespaces(true),
                evaluator = function(node) {
                    return isNotWhitespaces(node) && isNotBookmarks(node);
                };
            while (current && evaluator(current)) {
                current = new Node(current)._4e_nextSourceNode()[0];
            }
            return new Node(current);
        },
        shrink : function(mode, selectContents) {
            // Unable to shrink a collapsed range.
            if (!this.collapsed) {
                mode = mode || KER.SHRINK_TEXT;

                var walkerRange = this.clone();

                var startContainer = this.startContainer,
                    endContainer = this.endContainer,
                    startOffset = this.startOffset,
                    endOffset = this.endOffset,
                    collapsed = this.collapsed;

                // Whether the start/end boundary is moveable.
                var moveStart = 1,
                    moveEnd = 1;

                if (startContainer && startContainer[0].nodeType == KEN.NODE_TEXT) {
                    if (!startOffset)
                        walkerRange.setStartBefore(startContainer);
                    else if (startOffset >= startContainer[0].nodeValue.length)
                        walkerRange.setStartAfter(startContainer);
                    else {
                        // Enlarge the range properly to avoid walker making
                        // DOM changes caused by triming the text nodes later.
                        walkerRange.setStartBefore(startContainer);
                        moveStart = 0;
                    }
                }

                if (endContainer && endContainer[0].nodeType == KEN.NODE_TEXT) {
                    if (!endOffset)
                        walkerRange.setEndBefore(endContainer);
                    else if (endOffset >= endContainer[0].nodeValue.length)
                        walkerRange.setEndAfter(endContainer);
                    else {
                        walkerRange.setEndAfter(endContainer);
                        moveEnd = 0;
                    }
                }

                var walker = new Walker(walkerRange);

                walker.evaluator = function(node) {
                    node = node[0] || node;
                    return node.nodeType == ( mode == KER.SHRINK_ELEMENT ?
                        KEN.NODE_ELEMENT : KEN.NODE_TEXT );
                };

                var currentElement;
                walker.guard = function(node, movingOut) {

                    node = node[0] || node;
                    // Stop when we're shrink in element mode while encountering a text node.
                    if (mode == KER.SHRINK_ELEMENT && node.nodeType == KEN.NODE_TEXT)
                        return false;

                    // Stop when we've already walked "through" an element.
                    if (movingOut && node == currentElement)
                        return false;

                    if (!movingOut && node.nodeType == KEN.NODE_ELEMENT)
                        currentElement = node;

                    return true;
                };

                if (moveStart) {
                    var textStart = walker[ mode == KER.SHRINK_ELEMENT ? 'lastForward' : 'next']();
                    textStart && this.setStartAt(textStart, selectContents ? KER.POSITION_AFTER_START : KER.POSITION_BEFORE_START);
                }

                if (moveEnd) {
                    walker.reset();
                    var textEnd = walker[ mode == KER.SHRINK_ELEMENT ? 'lastBackward' : 'previous']();
                    textEnd && this.setEndAt(textEnd, selectContents ? KER.POSITION_BEFORE_END : KER.POSITION_AFTER_END);
                }

                return !!( moveStart || moveEnd );
            }
        },
        getTouchedStartNode : function() {
            var container = this.startContainer;

            if (this.collapsed || container[0].nodeType != KEN.NODE_ELEMENT)
                return container;

            return container.childNodes[this.startOffset] || container;
        },
        createBookmark : function(serializable) {
            var startNode, endNode;
            var baseId;
            var clone;
            startNode = new Node("<span></span>", null, this.document);
            startNode.attr('_ke_bookmark', 1);
            startNode.css('display', 'none');

            // For IE, it must have something inside, otherwise it may be
            // removed during DOM operations.
            startNode.html('&nbsp;');

            if (serializable) {
                baseId = S.guid('ke_bm_');
                startNode.attr('id', baseId + 'S');
            }

            // If collapsed, the endNode will not be created.
            if (!this.collapsed) {
                endNode = startNode._4e_clone();
                endNode.html('&nbsp;');

                if (serializable)
                    endNode.attr('id', baseId + 'E');

                clone = this.clone();
                clone.collapse();
                clone.insertNode(endNode);
            }

            clone = this.clone();
            clone.collapse(true);
            clone.insertNode(startNode);

            // Update the range position.
            if (endNode) {
                this.setStartAfter(startNode);
                this.setEndBefore(endNode);
            }
            else
                this.moveToPosition(startNode, KER.POSITION_AFTER_END);

            return {
                startNode : serializable ? baseId + 'S' : startNode,
                endNode : serializable ? baseId + 'E' : endNode,
                serializable : serializable
            };
        },
        moveToPosition : function(node, position) {
            this.setStartAt(node, position);
            this.collapse(true);
        },
        trim : function(ignoreStart, ignoreEnd) {
            var startContainer = this.startContainer,
                startOffset = this.startOffset,
                collapsed = this.collapsed;
            if (( !ignoreStart || collapsed )
                && startContainer[0] && startContainer[0].nodeType == KEN.NODE_TEXT) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!startOffset) {
                    startOffset = startContainer._4e_index();
                    startContainer = startContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (startOffset >= startContainer[0].nodeValue.length) {
                    startOffset = startContainer._4e_index() + 1;
                    startContainer = startContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    var nextText = startContainer._4e_splitText(startOffset);

                    startOffset = startContainer._4e_index() + 1;
                    startContainer = startContainer.parent();

                    // Check all necessity of updating the end boundary.
                    if (this.startContainer[0] == this.endContainer[0])
                        this.setEnd(nextText, this.endOffset - this.startOffset);
                    else if (startContainer[0] == this.endContainer[0])
                        this.endOffset += 1;
                }

                this.setStart(startContainer, startOffset);

                if (collapsed) {
                    this.collapse(true);
                    return;
                }
            }

            var endContainer = this.endContainer;
            var endOffset = this.endOffset;

            if (!( ignoreEnd || collapsed )
                && endContainer[0] && endContainer[0].nodeType == KEN.NODE_TEXT) {
                // If the offset is zero, we just insert the new node before
                // the start.
                if (!endOffset) {
                    endOffset = endContainer._4e_index();
                    endContainer = endContainer.parent();
                }
                // If the offset is at the end, we'll insert it after the text
                // node.
                else if (endOffset >= endContainer.nodeValue.length()) {
                    endOffset = endContainer._4e_index() + 1;
                    endContainer = endContainer.parent();
                }
                // In other case, we split the text node and insert the new
                // node at the split point.
                else {
                    endContainer._4e_splitText(endOffset);

                    endOffset = endContainer._4e_index() + 1;
                    endContainer = endContainer.parent();
                }

                this.setEnd(endContainer, endOffset);
            }
        },

        insertNode : function(node) {
            this.optimizeBookmark();
            this.trim(false, true);

            var startContainer = this.startContainer;
            var startOffset = this.startOffset;

            var nextNode = startContainer[0].childNodes[startOffset];

            if (nextNode) {
                DOM.insertBefore(node[0] || node, nextNode);
            } else
                startContainer[0].appendChild(node[0] || node);

            // Check if we need to update the end boundary.
            if (node.parent()[0] === this.endContainer[0])
                this.endOffset++;

            // Expand the range to embrace the new node.
            this.setStartBefore(node);
        },

        moveToBookmark : function(bookmark) {
            // Created with createBookmark().
            {
                var serializable = bookmark.serializable,
                    startNode = serializable ? S.one("#" + bookmark.startNode, this.document) : bookmark.startNode,
                    endNode = serializable ? S.one("#" + bookmark.endNode, this.document) : bookmark.endNode;

                // Set the range start at the bookmark start node position.
                this.setStartBefore(startNode);

                // Remove it, because it may interfere in the setEndBefore call.
                startNode.remove();

                // Set the range end at the bookmark end node position, or simply
                // collapse it if it is not available.
                if (endNode && endNode[0]) {
                    this.setEndBefore(endNode);
                    endNode.remove();
                }
                else
                    this.collapse(true);
            }
        },
        getCommonAncestor : function(includeSelf, ignoreTextNode) {
            var start = this.startContainer,
                end = this.endContainer,
                ancestor;

            if (start[0] === end[0]) {
                if (includeSelf
                    && start[0].nodeType == KEN.NODE_ELEMENT
                    && this.startOffset == this.endOffset - 1)
                    ancestor = new Node(start[0].childNodes[this.startOffset]);
                else
                    ancestor = start;
            }
            else
                ancestor = start._4e_commonAncestor(end);

            return ignoreTextNode && ancestor[0].nodeType == KEN.NODE_TEXT
                ? ancestor.parent() : ancestor;
        },
        enlarge : function(unit) {
            switch (unit) {
                case KER.ENLARGE_ELEMENT :

                    if (this.collapsed)
                        return;

                    // Get the common ancestor.
                    var commonAncestor = this.getCommonAncestor();

                    var body = new Node(this.document.body);

                    // For each boundary
                    //		a. Depending on its position, find out the first node to be checked (a sibling) or, if not available, to be enlarge.
                    //		b. Go ahead checking siblings and enlarging the boundary as much as possible until the common ancestor is not reached. After reaching the common ancestor, just save the enlargeable node to be used later.

                    var startTop, endTop;

                    var enlargeable, sibling, commonReached;

                    // Indicates that the node can be added only if whitespace
                    // is available before it.
                    var needsWhiteSpace = false;
                    var isWhiteSpace;
                    var siblingText;

                    // Process the start boundary.

                    var container = this.startContainer;
                    var offset = this.startOffset;

                    if (container[0].nodeType == KEN.NODE_TEXT) {
                        if (offset) {
                            // Check if there is any non-space text before the
                            // offset. Otherwise, container is null.
                            container = !S.trim(container[0].nodeValue.substring(0, offset)).length && container;

                            // If we found only whitespace in the node, it
                            // means that we'll need more whitespace to be able
                            // to expand. For example, <i> can be expanded in
                            // "A <i> [B]</i>", but not in "A<i> [B]</i>".
                            needsWhiteSpace = !!container;
                        }

                        if (container) {
                            if (!( sibling = container[0].previousSibling ))
                                enlargeable = container.parent();
                        }
                    }
                    else {
                        // If we have offset, get the node preceeding it as the
                        // first sibling to be checked.
                        if (offset)
                            sibling = container[0].childNodes[offset - 1] || container[0].lastChild;

                        // If there is no sibling, mark the container to be
                        // enlarged.
                        if (!sibling)
                            enlargeable = container;
                    }

                    while (enlargeable || sibling) {
                        if (enlargeable && !sibling) {
                            // If we reached the common ancestor, mark the flag
                            // for it.
                            if (!commonReached && enlargeable[0] === commonAncestor[0])
                                commonReached = true;

                            if (!body._4e_contains(enlargeable))
                                break;

                            // If we don't need space or this element breaks
                            // the line, then enlarge it.
                            if (!needsWhiteSpace || enlargeable.css('display') != 'inline') {
                                needsWhiteSpace = false;

                                // If the common ancestor has been reached,
                                // we'll not enlarge it immediately, but just
                                // mark it to be enlarged later if the end
                                // boundary also enlarges it.
                                if (commonReached)
                                    startTop = enlargeable;
                                else
                                    this.setStartBefore(enlargeable);
                            }

                            sibling = enlargeable[0].previousSibling;
                        }

                        // Check all sibling nodes preceeding the enlargeable
                        // node. The node wil lbe enlarged only if none of them
                        // blocks it.
                        while (sibling) {
                            // This flag indicates that this node has
                            // whitespaces at the end.
                            isWhiteSpace = false;

                            if (sibling.nodeType == KEN.NODE_TEXT) {
                                siblingText = sibling.nodeValue;

                                if (/[^\s\ufeff]/.test(siblingText))
                                    sibling = null;

                                isWhiteSpace = /[\s\ufeff]$/.test(siblingText);
                            }
                            else {
                                // If this is a visible element.
                                // We need to check for the bookmark attribute because IE insists on
                                // rendering the display:none nodes we use for bookmarks. (#3363)
                                if (sibling.offsetWidth > 0 && !sibling.getAttribute('_ke_bookmark')) {
                                    // We'll accept it only if we need
                                    // whitespace, and this is an inline
                                    // element with whitespace only.
                                    if (needsWhiteSpace && dtd.$removeEmpty[ sibling.nodeName.toLowerCase() ]) {
                                        // It must contains spaces and inline elements only.

                                        siblingText = DOM.text(sibling);

                                        if ((/[^\s\ufeff]/).test(siblingText))    // Spaces + Zero Width No-Break Space (U+FEFF)
                                            sibling = null;
                                        else {
                                            var allChildren = sibling.all || sibling.getElementsByTagName('*');
                                            for (var i = 0, child; child = allChildren[ i++ ];) {
                                                if (!dtd.$removeEmpty[ child.nodeName.toLowerCase() ]) {
                                                    sibling = null;
                                                    break;
                                                }
                                            }
                                        }

                                        if (sibling)
                                            isWhiteSpace = !!siblingText.length;
                                    }
                                    else
                                        sibling = null;
                                }
                            }

                            // A node with whitespaces has been found.
                            if (isWhiteSpace) {
                                // Enlarge the last enlargeable node, if we
                                // were waiting for spaces.
                                if (needsWhiteSpace) {
                                    if (commonReached)
                                        startTop = enlargeable;
                                    else if (enlargeable)
                                        this.setStartBefore(enlargeable);
                                }
                                else
                                    needsWhiteSpace = true;
                            }

                            if (sibling) {
                                var next = sibling.previousSibling;

                                if (!enlargeable && !next) {
                                    // Set the sibling as enlargeable, so it's
                                    // parent will be get later outside this while.
                                    enlargeable = new Node(sibling);
                                    sibling = null;
                                    break;
                                }

                                sibling = next;
                            }
                            else {
                                // If sibling has been set to null, then we
                                // need to stop enlarging.
                                enlargeable = null;
                            }
                        }

                        if (enlargeable)
                            enlargeable = enlargeable.parent();
                    }

                    // Process the end boundary. This is basically the same
                    // code used for the start boundary, with small changes to
                    // make it work in the opposite side (to the right). This
                    // makes it difficult to reuse the code here. So, fixes to
                    // the above code are likely to be replicated here.

                    container = this.endContainer;
                    offset = this.endOffset;

                    // Reset the common variables.
                    enlargeable = sibling = null;
                    commonReached = needsWhiteSpace = false;

                    if (container[0].nodeType == KEN.NODE_TEXT) {
                        // Check if there is any non-space text after the
                        // offset. Otherwise, container is null.
                        container = !S.trim(container[0].nodeValue.substring(offset)).length && container;

                        // If we found only whitespace in the node, it
                        // means that we'll need more whitespace to be able
                        // to expand. For example, <i> can be expanded in
                        // "A <i> [B]</i>", but not in "A<i> [B]</i>".
                        needsWhiteSpace = !( container && container[0].nodeValue.length );

                        if (container) {
                            if (!( sibling = container[0].nextSibling ))
                                enlargeable = container.parent();
                        }
                    }
                    else {
                        // Get the node right after the boudary to be checked
                        // first.
                        sibling = container[0].childNodes[offset];

                        if (!sibling)
                            enlargeable = container;
                    }

                    while (enlargeable || sibling) {
                        if (enlargeable && !sibling) {
                            if (!commonReached && enlargeable[0] == commonAncestor[0])
                                commonReached = true;

                            if (!body._4e_contains(enlargeable))
                                break;

                            if (!needsWhiteSpace || enlargeable.css('display') != 'inline') {
                                needsWhiteSpace = false;

                                if (commonReached)
                                    endTop = enlargeable;
                                else if (enlargeable)
                                    this.setEndAfter(enlargeable);
                            }

                            sibling = enlargeable[0].nextSibling;
                        }

                        while (sibling) {
                            isWhiteSpace = false;

                            if (sibling.nodeType == KEN.NODE_TEXT) {
                                siblingText = sibling.nodeValue;

                                if (/[^\s\ufeff]/.test(siblingText))
                                    sibling = null;

                                isWhiteSpace = /^[\s\ufeff]/.test(siblingText);
                            }
                            else {
                                // If this is a visible element.
                                // We need to check for the bookmark attribute because IE insists on
                                // rendering the display:none nodes we use for bookmarks. (#3363)
                                if (sibling.offsetWidth > 0 && !sibling.getAttribute('_ke_bookmark')) {
                                    // We'll accept it only if we need
                                    // whitespace, and this is an inline
                                    // element with whitespace only.
                                    if (needsWhiteSpace && dtd.$removeEmpty[ sibling.nodeName.toLowerCase() ]) {
                                        // It must contains spaces and inline elements only.

                                        siblingText = DOM.text(sibling);

                                        if ((/[^\s\ufeff]/).test(siblingText))
                                            sibling = null;
                                        else {
                                            allChildren = sibling.all || sibling.getElementsByTagName('*');
                                            for (i = 0; child = allChildren[ i++ ];) {
                                                if (!dtd.$removeEmpty[ child.nodeName.toLowerCase() ]) {
                                                    sibling = null;
                                                    break;
                                                }
                                            }
                                        }

                                        if (sibling)
                                            isWhiteSpace = !!siblingText.length;
                                    }
                                    else
                                        sibling = null;
                                }
                            }

                            if (isWhiteSpace) {
                                if (needsWhiteSpace) {
                                    if (commonReached)                                        endTop = enlargeable;
                                    else
                                        this.setEndAfter(enlargeable);
                                }
                            }

                            if (sibling) {
                                next = sibling.nextSibling;

                                if (!enlargeable && !next) {
                                    enlargeable = new Node(sibling);
                                    sibling = null;
                                    break;
                                }

                                sibling = next;
                            }
                            else {
                                // If sibling has been set to null, then we
                                // need to stop enlarging.
                                enlargeable = null;
                            }
                        }

                        if (enlargeable)
                            enlargeable = enlargeable.parent();
                    }

                    // If the common ancestor can be enlarged by both boundaries, then include it also.
                    if (startTop && endTop) {
                        commonAncestor = startTop._4e_contains(endTop) ? endTop : startTop;
                        this.setStartBefore(commonAncestor);
                        this.setEndAfter(commonAncestor);
                    }
                    break;

                case KER.ENLARGE_BLOCK_CONTENTS:
                case KER.ENLARGE_LIST_ITEM_CONTENTS:

                    // Enlarging the start boundary.
                    var walkerRange = new KERange(this.document);

                    body = new Node(this.document.body);

                    walkerRange.setStartAt(body, KER.POSITION_AFTER_START);
                    walkerRange.setEnd(this.startContainer, this.startOffset);

                    var walker = new Walker(walkerRange),
                        blockBoundary,  // The node on which the enlarging should stop.
                        tailBr, //
                        defaultGuard = Walker.blockBoundary(
                            ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ? { br : 1 } : null),
                        // Record the encountered 'blockBoundary' for later use.
                        boundaryGuard = function(node) {
                            var retval = defaultGuard(node);
                            if (!retval)
                                blockBoundary = node;
                            return retval;
                        },
                        // Record the encounted 'tailBr' for later use.
                        tailBrGuard = function(node) {
                            var retval = boundaryGuard(node);
                            if (!retval && node[0] && node._4e_name() == 'br')
                                tailBr = node;
                            return retval;
                        };

                    walker.guard = boundaryGuard;

                    enlargeable = walker.lastBackward();

                    // It's the body which stop the enlarging if no block boundary found.
                    blockBoundary = blockBoundary || body;

                    // Start the range at different position by comparing
                    // the document position of it with 'enlargeable' node.
                    this.setStartAt(
                        blockBoundary,
                        blockBoundary._4e_name() != 'br' &&
                            ( !enlargeable && this.checkStartOfBlock()
                                || enlargeable && blockBoundary._4e_contains(enlargeable) ) ?
                            KER.POSITION_AFTER_START :
                            KER.POSITION_AFTER_END);

                    // Enlarging the end boundary.
                    walkerRange = this.clone();
                    walkerRange.collapse();
                    walkerRange.setEndAt(body, KER.POSITION_BEFORE_END);
                    walker = new Walker(walkerRange);

                    // tailBrGuard only used for on range end.
                    walker.guard = ( unit == KER.ENLARGE_LIST_ITEM_CONTENTS ) ?
                        tailBrGuard : boundaryGuard;
                    blockBoundary = null;
                    // End the range right before the block boundary node.

                    enlargeable = walker.lastForward();

                    // It's the body which stop the enlarging if no block boundary found.
                    blockBoundary = blockBoundary || body;

                    // Start the range at different position by comparing
                    // the document position of it with 'enlargeable' node.
                    this.setEndAt(
                        blockBoundary,
                        ( !enlargeable && this.checkEndOfBlock()
                            || enlargeable && blockBoundary._4e_contains(enlargeable) ) ?
                            KER.POSITION_BEFORE_END :
                            KER.POSITION_BEFORE_START);
                    // We must include the <br> at the end of range if there's
                    // one and we're expanding list item contents
                    if (tailBr)
                        this.setEndAfter(tailBr);
            }
        },
        checkStartOfBlock : function() {
            var startContainer = this.startContainer,
                startOffset = this.startOffset;

            // If the starting node is a text node, and non-empty before the offset,
            // then we're surely not at the start of block.
            if (startOffset && startContainer[0].nodeType == KEN.NODE_TEXT) {
                var textBefore = S.trim(startContainer.substring(0, startOffset));
                if (textBefore.length)
                    return false;
            }

            // Antecipate the trim() call here, so the walker will not make
            // changes to the DOM, which would not get reflected into this
            // range otherwise.
            this.trim();

            // We need to grab the block element holding the start boundary, so
            // let's use an element path for it.
            var path = new ElementPath(this.startContainer);

            // Creates a range starting at the block start until the range start.
            var walkerRange = this.clone();
            walkerRange.collapse(true);
            walkerRange.setStartAt(path.block || path.blockLimit, KER.POSITION_AFTER_START);

            var walker = new Walker(walkerRange);
            walker.evaluator = getCheckStartEndBlockEvalFunction(true);

            return walker.checkBackward();
        },

        checkEndOfBlock : function() {
            var endContainer = this.endContainer,
                endOffset = this.endOffset;

            // If the ending node is a text node, and non-empty after the offset,
            // then we're surely not at the end of block.
            if (endContainer[0].nodeType == KEN.NODE_TEXT) {
                var textAfter = S.trim(endContainer[0].nodeValue.substring(endOffset));
                if (textAfter.length)
                    return false;
            }

            // Antecipate the trim() call here, so the walker will not make
            // changes to the DOM, which would not get reflected into this
            // range otherwise.
            this.trim();

            // We need to grab the block element holding the start boundary, so
            // let's use an element path for it.
            var path = new ElementPath(this.endContainer);

            // Creates a range starting at the block start until the range start.
            var walkerRange = this.clone();
            walkerRange.collapse(false);
            walkerRange.setEndAt(path.block || path.blockLimit, KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange);
            walker.evaluator = getCheckStartEndBlockEvalFunction(false);

            return walker.checkForward();
        },
        deleteContents:function() {
            if (this.collapsed)
                return;
            this.execContentsAction(0);
        },
        extractContents : function() {
            var docFrag = this.document.createDocumentFragment();
            if (!this.collapsed)
                this.execContentsAction(1, docFrag);
            return docFrag;
        },
        /**
         * Check whether current range is on the inner edge of the specified element.
         * @param {Number} checkType ( CKEDITOR.START | CKEDITOR.END ) The checking side.
         * @param {CKEDITOR.dom.element} element The target element to check.
         */
        checkBoundaryOfElement : function(element, checkType) {
            var walkerRange = this.clone();
            // Expand the range to element boundary.
            walkerRange[ checkType == KER.START ?
                'setStartAt' : 'setEndAt' ]
                (element, checkType == KER.START ?
                    KER.POSITION_AFTER_START
                    : KER.POSITION_BEFORE_END);

            var walker = new Walker(walkerRange),
                retval = false;
            walker.evaluator = elementBoundaryEval;
            return walker[ checkType == KER.START ?
                'checkBackward' : 'checkForward' ]();
        },

        getBoundaryNodes : function() {
            var startNode = this.startContainer,
                endNode = this.endContainer,
                startOffset = this.startOffset,
                endOffset = this.endOffset,
                childCount;

            if (startNode[0].nodeType == KEN.NODE_ELEMENT) {
                childCount = startNode[0].childNodes.length;
                if (childCount > startOffset)
                    startNode = new Node(startNode[0].childNodes[startOffset]);
                else if (childCount < 1)
                    startNode = startNode._4e_previousSourceNode();
                else        // startOffset > childCount but childCount is not 0
                {
                    // Try to take the node just after the current position.
                    startNode = startNode[0];
                    while (startNode.lastChild)
                        startNode = startNode.lastChild;
                    startNode = new Node(startNode);

                    // Normally we should take the next node in DFS order. But it
                    // is also possible that we've already reached the end of
                    // document.
                    startNode = startNode._4e_nextSourceNode() || startNode;
                }
            }

            if (endNode[0].nodeType == KEN.NODE_ELEMENT) {
                childCount = endNode[0].childNodes.length;
                if (childCount > endOffset)
                    endNode = new Node(endNode[0].childNodes[endOffset])._4e_previousSourceNode(true);
                else if (childCount < 1)
                    endNode = endNode._4e_previousSourceNode();
                else        // endOffset > childCount but childCount is not 0
                {
                    // Try to take the node just before the current position.
                    endNode = endNode[0];
                    while (endNode.lastChild)
                        endNode = endNode.lastChild;
                    endNode = new Node(endNode);
                }
            }

            // Sometimes the endNode will come right before startNode for collapsed
            // ranges. Fix it. (#3780)
            if (startNode._4e_position(endNode) & KEP.POSITION_FOLLOWING)
                startNode = endNode;

            return { startNode : startNode, endNode : endNode };
        },
        fixBlock : function(isStart, blockTag) {
            var bookmark = this.createBookmark(),
                fixedBlock = new Node(this.document.createElement(blockTag));

            this.collapse(isStart);

            this.enlarge(KER.ENLARGE_BLOCK_CONTENTS);
            fixedBlock[0].appendChild(this.extractContents());
            fixedBlock.trim();

            if (!UA.ie)
                fixedBlock._4e_appendBogus();

            this.insertNode(fixedBlock);

            this.moveToBookmark(bookmark);

            return fixedBlock;
        },
        splitBlock : function(blockTag) {
            var startPath = new ElementPath(this.startContainer),
                endPath = new ElementPath(this.endContainer);

            var startBlockLimit = startPath.blockLimit,
                endBlockLimit = endPath.blockLimit;

            var startBlock = startPath.block,
                endBlock = endPath.block;

            var elementPath = null;
            // Do nothing if the boundaries are in different block limits.
            if (startBlockLimit[0] !== endBlockLimit[0])
                return null;

            // Get or fix current blocks.
            if (blockTag != 'br') {
                if (!startBlock) {
                    startBlock = this.fixBlock(true, blockTag);
                    endBlock = new ElementPath(this.endContainer).block;
                }

                if (!endBlock)
                    endBlock = this.fixBlock(false, blockTag);
            }

            // Get the range position.
            var isStartOfBlock = startBlock && this.checkStartOfBlock(),
                isEndOfBlock = endBlock && this.checkEndOfBlock();

            // Delete the current contents.
            // TODO: Why is 2.x doing CheckIsEmpty()?
            this.deleteContents();

            if (startBlock && startBlock[0] == endBlock[0]) {
                if (isEndOfBlock) {
                    elementPath = new ElementPath(this.startContainer);
                    this.moveToPosition(endBlock, KER.POSITION_AFTER_END);
                    endBlock = null;
                }
                else if (isStartOfBlock) {
                    elementPath = new ElementPath(this.startContainer);
                    this.moveToPosition(startBlock, KER.POSITION_BEFORE_START);
                    startBlock = null;
                }
                else {
                    endBlock = this.splitElement(startBlock);

                    // In Gecko, the last child node must be a bogus <br>.
                    // Note: bogus <br> added under <ul> or <ol> would cause
                    // lists to be incorrectly rendered.
                    if (!UA.ie && !S.inArray(startBlock._4e_name(), ['ul', 'ol']))
                        startBlock._4e_appendBogus();
                }
            }

            return {
                previousBlock : startBlock,
                nextBlock : endBlock,
                wasStartOfBlock : isStartOfBlock,
                wasEndOfBlock : isEndOfBlock,
                elementPath : elementPath
            };
        },
        splitElement : function(toSplit) {
            if (!this.collapsed)
                return null;

            // Extract the contents of the block from the selection point to the end
            // of its contents.
            this.setEndAt(toSplit, KER.POSITION_BEFORE_END);
            var documentFragment = this.extractContents();

            // Duplicate the element after it.
            var clone = toSplit.clone(false);

            // Place the extracted contents into the duplicated element.
            clone[0].appendChild(documentFragment);
            clone.insertAfter(toSplit);
            this.moveToPosition(toSplit, KER.POSITION_AFTER_END);
            return clone;
        },
        moveToElementEditablePosition : function(el, isMoveToEnd) {
            var isEditable,xhtml_dtd = KE.XHTML_DTD;

            // Empty elements are rejected.
            if (xhtml_dtd.$empty[ el._4e_name() ])
                return false;

            while (el && el[0].nodeType == KEN.NODE_ELEMENT) {
                isEditable = el._4e_isEditable();

                // If an editable element is found, move inside it.
                if (isEditable)
                    this.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_BEFORE_END :
                        KER.POSITION_AFTER_START);
                // Stop immediately if we've found a non editable inline element (e.g <img>).
                else if (xhtml_dtd.$inline[ el._4e_name() ]) {
                    this.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    return true;
                }

                // Non-editable non-inline elements are to be bypassed, getting the next one.
                if (xhtml_dtd.$empty[ el._4e_name() ])
                    el = el[ isMoveToEnd ? '_4e_previous' : '_4e_next' ](nonWhitespaceOrBookmarkEval);
                else
                    el = el[ isMoveToEnd ? '_4e_last' : '_4e_first' ](nonWhitespaceOrBookmarkEval);

                // Stop immediately if we've found a text node.
                if (el && el[0].nodeType == KEN.NODE_TEXT) {
                    this.moveToPosition(el, isMoveToEnd ?
                        KER.POSITION_AFTER_END :
                        KER.POSITION_BEFORE_START);
                    return true;
                }
            }

            return isEditable;
        }

    });
    var inlineChildReqElements = { abbr:1,acronym:1,b:1,bdo:1,big:1,cite:1,code:1,del:1,dfn:1,em:1,font:1,i:1,ins:1,label:1,kbd:1,q:1,samp:1,small:1,span:1,strike:1,strong:1,sub:1,sup:1,tt:1,u:1,'var':1 };

    // Evaluator for CKEDITOR.dom.element::checkBoundaryOfElement, reject any
    // text node and non-empty elements unless it's being bookmark text.
    function elementBoundaryEval(node) {
        // Reject any text node unless it's being bookmark
        // OR it's spaces. (#3883)
        //如果不是文本节点并且是空的就是边界了
        var c1 = node[0].nodeType != KEN.NODE_TEXT
            && node._4e_name() in dtd.$removeEmpty,
            //文本为空也是边界
            c2 = !S.trim(node[0].nodeValue),
            //恩，进去了书签还是边界了
            c3 = !!node.parent().attr('_ke_bookmark');
        return c1 || c2 || c3;
    }

    var whitespaceEval = new Walker.whitespaces(),
        bookmarkEval = new Walker.bookmark();

    function nonWhitespaceOrBookmarkEval(node) {
        // Whitespaces and bookmark nodes are to be ignored.
        return !whitespaceEval(node) && !bookmarkEval(node);
    }

    function getCheckStartEndBlockEvalFunction(isStart) {
        var hadBr = false, bookmarkEvaluator = Walker.bookmark(true);
        return function(node) {
            // First ignore bookmark nodes.
            if (bookmarkEvaluator(node))
                return true;

            if (node[0].nodeType == KEN.NODE_TEXT) {
                // If there's any visible text, then we're not at the start.
                if (S.trim(node[0].nodeValue).length)
                    return false;
            }
            else if (node[0].nodeType == KEN.NODE_ELEMENT) {
                // If there are non-empty inline elements (e.g. <img />), then we're not
                // at the start.
                if (!inlineChildReqElements[ node._4e_name() ]) {
                    // If we're working at the end-of-block, forgive the first <br /> in non-IE
                    // browsers.
                    if (!isStart && !UA.ie && node._4e_name() == 'br' && !hadBr)
                        hadBr = true;
                    else
                        return false;
                }
            }
            return true;
        };
    }

    function bookmark(contentOnly, isReject) {
        function isBookmarkNode(node) {
            return ( node && node.nodeName == 'span'
                && node.getAttribute('_ke_bookmark') );
        }

        return function(node) {
            var isBookmark, parent;
            // Is bookmark inner text node?
            isBookmark = ( node && !node.nodeName && ( parent = node.parentNode )
                && isBookmarkNode(parent) );
            // Is bookmark node?
            isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
            return isReject ^ isBookmark;
        };
    }

    function whitespaces(isReject) {
        return function(node) {
            node = node[0] || node;
            var isWhitespace = node && ( node.nodeType == KEN.NODE_TEXT )
                && !S.trim(node.nodeValue);
            return isReject ^ isWhitespace;
        };
    }


    KE.Range = KERange;
});