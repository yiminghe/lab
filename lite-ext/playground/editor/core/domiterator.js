/**
 * modified from ckeditor ,dom iterator implementation using walker and nextSourceNode
 * @modifier:yiminghe@gmail.com(chengyu)
 */
KISSYEDITOR.add("editor-domiterator", function(KE) {
    var S = KISSY,
        UA = S.UA,
        Walker = KE.Walker,
        KERange = KE.Range,KER = KE.RANGE,
        KEN = KE.NODE,
        ElementPath = KE.ElementPath,
        Node = S.Node,
        DOM = S.DOM;

    function Iterator(range) {
        if (arguments.length < 1)
            return;

        this.range = range;
        this.forceBrBreak = false;

        // Whether include <br>s into the enlarged range.(#3730).
        this.enlargeBr = true;
        this.enforceRealBlocks = false;

        this._ || ( this._ = {} );
    }

    var beginWhitespaceRegex = /^[\r\n\t ]*$/,///^[\r\n\t ]+$/,//+:*??≤ª∆•≈‰ø’¥Æ
        isBookmark = Walker.bookmark();

    S.augment(Iterator, {
        getNextParagraph : function(blockTag) {
            // The block element to be returned.
            var block;

            // The range object used to identify the paragraph contents.
            var range;

            // Indicats that the current element in the loop is the last one.
            var isLast;

            // Instructs to cleanup remaining BRs.
            var removePreviousBr, removeLastBr;

            // This is the first iteration. Let's initialize it.
            if (!this._.lastNode) {
                range = this.range.clone();
                range.enlarge(this.forceBrBreak || !this.enlargeBr ?
                    KER.ENLARGE_LIST_ITEM_CONTENTS : KER.ENLARGE_BLOCK_CONTENTS);

                var walker = new Walker(range),
                    ignoreBookmarkTextEvaluator = Walker.bookmark(true, true);
                // Avoid anchor inside bookmark inner text.
                walker.evaluator = ignoreBookmarkTextEvaluator;
                this._.nextNode = walker.next();
                // TODO: It's better to have walker.reset() used here.
                walker = new Walker(range);
                walker.evaluator = ignoreBookmarkTextEvaluator;
                var lastNode = walker.previous();
                this._.lastNode = lastNode._4e_nextSourceNode(true);

                // We may have an empty text node at the end of block due to [3770].
                // If that node is the lastNode, it would cause our logic to leak to the
                // next block.(#3887)
                if (this._.lastNode &&
                    this._.lastNode[0].nodeType == KEN.NODE_TEXT &&
                    !S.trim(this._.lastNode[0].nodeValue) &&
                    this._.lastNode.parent()._4e_isBlockBoundary()) {
                    var testRange = new KERange(range.document);
                    testRange.moveToPosition(this._.lastNode, KER.POSITION_AFTER_END);
                    if (testRange.checkEndOfBlock()) {
                        var path = new ElementPath(testRange.endContainer);
                        var lastBlock = path.block || path.blockLimit;
                        this._.lastNode = lastBlock._4e_nextSourceNode(true);
                    }
                }

                // Probably the document end is reached, we need a marker node.
                if (!this._.lastNode) {
                    this._.lastNode = this._.docEndMarker = new Node(range.document.createTextNode(''));
                    DOM.insertAfter(this._.lastNode[0], lastNode[0]);
                }

                // Let's reuse this variable.
                range = null;
            }

            var currentNode = this._.nextNode;
            lastNode = this._.lastNode;

            this._.nextNode = null;
            while (currentNode) {
                // closeRange indicates that a paragraph boundary has been found,
                // so the range can be closed.
                var closeRange = false;

                // includeNode indicates that the current node is good to be part
                // of the range. By default, any non-element node is ok for it.
                var includeNode = ( currentNode[0].nodeType != KEN.NODE_ELEMENT ),
                    continueFromSibling = false;

                // If it is an element node, let's check if it can be part of the
                // range.
                if (!includeNode) {
                    var nodeName = currentNode._4e_name();

                    if (currentNode._4e_isBlockBoundary(this.forceBrBreak && { br : 1 })) {
                        // <br> boundaries must be part of the range. It will
                        // happen only if ForceBrBreak.
                        if (nodeName == 'br')
                            includeNode = true;
                        else if (!range && !currentNode[0].childNodes.length && nodeName != 'hr') {
                            // If we have found an empty block, and haven't started
                            // the range yet, it means we must return this block.
                            block = currentNode;
                            isLast = currentNode._4e_equals(lastNode);
                            break;
                        }

                        // The range must finish right before the boundary,
                        // including possibly skipped empty spaces. (#1603)
                        if (range) {
                            range.setEndAt(currentNode, KER.POSITION_BEFORE_START);

                            // The found boundary must be set as the next one at this
                            // point. (#1717)
                            if (nodeName != 'br')
                                this._.nextNode = currentNode;
                        }

                        closeRange = true;
                    } else {
                        // If we have child nodes, let's check them.
                        if (currentNode[0].firstChild) {
                            // If we don't have a range yet, let's start it.
                            if (!range) {
                                range = new KERange(this.range.document);
                                range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
                            }

                            currentNode = new Node(currentNode[0].firstChild);
                            continue;
                        }
                        includeNode = true;
                    }
                }
                else if (currentNode[0].nodeType == KEN.NODE_TEXT) {
                    // Ignore normal whitespaces (i.e. not including &nbsp; or
                    // other unicode whitespaces) before/after a block node.
                    if (beginWhitespaceRegex.test(currentNode[0].nodeValue))
                        includeNode = false;
                }

                // The current node is good to be part of the range and we are
                // starting a new range, initialize it first.
                if (includeNode && !range) {
                    range = new KERange(this.range.document);
                    range.setStartAt(currentNode, KER.POSITION_BEFORE_START);
                }

                // The last node has been found.
                isLast = ( !closeRange || includeNode ) && currentNode._4e_equals(lastNode);

                // If we are in an element boundary, let's check if it is time
                // to close the range, otherwise we include the parent within it.
                if (range && !closeRange) {
                    while (!currentNode[0].nextSibling && !isLast) {
                        var parentNode = currentNode.parent();

                        if (parentNode._4e_isBlockBoundary(this.forceBrBreak && { br : 1 })) {
                            closeRange = true;
                            isLast = isLast || parentNode._4e_equals(lastNode);
                            break;
                        }

                        currentNode = parentNode;
                        includeNode = true;
                        isLast = currentNode._4e_equals(lastNode);
                        continueFromSibling = true;
                    }
                }

                // Now finally include the node.
                if (includeNode)
                    range.setEndAt(currentNode, KER.POSITION_AFTER_END);

                currentNode = currentNode._4e_nextSourceNode(continueFromSibling, null, lastNode);
                isLast = !currentNode;

                // We have found a block boundary. Let's close the range and move out of the
                // loop.
                if (( closeRange || isLast ) && range) {
                    var boundaryNodes = range.getBoundaryNodes(),
                        startPath = new ElementPath(range.startContainer);

                    // Drop the range if it only contains bookmark nodes, and is
                    // not because of the original collapsed range. (#4087,#4450)
                    if (boundaryNodes.startNode.parent()._4e_equals(startPath.blockLimit)
                        && isBookmark(boundaryNodes.startNode) && isBookmark(boundaryNodes.endNode)) {
                        range = null;
                        this._.nextNode = null;
                    }
                    else
                        break;
                }

                if (isLast)
                    break;

            }

            // Now, based on the processed range, look for (or create) the block to be returned.
            if (!block) {
                // If no range has been found, this is the end.
                if (!range) {
                    this._.docEndMarker && this._.docEndMarker.remove();
                    this._.nextNode = null;
                    return null;
                }

                startPath = new ElementPath(range.startContainer);
                var startBlockLimit = startPath.blockLimit,
                    checkLimits = { div : 1, th : 1, td : 1 };
                block = startPath.block;

                if ((!block || !block[0])
                    && !this.enforceRealBlocks
                    && checkLimits[ startBlockLimit._4e_name() ]
                    && range.checkStartOfBlock()
                    && range.checkEndOfBlock())
                    block = startBlockLimit;
                else if (!block || ( this.enforceRealBlocks && block._4e_name() == 'li' )) {
                    // Create the fixed block.
                    block = new Node(this.range.document.createElement(blockTag || 'p'));
                    // Move the contents of the temporary range to the fixed block.
                    block[0].appendChild(range.extractContents());
                    block._4e_trim();
                    // Insert the fixed block into the DOM.
                    range.insertNode(block);
                    removePreviousBr = removeLastBr = true;
                }
                else if (block._4e_name() != 'li') {
                    // If the range doesn't includes the entire contents of the
                    // block, we must split it, isolating the range in a dedicated
                    // block.
                    if (!range.checkStartOfBlock() || !range.checkEndOfBlock()) {
                        // The resulting block will be a clone of the current one.
                        block = block._4e_clone(false);

                        // Extract the range contents, moving it to the new block.
                        block[0].appendChild(range.extractContents());
                        block._4e_trim();

                        // Split the block. At this point, the range will be in the
                        // right position for our intents.
                        var splitInfo = range.splitBlock();

                        removePreviousBr = !splitInfo.wasStartOfBlock;
                        removeLastBr = !splitInfo.wasEndOfBlock;

                        // Insert the new block into the DOM.
                        range.insertNode(block);
                    }
                }
                else if (!isLast) {
                    // LIs are returned as is, with all their children (due to the
                    // nested lists). But, the next node is the node right after
                    // the current range, which could be an <li> child (nested
                    // lists) or the next sibling <li>.

                    this._.nextNode = ( block._4e_equals(lastNode) ? null :
                        range.getBoundaryNodes().endNode._4e_nextSourceNode(true, null, lastNode) );
                }
            }

            if (removePreviousBr) {
                var previousSibling = new Node(block[0].previousSibling);
                if (previousSibling[0] && previousSibling[0].nodeType == KEN.NODE_ELEMENT) {
                    if (previousSibling._4e_name() == 'br')
                        previousSibling._4e_remove();
                    else if (previousSibling[0].lastChild && previousSibling[0].lastChild.nodeName.toLowerCase() == 'br')
                        DOM._4e_remove(previousSibling[0].lastChild);
                }
            }

            if (removeLastBr) {
                // Ignore bookmark nodes.(#3783)
                var bookmarkGuard = Walker.bookmark(false, true);

                var lastChild = new Node(block[0].lastChild);
                if (lastChild[0] && lastChild[0].nodeType == KEN.NODE_ELEMENT && lastChild._4e_name() == 'br') {
                    // Take care not to remove the block expanding <br> in non-IE browsers.
                    if (UA.ie
                        || lastChild._4e_previous(bookmarkGuard)
                        || lastChild._4e_next(bookmarkGuard))
                        lastChild._4e_remove();
                }
            }

            // Get a reference for the next element. This is important because the
            // above block can be removed or changed, so we can rely on it for the
            // next interation.
            if (!this._.nextNode) {
                this._.nextNode = ( isLast || block._4e_equals(lastNode) ) ? null :
                    block._4e_nextSourceNode(true, null, lastNode);
            }

            return block;
        }
    });

    KERange.prototype.createIterator = function() {
        return new Iterator(this);
    };
});