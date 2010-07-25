/**
 * modified from ckeditor for kissy editor ,walker implementation
 * @refer:http://www.w3.org/TR/DOM-Level-2-Traversal-Range/traversal#TreeWalker
 * @modifier:yiminghe@gmail.com(chengyu)
 */
KISSY.add("editor-walker", function(S) {

    var KEN = KISSYEDITOR.NODE,Node = S.Node;
    // This function is to be called under a "walker" instance scope.
    function iterate(rtl, breakOnFalse) {
        // Return null if we have reached the end.
        if (this._.end)
            return null;

        var node,
            range = this.range,
            guard,
            userGuard = this.guard,
            type = this.type,
            getSourceNodeFn = ( rtl ? '_4e_previousSourceNode' : '_4e_nextSourceNode' );

        // This is the first call. Initialize it.
        if (!this._.start) {
            this._.start = 1;

            // Trim text nodes and optmize the range boundaries. DOM changes
            // may happen at this point.
            range.trim();

            // A collapsed range must return null at first call.
            if (range.collapsed)
            {
                this.end();
                return null;
            }
        }

        // Create the LTR guard function, if necessary.
        if (!rtl && !this._.guardLTR) {
            // Gets the node that stops the walker when going LTR.
            var limitLTR = range.endContainer,
                blockerLTR = new Node(limitLTR[0].childNodes[range.endOffset]);
            //从左到右保证在 range 区间内获取 nextSourceNode
            this._.guardLTR = function(node, movingOut) {
                return
                //从endContainer移出去，失败返回false
                (
                    ( !movingOut
                        ||
                        limitLTR[0] !== node[0] )
                        //到达深度遍历的最后一个节点，结束
                        && ( !blockerLTR[0] || node[0] !== (blockerLTR[0]) )

                        //从body移出也结束
                        && ( node[0].nodeType != KEN.NODE_ELEMENT
                        || !movingOut
                        || node._4e_name() != 'body' ) );
            };
        }

        // Create the RTL guard function, if necessary.
        if (rtl && !this._.guardRTL) {
            // Gets the node that stops the walker when going LTR.
            var limitRTL = range.startContainer,
                blockerRTL = ( range.startOffset > 0 ) && new Node(limitRTL[0].childNodes[range.startOffset - 1]);

            this._.guardRTL = function(node, movingOut) {

                return (
                    node
                        && node[0]
                        && ( !movingOut || limitRTL[0] !== node[0] )
                        && ( !blockerRTL[0] || node[0] !== blockerRTL[0] )
                        && ( node[0].nodeType != KEN.NODE_ELEMENT || !movingOut || node._4e_name() != 'body' ) );
            };
        }

        // Define which guard function to use.
        var stopGuard = rtl ? this._.guardRTL : this._.guardLTR;

        // Make the user defined guard function participate in the process,
        // otherwise simply use the boundary guard.
        if (userGuard) {
            guard = function(node, movingOut) {
                if (stopGuard(node, movingOut) === false)
                    return false;

                return userGuard(node, movingOut);
            };
        }
        else
            guard = stopGuard;

        if (this.current)
            node = this.current[ getSourceNodeFn ](false, type, guard);
        else {
            // Get the first node to be returned.

            if (rtl) {
                node = range.endContainer;

                if (range.endOffset > 0)
                {
                    node = new Node(node[0].childNodes[range.endOffset - 1]);
                    if (guard(node) === false)
                        node = null;
                }
                else
                    node = ( guard(node, true) === false ) ?
                        null : node._4e_previousSourceNode(true, type, guard);
            }
            else {
                node = range.startContainer;
                node = new Node(node[0].childNodes[range.startOffset]);

                if (node && node[0]) {
                    if (guard(node) === false)
                        node = null;
                }
                else
                    node = ( guard(range.startContainer, true) === false ) ?
                        null : range.startContainer._4e_nextSourceNode(true, type, guard);
            }
        }

        while (node && node[0] && !this._.end) {
            this.current = node;

            if (!this.evaluator || this.evaluator(node) !== false) {
                if (!breakOnFalse)
                    return node;
            }
            else if (breakOnFalse && this.evaluator)
                return false;

            node = node[ getSourceNodeFn ](false, type, guard);
        }

        this.end();
        return this.current = null;
    }

    function iterateToLast(rtl) {
        var node, last = null;

        while (( node = iterate.call(this, rtl) ))
            last = node;

        return last;
    }

    function Walker(range) {
        this.range = range;

        /**
         * A function executed for every matched node, to check whether
         * it's to be considered into the walk or not. If not provided, all
         * matched nodes are considered good.
         * If the function returns "false" the node is ignored.
         * @name CKEDITOR.dom.walker.prototype.evaluator
         * @property
         * @type Function
         */
        // this.evaluator = null;

        /**
         * A function executed for every node the walk pass by to check
         * whether the walk is to be finished. It's called when both
         * entering and exiting nodes, as well as for the matched nodes.
         * If this function returns "false", the walking ends and no more
         * nodes are evaluated.
         * @name CKEDITOR.dom.walker.prototype.guard
         * @property
         * @type Function
         */
        // this.guard = null;

        /** @private */
        this._ = {};
    }


    S.augment(Walker, {
        /**
         * Stop walking. No more nodes are retrieved if this function gets
         * called.
         */
        end : function() {
            this._.end = 1;
        },

        /**
         * Retrieves the next node (at right).
         * @returns {CKEDITOR.dom.node} The next node or null if no more
         *        nodes are available.
         */
        next : function() {
            return iterate.call(this);
        },

        /**
         * Retrieves the previous node (at left).
         * @returns {CKEDITOR.dom.node} The previous node or null if no more
         *        nodes are available.
         */
        previous : function() {
            return iterate.call(this, true);
        },

        /**
         * Check all nodes at right, executing the evaluation fuction.
         * @returns {Boolean} "false" if the evaluator function returned
         *        "false" for any of the matched nodes. Otherwise "true".
         */
        checkForward : function() {
            return iterate.call(this, false, true) !== false;
        },

        /**
         * Check all nodes at left, executing the evaluation fuction.
         * @returns {Boolean} "false" if the evaluator function returned
         *        "false" for any of the matched nodes. Otherwise "true".
         */
        checkBackward : function() {
            return iterate.call(this, true, true) !== false;
        },

        /**
         * Executes a full walk forward (to the right), until no more nodes
         * are available, returning the last valid node.
         * @returns {CKEDITOR.dom.node} The last node at the right or null
         *        if no valid nodes are available.
         */
        lastForward : function() {
            return iterateToLast.call(this);
        },

        /**
         * Executes a full walk backwards (to the left), until no more nodes
         * are available, returning the last valid node.
         * @returns {CKEDITOR.dom.node} The last node at the left or null
         *        if no valid nodes are available.
         */
        lastBackward : function() {
            return iterateToLast.call(this, true);
        },

        reset : function() {
            delete this.current;
            this._ = {};
        }

    });


    /*
     * Anything whose display computed style is block, list-item, table,
     * table-row-group, table-header-group, table-footer-group, table-row,
     * table-column-group, table-column, table-cell, table-caption, or whose node
     * name is hr, br (when enterMode is br only) is a block boundary.
     */
    var blockBoundaryDisplayMatch = {
        block : 1,
        'list-item' : 1,
        table : 1,
        'table-row-group' : 1,
        'table-header-group' : 1,
        'table-footer-group' : 1,
        'table-row' : 1,
        'table-column-group' : 1,
        'table-column' : 1,
        'table-cell' : 1,
        'table-caption' : 1
    },
        blockBoundaryNodeNameMatch = { hr : 1 };

    Node.prototype._4e_isBlockBoundary = function(customNodeNames) {
        var nodeNameMatches = S.clone(blockBoundaryNodeNameMatch);
        S.mix(nodeNameMatches, customNodeNames || {});

        return blockBoundaryDisplayMatch[ this.getComputedStyle('display') ] ||
            nodeNameMatches[ this.getName() ];
    };

    Walker.blockBoundary = function(customNodeNames) {
        return function(node, type)
        {
            return ! ( node[0].nodeType == CKEDITOR.NODE_ELEMENT
                && node._4e_isBlockBoundary(customNodeNames) );
        };
    };

    Walker.listItemBoundary = function() {
        return this.blockBoundary({ br : 1 });
    };
    /**
     * Whether the node is a bookmark node's inner text node.
     */
    Walker.bookmarkContents = function(node) {
    },

        /**
         * Whether the to-be-evaluated node is a bookmark node OR bookmark node
         * inner contents.
         * @param {Boolean} contentOnly Whether only test againt the text content of
         * bookmark node instead of the element itself(default).
         * @param {Boolean} isReject Whether should return 'false' for the bookmark
         * node instead of 'true'(default).
         */
        Walker.bookmark = function(contentOnly, isReject) {
            function isBookmarkNode(node) {
                return ( node && node[0]
                    && node._4e_name() == 'span'
                    && node.attr('_ke_bookmark') );
            }

            return function(node) {
                var isBookmark, parent;
                // Is bookmark inner text node?
                isBookmark = ( node && node[0] && node[0].nodeType == KEN.NODE_TEXT && ( parent = node.getParent() )
                    && isBookmarkNode(parent) );
                // Is bookmark node?
                isBookmark = contentOnly ? isBookmark : isBookmark || isBookmarkNode(node);
                return isReject ^ isBookmark;
            };
        };

    /**
     * Whether the node is a text node containing only whitespaces characters.
     * @param isReject
     */
    Walker.whitespaces = function(isReject) {
        return function(node) {
            node = node[0] || node;
            var isWhitespace = node && ( node.nodeType == KEN.NODE_TEXT )
                && !S.trim(node.nodeValue);
            return isReject ^ isWhitespace;
        };
    };

    /**
     * Whether the node is invisible in wysiwyg mode.
     * @param isReject
     */
    Walker.invisible = function(isReject) {
        var whitespace = CKEDITOR.dom.walker.whitespaces();
        return function(node) {
            // Nodes that take no spaces in wysiwyg:
            // 1. White-spaces but not including NBSP;
            // 2. Empty inline elements, e.g. <b></b> we're checking here
            // 'offsetHeight' instead of 'offsetWidth' for properly excluding
            // all sorts of empty paragraph, e.g. <br />.
            var isInvisible = whitespace(node) || node[0].nodeType == KEN.NODE_ELEMENT && !node[0].offsetHeight;
            return isReject ^ isInvisible;
        };
    };


    S.Walker = Walker;
});