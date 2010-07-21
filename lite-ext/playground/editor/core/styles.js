/**
 * modified from ckeditor for kissy editor,use style to gen element and wrap range's elements
 * @modifier:yiminghe@gmail.com(chengyu)
 */
KISSY.add("editor-styles", function(S) {

    var KE = KISSYEDITOR,
        KEST = KE.STYLE = {}
        ,KER = KE.RANGE,
        KERange = S.Range,
        Walker = S.Walker,
        ElementPath = S.ElementPath;
    KEST.STYLE_BLOCK = 1;
    KEST.STYLE_INLINE = 2;
    KEST.STYLE_OBJECT = 3;


    var blockElements = { address:1,div:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,p:1,pre:1 };
    var objectElements = { a:1,embed:1,hr:1,img:1,li:1,object:1,ol:1,table:1,td:1,tr:1,th:1,ul:1,dl:1,dt:1,dd:1,form:1};

    var semicolonFixRegex = /\s*(?:;\s*|$)/;
    var varRegex = /#\((.+?)\)/g;

    function replaceVariables(list, variablesValues) {
        for (var item in list) {
            list[ item ] = list[ item ].replace(varRegex, function(match, varName) {
                return variablesValues[ varName ];
            });
        }
    }

    function KEStyle(styleDefinition, variablesValues) {
        if (variablesValues) {
            styleDefinition = S.clone(styleDefinition);
            replaceVariables(styleDefinition.attributes, variablesValues);
            replaceVariables(styleDefinition.styles, variablesValues);
        }

        var element = this.element = ( styleDefinition.element || '*' ).toLowerCase();

        this.type = ( element == '#' || blockElements[ element ] ) ?
            KEST.STYLE_BLOCK
            : objectElements[ element ] ?
            KEST.STYLE_OBJECT : KEST.STYLE_INLINE;

        this._ = {
            definition : styleDefinition
        };
    }

    KEStyle.prototype = {
        apply : function(document) {
            applyStyle.call(this, document, false);
        },

        remove : function(document) {
            applyStyle.call(this, document, true);
        },

        applyToRange : function(range) {
            return ( this.applyToRange =
                this.type == CKEDITOR.STYLE_INLINE ?
                    applyInlineStyle
                    : this.type == CKEDITOR.STYLE_BLOCK ?
                    applyBlockStyle
                    : this.type == CKEDITOR.STYLE_OBJECT ?
                    applyObjectStyle
                    : null ).call(this, range);
        },

        removeFromRange : function(range) {
            return ( this.removeFromRange =
                this.type == CKEDITOR.STYLE_INLINE ?
                    removeInlineStyle
                    : null ).call(this, range);
        },

        applyToObject : function(element) {
            setupElement(element, this);
        },
        // Checks if an element, or any of its attributes, is removable by the
        // current style definition.
        checkElementRemovable : function(element, fullMatch) {
            if (!element)
                return false;

            var def = this._.definition,
                attribs;

            // If the element name is the same as the style name.
            if (element._4e_name() == this.element) {
                // If no attributes are defined in the element.
                if (!fullMatch && !element._4e_hasAttributes())
                    return true;

                attribs = getAttributesForComparison(def);

                if (attribs._length) {
                    for (var attName in attribs) {
                        if (attName == '_length')
                            continue;

                        var elementAttr = element.attr(attName) || '';
                        if (attName == 'style' ?
                            compareCssText(attribs[ attName ], normalizeCssText(elementAttr, false))
                            : attribs[ attName ] == elementAttr) {
                            if (!fullMatch)
                                return true;
                        }
                        else if (fullMatch)
                            return false;
                    }
                    if (fullMatch)
                        return true;
                }
                else
                    return true;
            }

            // Check if the element can be somehow overriden.
            var override = getOverrides(this)[ element._4e_name() ];
            if (override) {
                // If no attributes have been defined, remove the element.
                if (!( attribs = override.attributes ))
                    return true;

                for (var i = 0; i < attribs.length; i++) {
                    attName = attribs[i][0];
                    var actualAttrValue = element.attr(attName);
                    if (actualAttrValue) {
                        var attValue = attribs[i][1];

                        // Remove the attribute if:
                        //    - The override definition value is null;
                        //    - The override definition value is a string that
                        //      matches the attribute value exactly.
                        //    - The override definition value is a regex that
                        //      has matches in the attribute value.
                        if (attValue === null ||
                            ( typeof attValue == 'string' && actualAttrValue == attValue ) ||
                            attValue.test(actualAttrValue))
                            return true;
                    }
                }
            }
            return false;
        }
    };

    KEStyle.getStyleText = function(styleDefinition) {
        // If we have already computed it, just return it.
        var stylesDef = styleDefinition._ST;
        if (stylesDef)
            return stylesDef;

        stylesDef = styleDefinition.styles;

        // Builds the StyleText.
        var stylesText = ( styleDefinition.attributes && styleDefinition.attributes[ 'style' ] ) || '',
            specialStylesText = '';

        if (stylesText.length)
            stylesText = stylesText.replace(semicolonFixRegex, ';');

        for (var style in stylesDef) {
            var styleVal = stylesDef[ style ],
                text = ( style + ':' + styleVal ).replace(semicolonFixRegex, ';');

            // Some browsers don't support 'inherit' property value, leave them intact. (#5242)
            if (styleVal == 'inherit')
                specialStylesText += text;
            else
                stylesText += text;
        }

        // Browsers make some changes to the style when applying them. So, here
        // we normalize it to the browser format.
        if (stylesText.length)
            stylesText = normalizeCssText(stylesText);

        stylesText += specialStylesText;

        // Return it, saving it to the next request.
        return ( styleDefinition._ST = stylesText );
    };

    function getElement(style, targetDocument) {
        var el;

        var def = style._.definition;

        var elementName = style.element;

        // The "*" element name will always be a span for this function.
        if (elementName == '*')
            elementName = 'span';

        // Create the element.
        el = new Node(targetDocument.createElement(elementName));

        return setupElement(el, style);
    }

    function setupElement(el, style) {
        var def = style._.definition;
        var attributes = def.attributes;
        var styles = KEStyle.getStyleText(def);

        // Assign all defined attributes.
        if (attributes) {
            for (var att in attributes)
            {
                el.attr(att, attributes[ att ]);
            }
        }

        // Assign all defined styles.
        if (styles)
            el.attr('style', styles);

        return el;
    }

    function applyInlineStyle(range) {
        var document = range.document;

        if (range.collapsed) {
            // Create the element to be inserted in the DOM.
            var collapsedElement = getElement(this, document);
            // Insert the empty element into the DOM at the range position.
            range.insertNode(collapsedElement);
            // Place the selection right inside the empty element.
            range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
            return;
        }

        var elementName = this.element;
        var def = this._.definition;
        var isUnknownElement;

        // Get the DTD definition for the element. Defaults to "span".
        var dtd = dtd[ elementName ] || ( isUnknownElement = true,dtd.span );

        // Bookmark the range so we can re-select it after processing.
        var bookmark = range.createBookmark();

        // Expand the range.
        range.enlarge(KER.ENLARGE_ELEMENT);
        range.trim();

        // Get the first node to be processed and the last, which concludes the
        // processing.
        var boundaryNodes = range.createBookmark(),
            firstNode = boundaryNodes.startNode,
            lastNode = boundaryNodes.endNode;

        var currentNode = firstNode;

        var styleRange;

        while (currentNode) {
            var applyStyle = false;

            if (currentNode[0] == lastNode[0]) {
                currentNode = null;
                applyStyle = true;
            }
            else {
                var nodeType = currentNode.type;
                var nodeName = nodeType == KEN.NODE_ELEMENT ? currentNode._4e_name() : null;

                if (nodeName && currentNode.getAttribute('_fck_bookmark')) {
                    currentNode = currentNode._4e_nextSourceNode(true);
                    continue;
                }

                // Check if the current node can be a child of the style element.
                if (!nodeName || ( dtd[ nodeName ]
                    && ( currentNode._4e_position(lastNode) |
                    ( KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) )
                    == ( KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED )
                    && ( !def.childRule || def.childRule(currentNode) ) )) {
                    var currentParent = currentNode.parent();

                    // Check if the style element can be a child of the current
                    // node parent or if the element is not defined in the DTD.
                    if (currentParent
                        && ( ( dtd[currentParent._4e_name()] || dtd.span )[ elementName ] || isUnknownElement )
                        && ( !def.parentRule || def.parentRule(currentParent) )) {
                        // This node will be part of our range, so if it has not
                        // been started, place its start right before the node.
                        // In the case of an element node, it will be included
                        // only if it is entirely inside the range.
                        if (!styleRange &&
                            ( !nodeName
                                || !dtd.$removeEmpty[ nodeName ]
                                || ( currentNode._4e_position(lastNode) |
                                ( KEP.POSITION_PRECEDING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED ))
                                ==
                                ( KEP.POSITION_PRECEDING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED )
                                )) {
                            styleRange = new KERange(document);
                            styleRange.setStartBefore(currentNode);
                        }

                        // Non element nodes, or empty elements can be added
                        // completely to the range.
                        if (nodeType == KEN.NODE_TEXT || ( nodeType == KEN.NODE_ELEMENT && !currentNode.childNodes.length )) {
                            var includedNode = currentNode;
                            var parentNode;

                            // This node is about to be included completelly, but,
                            // if this is the last node in its parent, we must also
                            // check if the parent itself can be added completelly
                            // to the range.
                            while (!includedNode[0].nextSibling
                                && ( parentNode = includedNode.parent(),dtd[ parentNode._4e_name() ] )
                                && ( parentNode._4e_position(firstNode) | KEP.POSITION_FOLLOWING | KEP.POSITION_IDENTICAL | KEP.POSITION_IS_CONTAINED) == ( KEP.POSITION_FOLLOWING + KEP.POSITION_IDENTICAL + KEP.POSITION_IS_CONTAINED )
                                && ( !def.childRule || def.childRule(parentNode) ))
                            {
                                includedNode = parentNode;
                            }

                            styleRange.setEndAfter(includedNode);

                            // If the included node still is the last node in its
                            // parent, it means that the parent can't be included
                            // in this style DTD, so apply the style immediately.
                            if (!includedNode[0].nextSibling)
                                applyStyle = true;

                        }
                    }
                    else
                        applyStyle = true;
                }
                else
                    applyStyle = true;

                // Get the next node to be processed.
                currentNode = currentNode._4e_nextSourceNode();
            }

            // Apply the style if we have something to which apply it.
            if (applyStyle && styleRange && !styleRange.collapsed) {
                // Build the style element, based on the style object definition.
                var styleNode = getElement(this, document);

                // Get the element that holds the entire range.
                var parent = styleRange.getCommonAncestor();

                // Loop through the parents, removing the redundant attributes
                // from the element to be applied.
                while (styleNode && parent) {
                    if (parent.getName() == elementName) {
                        for (var attName in def.attributes) {
                            if (styleNode.getAttribute(attName) == parent.getAttribute(attName))
                                styleNode.removeAttribute(attName);
                        }

                        for (var styleName in def.styles) {
                            if (styleNode.css(styleName) == parent.css(styleName))
                                styleNode.css(styleName, "");
                        }

                        if (!styleNode._4e_hasAttributes()) {
                            styleNode = null;
                            break;
                        }
                    }

                    parent = parent.parent();
                }

                if (styleNode) {
                    // Move the contents of the range to the style element.
                    styleNode[0].appendChild(styleRange.extractContents());

                    // Here we do some cleanup, removing all duplicated
                    // elements from the style element.
                    removeFromInsideElement(this, styleNode);

                    // Insert it into the range position (it is collapsed after
                    // extractContents.
                    styleRange.insertNode(styleNode);

                    // Let's merge our new style with its neighbors, if possible.
                    styleNode._4e_mergeSiblings();

                    // As the style system breaks text nodes constantly, let's normalize
                    // things for performance.
                    // With IE, some paragraphs get broken when calling normalize()
                    // repeatedly. Also, for IE, we must normalize body, not documentElement.
                    // IE is also known for having a "crash effect" with normalize().
                    // We should try to normalize with IE too in some way, somewhere.
                    if (!UA.ie)
                        styleNode[0].normalize();
                }

                // Style applied, let's release the range, so it gets
                // re-initialization in the next loop.
                styleRange = null;
            }
        }

        firstNode.remove();
        lastNode.remove();
        range.moveToBookmark(bookmark);
        // Minimize the result range to exclude empty text nodes. (#5374)
        range.shrink(KER.SHRINK_TEXT);
    }

    function removeInlineStyle(range) {
        /*
         * Make sure our range has included all "collpased" parent inline nodes so
         * that our operation logic can be simpler.
         */
        range.enlarge(KER.ENLARGE_ELEMENT);

        var bookmark = range.createBookmark(),
            startNode = bookmark.startNode;

        if (range.collapsed) {

            var startPath = new ElementPath(startNode.parent()),
                // The topmost element in elementspatch which we should jump out of.
                boundaryElement;


            for (var i = 0, element; i < startPath.elements.length
                && ( element = startPath.elements[i] ); i++) {
                /*
                 * 1. If it's collaped inside text nodes, try to remove the style from the whole element.
                 *
                 * 2. Otherwise if it's collapsed on element boundaries, moving the selection
                 *  outside the styles instead of removing the whole tag,
                 *  also make sure other inner styles were well preserverd.(#3309)
                 */
                if (element == startPath.block || element == startPath.blockLimit)
                    break;

                if (this.checkElementRemovable(element)) {
                    var endOfElement = range.checkBoundaryOfElement(element, KER.END),
                        startOfElement = !endOfElement && range.checkBoundaryOfElement(element, KER.START);
                    if (startOfElement || endOfElement) {
                        boundaryElement = element;
                        boundaryElement.match = startOfElement ? 'start' : 'end';
                    } else {
                        /*
                         * Before removing the style node, there may be a sibling to the style node
                         * that's exactly the same to the one to be removed. To the user, it makes
                         * no difference that they're separate entities in the DOM tree. So, merge
                         * them before removal.
                         */
                        element._4e_mergeSiblings();
                        removeFromElement(this, element);

                    }
                }
            }

            // Re-create the style tree after/before the boundary element,
            // the replication start from bookmark start node to define the
            // new range.
            if (boundaryElement) {
                var clonedElement = startNode;
                for (i = 0; ; i++) {
                    var newElement = startPath.elements[ i ];
                    if (newElement[0] == boundaryElement[0])
                        break;
                    // Avoid copying any matched element.
                    else if (newElement.match)
                        continue;
                    else
                        newElement = newElement._4e_clone();
                    newElement.append(clonedElement);
                    clonedElement = newElement;
                }
                DOM[ boundaryElement.match == 'start' ?
                    'insertBefore' : 'insertAfter' ](clonedElement[0], boundaryElement[0]);
            }
        }
        else {
            /*
             * Now our range isn't collapsed. Lets walk from the start node to the end
             * node via DFS and remove the styles one-by-one.
             */
            var endNode = bookmark.endNode,
                me = this;

            /*
             * Find out the style ancestor that needs to be broken down at startNode
             * and endNode.
             */
            function breakNodes() {
                var startPath = new RlementPath(startNode.parent()),
                    endPath = new RlementPath(endNode.parent()),
                    breakStart = null,
                    breakEnd = null;
                for (var i = 0; i < startPath.elements.length; i++) {
                    var element = startPath.elements[ i ];

                    if (element == startPath.block || element == startPath.blockLimit)
                        break;

                    if (me.checkElementRemovable(element))
                        breakStart = element;
                }
                for (i = 0; i < endPath.elements.length; i++) {
                    element = endPath.elements[ i ];

                    if (element == endPath.block || element == endPath.blockLimit)
                        break;

                    if (me.checkElementRemovable(element))
                        breakEnd = element;
                }

                if (breakEnd)
                    endNode.breakParent(breakEnd);
                if (breakStart)
                    startNode.breakParent(breakStart);
            }

            breakNodes();

            // Now, do the DFS walk.
            var currentNode = startNode.getNext();
            while (!currentNode.equals(endNode))
            {
                /*
                 * Need to get the next node first because removeFromElement() can remove
                 * the current node from DOM tree.
                 */
                var nextNode = currentNode.getNextSourceNode();
                if (currentNode.type == CKEDITOR.NODE_ELEMENT && this.checkElementRemovable(currentNode))
                {
                    // Remove style from element or overriding element.
                    if (currentNode.getName() == this.element)
                        removeFromElement(this, currentNode);
                    else
                        removeOverrides(currentNode, getOverrides(this)[ currentNode.getName() ]);

                    /*
                     * removeFromElement() may have merged the next node with something before
                     * the startNode via mergeSiblings(). In that case, the nextNode would
                     * contain startNode and we'll have to call breakNodes() again and also
                     * reassign the nextNode to something after startNode.
                     */
                    if (nextNode.type == CKEDITOR.NODE_ELEMENT && nextNode.contains(startNode))
                    {
                        breakNodes();
                        nextNode = startNode.getNext();
                    }
                }
                currentNode = nextNode;
            }
        }

        range.moveToBookmark(bookmark);
    }

    // Turn inline style text properties into one hash.
    function parseStyleText(styleText) {
        var retval = {};
        styleText.replace(/&quot;/g, '"')
            .replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g, function(match, name, value) {
            retval[ name ] = value;
        });
        return retval;
    }

    function compareCssText(source, target) {
        typeof source == 'string' && ( source = parseStyleText(source) );
        typeof target == 'string' && ( target = parseStyleText(target) );
        for (var name in source) {
            // Value 'inherit'  is treated as a wildcard,
            // which will match any value.
            if (!( name in target &&
                ( target[ name ] == source[ name ]
                    || source[ name ] == 'inherit'
                    || target[ name ] == 'inherit' ) ))
            {
                return false;
            }
        }
        return true;
    }

    function normalizeCssText(unparsedCssText, nativeNormalize) {
        var styleText;
        if (nativeNormalize !== false) {
            // Injects the style in a temporary span object, so the browser parses it,
            // retrieving its final format.
            var temp = document.createElement('span');
            temp.setAttribute('style', unparsedCssText);
            styleText = temp.getAttribute('style') || '';
        }
        else
            styleText = unparsedCssText;

        // Shrinking white-spaces around colon and semi-colon (#4147).
        // Compensate tail semi-colon.
        return styleText.replace(/\s*([;:])\s*/, '$1')
            .replace(/([^\s;])$/, '$1;')
            .replace(/,\s+/g, ',')// Trimming spaces after comma (e.g. font-family name)(#4107).
            .toLowerCase();
    }

    function getAttributesForComparison(styleDefinition) {
        // If we have already computed it, just return it.
        var attribs = styleDefinition._AC;
        if (attribs)
            return attribs;

        attribs = {};

        var length = 0;

        // Loop through all defined attributes.
        var styleAttribs = styleDefinition.attributes;
        if (styleAttribs) {
            for (var styleAtt in styleAttribs) {
                length++;
                attribs[ styleAtt ] = styleAttribs[ styleAtt ];
            }
        }

        // Includes the style definitions.
        var styleText = KEStyle.getStyleText(styleDefinition);
        if (styleText) {
            if (!attribs[ 'style' ])
                length++;
            attribs[ 'style' ] = styleText;
        }

        // Appends the "length" information to the object.
        attribs._length = length;

        // Return it, saving it to the next request.
        return ( styleDefinition._AC = attribs );
    }


    /**
     * Get the the collection used to compare the elements and attributes,
     * defined in this style overrides, with other element. All information in
     * it is lowercased.
     * @param {KEStyle} style
     */
    function getOverrides(style) {
        if (style._.overrides)
            return style._.overrides;

        var overrides = ( style._.overrides = {} ),
            definition = style._.definition.overrides;

        if (definition) {
            // The override description can be a string, object or array.
            // Internally, well handle arrays only, so transform it if needed.
            if (!S.isArray(definition))
                definition = [ definition ];

            // Loop through all override definitions.
            for (var i = 0; i < definition.length; i++) {
                var override = definition[i];
                var elementName;
                var overrideEl;
                var attrs;

                // If can be a string with the element name.
                if (typeof override == 'string')
                    elementName = override.toLowerCase();
                // Or an object.
                else {
                    elementName = override.element ? override.element.toLowerCase() : style.element;
                    attrs = override.attributes;
                }

                // We can have more than one override definition for the same
                // element name, so we attempt to simply append information to
                // it if it already exists.
                overrideEl = overrides[ elementName ] || ( overrides[ elementName ] = {} );

                if (attrs) {
                    // The returning attributes list is an array, because we
                    // could have different override definitions for the same
                    // attribute name.
                    var overrideAttrs = ( overrideEl.attributes = overrideEl.attributes || new Array() );
                    for (var attName in attrs)
                    {
                        // Each item in the attributes array is also an array,
                        // where [0] is the attribute name and [1] is the
                        // override value.
                        overrideAttrs.push([ attName.toLowerCase(), attrs[ attName ] ]);
                    }
                }
            }
        }

        return overrides;
    }

    function normalizeProperty(name, value, isStyle) {
        var temp = new Node('<span></span>');
        temp [ isStyle ? 'css' : 'attr' ](name, value);
        return temp[ isStyle ? 'css' : 'attr' ](name);
    }

    // Removes a style from an element itself, don't care about its subtree.
    function removeFromElement(style, element) {
        var def = style._.definition,
            attributes = S.mix({}, def.attributes, getOverrides(style)[ element._4e_name() ]),
            styles = def.styles,
            // If the style is only about the element itself, we have to remove the element.
            removeEmpty = S.isEmptyObject(attributes) && S.isEmptyObject(styles);

        // Remove definition attributes/style from the elemnt.
        for (var attName in attributes) {
            // The 'class' element value must match (#1318).
            if (( attName == 'class' || style._.definition.fullMatch )
                && element.getAttribute(attName) != normalizeProperty(attName, attributes[ attName ]))
                continue;
            removeEmpty = element.hasAttribute(attName);
            element.removeAttribute(attName);
        }

        for (var styleName in styles) {
            // Full match style insist on having fully equivalence. (#5018)
            if (style._.definition.fullMatch
                && element.css(styleName) != normalizeProperty(styleName, styles[ styleName ], true))
                continue;

            removeEmpty = removeEmpty || !!element.css(styleName);
            element.css(styleName, "");
        }

        removeEmpty && removeNoAttribsElement(element);
    }

    // Removes a style from inside an element.
    function removeFromInsideElement(style, element) {
        var def = style._.definition,
            attribs = def.attributes,
            styles = def.styles,
            overrides = getOverrides(style);

        var innerElements = element.all(style.element);

        for (var i = innerElements.length; --i >= 0;)
            removeFromElement(style, new Node(innerElements[i]));

        // Now remove any other element with different name that is
        // defined to be overriden.
        for (var overrideElement in overrides) {
            if (overrideElement != style.element) {
                innerElements = element.all(overrideElement);
                for (i = innerElements.length - 1; i >= 0; i--) {
                    var innerElement = new Node(innerElements[i]);
                    removeOverrides(innerElement, overrides[ overrideElement ]);
                }
            }
        }

    }

    /**
     *  Remove overriding styles/attributes from the specific element.
     *  Note: Remove the element if no attributes remain.
     * @param {Object} element
     * @param {Object} overrides
     */
    function removeOverrides(element, overrides) {
        var attributes = overrides && overrides.attributes;

        if (attributes) {
            for (var i = 0; i < attributes.length; i++) {
                var attName = attributes[i][0], actualAttrValue;

                if (( actualAttrValue = element.attr(attName) )) {
                    var attValue = attributes[i][1];

                    // Remove the attribute if:
                    //    - The override definition value is null ;
                    //    - The override definition valie is a string that
                    //      matches the attribute value exactly.
                    //    - The override definition value is a regex that
                    //      has matches in the attribute value.
                    if (attValue === null ||
                        ( attValue.test && attValue.test(actualAttrValue) ) ||
                        ( typeof attValue == 'string' && actualAttrValue == attValue ))
                        element[0].removeAttribute(attName);
                }
            }
        }

        removeNoAttribsElement(element);
    }

    // If the element has no more attributes, remove it.
    function removeNoAttribsElement(element) {
        // If no more attributes remained in the element, remove it,
        // leaving its children.
        if (!element._4e_hasAttributes()) {
            // Removing elements may open points where merging is possible,
            // so let's cache the first and last nodes for later checking.
            var firstChild = element[0].firstChild;
            var lastChild = element[0].lastChild;

            element.remove();

            if (firstChild) {
                // Check the cached nodes for merging.
                firstChild.nodeType == KEN.NODE_ELEMENT && DOM._4e_mergeSiblings(firstChild);

                if (lastChild && !firstChild === lastChild
                    && lastChild.nodeType == KEN.NODE_ELEMENT)
                    DOM._4e_mergeSiblings(lastChild);
            }
        }
    }
});