/**
 * modified from ckeditor for kissy editor,use style to gen element and wrap range's elements
 * @author: <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add('styles', function (KE) {
  var TRUE = true,
    FALSE = false,
    NULL = null,
    S = KISSY,
    Utils = KE.Utils,
    DOM = S.DOM,
    /**
     * enum for style type
     * @enum {number}
     */
    KEST = {
      STYLE_BLOCK: 1,
      STYLE_INLINE: 2,
      STYLE_OBJECT: 3,
    },
    KER = KE.RANGE,
    KESelection = KE.Selection,
    KEN = KE.NODE,
    KEP = KE.POSITION,
    KERange = KE.Range,
    //Walker = KE.Walker,
    Node = S.Node,
    UA = S.UA,
    ElementPath = KE.ElementPath,
    blockElements = {
      address: 1,
      div: 1,
      h1: 1,
      h2: 1,
      h3: 1,
      h4: 1,
      h5: 1,
      h6: 1,
      p: 1,
      pre: 1,
    },
    objectElements = {
      //why? a should be same to inline? 但是不能互相嵌套
      //a:1,
      embed: 1,
      hr: 1,
      img: 1,
      li: 1,
      object: 1,
      ol: 1,
      table: 1,
      td: 1,
      tr: 1,
      th: 1,
      ul: 1,
      dl: 1,
      dt: 1,
      dd: 1,
      form: 1,
    },
    semicolonFixRegex = /\s*(?:;\s*|$)/g,
    varRegex = /#\((.+?)\)/g;

  KE.STYLE = KEST;
  function replaceVariables(list, variablesValues) {
    for (var item in list) {
      list[item] = list[item].replace(varRegex, function (match, varName) {
        return variablesValues[varName];
      });
    }
  }

  /**
   * @constructor
   * @param styleDefinition {Object}
   * @param variablesValues {Object}
   */
  function KEStyle(styleDefinition, variablesValues) {
    if (variablesValues) {
      styleDefinition = S.clone(styleDefinition);
      replaceVariables(styleDefinition['attributes'], variablesValues);
      replaceVariables(styleDefinition['styles'], variablesValues);
    }

    var element =
      (this['element'] =
      this.element =
        (styleDefinition['element'] || '*').toLowerCase());

    this['type'] = this.type =
      element == '#' || blockElements[element]
        ? KEST.STYLE_BLOCK
        : objectElements[element]
        ? KEST.STYLE_OBJECT
        : KEST.STYLE_INLINE;

    this._ = {
      definition: styleDefinition,
    };
  }

  /**
   *
   * @param {Document} document
   * @param {boolean=} remove
   */
  function applyStyle(document, remove) {
    // Get all ranges from the selection.
    var self = this,
      func = remove ? self.removeFromRange : self.applyToRange;
    // Apply the style to the ranges.
    //ie select 选中期间document得不到range
    document.body.focus();

    var selection = new KESelection(document);
    // Bookmark the range so we can re-select it after processing.
    var ranges = selection.getRanges();
    for (var i = 0; i < ranges.length; i++) {
      //格式化后，range进入格式标签内
      func.call(self, ranges[i]);
    }
    selection.selectRanges(ranges);
  }

  KEStyle.prototype = {
    apply: function (document) {
      applyStyle.call(this, document, FALSE);
    },

    remove: function (document) {
      applyStyle.call(this, document, TRUE);
    },

    applyToRange: function (range) {
      var self = this;
      return (self.applyToRange =
        this.type == KEST.STYLE_INLINE
          ? applyInlineStyle
          : self.type == KEST.STYLE_BLOCK
          ? applyBlockStyle
          : self.type == KEST.STYLE_OBJECT
          ? NULL
          : //yiminghe note:no need!
            //applyObjectStyle
            NULL).call(self, range);
    },

    removeFromRange: function (range) {
      var self = this;
      return (self.removeFromRange =
        self.type == KEST.STYLE_INLINE ? removeInlineStyle : NULL).call(
        self,
        range,
      );
    },

    applyToObject: function (element) {
      setupElement(element, this);
    },
    // Checks if an element, or any of its attributes, is removable by the
    // current style definition.
    checkElementRemovable: function (element, fullMatch) {
      if (!element) return FALSE;

      var def = this._.definition,
        attribs;

      // If the element name is the same as the style name.
      if (element._4e_name() == this.element) {
        // If no attributes are defined in the element.
        if (!fullMatch && !element._4e_hasAttributes()) return TRUE;

        attribs = getAttributesForComparison(def);

        if (attribs['_length']) {
          for (var attName in attribs) {
            if (attName == '_length') continue;

            var elementAttr = element.attr(attName) || '';
            if (
              attName == 'style'
                ? compareCssText(
                    attribs[attName],
                    normalizeCssText(elementAttr, FALSE),
                  )
                : attribs[attName] == elementAttr
            ) {
              if (!fullMatch) return TRUE;
            } else if (fullMatch) return FALSE;
          }
          if (fullMatch) return TRUE;
        } else return TRUE;
      }

      // Check if the element can be somehow overriden.
      var override = getOverrides(this)[element._4e_name()];

      if (override) {
        // If no attributes have been defined, remove the element.
        if (!(attribs = override.attributes)) return TRUE;

        for (var i = 0; i < attribs.length; i++) {
          attName = attribs[i][0];
          var actualAttrValue = element.attr(attName);
          if (actualAttrValue) {
            var attValue = attribs[i][1];
            // Remove the attribute if:
            //    - The override definition value is NULL;
            //    - The override definition value is a string that
            //      matches the attribute value exactly.
            //    - The override definition value is a regex that
            //      has matches in the attribute value.
            if (
              attValue === NULL ||
              (typeof attValue == 'string' && actualAttrValue == attValue) ||
              (attValue.test && attValue.test(actualAttrValue))
            )
              return TRUE;
          }
        }
      }
      return FALSE;
    },

    /**
     * Get the style state inside an element path. Returns "TRUE" if the
     * element is active in the path.
     */
    checkActive: function (elementPath) {
      switch (this.type) {
        case KEST.STYLE_BLOCK:
          return this.checkElementRemovable(
            elementPath.block || elementPath.blockLimit,
            TRUE,
          );

        case KEST.STYLE_OBJECT:
        case KEST.STYLE_INLINE:
          var elements = elementPath.elements;

          for (var i = 0, element; i < elements.length; i++) {
            element = elements[i];

            if (
              this.type == KEST.STYLE_INLINE &&
              (DOM._4e_equals(element, elementPath.block) ||
                DOM._4e_equals(element, elementPath.blockLimit))
            )
              continue;

            if (
              this.type == KEST.STYLE_OBJECT &&
              !(element._4e_name() in objectElements)
            )
              continue;

            if (this.checkElementRemovable(element, TRUE)) return TRUE;
          }
      }
      return FALSE;
    },
  };

  KEStyle.getStyleText = function (styleDefinition) {
    // If we have already computed it, just return it.
    var stylesDef = styleDefinition._ST;
    if (stylesDef) return stylesDef;

    stylesDef = styleDefinition['styles'];

    // Builds the StyleText.
    var stylesText =
        (styleDefinition['attributes'] &&
          styleDefinition['attributes']['style']) ||
        '',
      specialStylesText = '';

    if (stylesText.length)
      stylesText = stylesText.replace(semicolonFixRegex, ';');

    for (var style in stylesDef) {
      var styleVal = stylesDef[style],
        text = (style + ':' + styleVal).replace(semicolonFixRegex, ';');

      // Some browsers don't support 'inherit' property value, leave them intact. (#5242)
      if (styleVal == 'inherit') specialStylesText += text;
      else stylesText += text;
    }

    // Browsers make some changes to the style when applying them. So, here
    // we normalize it to the browser format.
    if (stylesText.length) stylesText = normalizeCssText(stylesText);

    stylesText += specialStylesText;

    // Return it, saving it to the next request.
    return (styleDefinition._ST = stylesText);
  };

  function getElement(style, targetDocument) {
    var el,
      //def = style._.definition,
      elementName = style['element'];

    // The "*" element name will always be a span for this function.
    if (elementName == '*') elementName = 'span';

    // Create the element.
    el = new Node(targetDocument.createElement(elementName));

    return setupElement(el, style);
  }

  function setupElement(el, style) {
    var def = style._['definition'],
      attributes = def['attributes'],
      styles = KEStyle.getStyleText(def);

    // Assign all defined attributes.
    if (attributes) {
      for (var att in attributes) {
        el.attr(att, attributes[att]);
      }
    }

    // Assign all defined styles.

    if (styles) el[0].style.cssText = styles;

    return el;
  }

  function applyBlockStyle(range) {
    // Serializible bookmarks is needed here since
    // elements may be merged.
    var bookmark = range.createBookmark(TRUE),
      iterator = range.createIterator();
    iterator.enforceRealBlocks = TRUE;

    // make recognize <br /> tag as a separator in ENTER_BR mode (#5121)
    //if (this._.enterMode)
    iterator.enlargeBr = TRUE; //( this._.enterMode != CKEDITOR.ENTER_BR );

    var block,
      doc = range.document;
    // Only one =
    while ((block = iterator.getNextParagraph())) {
      var newBlock = getElement(this, doc);
      replaceBlock(block, newBlock);
    }
    range.moveToBookmark(bookmark);
  }

  // Wrapper function of String::replace without considering of head/tail bookmarks nodes.
  function replace(str, regexp, replacement) {
    var headBookmark = '',
      tailBookmark = '';

    str = str.replace(
      /(^<span[^>]+_ke_bookmark.*?\/span>)|(<span[^>]+_ke_bookmark.*?\/span>$)/gi,
      function (str, m1, m2) {
        m1 && (headBookmark = m1);
        m2 && (tailBookmark = m2);
        return '';
      },
    );
    return headBookmark + str.replace(regexp, replacement) + tailBookmark;
  }

  /**
   * Converting from a non-PRE block to a PRE block in formatting operations.
   */
  function toPre(block, newBlock) {
    // First trim the block content.
    var preHtml = block.html();

    // 1. Trim head/tail spaces, they're not visible.
    preHtml = replace(preHtml, /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
    // 2. Delete ANSI whitespaces immediately before and after <BR> because
    //    they are not visible.
    preHtml = preHtml.replace(/[ \t\r\n]*(<br[^>]*>)[ \t\r\n]*/gi, '$1');
    // 3. Compress other ANSI whitespaces since they're only visible as one
    //    single space previously.
    // 4. Convert &nbsp; to spaces since &nbsp; is no longer needed in <PRE>.
    preHtml = preHtml.replace(/([ \t\n\r]+|&nbsp;)/g, ' ');
    // 5. Convert any <BR /> to \n. This must not be done earlier because
    //    the \n would then get compressed.
    preHtml = preHtml.replace(/<br\b[^>]*>/gi, '\n');

    // Krugle: IE normalizes innerHTML to <pre>, breaking whitespaces.
    if (UA.ie) {
      var temp = block[0].ownerDocument.createElement('div');
      temp.appendChild(newBlock[0]);
      newBlock[0].outerHTML = '<pre>' + preHtml + '</pre>';
      newBlock = new Node(temp.firstChild);
      newBlock._4e_remove();
    } else newBlock.html(preHtml);

    return newBlock;
  }

  /**
   * Split into multiple <pre> blocks separated by double line-break.
   * @param preBlock
   */
  function splitIntoPres(preBlock) {
    // Exclude the ones at header OR at tail,
    // and ignore bookmark content between them.
    var duoBrRegex =
        /(\S\s*)\n(?:\s|(<span[^>]+_ck_bookmark.*?\/span>))*\n(?!$)/gi,
      //blockName = preBlock._4e_name(),
      splittedHtml = replace(
        preBlock._4e_outerHtml(),
        duoBrRegex,
        function (match, charBefore, bookmark) {
          return charBefore + '</pre>' + bookmark + '<pre>';
        },
      );

    var pres = [];
    splittedHtml.replace(
      /<pre\b.*?>([\s\S]*?)<\/pre>/gi,
      function (match, preContent) {
        pres.push(preContent);
      },
    );
    return pres;
  }

  // Replace the original block with new one, with special treatment
  // for <pre> blocks to make sure content format is well preserved, and merging/splitting adjacent
  // when necessary.(#3188)
  function replaceBlock(block, newBlock) {
    var newBlockIsPre = newBlock._4e_name == 'pre',
      blockIsPre = block._4e_name == 'pre',
      isToPre = newBlockIsPre && !blockIsPre,
      isFromPre = !newBlockIsPre && blockIsPre;

    if (isToPre) newBlock = toPre(block, newBlock);
    else if (isFromPre)
      // Split big <pre> into pieces before start to convert.
      newBlock = fromPres(splitIntoPres(block), newBlock);
    else block._4e_moveChildren(newBlock);

    block[0].parentNode.replaceChild(newBlock[0], block[0]);
    if (newBlockIsPre) {
      // Merge previous <pre> blocks.
      mergePre(newBlock);
    }
  }

  /**
   * Merge a <pre> block with a previous sibling if available.
   */
  function mergePre(preBlock) {
    var previousBlock;
    if (
      !(
        (previousBlock = preBlock._4e_previousSourceNode(
          TRUE,
          KEN.NODE_ELEMENT,
        )) && previousBlock._4e_name() == 'pre'
      )
    )
      return;

    // Merge the previous <pre> block contents into the current <pre>
    // block.
    //
    // Another thing to be careful here is that currentBlock might contain
    // a '\n' at the beginning, and previousBlock might contain a '\n'
    // towards the end. These new lines are not normally displayed but they
    // become visible after merging.
    var mergedHtml =
      replace(previousBlock.html(), /\n$/, '') +
      '\n\n' +
      replace(preBlock.html(), /^\n/, '');

    // Krugle: IE normalizes innerHTML from <pre>, breaking whitespaces.
    if (UA.ie) preBlock[0].outerHTML = '<pre>' + mergedHtml + '</pre>';
    else preBlock.html(mergedHtml);

    previousBlock._4e_remove();
  }

  /**
   * Converting a list of <pre> into blocks with format well preserved.
   */
  function fromPres(preHtmls, newBlock) {
    var docFrag = newBlock[0].ownerDocument.createDocumentFragment();
    for (var i = 0; i < preHtmls.length; i++) {
      var blockHtml = preHtmls[i];

      // 1. Trim the first and last line-breaks immediately after and before <pre>,
      // they're not visible.
      blockHtml = blockHtml.replace(/(\r\n|\r)/g, '\n');
      blockHtml = replace(blockHtml, /^[ \t]*\n/, '');
      blockHtml = replace(blockHtml, /\n$/, '');
      // 2. Convert spaces or tabs at the beginning or at the end to &nbsp;
      blockHtml = replace(
        blockHtml,
        /^[ \t]+|[ \t]+$/g,
        function (match, offset) {
          if (match.length == 1)
            // one space, preserve it
            return '&nbsp;';
          else if (!offset)
            // beginning of block
            return new Array(match.length).join('&nbsp;') + ' ';
          // end of block
          else return ' ' + new Array(match.length).join('&nbsp;');
        },
      );

      // 3. Convert \n to <BR>.
      // 4. Convert contiguous (i.e. non-singular) spaces or tabs to &nbsp;
      blockHtml = blockHtml.replace(/\n/g, '<br>');
      blockHtml = blockHtml.replace(/[ \t]{2,}/g, function (match) {
        return new Array(match.length).join('&nbsp;') + ' ';
      });

      var newBlockClone = newBlock._4e_clone();
      newBlockClone.html(blockHtml);
      docFrag.appendChild(newBlockClone[0]);
    }
    return docFrag;
  }

  /**
   *
   * @param range {KISSY.Editor.Range}
   */
  function applyInlineStyle(range) {
    var self = this,
      document = range.document;

    if (range.collapsed) {
      // Create the element to be inserted in the DOM.
      var collapsedElement = getElement(this, document);
      // Insert the empty element into the DOM at the range position.
      range.insertNode(collapsedElement);
      // Place the selection right inside the empty element.
      range.moveToPosition(collapsedElement, KER.POSITION_BEFORE_END);
      return;
    }
    var elementName = this['element'],
      def = this._['definition'],
      isUnknownElement,
      // Get the DTD definition for the element. Defaults to "span".
      dtd =
        KE.XHTML_DTD[elementName] ||
        ((isUnknownElement = TRUE), KE.XHTML_DTD['span']);

    // Bookmark the range so we can re-select it after processing.
    var bookmark = range.createBookmark();

    // Expand the range.

    range.enlarge(KER.ENLARGE_ELEMENT);
    range.trim();
    // Get the first node to be processed and the last, which concludes the
    // processing.
    var boundaryNodes = range.createBookmark(),
      firstNode = boundaryNodes.startNode,
      lastNode = boundaryNodes.endNode,
      currentNode = firstNode,
      styleRange;

    while (currentNode && currentNode[0]) {
      var applyStyle = FALSE;

      if (DOM._4e_equals(currentNode, lastNode)) {
        currentNode = NULL;
        applyStyle = TRUE;
      } else {
        var nodeType = currentNode[0].nodeType,
          nodeName =
            nodeType == KEN.NODE_ELEMENT ? currentNode._4e_name() : NULL;

        if (nodeName && currentNode.attr('_ke_bookmark')) {
          currentNode = currentNode._4e_nextSourceNode(TRUE);
          continue;
        }

        // Check if the current node can be a child of the style element.
        if (
          !nodeName ||
          (dtd[nodeName] &&
            (currentNode._4e_position(lastNode) |
              (KEP.POSITION_PRECEDING |
                KEP.POSITION_IDENTICAL |
                KEP.POSITION_IS_CONTAINED)) ==
              KEP.POSITION_PRECEDING +
                KEP.POSITION_IDENTICAL +
                KEP.POSITION_IS_CONTAINED &&
            (!def['childRule'] || def['childRule'](currentNode)))
        ) {
          var currentParent = currentNode.parent();

          // Check if the style element can be a child of the current
          // node parent or if the element is not defined in the DTD.
          if (
            currentParent &&
            currentParent[0] &&
            ((KE.XHTML_DTD[currentParent._4e_name()] || KE.XHTML_DTD['span'])[
              elementName
            ] ||
              isUnknownElement) &&
            (!def['parentRule'] || def['parentRule'](currentParent))
          ) {
            // This node will be part of our range, so if it has not
            // been started, place its start right before the node.
            // In the case of an element node, it will be included
            // only if it is entirely inside the range.
            if (
              !styleRange &&
              (!nodeName ||
                !KE.XHTML_DTD.$removeEmpty[nodeName] ||
                (currentNode._4e_position(lastNode) |
                  (KEP.POSITION_PRECEDING |
                    KEP.POSITION_IDENTICAL |
                    KEP.POSITION_IS_CONTAINED)) ==
                  KEP.POSITION_PRECEDING +
                    KEP.POSITION_IDENTICAL +
                    KEP.POSITION_IS_CONTAINED)
            ) {
              styleRange = new KERange(document);
              styleRange.setStartBefore(currentNode);
            }

            // Non element nodes, or empty elements can be added
            // completely to the range.
            if (
              nodeType == KEN.NODE_TEXT ||
              (nodeType == KEN.NODE_ELEMENT &&
                !currentNode[0].childNodes.length)
            ) {
              var includedNode = currentNode,
                parentNode;

              // This node is about to be included completelly, but,
              // if this is the last node in its parent, we must also
              // check if the parent itself can be added completelly
              // to the range.
              //2010-11-18 fix ; http://dev.ckeditor.com/ticket/6687
              //<span><book/>123<book/></span> 直接越过末尾 <book/>
              var validNextSilbing = includedNode._4e_next(function (node) {
                //only get attributes on element nodes by kissy
                //when textnode attr() return undefined ,wonderful !!!
                return !node.attr('_ke_bookmark');
              });

              while (
                !validNextSilbing &&
                ((parentNode = includedNode.parent()),
                dtd[parentNode._4e_name()]) &&
                (parentNode._4e_position(firstNode) |
                  KEP.POSITION_FOLLOWING |
                  KEP.POSITION_IDENTICAL |
                  KEP.POSITION_IS_CONTAINED) ==
                  KEP.POSITION_FOLLOWING +
                    KEP.POSITION_IDENTICAL +
                    KEP.POSITION_IS_CONTAINED &&
                (!def['childRule'] || def['childRule'](parentNode))
              ) {
                includedNode = parentNode;
              }

              styleRange.setEndAfter(includedNode);

              // If the included node still is the last node in its
              // parent, it means that the parent can't be included
              // in this style DTD, so apply the style immediately.
              if (!includedNode[0].nextSibling) applyStyle = TRUE;
            }
          } else applyStyle = TRUE;
        } else applyStyle = TRUE;

        // Get the next node to be processed.
        currentNode = currentNode._4e_nextSourceNode();
      }

      // Apply the style if we have something to which apply it.
      if (applyStyle && styleRange && !styleRange.collapsed) {
        // Build the style element, based on the style object definition.
        var styleNode = getElement(self, document),
          // Get the element that holds the entire range.
          parent = styleRange.getCommonAncestor();

        var removeList = {
          styles: {},
          attrs: {},
          // Styles cannot be removed.
          blockedStyles: {},
          // Attrs cannot be removed.
          blockedAttrs: {},
        };

        var attName, styleName, value;

        // Loop through the parents, removing the redundant attributes
        // from the element to be applied.
        while (styleNode && parent && styleNode[0] && parent[0]) {
          if (parent._4e_name() == elementName) {
            for (attName in def['attributes']) {
              if (
                removeList.blockedAttrs[attName] ||
                !(value = parent.attr(styleName))
              )
                continue;

              if (styleNode.attr(attName) == value) {
                //removeList.attrs[ attName ] = 1;
                styleNode.removeAttr(attName);
              } else removeList.blockedAttrs[attName] = 1;
            }
            //bug notice add by yiminghe@gmail.com
            //<span style="font-size:70px"><span style="font-size:30px">xcxx</span></span>
            //下一次格式xxx为70px
            //var exit = FALSE;
            for (styleName in def['styles']) {
              if (
                removeList.blockedStyles[styleName] ||
                !(value = parent._4e_style(styleName))
              )
                continue;

              if (styleNode._4e_style(styleName) == value) {
                //removeList.styles[ styleName ] = 1;
                styleNode._4e_style(styleName, '');
              } else removeList.blockedStyles[styleName] = 1;
            }

            if (!styleNode._4e_hasAttributes()) {
              styleNode = NULL;
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
          removeFromInsideElement(self, styleNode);

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
          if (!UA.ie) styleNode[0].normalize();
        }
        // Style already inherit from parents, left just to clear up any internal overrides. (#5931)
        /**
                 * from koubei
                 *1.输入ab
                 2.ctrl-a 设置字体大小 x
                 3.选中b设置字体大小 y
                 4.保持选中b,设置字体大小 x
                 exptected: b 大小为 x
                 actual: b 大小为 y
                 */
        else {
          styleNode = new Node(document.createElement('span'));
          styleNode[0].appendChild(styleRange.extractContents());
          styleRange.insertNode(styleNode);
          removeFromInsideElement(self, styleNode);
          styleNode._4e_remove(true);
        }

        // Style applied, let's release the range, so it gets
        // re-initialization in the next loop.
        styleRange = NULL;
      }
    }

    firstNode._4e_remove();
    lastNode._4e_remove();
    range.moveToBookmark(bookmark);
    // Minimize the result range to exclude empty text nodes. (#5374)
    range.shrink(KER.SHRINK_TEXT);
  }

  /**
   *
   * @param range {KISSY.Editor.Range}
   */
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

      for (
        var i = 0, element;
        i < startPath.elements.length && (element = startPath.elements[i]);
        i++
      ) {
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
            startOfElement =
              !endOfElement && range.checkBoundaryOfElement(element, KER.START);
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
            //yiminghe:note,bug for ckeditor
            //qc #3700 for chengyu(yiminghe)
            //从word复制过来的已编辑文本无法使用粗体和斜体等功能取消
            if (element._4e_name() == this.element)
              removeFromElement(this, element);
            else
              removeOverrides(element, getOverrides(this)[element._4e_name()]);
          }
        }
      }

      // Re-create the style tree after/before the boundary element,
      // the replication start from bookmark start node to define the
      // new range.
      if (boundaryElement && boundaryElement[0]) {
        var clonedElement = startNode;
        for (i = 0; ; i++) {
          var newElement = startPath.elements[i];
          if (DOM._4e_equals(newElement, boundaryElement)) break;
          // Avoid copying any matched element.
          else if (newElement.match) continue;
          else newElement = newElement._4e_clone();
          newElement[0].appendChild(clonedElement[0]);
          clonedElement = newElement;
        }
        //脱离当前的元素，将 bookmark 插入到当前元素后面
        //<strong>xx|</strong>  ->
        //<strong>xx<strong>|
        DOM[boundaryElement.match == 'start' ? 'insertBefore' : 'insertAfter'](
          clonedElement,
          boundaryElement,
        );
      }
    } else {
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
        var startPath = new ElementPath(startNode.parent()),
          endPath = new ElementPath(endNode.parent()),
          breakStart = NULL,
          breakEnd = NULL;
        for (var i = 0; i < startPath.elements.length; i++) {
          var element = startPath.elements[i];

          if (element == startPath.block || element == startPath.blockLimit)
            break;

          if (me.checkElementRemovable(element)) breakStart = element;
        }
        for (i = 0; i < endPath.elements.length; i++) {
          element = endPath.elements[i];

          if (element == endPath.block || element == endPath.blockLimit) break;

          if (me.checkElementRemovable(element)) breakEnd = element;
        }

        if (breakEnd) endNode._4e_breakParent(breakEnd);
        if (breakStart) startNode._4e_breakParent(breakStart);
      }

      breakNodes();

      // Now, do the DFS walk.
      var currentNode = new Node(startNode[0].nextSibling);
      while (currentNode[0] !== endNode[0]) {
        /*
         * Need to get the next node first because removeFromElement() can remove
         * the current node from DOM tree.
         */
        var nextNode = currentNode._4e_nextSourceNode();
        if (
          currentNode[0] &&
          currentNode[0].nodeType == KEN.NODE_ELEMENT &&
          this.checkElementRemovable(currentNode)
        ) {
          // Remove style from element or overriding element.
          if (currentNode._4e_name() == this['element'])
            removeFromElement(this, currentNode);
          else
            removeOverrides(
              currentNode,
              getOverrides(this)[currentNode._4e_name()],
            );

          /*
           * removeFromElement() may have merged the next node with something before
           * the startNode via mergeSiblings(). In that case, the nextNode would
           * contain startNode and we'll have to call breakNodes() again and also
           * reassign the nextNode to something after startNode.
           */
          if (
            nextNode[0].nodeType == KEN.NODE_ELEMENT &&
            nextNode.contains(startNode)
          ) {
            breakNodes();
            nextNode = new Node(startNode[0].nextSibling);
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
    styleText
      .replace(/&quot;/g, '"')
      .replace(
        /\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
        function (match, name, value) {
          retval[name] = value;
        },
      );
    return retval;
  }

  function compareCssText(source, target) {
    typeof source == 'string' && (source = parseStyleText(source));
    typeof target == 'string' && (target = parseStyleText(target));
    for (var name in source) {
      // Value 'inherit'  is treated as a wildcard,
      // which will match any value.
      if (
        !(
          name in target &&
          (target[name] == source[name] ||
            source[name] == 'inherit' ||
            target[name] == 'inherit')
        )
      ) {
        return FALSE;
      }
    }
    return TRUE;
  }

  /**
   *
   * @param {string} unparsedCssText
   * @param {boolean=} nativeNormalize
   */
  function normalizeCssText(unparsedCssText, nativeNormalize) {
    var styleText;
    if (nativeNormalize !== FALSE) {
      // Injects the style in a temporary span object, so the browser parses it,
      // retrieving its final format.
      var temp = document.createElement('span');
      temp.style.cssText = unparsedCssText;
      //temp.setAttribute('style', unparsedCssText);
      styleText = temp.style.cssText || '';
    } else styleText = unparsedCssText;

    // Shrinking white-spaces around colon and semi-colon (#4147).
    // Compensate tail semi-colon.
    return styleText
      .replace(/\s*([;:])\s*/, '$1')
      .replace(/([^\s;])$/, '$1;')
      .replace(/,\s+/g, ',') // Trimming spaces after comma (e.g. font-family name)(#4107).
      .toLowerCase();
  }

  /**
   * 把 styles(css配置) 作为 属性 style 统一看待
   * 注意对 inherit 的处理
   * @param styleDefinition
   */
  function getAttributesForComparison(styleDefinition) {
    // If we have already computed it, just return it.
    var attribs = styleDefinition._AC;
    if (attribs) return attribs;

    attribs = {};

    var length = 0,
      // Loop through all defined attributes.
      styleAttribs = styleDefinition['attributes'];
    if (styleAttribs) {
      for (var styleAtt in styleAttribs) {
        length++;
        attribs[styleAtt] = styleAttribs[styleAtt];
      }
    }

    // Includes the style definitions.
    var styleText = KEStyle.getStyleText(styleDefinition);
    if (styleText) {
      if (!attribs['style']) length++;
      attribs['style'] = styleText;
    }

    // Appends the "length" information to the object.
    //防止被compiler优化
    attribs['_length'] = length;

    // Return it, saving it to the next request.
    return (styleDefinition._AC = attribs);
  }

  /**
   * Get the the collection used to compare the elements and attributes,
   * defined in this style overrides, with other element. All information in
   * it is lowercased.
   * @param  style
   */
  function getOverrides(style) {
    if (style._.overrides) return style._.overrides;

    var overrides = (style._.overrides = {}),
      definition = style._.definition['overrides'];

    if (definition) {
      // The override description can be a string, object or array.
      // Internally, well handle arrays only, so transform it if needed.
      if (!S.isArray(definition)) definition = [definition];

      // Loop through all override definitions.
      for (var i = 0; i < definition.length; i++) {
        var override = definition[i];
        var elementName;
        var overrideEl;
        var attrs;

        // If can be a string with the element name.
        if (typeof override == 'string') elementName = override.toLowerCase();
        // Or an object.
        else {
          elementName = override['element']
            ? override['element'].toLowerCase()
            : style.element;
          attrs = override['attributes'];
        }

        // We can have more than one override definition for the same
        // element name, so we attempt to simply append information to
        // it if it already exists.
        overrideEl = overrides[elementName] || (overrides[elementName] = {});

        if (attrs) {
          // The returning attributes list is an array, because we
          // could have different override definitions for the same
          // attribute name.
          var overrideAttrs = (overrideEl['attributes'] =
            overrideEl['attributes'] || new Array());
          for (var attName in attrs) {
            // Each item in the attributes array is also an array,
            // where [0] is the attribute name and [1] is the
            // override value.
            overrideAttrs.push([attName.toLowerCase(), attrs[attName]]);
          }
        }
      }
    }

    return overrides;
  }

  // Removes a style from an element itself, don't care about its subtree.
  function removeFromElement(style, element) {
    var def = style._.definition,
      attributes = Utils.mix(
        def['attributes'],
        getOverrides(style)[element._4e_name()],
      ),
      styles = def['styles'],
      // If the style is only about the element itself, we have to remove the element.
      removeEmpty = S.isEmptyObject(attributes) && S.isEmptyObject(styles);

    // Remove definition attributes/style from the elemnt.
    for (var attName in attributes) {
      // The 'class' element value must match (#1318).
      if (
        (attName == 'class' || style._.definition['fullMatch']) &&
        element.attr(attName) != normalizeProperty(attName, attributes[attName])
      )
        continue;
      removeEmpty = removeEmpty || !!element._4e_hasAttribute(attName);
      element.removeAttr(attName);
    }

    for (var styleName in styles) {
      // Full match style insist on having fully equivalence. (#5018)
      if (
        style._.definition['fullMatch'] &&
        element._4e_style(styleName) !=
          normalizeProperty(styleName, styles[styleName], TRUE)
      )
        continue;

      removeEmpty = removeEmpty || !!element._4e_style(styleName);
      //设置空即为：清除样式
      element._4e_style(styleName, '');
    }

    //removeEmpty &&
    //始终检查
    removeNoAttribsElement(element);
  }

  /**
   *
   * @param {string} name
   * @param {string} value
   * @param {boolean=} isStyle
   */
  function normalizeProperty(name, value, isStyle) {
    var temp = new Node('<span>');
    temp[isStyle ? '_4e_style' : 'attr'](name, value);
    return temp[isStyle ? '_4e_style' : 'attr'](name);
  }

  // Removes a style from inside an element.
  function removeFromInsideElement(style, element) {
    var //def = style._.definition,
      //attribs = def.attributes,
      //styles = def.styles,
      overrides = getOverrides(style),
      innerElements = element.all(style['element']);

    for (var i = innerElements.length; --i >= 0; )
      removeFromElement(style, new Node(innerElements[i]));

    // Now remove any other element with different name that is
    // defined to be overriden.
    for (var overrideElement in overrides) {
      if (overrideElement != style['element']) {
        innerElements = element.all(overrideElement);
        for (i = innerElements.length - 1; i >= 0; i--) {
          var innerElement = new Node(innerElements[i]);
          removeOverrides(innerElement, overrides[overrideElement]);
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
    var attributes = overrides && overrides['attributes'];

    if (attributes) {
      for (var i = 0; i < attributes.length; i++) {
        var attName = attributes[i][0],
          actualAttrValue;

        if ((actualAttrValue = element.attr(attName))) {
          var attValue = attributes[i][1];

          // Remove the attribute if:
          //    - The override definition value is NULL ;
          //    - The override definition valie is a string that
          //      matches the attribute value exactly.
          //    - The override definition value is a regex that
          //      has matches in the attribute value.
          if (
            attValue === NULL ||
            (attValue.test && attValue.test(actualAttrValue)) ||
            (typeof attValue == 'string' && actualAttrValue == attValue)
          )
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
      var firstChild = element[0].firstChild,
        lastChild = element[0].lastChild;

      element._4e_remove(TRUE);

      if (firstChild) {
        // Check the cached nodes for merging.
        firstChild.nodeType == KEN.NODE_ELEMENT &&
          DOM._4e_mergeSiblings(firstChild);

        if (
          lastChild &&
          firstChild != lastChild &&
          lastChild.nodeType == KEN.NODE_ELEMENT
        )
          DOM._4e_mergeSiblings(lastChild);
      }
    }
  }

  KE.Style = KEStyle;
  KE['Style'] = KEStyle;

  var StyleP = KEStyle.prototype;
  KE.Utils.extern(StyleP, {
    apply: StyleP.apply,
    remove: StyleP.remove,
    applyToRange: StyleP.applyToRange,
    removeFromRange: StyleP.removeFromRange,
    applyToObject: StyleP.applyToObject,
    checkElementRemovable: StyleP.checkElementRemovable,
    checkActive: StyleP.checkActive,
  });
});
