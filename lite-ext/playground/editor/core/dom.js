/**
 * modified from ckeditor,dom utils for kissy editor
 * @modifier:yiminghe@gmail.com(chengyu)
 */
KISSYEDITOR.add("editor-dom", function(KE) {

    var S = KISSY,
        DOM = S.DOM,
        UA = S.UA,
        doc = document,
        Node = S.Node,

        REMOVE_EMPTY = {abbr:1,acronym:1,address:1,b:1,bdo:1,big:1,cite:1,code:1,del:1,dfn:1,em:1,font:1,i:1,ins:1,label:1,kbd:1,q:1,s:1,samp:1,small:1,span:1,strike:1,strong:1,sub:1,sup:1,tt:1,u:1,'var':1};
    KE.NODE = {
        NODE_ELEMENT:1,
        NODE_TEXT:3,
        NODE_DOCUMENT_FRAGMENT:11
    };
    KE.POSITION = {};
    var KEN = KE.NODE,KEP = KE.POSITION;

    KEP.POSITION_IDENTICAL = 0;
    KEP.POSITION_DISCONNECTED = 1;
    KEP.POSITION_FOLLOWING = 2;
    KEP.POSITION_PRECEDING = 4;
    KEP.POSITION_IS_CONTAINED = 8;
    KEP.POSITION_CONTAINS = 16;
    var customData = {};
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


    var editorDom = {
        _4e_remove:function(el) {
            el = el[0] || el;
            el.parentNode.removeChild(el);
        },
        _4e_isBlockBoundary:function(el, customNodeNames) {
            if (!el[0]) el = new Node(el);
            var nodeNameMatches = S.mix(S.mix({}, blockBoundaryNodeNameMatch), customNodeNames || {});

            return blockBoundaryDisplayMatch[ el.css('display') ] ||
                nodeNameMatches[ el._4e_name() ];
        },
        _4e_getWin:function(elem) {
            return (elem && ('scrollTo' in elem) && elem["document"]) ?
                elem :
                elem && elem.nodeType === 9 ?
                    elem.parentWindow || elem.defaultView :
                    false;
        },
        _4e_index:function(el) {
            el = el[0] || el;
            var siblings = el.parentNode.childNodes;
            for (var i = 0; i < siblings.length; i++) {
                if (siblings[i] === el) return i;
            }
            return -1;
        },
        _4e_first:function(el, evaluator) {
            el = el[0] || el;
            var first = el.firstChild,
                retval = first && new Node(first);
            if (retval && evaluator && !evaluator(retval))
                retval = retval._4e_next(evaluator);

            return retval;
        },

        _4e_move : function(thisElement, target, toStart) {
            thisElement.remove();
            thisElement = thisElement[0];
            target = target[0] || target;
            if (toStart) {
                target.insertBefore(thisElement, target.firstChild);
            }
            else {
                target.appendChild(thisElement);
            }
        },

        _4e_name:function(thisElement) {
            thisElement = thisElement[0] || thisElement;
            return thisElement.nodeName.toLowerCase();
        },
        _4e_isIdentical : function(thisElement, otherElement) {
            if (thisElement._4e_name() != otherElement._4e_name())
                return false;

            var thisAttribs = thisElement[0].attributes,
                otherAttribs = otherElement[0].attributes;

            var thisLength = thisAttribs.length,
                otherLength = otherAttribs.length;

            if (!UA.ie && thisLength != otherLength)
                return false;

            for (var i = 0; i < thisLength; i++) {
                var attribute = thisAttribs[ i ];

                if (( !UA.ie || ( attribute.specified && attribute.nodeName != '_ke_expando' ) ) && attribute.nodeValue != otherElement.attr(attribute.nodeName))
                    return false;
            }

            // For IE, we have to for both elements, because it's difficult to
            // know how the atttibutes collection is organized in its DOM.
            if (UA.ie) {
                for (i = 0; i < otherLength; i++) {
                    attribute = otherAttribs[ i ];
                    if (attribute.specified && attribute.nodeName != '_ke_expando'
                        && attribute.nodeValue != thisElement.attr(attribute.nodeName))
                        return false;
                }
            }

            return true;
        },
        _4e_isEmptyInlineRemoveable : function(thisElement) {
            var children = (thisElement[0] || thisElement).childNodes;
            for (var i = 0, count = children.length; i < count; i++) {
                var child = children[i],
                    nodeType = child.nodeType;

                if (nodeType == KEN.NODE_ELEMENT && child.getAttribute('_ke_bookmark'))
                    continue;

                if (nodeType == KEN.NODE_ELEMENT && !editorDom._4e_isEmptyInlineRemoveable(child)
                    || nodeType == KEN.NODE_TEXT && S.trim(child.nodeValue)) {
                    return false;
                }
            }
            return true;
        },
        _4e_moveChildren : function(thisElement, target, toStart) {
            var $ = thisElement[0];
            target = target[0] || target;
            if ($ == target)
                return;

            var child;

            if (toStart) {
                while (( child = $.lastChild ))
                    target.insertBefore($.removeChild(child), target.firstChild);
            }
            else {
                while (( child = $.firstChild ))
                    target.appendChild($.removeChild(child));
            }
        },
        _4e_mergeSiblings : ( function() {
            function mergeElements(element, sibling, isNext) {
                if (sibling[0] && sibling[0].nodeType == KEN.NODE_ELEMENT) {
                    // Jumping over bookmark nodes and empty inline elements, e.g. <b><i></i></b>,
                    // queuing them to be moved later. (#5567)
                    var pendingNodes = [];

                    while (sibling.attr('_ke_bookmark')
                        || sibling._4e_isEmptyInlineRemoveable()) {
                        pendingNodes.push(sibling);
                        sibling = isNext ? new Node(sibling[0].nextSibling) : new Node(sibling[0].previousSibling);
                        if (!sibling[0] || sibling[0].nodeType != KEN.NODE_ELEMENT)
                            return;
                    }

                    if (element._4e_isIdentical(sibling)) {
                        // Save the last child to be checked too, to merge things like
                        // <b><i></i></b><b><i></i></b> => <b><i></i></b>
                        var innerSibling = isNext ? element[0].lastChild : element[0].firstChild;

                        // Move pending nodes first into the target element.
                        while (pendingNodes.length)
                            pendingNodes.shift()._4e_move(element, !isNext);

                        sibling._4e_moveChildren(element, !isNext);
                        sibling.remove();

                        // Now check the last inner child (see two comments above).
                        if (innerSibling[0] && innerSibling[0].nodeType == KEN.NODE_ELEMENT)
                            innerSibling._4e_mergeSiblings();
                    }
                }
            }

            return function(thisElement) {
                if (!thisElement[0]) return;
                //note by yiminghe,why not just merge whatever
                // Merge empty links and anchors also. (#5567)
                if (!( REMOVE_EMPTY[ thisElement._4e_name() ] || thisElement._4e_name() == "a" ))
                    return;

                mergeElements(thisElement, new Node(thisElement[0].nextSibling), true);
                mergeElements(thisElement, new Node(thisElement[0].previousSibling));
            };
        } )(),
        _4e_unselectable :
            UA.gecko ?
                function(el) {
                    el = el[0] || el;
                    el.style.MozUserSelect = 'none';
                }
                : UA.webkit ?
                function(el) {
                    el = el[0] || el;
                    el.style.KhtmlUserSelect = 'none';
                }
                :
                function(el) {
                    el = el[0] || el;
                    if (UA.ie || UA.opera) {
                        var element = el,
                            e,
                            i = 0;

                        element.unselectable = 'on';

                        while (( e = element.all[ i++ ] )) {
                            switch (e.tagName.toLowerCase()) {
                                case 'iframe' :
                                case 'textarea' :
                                case 'input' :
                                case 'select' :
                                    /* Ignore the above tags */
                                    break;
                                default :
                                    e.unselectable = 'on';
                            }
                        }
                    }
                },

        _4e_getOffset:function(elem, refDocument) {
            var elem = elem[0] || elem,
                box,
                x = 0,
                y = 0,
                currentWindow = elem.ownerDocument.defaultView || elem.ownerDocument.parentWindow,
                currentDoc = elem.ownerDocument,
                currentDocElem = currentDoc.documentElement;
            //same with DOM.offset
            if (elem[GET_BOUNDING_CLIENT_RECT]) {
                if (elem !== currentDoc.body && currentDocElem !== elem) {
                    box = elem[GET_BOUNDING_CLIENT_RECT]();
                    x = box.left + DOM["scrollLeft"](currentWindow);
                    y = box.top + DOM["scrollTop"](currentWindow);
                }
                if (refDocument) {
                    var refWindow = refDocument.defaultView || refDocument.parentWindow;
                    if (currentWindow != refWindow && currentWindow.frameElement) {
                        //note:when iframe is static ,still some mistake
                        var iframePosition = editorDom._4e_getOffset(currentWindow.frameElement, refDocument);
                        x += iframePosition.left;
                        y += iframePosition.top;
                    }
                }
            }
            return { left: x, top: y };
        },

        _4e_getFrameDocument : function(el) {
            var $ = el[0] || el;

            try {
                // In IE, with custom document.domain, it may happen that
                // the iframe is not yet available, resulting in "Access
                // Denied" for the following property access.
                $.contentWindow.document;
            }
            catch (e) {
                // Trick to solve this issue, forcing the iframe to get ready
                // by simply setting its "src" property.
                $.src = $.src;

                // In IE6 though, the above is not enough, so we must pause the
                // execution for a while, giving it time to think.
                if (UA.ie && UA.ie < 7) {
                    window.showModalDialog(
                        'javascript:document.write("' +
                            '<script>' +
                            'window.setTimeout(' +
                            'function(){window.close();}' +
                            ',50);' +
                            '</script>")');
                }
            }
            return $ && $.contentWindow.document;
        },

        _4e_splitText : function(el, offset) {
            el = el[0] || el;
            var doc = el.ownerDocument;
            if (!el || el.nodeType != KEN.NODE_TEXT) return;
            // If the offset is after the last char, IE creates the text node
            // on split, but don't include it into the DOM. So, we have to do
            // that manually here.
            if (UA.ie && offset == el.nodeValue.length) {
                var next = doc.createTextNode("");
                DOM.insertAfter(next, el);
                return next;
            }


            var retval = new Node(el.splitText(offset));

            // IE BUG: IE8 does not update the childNodes array in DOM after splitText(),
            // we need to make some DOM changes to make it update. (#3436)
            if (UA.ie == 8) {
                var workaround = doc.createTextNode("");
                DOM.insertAfter(workaround, retval[0]);
                workaround.parentNode.removeChild(workaround);
            }

            return retval;
        },

        _4e_parents : function(node, closerFirst) {
            if (!node[0]) node = new Node(node);
            var parents = [];

            do {
                parents[  closerFirst ? 'push' : 'unshift' ](node);
            } while (( node = node.parent() ));

            return parents;
        },

        _4e_clone : function(el, includeChildren, cloneId) {
            el = el[0] || el;
            var $clone = el.cloneNode(includeChildren);

            if (!cloneId) {
                var removeIds = function(node) {
                    if (node.nodeType != KEN.NODE_ELEMENT)
                        return;

                    node.removeAttribute('id', false);
                    //复制时不要复制expando
                    node.removeAttribute('_ke_expando', false);

                    var childs = node.childNodes;
                    for (var i = 0; i < childs.length; i++)
                        removeIds(childs[ i ]);
                };

                // The "id" attribute should never be cloned to avoid duplication.
                removeIds($clone);
            }
            return new Node($clone);
        },
        /**
         * 深度优先遍历获取下一结点
         * @param el
         * @param startFromSibling
         * @param nodeType
         * @param guard
         */
        _4e_nextSourceNode : function(el, startFromSibling, nodeType, guard) {
            el = el[0] || el;
            // If "guard" is a node, transform it in a function.
            if (guard && !guard.call) {
                var guardNode = guard[0] || guard;
                guard = function(node) {
                    node = node[0] || node;
                    return node !== guardNode;
                };
            }

            var node = !startFromSibling && el.firstChild ,
                parent = new Node(el);

            // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
            // send the 'moving out' signal even we don't actually dive into.
            if (!node) {
                if (el.nodeType == KEN.NODE_ELEMENT && guard && guard(this, true) === false)
                    return null;
                node = el.nextSibling;
            }

            while (!node && ( parent = parent.parent())) {
                // The guard check sends the "true" paramenter to indicate that
                // we are moving "out" of the element.
                if (guard && guard(parent, true) === false)
                    return null;

                node = parent[0].nextSibling;
            }

            if (!node)
                return null;
            node = new Node(node);
            if (guard && guard(node) === false)
                return null;

            if (nodeType && nodeType != node[0].nodeType)
                return node._4e_nextSourceNode(false, nodeType, guard);

            return node;
        },
        _4e_previousSourceNode : function(el, startFromSibling, nodeType, guard) {
            el = el[0] || el;
            if (guard && !guard.call) {
                var guardNode = guard[0] || guard;
                guard = function(node) {
                    node = node[0] || node;
                    return node !== guardNode;
                };
            }

            var node = ( !startFromSibling && el.lastChild),
                parent = new Node(el);

            // Guarding when we're skipping the current element( no children or 'startFromSibling' ).
            // send the 'moving out' signal even we don't actually dive into.
            if (!node) {
                if (el.nodeType == KEN.NODE_ELEMENT && guard && guard(el, true) === false)
                    return null;
                node = el.previousSibling;
            }

            while (!node && ( parent = parent.parent() )) {
                // The guard check sends the "true" paramenter to indicate that
                // we are moving "out" of the element.
                if (guard && guard(parent, true) === false)
                    return null;
                node = parent[0].previousSibling;
            }

            if (!node)
                return null;
            node = new Node(node);
            if (guard && guard(node) === false)
                return null;

            if (nodeType && node[0].nodeType != nodeType)
                return node._4e_previousSourceNode(false, nodeType, guard);

            return node;
        },
        _4e_contains :
            UA.ie || UA.webkit ?
                function(el, node) {
                    el = el[0] || el;
                    node = node[0] || node;
                    return node.nodeType != KEN.NODE_ELEMENT ?
                        el.contains(node.parentNode) :
                        el != node && el.contains(node);
                }
                :
                function(el, node) {
                    el = el[0] || el;
                    node = node[0] || node;
                    return !!( el.compareDocumentPosition(node) & 16 );
                },
        _4e_commonAncestor:function(el, node) {
            if (node[0] === el[0])
                return el;

            if (node._4e_contains && node._4e_contains(el))
                return node;

            var start = el[0].nodeType == KEN.NODE_TEXT ? el.parent() : el;

            do   {
                if (start._4e_contains(node))
                    return start;
            } while (( start = start.parent() ));

            return null;
        },
        _4e_ascendant : function(el, name, includeSelf) {
            var $ = el[0] || el;

            if (!includeSelf)
                $ = $.parentNode;

            while ($) {
                if ($.nodeName && $.nodeName.toLowerCase() == name)
                    return new Node($);

                $ = $.parentNode;
            }
            return null;
        },
        _4e_hasAttribute : function(el, name) {
            el = el[0] || el;
            var $attr = el.attributes.getNamedItem(name);
            return !!( $attr && $attr.specified );
        },
        _4e_hasAttributes: UA.ie ?
            function(el) {
                el = el[0] || el;
                var attributes = el.attributes;

                for (var i = 0; i < attributes.length; i++) {
                    var attribute = attributes[i];

                    switch (attribute.nodeName) {
                        case 'class' :
                            // IE has a strange bug. If calling removeAttribute('className'),
                            // the attributes collection will still contain the "class"
                            // attribute, which will be marked as "specified", even if the
                            // outerHTML of the element is not displaying the class attribute.
                            // Note : I was not able to reproduce it outside the editor,
                            // but I've faced it while working on the TC of #1391.
                            if (el.getAttribute('class'))
                                return true;

                        // Attributes to be ignored.
                        case '_ke_expando' :
                            continue;

                        /*jsl:fallthru*/

                        default :
                            if (attribute.specified)
                                return true;
                    }
                }

                return false;
            }
            :
            function(el) {
                el = el[0] || el;
                var attributes = el.attributes;
                return ( attributes.length > 1 || ( attributes.length == 1 && attributes[0].nodeName != '_ke_expando' ) );
            },

        _4e_position : function(el, otherNode) {
            var $ = el[0] || el;
            var $other = otherNode[0] || otherNode;

            if ($.compareDocumentPosition)
                return $.compareDocumentPosition($other);

            // IE and Safari have no support for compareDocumentPosition.

            if ($ == $other)
                return KEP.POSITION_IDENTICAL;

            // Only element nodes support contains and sourceIndex.
            if ($.nodeType == KEN.NODE_ELEMENT && $other.nodeType == KEN.NODE_ELEMENT) {
                if ($.contains) {
                    if ($.contains($other))
                        return KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING;

                    if ($other.contains($))
                        return KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
                }

                if ('sourceIndex' in $) {
                    return ( $.sourceIndex < 0 || $other.sourceIndex < 0 ) ? KEP.POSITION_DISCONNECTED :
                        ( $.sourceIndex < $other.sourceIndex ) ? KEP.POSITION_PRECEDING :
                            KEP.POSITION_FOLLOWING;
                }
            }

            // For nodes that don't support compareDocumentPosition, contains
            // or sourceIndex, their "address" is compared.

            var addressOfThis = el._4e_address(),
                addressOfOther = otherNode._4e_address(),
                minLevel = Math.min(addressOfThis.length, addressOfOther.length);

            // Determinate preceed/follow relationship.
            for (var i = 0; i <= minLevel - 1; i++) {
                if (addressOfThis[ i ] != addressOfOther[ i ]) {
                    if (i < minLevel) {
                        return addressOfThis[ i ] < addressOfOther[ i ] ?
                            KEP.POSITION_PRECEDING : KEP.POSITION_FOLLOWING;
                    }
                    break;
                }
            }

            // Determinate contains/contained relationship.
            return ( addressOfThis.length < addressOfOther.length ) ?
                KEP.POSITION_CONTAINS + KEP.POSITION_PRECEDING :
                KEP.POSITION_IS_CONTAINED + KEP.POSITION_FOLLOWING;
        },

        _4e_address:function(el, normalized) {
            var address = [],el = el[0] || el;
            var $documentElement = el.ownerDocument.documentElement;
            var node = el;

            while (node && node != $documentElement) {
                var parentNode = node.parentNode;
                var currentIndex = -1;

                if (parentNode) {
                    for (var i = 0; i < parentNode.childNodes.length; i++) {
                        var candidate = parentNode.childNodes[i];

                        if (normalized &&
                            candidate.nodeType == 3 &&
                            candidate.previousSibling &&
                            candidate.previousSibling.nodeType == 3) {
                            continue;
                        }

                        currentIndex++;

                        if (candidate == node)
                            break;
                    }

                    address.unshift(currentIndex);
                }

                node = parentNode;
            }

            return address;
        },
        _4e_breakParent : function(el, parent) {
            var KERange = KE.Range;
            var range = new KERange(el[0].ownerDocument);

            // We'll be extracting part of this element, so let's use our
            // range to get the correct piece.
            range.setStartAfter(el);
            range.setEndAfter(parent);

            // Extract it.
            var docFrag = range.extractContents();

            // Move the element outside the broken element.
            range.insertNode(el.remove());

            // Re-insert the extracted piece after the element.
            el[0].parentNode.insertBefore(docFrag, el[0].nextSibling);
        },
        _4e_style:function(el, styleName, val) {
            if (val !== undefined) {
                return el.css(styleName, val);
            }
            el = el[0] || el;
            return el.style[normalizeStyle(styleName)];
        },
        _4e_remove : function(el, preserveChildren) {
            var $ = el[0] || el;
            var parent = $.parentNode;
            if (parent) {
                if (preserveChildren) {
                    // Move all children before the node.
                    for (var child; ( child = $.firstChild );) {
                        parent.insertBefore($.removeChild(child), $);
                    }
                }
                parent.removeChild($);
            }
            return this;
        },
        _4e_trim : function(el) {
            DOM._4e_ltrim(el);
            DOM._4e_rtrim(el);
        },

        _4e_ltrim : function(el) {
            el = el[0] || el;
            var child;
            while (( child = el.firstChild )) {
                if (child.nodeType == KEN.NODE_TEXT) {
                    var trimmed = ltrim(child.nodeValue),
                        originalLength = child.nodeValue.length;

                    if (!trimmed) {
                        el.removeChild(child);
                        continue;
                    }
                    else if (trimmed.length < originalLength) {
                        new Node(child)._4e_splitText(originalLength - trimmed.length);
                        // IE BUG: child.remove() may raise JavaScript errors here. (#81)
                        el.removeChild(el.firstChild);
                    }
                }
                break;
            }
        },

        _4e_rtrim : function(el) {
            el = el[0] || el;
            var child;
            while (( child = el.lastChild )) {
                if (child.type == KEN.NODE_TEXT) {
                    var trimmed = rtrim(child.nodeValue),
                        originalLength = child.nodeValue.length;

                    if (!trimmed) {
                        el.removeChild(child);
                        continue;
                    } else if (trimmed.length < originalLength) {
                        new Node(child)._4e_splitText(trimmed.length);
                        // IE BUG: child.getNext().remove() may raise JavaScript errors here.
                        // (#81)
                        el.removeChild(el.lastChild);
                    }
                }
                break;
            }

            if (!UA.ie && !UA.opera) {
                child = el.lastChild;
                if (child && child.nodeType == 1 && child.nodeName.toLowerCase() == 'br') {
                    // Use "eChildNode.parentNode" instead of "node" to avoid IE bug (#324).
                    child.parentNode.removeChild(child);
                }
            }
        },

        _4e_appendBogus : function(el) {
            el = el[0] || el;
            var lastChild = el.lastChild;

            // Ignore empty/spaces text.
            while (lastChild && lastChild.nodeType == KEN.NODE_TEXT && !S.trim(lastChild.nodeValue))
                lastChild = lastChild.previousSibling;
            if (!lastChild || lastChild.nodeType == KEN.NODE_TEXT || DOM._4e_name(lastChild) !== 'br') {
                var bogus = UA.opera ?
                    el.ownerDocument.createTextNode('') :
                    el.ownerDocument.createElement('br');

                UA.gecko && bogus.setAttribute('type', '_moz');

                el.appendChild(bogus);
            }
        },
        _4e_previous : function(el, evaluator) {
            var previous = el[0] || el, retval;
            do
            {
                previous = previous.previousSibling;
                retval = previous && new Node(previous);
            }
            while (retval && evaluator && !evaluator(retval))
            return retval;
        },

        /**
         * Gets the node that follows this element in its parent's child list.
         * @param {Function} evaluator Filtering the result node.
         * @returns {CKEDITOR.dom.node} The next node or null if not available.
         * @example
         * var element = CKEDITOR.dom.element.createFromHtml( '&lt;div&gt;&lt;b&gt;Example&lt;/b&gt; &lt;i&gt;next&lt;/i&gt;&lt;/div&gt;' );
         * var first = <b>element.getFirst().getNext()</b>;
         * alert( first.getName() );  // "i"
         */
        _4e_next : function(el, evaluator) {
            var next = el[0] || el, retval;
            do            {
                next = next.nextSibling;
                retval = next && new Node(next);
            }
            while (retval && evaluator && !evaluator(retval))
            return retval;
        },
        _4e_outerHtml : function(el) {
            el = el[0] || el;
            if (el.outerHTML) {
                // IE includes the <?xml:namespace> tag in the outerHTML of
                // namespaced element. So, we must strip it here. (#3341)
                return el.outerHTML.replace(/<\?[^>]*>/, '');
            }

            var tmpDiv = el.ownerDocument.createElement('div');
            tmpDiv.appendChild(el.cloneNode(true));
            return tmpDiv.innerHTML;
        },

        _4e_setMarker : function(element, database, name, value) {
            if (!element[0]) element = new Node(element);
            var id = element._4e_getData('list_marker_id') ||
                ( element._4e_setData('list_marker_id', S.guid())._4e_getData('list_marker_id')),
                markerNames = element._4e_getData('list_marker_names') ||
                    ( element._4e_setData('list_marker_names', {})._4e_getData('list_marker_names'));
            database[id] = element;
            markerNames[name] = 1;

            return element._4e_setData(name, value);
        },
        _4e_clearMarkers : function(element, database, removeFromDatabase) {
            if (!element[0]) element = new Node(element);
            var names = element._4e_getData('list_marker_names'),
                id = element._4e_getData('list_marker_id');
            for (var i in names)
                element._4e_removeData(i);
            element._4e_removeData('list_marker_names');
            if (removeFromDatabase) {
                element._4e_removeData('list_marker_id');
                delete database[id];
            }
        },

        _4e_setData : function(el, key, value) {
            var expandoNumber = DOM._4e_getUniqueId(el),
                dataSlot = customData[ expandoNumber ] || ( customData[ expandoNumber ] = {} );
            dataSlot[ key ] = value;
            return el;
        },


        _4e_getData :function(el, key) {
            el = el[0] || el;
            var expandoNumber = el.getAttribute('_ke_expando'),
                dataSlot = expandoNumber && customData[ expandoNumber ];
            return dataSlot && dataSlot[ key ];
        },


        _4e_removeData : function(el, key) {
            el = el[0] || el;
            var expandoNumber = el.getAttribute('_ke_expando'),
                dataSlot = expandoNumber && customData[ expandoNumber ],
                retval = dataSlot && dataSlot[ key ];

            if (typeof retval != 'undefined' && dataSlot)
                delete dataSlot[ key ];
            if (S.isEmptyObject(dataSlot))
                DOM._4e_clearData(el);

            return retval || null;
        },

        _4e_clearData : function(el) {
            el = el[0] || el;
            var expandoNumber = el.getAttribute('_ke_expando');
            expandoNumber && delete customData[ expandoNumber ];
            //ie inner html 会把属性带上，删掉！
            expandoNumber && el.removeAttribute("_ke_expando");
        },
        _4e_getUniqueId : function(el) {
            el = el[0] || el;
            return el.getAttribute('_ke_expando') || ( el.setAttribute('_ke_expando', S.guid()));
        },

        _4e_copyAttributes : function(el, dest, skipAttributes) {
            el = el[0] || el;
            var attributes = el.attributes;
            skipAttributes = skipAttributes || {};

            for (var n = 0; n < attributes.length; n++) {
                var attribute = attributes[n];

                // Lowercase attribute name hard rule is broken for
                // some attribute on IE, e.g. CHECKED.
                var attrName = attribute.nodeName.toLowerCase(),
                    attrValue;

                // We can set the type only once, so do it with the proper value, not copying it.
                if (attrName in skipAttributes)
                    continue;

                if (attrName == 'checked' && ( attrValue = DOM.attr(el, attrName) ))
                    dest.attr(attrName, attrValue);
                // IE BUG: value attribute is never specified even if it exists.
                else if (attribute.specified ||
                    ( UA.ie && attribute.nodeValue && attrName == 'value' )) {
                    attrValue = DOM.attr(el, attrName);
                    if (attrValue === null)
                        attrValue = attribute.nodeValue;
                    dest.attr(attrName, attrValue);
                }
            }

            // The style:
            if (el.style.cssText !== '')
                dest[0].style.cssText = el.style.cssText;
        }
    };

    function ltrim(str) {
        return str.replace(/^\s+/, "");
    }

    function rtrim(str) {
        return str.replace(/\s+$/, "");
    }

    function normalizeStyle(styleName) {
        return styleName.replace(/-(\w)/g, function(m, g1) {
            return g1.toUpperCase();
        })
    }

    S.DOM._4e_inject = function(editorDom) {
        S.mix(DOM, editorDom);
        for (var dm in editorDom) {
            if (editorDom.hasOwnProperty(dm))
                (function(dm) {
                    Node.prototype[dm] = function() {
                        var args = [].slice.call(arguments, 0);
                        args.unshift(this);
                        return editorDom[dm].apply(null, args);
                    };
                })(dm);
        }
    };
    S.DOM._4e_inject(editorDom);

});