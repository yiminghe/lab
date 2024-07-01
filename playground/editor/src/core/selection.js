/**
 * modified from ckeditor core plugin - selection
 * @author: <yiminghe@gmail.com>
 */
/*
 Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */
KISSY.Editor.add('selection', function (KE) {
  /**
   * selection type enum
   * @enum {number}
   */
  KE.SELECTION = {
    SELECTION_NONE: 1,
    SELECTION_TEXT: 2,
    SELECTION_ELEMENT: 3,
  };
  var TRUE = true,
    FALSE = false,
    NULL = null,
    S = KISSY,
    UA = S.UA,
    DOM = S.DOM,
    Event = S.Event,
    //tryThese = KE.Utils.tryThese,
    Node = S.Node,
    KES = KE.SELECTION,
    KER = KE.RANGE,
    KEN = KE.NODE,
    OLD_IE = !window.getSelection,
    //EventTarget = S.EventTarget,
    Walker = KE.Walker,
    //ElementPath = KE.ElementPath,
    KERange = KE.Range;

  /**
   * @constructor
   * @param document {Document}
   */
  function KESelection(document) {
    var self = this;
    self['document'] = self.document = document;
    self._ = {
      cache: {},
    };

    /**
     * IE BUG: The selection's document may be a different document than the
     * editor document. Return NULL if that's the case.
     */
    if (OLD_IE) {
      var range = self.getNative().createRange();
      if (
        !range ||
        (range.item && range.item(0).ownerDocument != document) ||
        (range.parentElement && range.parentElement().ownerDocument != document)
      ) {
        self.isInvalid = TRUE;
      }
    }
  }

  var styleObjectElements = {
    img: 1,
    hr: 1,
    li: 1,
    table: 1,
    tr: 1,
    td: 1,
    th: 1,
    embed: 1,
    object: 1,
    ol: 1,
    ul: 1,
    a: 1,
    input: 1,
    form: 1,
    select: 1,
    textarea: 1,
    button: 1,
    fieldset: 1,
    thead: 1,
    tfoot: 1,
  };

  S.augment(KESelection, {
    /**
     * Gets the native selection object from the browser.
     * @returns {Object} The native selection object.
     * @example
     * var selection = editor.getSelection().<b>getNative()</b>;
     */
    getNative: !OLD_IE
      ? function () {
          var self = this,
            cache = self._.cache;
          return (
            cache.nativeSel ||
            (cache.nativeSel = DOM._4e_getWin(self.document).getSelection())
          );
        }
      : function () {
          var self = this,
            cache = self._.cache;
          return cache.nativeSel || (cache.nativeSel = self.document.selection);
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
     * @returns {number} One of the following constant values:
     *         SELECTION_NONE,  SELECTION_TEXT or
     *         SELECTION_ELEMENT.
     * @example
     * if ( editor.getSelection().<b>getType()</b> == SELECTION_TEXT )
     *     alert( 'Text is selected' );
     */
    getType: !OLD_IE
      ? function () {
          var self = this,
            cache = self._.cache;
          if (cache.type) return cache.type;

          var type = KES.SELECTION_TEXT,
            sel = self.getNative();

          if (!sel) type = KES.SELECTION_NONE;
          else if (sel.rangeCount == 1) {
            // Check if the actual selection is a control (IMG,
            // TABLE, HR, etc...).

            var range = sel.getRangeAt(0),
              startContainer = range.startContainer;

            if (
              startContainer == range.endContainer &&
              startContainer.nodeType == KEN.NODE_ELEMENT &&
              range.endOffset - range.startOffset === 1 &&
              styleObjectElements[
                startContainer.childNodes[
                  range.startOffset
                ].nodeName.toLowerCase()
              ]
            ) {
              type = KES.SELECTION_ELEMENT;
            }
          }

          return (cache.type = type);
        }
      : function () {
          var self = this,
            cache = self._.cache;
          if (cache.type) return cache.type;

          var type = KES.SELECTION_NONE;

          try {
            var sel = self.getNative(),
              ieType = sel.type;

            if (ieType == 'Text') type = KES.SELECTION_TEXT;

            if (ieType == 'Control') type = KES.SELECTION_ELEMENT;

            // It is possible that we can still get a text range
            // object even when type == 'None' is returned by IE.
            // So we'd better check the object returned by
            // createRange() rather than by looking at the type.
            //当前一个操作选中文本，后一个操作右键点了字串中间就会出现了
            if (sel.createRange().parentElement) type = KES.SELECTION_TEXT;
          } catch (e) {}

          return (cache.type = type);
        },

    getRanges: OLD_IE
      ? (function () {
          // Finds the container and offset for a specific boundary
          // of an IE range.
          /**
           *
           * @param {TextRange} range
           * @param {boolean=} start
           */
          var getBoundaryInformation = function (range, start) {
            // Creates a collapsed range at the requested boundary.
            range = range.duplicate();
            range.collapse(start);

            // Gets the element that encloses the range entirely.
            var parent = range.parentElement(),
              siblings = parent.childNodes,
              testRange;

            for (var i = 0; i < siblings.length; i++) {
              var child = siblings[i];

              if (child.nodeType == KEN.NODE_ELEMENT) {
                testRange = range.duplicate();

                testRange.moveToElementText(child);

                var comparisonStart = testRange.compareEndPoints(
                    'StartToStart',
                    range,
                  ),
                  comparisonEnd = testRange.compareEndPoints(
                    'EndToStart',
                    range,
                  );

                testRange.collapse();
                //中间有其他标签
                if (comparisonStart > 0) break;
                // When selection stay at the side of certain self-closing elements, e.g. BR,
                // our comparison will never shows an equality. (#4824)
                else if (
                  !comparisonStart ||
                  (comparisonEnd == 1 && comparisonStart == -1)
                )
                  return { container: parent, offset: i };
                else if (!comparisonEnd)
                  return { container: parent, offset: i + 1 };

                testRange = NULL;
              }
            }

            if (!testRange) {
              testRange = range.duplicate();
              testRange.moveToElementText(parent);
              testRange.collapse(FALSE);
            }

            testRange.setEndPoint('StartToStart', range);
            // IE report line break as CRLF with range.text but
            // only LF with textnode.nodeValue, normalize them to avoid
            // breaking character counting logic below. (#3949)
            var distance = testRange.text.replace(/\r\n|\r/g, '\n').length;

            try {
              while (distance > 0)
                //bug? 可能不是文本节点 nodeValue undefined
                //永远不会出现 textnode<img/>textnode
                //停止时，前面一定为textnode
                distance -= siblings[--i].nodeValue.length;
            } catch (e) {
              // Measurement in IE could be somtimes wrong because of <select> element. (#4611)
              distance = 0;
            }

            if (distance === 0) {
              return {
                container: parent,
                offset: i,
              };
            } else {
              return {
                container: siblings[i],
                offset: -distance,
              };
            }
          };

          return function () {
            var self = this,
              cache = self._.cache;
            if (cache.ranges) return cache.ranges;

            // IE doesn't have range support (in the W3C way), so we
            // need to do some magic to transform selections into
            // CKEDITOR.dom.range instances.

            var sel = self.getNative(),
              nativeRange = sel && sel.createRange(),
              type = self.getType(),
              range;

            if (!sel) return [];

            if (type == KES.SELECTION_TEXT) {
              range = new KERange(self.document);
              var boundaryInfo = getBoundaryInformation(nativeRange, TRUE);
              range.setStart(
                new Node(boundaryInfo.container),
                boundaryInfo.offset,
              );
              boundaryInfo = getBoundaryInformation(nativeRange);
              range.setEnd(
                new Node(boundaryInfo.container),
                boundaryInfo.offset,
              );
              return (cache.ranges = [range]);
            } else if (type == KES.SELECTION_ELEMENT) {
              var retval = (cache.ranges = []);

              for (var i = 0; i < nativeRange.length; i++) {
                var element = nativeRange.item(i),
                  parentElement = element.parentNode,
                  j = 0;

                range = new KERange(self.document);

                for (
                  ;
                  j < parentElement.childNodes.length &&
                  parentElement.childNodes[j] != element;
                  j++
                ) {
                  /*jsl:pass*/
                }

                range.setStart(new Node(parentElement), j);
                range.setEnd(new Node(parentElement), j + 1);
                retval.push(range);
              }

              return retval;
            }

            return (cache.ranges = []);
          };
        })()
      : function () {
          var self = this,
            cache = self._.cache;
          if (cache.ranges) return cache.ranges;

          // On browsers implementing the W3C range, we simply
          // tranform the native ranges in CKEDITOR.dom.range
          // instances.

          var ranges = [],
            sel = self.getNative();

          if (!sel) return [];

          for (var i = 0; i < sel.rangeCount; i++) {
            var nativeRange = sel.getRangeAt(i),
              range = new KERange(self.document);

            range.setStart(
              new Node(nativeRange.startContainer),
              nativeRange.startOffset,
            );
            range.setEnd(
              new Node(nativeRange.endContainer),
              nativeRange.endOffset,
            );
            ranges.push(range);
          }

          return (cache.ranges = ranges);
        },

    /**
     * Gets the DOM element in which the selection starts.
     * @returns {KISSY.Node} The element at the beginning of the
     *        selection.
     * @example
     * var element = editor.getSelection().<b>getStartElement()</b>;
     * alert( element._4e_name() );
     */
    getStartElement: function () {
      var self = this,
        cache = self._.cache;
      if (cache.startElement !== undefined) return cache.startElement;

      var node,
        sel = self.getNative();

      switch (self.getType()) {
        case KES.SELECTION_ELEMENT:
          return this.getSelectedElement();

        case KES.SELECTION_TEXT:
          var range = self.getRanges()[0];

          if (range) {
            if (!range.collapsed) {
              range.optimize();

              // Decrease the range content to exclude particial
              // selected node on the start which doesn't have
              // visual impact. ( #3231 )
              while (TRUE) {
                var startContainer = range.startContainer,
                  startOffset = range.startOffset;
                // Limit the fix only to non-block elements.(#3950)
                if (
                  startOffset ==
                    (startContainer[0].nodeType === KEN.NODE_ELEMENT
                      ? startContainer[0].childNodes.length
                      : startContainer[0].nodeValue.length) &&
                  !startContainer._4e_isBlockBoundary()
                )
                  range.setStartAfter(startContainer);
                else break;
              }

              node = range.startContainer;

              if (node[0].nodeType != KEN.NODE_ELEMENT) return node.parent();

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

          if (OLD_IE) {
            range = sel.createRange();
            range.collapse(TRUE);
            node = range.parentElement();
          } else {
            node = sel.anchorNode;
            if (node && node.nodeType != KEN.NODE_ELEMENT)
              node = node.parentNode;
          }
      }

      return (cache.startElement = node ? DOM._4e_wrap(node) : NULL);
    },

    /**
     * Gets the current selected element.
     * @returns {KISSY.Node} The selected element. Null if no
     *        selection is available or the selection type is not
     *       SELECTION_ELEMENT.
     * @example
     * var element = editor.getSelection().<b>getSelectedElement()</b>;
     * alert( element._4e_name() );
     */
    getSelectedElement: function () {
      var self = this,
        node,
        cache = self._.cache;
      if (cache.selectedElement !== undefined) return cache.selectedElement;

      // Is it native IE control type selection?

      if (OLD_IE) {
        var range = self.getNative().createRange();
        node = range.item && range.item(0);
      } // Figure it out by checking if there's a single enclosed
      // node of the range.
      if (!node) {
        node = (function () {
          var range = self.getRanges()[0],
            enclosed,
            selected;

          // Check first any enclosed element, e.g. <ul>[<li><a href="#">item</a></li>]</ul>
          //脱两层？？2是啥意思？
          for (
            var i = 2;
            i &&
            !(
              (enclosed = range.getEnclosedNode()) &&
              enclosed[0].nodeType == KEN.NODE_ELEMENT &&
              //某些值得这么多的元素？？
              styleObjectElements[enclosed._4e_name()] &&
              (selected = enclosed)
            );
            i--
          ) {
            // Then check any deep wrapped element, e.g. [<b><i><img /></i></b>]
            //一下子退到底  ^<a><span><span><img/></span></span></a>^
            // ->
            //<a><span><span>^<img/>^</span></span></a>
            range.shrink(KER.SHRINK_ELEMENT);
          }

          return selected && selected[0];
        })();
      }

      return (cache.selectedElement = DOM._4e_wrap(node));
    },

    reset: function () {
      this._.cache = {};
    },

    selectElement: function (element) {
      var range,
        self = this,
        doc = self.document;
      if (OLD_IE) {
        //do not use empty()，编辑器内滚动条重置了
        //选择的 img 内容前后莫名被清除
        //self.getNative().empty();
        try {
          // Try to select the node as a control.
          range = doc.body['createControlRange']();
          range['addElement'](element[0]);
          range.select();
        } catch (e) {
          // If failed, select it as a text range.
          range = doc.body.createTextRange();
          range.moveToElementText(element[0]);
          range.select();
        } finally {
          //this.document.fire('selectionchange');
        }
        self.reset();
      } else {
        // Create the range for the element.
        range = doc.createRange();
        range.selectNode(element[0]);
        // Select the range.
        var sel = self.getNative();
        sel.removeAllRanges();
        sel.addRange(range);
        self.reset();
      }
    },

    selectRanges: function (ranges) {
      var self = this;
      if (OLD_IE) {
        if (ranges.length > 1) {
          // IE doesn't accept multiple ranges selection, so we join all into one.
          var last = ranges[ranges.length - 1];
          ranges[0].setEnd(last.endContainer, last.endOffset);
          ranges.length = 1;
        }

        // IE doesn't accept multiple ranges selection, so we just
        // select the first one.
        if (ranges[0]) ranges[0].select();

        self.reset();
      } else {
        var sel = self.getNative();
        if (!sel) return;
        sel.removeAllRanges();
        for (var i = 0; i < ranges.length; i++) {
          var range = ranges[i],
            nativeRange = self.document.createRange(),
            startContainer = range.startContainer;

          // In FF2, if we have a collapsed range, inside an empty
          // element, we must add something to it otherwise the caret
          // will not be visible.
          if (
            range.collapsed &&
            UA.gecko &&
            UA.gecko < 1.09 &&
            startContainer[0].nodeType == KEN.NODE_ELEMENT &&
            !startContainer[0].childNodes.length
          ) {
            startContainer[0].appendChild(self.document.createTextNode(''));
          }
          nativeRange.setStart(startContainer[0], range.startOffset);
          nativeRange.setEnd(range.endContainer[0], range.endOffset);
          // Select the range.
          sel.addRange(nativeRange);
        }
        self.reset();
      }
    },
    createBookmarks2: function (normalized) {
      var bookmarks = [],
        ranges = this.getRanges();

      for (var i = 0; i < ranges.length; i++)
        bookmarks.push(ranges[i].createBookmark2(normalized));

      return bookmarks;
    },
    createBookmarks: function (serializable, ranges) {
      var self = this,
        retval = [],
        doc = self.document,
        bookmark;
      ranges = ranges || self.getRanges();
      var length = ranges.length;
      for (var i = 0; i < length; i++) {
        retval.push((bookmark = ranges[i].createBookmark(serializable, TRUE)));
        serializable = bookmark.serializable;

        var bookmarkStart = serializable
            ? S.one('#' + bookmark.startNode, doc)
            : bookmark.startNode,
          bookmarkEnd = serializable
            ? S.one('#' + bookmark.endNode, doc)
            : bookmark.endNode;

        // Updating the offset values for rest of ranges which have been mangled(#3256).
        for (var j = i + 1; j < length; j++) {
          var dirtyRange = ranges[j],
            rangeStart = dirtyRange.startContainer,
            rangeEnd = dirtyRange.endContainer;

          DOM._4e_equals(rangeStart, bookmarkStart.parent()) &&
            dirtyRange.startOffset++;
          DOM._4e_equals(rangeStart, bookmarkEnd.parent()) &&
            dirtyRange.startOffset++;
          DOM._4e_equals(rangeEnd, bookmarkStart.parent()) &&
            dirtyRange.endOffset++;
          DOM._4e_equals(rangeEnd, bookmarkEnd.parent()) &&
            dirtyRange.endOffset++;
        }
      }

      return retval;
    },

    selectBookmarks: function (bookmarks) {
      var self = this,
        ranges = [];
      for (var i = 0; i < bookmarks.length; i++) {
        var range = new KERange(self.document);
        range.moveToBookmark(bookmarks[i]);
        ranges.push(range);
      }
      self.selectRanges(ranges);
      return self;
    },

    getCommonAncestor: function () {
      var ranges = this.getRanges(),
        startNode = ranges[0].startContainer,
        endNode = ranges[ranges.length - 1].endContainer;
      return startNode._4e_commonAncestor(endNode);
    },

    // Moving scroll bar to the current selection's start position.
    scrollIntoView: function () {
      // If we have split the block, adds a temporary span at the
      // range position and scroll relatively to it.
      var start = this.getStartElement();
      start && start._4e_scrollIntoView();
    },
    removeAllRanges: function () {
      var sel = this.getNative();
      if (!OLD_IE) {
        sel && sel.removeAllRanges();
      } else {
        sel && sel.clear();
      }
    },
  });

  var nonCells = { table: 1, tbody: 1, tr: 1 },
    notWhitespaces = Walker.whitespaces(TRUE),
    fillerTextRegex = /\ufeff|\u00a0/;
  KERange.prototype['select'] = KERange.prototype.select = !OLD_IE
    ? function () {
        var self = this,
          startContainer = self.startContainer;

        // If we have a collapsed range, inside an empty element, we must add
        // something to it, otherwise the caret will not be visible.
        if (
          self.collapsed &&
          startContainer[0].nodeType == KEN.NODE_ELEMENT &&
          !startContainer[0].childNodes.length
        )
          startContainer[0].appendChild(self.document.createTextNode(''));

        var nativeRange = self.document.createRange();
        nativeRange.setStart(startContainer[0], self.startOffset);

        try {
          nativeRange.setEnd(self.endContainer[0], self.endOffset);
        } catch (e) {
          // There is a bug in Firefox implementation (it would be too easy
          // otherwise). The new start can't be after the end (W3C says it can).
          // So, let's create a new range and collapse it to the desired point.
          if (e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0) {
            self.collapse(TRUE);
            nativeRange.setEnd(self.endContainer[0], self.endOffset);
          } else throw e;
        }

        var selection = getSelection(self.document).getNative();
        selection.removeAllRanges();
        selection.addRange(nativeRange);
      } // V2
    : function (forceExpand) {
        var self = this,
          collapsed = self.collapsed,
          isStartMarkerAlone,
          dummySpan;
        //选的是元素，直接使用selectElement
        //还是有差异的，特别是img选择框问题
        if (
          self.startContainer[0] === self.endContainer[0] &&
          self.endOffset - self.startOffset == 1
        ) {
          var selEl = self.startContainer[0].childNodes[self.startOffset];
          if (selEl.nodeType == KEN.NODE_ELEMENT) {
            new KESelection(self.document).selectElement(new Node(selEl));
            return;
          }
        }
        // IE doesn't support selecting the entire table row/cell, move the selection into cells, e.g.
        // <table><tbody><tr>[<td>cell</b></td>... => <table><tbody><tr><td>[cell</td>...
        if (
          (self.startContainer[0].nodeType == KEN.NODE_ELEMENT &&
            self.startContainer._4e_name() in nonCells) ||
          (self.endContainer[0].nodeType == KEN.NODE_ELEMENT &&
            self.endContainer._4e_name() in nonCells)
        ) {
          self.shrink(KER.SHRINK_ELEMENT, TRUE);
        }

        var bookmark = self.createBookmark(),
          // Create marker tags for the start and end boundaries.
          startNode = bookmark.startNode,
          endNode;
        if (!collapsed) endNode = bookmark.endNode;

        // Create the main range which will be used for the selection.
        var ieRange = self.document.body.createTextRange();

        // Position the range at the start boundary.
        ieRange.moveToElementText(startNode[0]);
        //跳过开始 bookmark 标签
        ieRange.moveStart('character', 1);

        if (endNode) {
          // Create a tool range for the end.
          var ieRangeEnd = self.document.body.createTextRange();
          // Position the tool range at the end.
          ieRangeEnd.moveToElementText(endNode[0]);
          // Move the end boundary of the main range to match the tool range.
          ieRange.setEndPoint('EndToEnd', ieRangeEnd);
          ieRange.moveEnd('character', -1);
        } else {
          // The isStartMarkerAlone logic comes from V2. It guarantees that the lines
          // will expand and that the cursor will be blinking on the right place.
          // Actually, we are using this flag just to avoid using this hack in all
          // situations, but just on those needed.
          var next = startNode[0].nextSibling;
          while (next && !notWhitespaces(next)) {
            next = next.nextSibling;
          }
          isStartMarkerAlone =
            !(
              next &&
              next.nodeValue &&
              next.nodeValue.match(fillerTextRegex)
            ) && // already a filler there?
            (forceExpand ||
              !startNode[0].previousSibling ||
              (startNode[0].previousSibling &&
                DOM._4e_name(startNode[0].previousSibling) == 'br'));

          // Append a temporary <span>&#65279;</span> before the selection.
          // This is needed to avoid IE destroying selections inside empty
          // inline elements, like <b></b> (#253).
          // It is also needed when placing the selection right after an inline
          // element to avoid the selection moving inside of it.
          dummySpan = new Node(self.document.createElement('span'));
          dummySpan.html('&#65279;'); // Zero Width No-Break Space (U+FEFF). See #1359.
          dummySpan.insertBefore(startNode);
          if (isStartMarkerAlone) {
            // To expand empty blocks or line spaces after <br>, we need
            // instead to have any char, which will be later deleted using the
            // selection.
            // \ufeff = Zero Width No-Break Space (U+FEFF). (#1359)
            DOM.insertBefore(self.document.createTextNode('\ufeff'), startNode);
          }
        }

        // Remove the markers (reset the position, because of the changes in the DOM tree).
        self.setStartBefore(startNode);
        startNode._4e_remove();

        if (collapsed) {
          if (isStartMarkerAlone) {
            // Move the selection start to include the temporary \ufeff.
            ieRange.moveStart('character', -1);
            ieRange.select();
            // Remove our temporary stuff.
            self.document.selection.clear();
          } else ieRange.select();
          if (dummySpan) {
            self.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
            dummySpan._4e_remove();
          }
        } else {
          self.setEndBefore(endNode);
          endNode._4e_remove();
          ieRange.select();
        }
        // this.document.fire('selectionchange');
      };

  function getSelection(doc) {
    var sel = new KESelection(doc);
    return !sel || sel.isInvalid ? NULL : sel;
  }

  KESelection.getSelection = getSelection;

  /**
   * 监控选择区域变化
   * @param editor
   */
  function monitorAndFix(editor) {
    var doc = editor.document,
      body = new Node(doc.body),
      html = new Node(doc.documentElement);

    if (UA.ie) {
      //ie 焦点管理不行 (ie9 也不行) ,编辑器 iframe 失去焦点，选择区域/光标位置也丢失了
      //ie中事件都是同步，focus();xx(); 会立即触发事件处理函数，然后再运行xx();

      // In IE6/7 the blinking cursor appears, but contents are
      // not editable. (#5634)
      //终于和ck同步了，我也发现了这个bug，哈哈,ck3.3.2解决
      if (
        UA.ie < 8 ||
        //ie8 的 7 兼容模式
        document['documentMode'] == 7
      ) {
        // The 'click' event is not fired when clicking the
        // scrollbars, so we can use it to check whether
        // the empty space following <body> has been clicked.
        html.on('click', function (evt) {
          var t = new Node(evt.target);
          if (t._4e_name() === 'html')
            editor.getSelection().getRanges()[0].select();
        });
      }

      // Other browsers don't loose the selection if the
      // editor document loose the focus. In IE, we don't
      // have support for it, so we reproduce it here, other
      // than firing the selection change event.

      var savedRange,
        saveEnabled,
        //2010-10-08 import from ckeditor 3.4.1
        //ie 点击(mousedown-focus-mouseup)空白处，不保留原有的 selection
        restoreEnabled = 1;

      // Listening on document element ensures that
      // scrollbar is included. (#5280)
      html.on('mousedown', function () {
        // Lock restore selection now, as we have
        // a followed 'click' event which introduce
        // new selection. (#5735)
        //点击时不要恢复了，点击就意味着原来的选择区域作废
        restoreEnabled = 0;
      });

      html.on('mouseup', function () {
        restoreEnabled = 1;
      });
      //事件顺序
      // 1.body mousedown
      // 2.html mousedown
      // body  blur
      // window blur
      // 3.body focusin
      // 4.body focus
      // 5.window focus
      // 6.body mouseup
      // 7.body mousedown
      // 8.body click
      // 9.html click
      // 10.doc click

      // "onfocusin" is fired before "onfocus". It makes it
      // possible to restore the selection before click
      // events get executed.
      body.on('focusin', function (evt) {
        var t = new Node(evt.target);
        //S.log(restoreEnabled);
        // If there are elements with layout they fire this event but
        // it must be ignored to allow edit its contents #4682
        if (t._4e_name() != 'body') return;

        // If we have saved a range, restore it at this
        // point.
        if (savedRange) {
          // Well not break because of this.
          try {
            //S.log("body focusin");
            restoreEnabled && savedRange.select();
          } catch (e) {}

          savedRange = NULL;
        }
      });

      body.on('focus', function () {
        //S.log("body focus");
        // Enable selections to be saved.
        saveEnabled = TRUE;
        saveSelection();
      });

      body.on('beforedeactivate', function (evt) {
        // Ignore this event if it's caused by focus switch between
        // internal editable control type elements, e.g. layouted paragraph. (#4682)
        if (evt.relatedTarget) return;

        // Disable selections from being saved.
        saveEnabled = FALSE;
        restoreEnabled = 1;
      });

      // IE before version 8 will leave cursor blinking inside the document after
      // editor blurred unless we clean up the selection. (#4716)
      //if (UA.ie < 8) {
      Event.on(DOM._4e_getWin(doc), 'blur', function () {
        //把选择区域与光标清除
        doc && doc.selection.empty();
      });
      /*
             Event.on(body, 'blur', function() {
             S.log("body blur");
             });

             Event.on(DOM._4e_getWin(doc), 'focus', function() {
             S.log("win focus");
             });
             Event.on(doc, 'click', function() {
             S.log("doc click");
             });
             body.on('click', function() {
             S.log("body click");
             });
             html.on('click', function() {
             S.log("html click");
             });*/
      //}

      // IE fires the "selectionchange" event when clicking
      // inside a selection. We don't want to capture that.
      body.on('mousedown', function () {
        //S.log("body mousedown");
        disableSave();
      });
      body.on('mouseup', function () {
        //S.log("body mouseup");
        saveEnabled = TRUE;
        setTimeout(function () {
          saveSelection(TRUE);
        }, 0);
      });
      function disableSave() {
        saveEnabled = FALSE;
        //S.log("disableSave");
      }

      /**
       *
       * @param {boolean=} testIt
       */
      function saveSelection(testIt) {
        //S.log("saveSelection");
        if (saveEnabled) {
          var doc = editor.document,
            sel = editor.getSelection(),
            type = sel && sel.getType(),
            nativeSel = sel && sel.getNative();

          // There is a very specific case, when clicking
          // inside a text selection. In that case, the
          // selection collapses at the clicking point,
          // but the selection object remains in an
          // unknown state, making createRange return a
          // range at the very start of the document. In
          // such situation we have to test the range, to
          // be sure it's valid.
          //右键时，若前一个操作选中，则该次一直为None
          if (testIt && nativeSel && type == KES.SELECTION_NONE) {
            // The "InsertImage" command can be used to
            // test whether the selection is good or not.
            // If not, it's enough to give some time to
            // IE to put things in order for us.
            if (!doc['queryCommandEnabled']('InsertImage')) {
              setTimeout(function () {
                //S.log("retry");
                saveSelection(TRUE);
              }, 50);
              return;
            }
          }

          // Avoid saving selection from within text input. (#5747)
          var parentTag;
          if (
            nativeSel &&
            type == KES.SELECTION_TEXT &&
            (parentTag = DOM._4e_name(sel.getStartElement())) &&
            parentTag in { input: 1, textarea: 1 }
          ) {
            return;
          }
          savedRange = nativeSel && sel.getRanges()[0];
          editor._monitor();
        }
      }

      body.on('keydown', disableSave);
      body.on('keyup', function () {
        saveEnabled = TRUE;
        saveSelection();
      });

      // IE is the only to provide the "selectionchange"
      // event.
      // 注意：ie右键短暂点击并不能改变选择范围
      Event.on(doc, 'selectionchange', saveSelection);
    } else {
      // In other browsers, we make the selection change
      // check based on other events, like clicks or keys
      // press.
      Event.on(doc, 'mouseup', editor._monitor, editor);
      Event.on(doc, 'keyup', editor._monitor, editor);
    }

    // List of elements in which has no way to move editing focus outside.
    var nonExitableElementNames = { table: 1, pre: 1 };

    // Matching an empty paragraph at the end of document.
    var emptyParagraphRegexp =
      /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;)?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;

    function isBlankParagraph(block) {
      return block._4e_outerHtml().match(emptyParagraphRegexp);
    }

    var isNotWhitespace = KE.Walker.whitespaces(TRUE); //,
    //isNotBookmark = KE.Walker.bookmark(FALSE, TRUE);

    /**
     * 如果选择了body下面的直接inline元素，则新建p
     */
    editor.on('selectionChange', function (ev) {
      var path = ev.path,
        selection = ev.selection,
        range = selection && selection.getRanges()[0],
        blockLimit = path.blockLimit;

      if (!range || !range.collapsed || path.block) return;

      if (blockLimit._4e_name() == 'body') {
        var fixedBlock = range.fixBlock(TRUE, 'p');
        //firefox选择区域变化时自动添加空行，不要出现裸的text
        if (isBlankParagraph(fixedBlock)) {
          var element = fixedBlock._4e_next(isNotWhitespace);

          if (
            element &&
            element[0].nodeType == KEN.NODE_ELEMENT &&
            !nonExitableElementNames[element._4e_name()]
          ) {
            range.moveToElementEditablePosition(element);
            fixedBlock._4e_remove();
          } else {
            element = fixedBlock._4e_previous(isNotWhitespace);
            if (
              element &&
              element[0].nodeType == KEN.NODE_ELEMENT &&
              !nonExitableElementNames[element._4e_name()]
            ) {
              range.moveToElementEditablePosition(
                element,
                //空行的话还是要移到开头的
                isBlankParagraph(element) ? FALSE : TRUE,
              );
              fixedBlock._4e_remove();
            }
          }
        }
        range.select();
        if (!OLD_IE) {
          //选择区域变了，通知其他插件更新状态
          editor.notifySelectionChange();
        }
      }
    });
  }

  KE.Selection = KESelection;
  KE['Selection'] = KESelection;
  var SelectionP = KESelection.prototype;
  KE.Utils.extern(SelectionP, {
    getNative: SelectionP.getNative,
    getType: SelectionP.getType,
    getRanges: SelectionP.getRanges,
    getStartElement: SelectionP.getStartElement,
    getSelectedElement: SelectionP.getSelectedElement,
    reset: SelectionP.reset,
    selectElement: SelectionP.selectElement,
    selectRanges: SelectionP.selectRanges,
    createBookmarks2: SelectionP.createBookmarks2,
    createBookmarks: SelectionP.createBookmarks,
    getCommonAncestor: SelectionP.getCommonAncestor,
    scrollIntoView: SelectionP.scrollIntoView,
    selectBookmarks: SelectionP.selectBookmarks,
    removeAllRanges: SelectionP.removeAllRanges,
  });

  KE.on('instanceCreated', function (ev) {
    var editor = ev.editor;
    monitorAndFix(editor);
  });
});
