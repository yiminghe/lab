import getCaretPosition from './getCaretPosition.js';
import {
  activeOverlayStyle,
  cursorStyle,
  inActiveOverlayStyle,
  selectionOverlayStyle,
} from './constants.js';
import {
  closest,
  constrain,
  getEqDatasetQuery,
  eqDataset,
  isTextNode,
  findNodesInBlock,
  px,
  setDataset,
  extendSelection,
  isVoidSelected,
} from './utils.js';

function nativeCaretPositionFromPoint(clientX, clientY) {
  let range, offsetNode, offset;
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(clientX, clientY);
    offsetNode = range.startContainer;
    offset = range.startOffset;
  } else if (document.caretPositionFromPoint) {
    range = document.caretPositionFromPoint(clientX, clientY);
    offsetNode = range.offsetNode;
    offset = range.offset;
  } else {
    return null;
  }
  return {
    offsetNode,
    offset,
  };
}

function findMatchRect(rects, clientX) {
  let minDistance = +Infinity;
  let rect;
  for (const lowRect of rects) {
    const distance = Math.abs(lowRect.left - clientX);
    if (distance < minDistance) {
      rect = lowRect;
      minDistance = distance;
    }
  }
  return rect;
}

export default class Selection {
  constructor(props) {
    this.selection = null;
    this.props = props;
    const { container, textArea, underLayer, topLayer } = props;
    container.addEventListener('mousedown', this.onMouseDown);
    textArea.addEventListener('blur', this.blur);
    this.cursor = document.createElement('div');
    this.cursor.dataset.cursor = true;
    this.overlay = document.createElement('div');
    Object.assign(this.cursor.style, cursorStyle);
    this.visible = false;
    topLayer.appendChild(this.cursor);
    topLayer.appendChild(this.overlay);
  }

  closest(el, s) {
    return closest(el, s, this.props.content);
  }

  destroy() {
    const { container, textArea } = props;
    container.removeEventListener('mousedown', this.onMouseDown);
    textArea.removeEventListener('blur', this.blur);
  }

  startTimer() {
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }
    this.blinkTimer = setTimeout(this.blink, 500);
  }

  setCursor(visible) {
    if (this.visible !== visible) {
      this.cursor.style.opacity = visible ? 1 : 0;
      this.visible = visible;
    }
  }

  focus() {
    this.setCursor(true);
    this.startTimer();
  }

  blink = () => {
    this.setCursor(!this.visible);
    this.startTimer();
  };

  blur = () => {
    if (this.blinkTimer) {
      clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }
    this.setCursor(false);

    const lineDiv = Array.from(
      this.overlay.querySelectorAll('[data-selection-overlay]'),
    );
    lineDiv.forEach((line) => {
      Object.assign(line.style, inActiveOverlayStyle);
    });
  };

  destroy() {
    const { container } = props;
    container.removeEventListener('mousedown', this.onMouseDown);
  }

  findCursorPosition(event) {
    let { clientX, clientY } = event;
    const { content } = this.props;
    // const paragraphCssQuery = getEqDatasetQuery(paragraph);
    const ps = [content.firstElementChild, content.lastElementChild];
    const psRects = [].map.call(ps, (p) => p.getClientRects()[0]);
    const firstRect = psRects[0];
    const lastRect = psRects[psRects.length - 1];

    clientY = constrain(clientY, firstRect.top + 1, lastRect.bottom - 1);
    clientX = constrain(clientX, firstRect.left + 1, lastRect.right - 1);

    let p = document.elementFromPoint(clientX, clientY);

    if (p === content) {
      return {};
    }

    if (p.dataset && p.dataset.cursor) {
      return {};
    }

    let restoreOverlayDisplay = () => {};

    try {
      if (p.dataset?.selectionOverlay) {
        this.overlay.style.display = 'none';
        p = document.elementFromPoint(clientX, clientY);
        restoreOverlayDisplay = () => {
          this.overlay.style.display = '';
        };
      }

      const voidElement = this.closest(
        p,
        getEqDatasetQuery(this.props.datasetMap.void),
      );

      if (voidElement) {
        return {
          selection: {
            element: voidElement,
          },
        };
      }

      if (!p) {
        return {};
      }

      const caretPosition = nativeCaretPositionFromPoint(clientX, clientY);

      const { datasetMap } = this.props;

      if (caretPosition) {
        let { offsetNode, offset } = caretPosition;
        if (!isTextNode(offsetNode) && eqDataset(offsetNode, datasetMap.void)) {
          if (!eqDataset(offsetNode, datasetMap.inline)) {
            return {
              selection: {
                element: offsetNode,
              },
            };
          }
          const offsetBounding = offsetNode.getBoundingClientRect();
          const center = (offsetBounding.left + offsetBounding.right) / 2;
          if (clientX > center) {
            offsetNode = offsetNode.lastChild.firstChild;
            offset = 1;
          } else {
            offsetNode = offsetNode.firstChild.firstChild;
            offset = 0;
          }
          // console.log('focus inside void');
        }
        if (offsetNode.dataset && offsetNode.dataset.cursor) {
          return {};
        }
        const range = document.createRange();
        range.setStart(offsetNode, offset);
        range.setEnd(offsetNode, offset);
        // ff : auto underLayer will not return two
        let rect = findMatchRect(range.getClientRects(), clientX);
        if (!rect) {
          //rect = findMatchRect(range.getClientRects(), clientX);
          throw new Error('no rect');
        }
        return {
          rect,
          offsetNode,
          offset,
        };
      }
      return getCaretPosition(p, datasetMap, clientX, clientY);
    } finally {
      restoreOverlayDisplay();
    }
  }

  isCollapsed() {
    if (this.selection) {
      const { anchorNode, anchorOffset, focusNode, focusOffset } =
        this.selection;
      return (
        isTextNode(anchorNode) &&
        anchorNode === focusNode &&
        anchorOffset === focusOffset &&
        anchorNode === focusNode
      );
    }
    return false;
  }

  isBlockVoid(el) {
    return (
      el &&
      eqDataset(el, this.props.datasetMap.void) &&
      !eqDataset(el, this.props.datasetMap.inline)
    );
  }

  isInlineVoid(el) {
    return (
      el &&
      eqDataset(el, this.props.datasetMap.void) &&
      eqDataset(el, this.props.datasetMap.inline)
    );
  }

  draw() {
    const { overlay } = this;
    const { datasetMap, underLayer, topLayer } = this.props;
    this.blur();

    if (isVoidSelected(this.prevSelection)) {
      const prevFocusElement = extendSelection(this.prevSelection).focusElement;
      delete prevFocusElement.dataset[datasetMap.selected[0]];
    }

    if (this.isCollapsed()) {
      let { anchorRect } = this.selection;
      const topLayerRect = topLayer.getClientRects()[0];
      const cursorPos = {
        left: anchorRect.left - topLayerRect.left + 'px',
        top: anchorRect.top - topLayerRect.top + 'px',
        height: anchorRect.height + 'px',
        opacity: 1,
      };
      Object.assign(this.cursor.style, cursorPos);
      // const pRect = underLayer.getClientRects()[0];
      const left = anchorRect.left - topLayerRect.left;
      const top = anchorRect.top - topLayerRect.top;
      Object.assign(this.props.textArea.style, {
        left: left + 'px',
        top: top + 'px',
      });
      this.focus();
      if (overlay.firstElementChild) {
        overlay.innerHTML = '';
      }
    } else {
      let paragraphCssQuery = getEqDatasetQuery(datasetMap.paragraph);
      let {
        anchorNode,
        anchorOffset,
        focusNode,
        focusOffset,
        focusElement,
        anchorElement,
      } = extendSelection(this.selection);

      if (isVoidSelected(this.selection)) {
        if (overlay.firstElementChild) {
          overlay.innerHTML = '';
        }
        setDataset(focusElement, datasetMap.selected);
        return;
      }

      if (anchorNode === focusNode) {
        if (anchorOffset > focusOffset) {
          [anchorOffset, focusOffset] = [focusOffset, anchorOffset];
          [anchorElement, focusElement] = [focusElement, anchorElement];
        }
      } else if (
        focusElement.compareDocumentPosition(anchorElement) &
        Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        [anchorNode, anchorOffset, focusNode, focusOffset] = [
          focusNode,
          focusOffset,
          anchorNode,
          anchorOffset,
        ];
        [anchorElement, focusElement] = [focusElement, anchorElement];
      }

      let anchorBlock;
      let focusBlock;
      let nodes = [];

      if (this.isBlockVoid(anchorElement)) {
        anchorBlock = anchorElement;
        nodes.push(anchorElement);
      } else {
        anchorBlock = this.closest(anchorElement, paragraphCssQuery);
        nodes.push(
          ...findNodesInBlock(anchorBlock, datasetMap, {
            start: anchorElement,
            end: focusElement,
          }),
        );
      }

      if (this.isBlockVoid(focusElement)) {
        focusBlock = focusElement;
      } else {
        focusBlock = this.closest(focusElement, paragraphCssQuery);
      }

      if (anchorBlock !== focusBlock) {
        let nextBlock = anchorBlock.nextElementSibling;
        while (nextBlock !== focusBlock) {
          if (this.isBlockVoid(nextBlock)) {
            nodes.push(nextBlock);
          } else {
            if (!nextBlock || !nextBlock.querySelectorAll) {
              // debugger
            }
            nodes.push(
              nextBlock.querySelectorAll(
                `${getEqDatasetQuery(datasetMap.string)},${getEqDatasetQuery(
                  datasetMap.void,
                )}`,
              ),
            );
          }
          nextBlock = nextBlock.nextElementSibling;
        }
        if (this.isBlockVoid(focusElement)) {
          nodes.push(focusElement);
        } else {
          nodes.push(
            ...findNodesInBlock(focusBlock, datasetMap, { end: focusElement }),
          );
        }
      }

      if (isTextNode(anchorNode)) {
        if (focusNode !== anchorNode) {
          nodes[0] = {
            getClientRects() {
              const range = document.createRange();
              range.setStart(anchorNode, anchorOffset);
              range.setEnd(anchorNode, anchorNode.textContent.length);
              return range.getClientRects();
            },
          };
        } else {
          nodes[0] = {
            getClientRects() {
              const range = document.createRange();
              range.setStart(focusNode, anchorOffset);
              range.setEnd(focusNode, focusOffset);
              return range.getClientRects();
            },
          };
        }
      }
      if (isTextNode(focusNode) && focusNode !== anchorNode) {
        nodes[nodes.length - 1] = {
          getClientRects() {
            const range = document.createRange();
            range.setStart(focusNode, 0);
            range.setEnd(focusNode, focusOffset);
            return range.getClientRects();
          },
        };
      }

      const rects = [];
      for (const n of nodes) {
        rects.push(...n.getClientRects());
      }

      const lines = [];
      let currentLeft = undefined;
      let line;
      for (const rect of rects) {
        if (currentLeft === undefined) {
          line = {};
          line.left = rect.left;
          line.right = rect.right;
          line.top = rect.top;
          line.bottom = rect.bottom;
        } else if (rect.left >= currentLeft) {
          line.right = Math.max(line.right, rect.right);
          line.top = Math.min(line.top, rect.top);
          line.bottom = Math.max(line.bottom, rect.bottom);
        } else {
          lines.push(line);
          line = {};
          line.left = rect.left;
          line.right = rect.right;
          line.top = rect.top;
          line.bottom = rect.bottom;
        }
        currentLeft = line.right;
      }
      if (line) {
        lines.push(line);
      }

      const lineDiv = Array.from(
        overlay.querySelectorAll('[data-selection-overlay]'),
      );
      const diff = Math.abs(lineDiv.length - lines.length);
      if (diff) {
        if (lineDiv.length > lines.length) {
          for (let i = 0; i < diff; i++) {
            overlay.removeChild(lineDiv[lineDiv.length - i - 1]);
          }
          lineDiv.length = lines.length;
        } else {
          for (let i = 0; i < diff; i++) {
            const div = document.createElement('div');
            div.dataset.selectionOverlay = true;
            Object.assign(div.style, selectionOverlayStyle);
            overlay.appendChild(div);
            lineDiv.push(div);
          }
        }
      }

      const containerRect = topLayer.getClientRects()[0];

      lines.forEach((line, index) => {
        const dom = lineDiv[index];
        Object.assign(dom.style, activeOverlayStyle, {
          left: px(line.left - containerRect.left),
          top: px(line.top - containerRect.top),
          width: px(line.right - line.left),
          height: px(line.bottom - line.top),
        });
      });
    }
  }

  setSelection(selection) {
    this.prevSelection = this.selection;
    this.selection = selection;
  }

  onMouseDown = (event) => {
    event.preventDefault();
    this.props.textArea.focus({
      preventScroll: true,
    });
    const curorPositon = this.findCursorPosition(event);
    if (curorPositon.selection) {
      const voidElement = curorPositon.selection.element;
      const parentNode = voidElement.parentNode;
      const index = [].indexOf.call(parentNode.childNodes, voidElement);
      this.setSelection({
        anchorNode: parentNode,
        anchorOffset: index,
        focusNode: parentNode,
        focusOffset: index,
      });
    } else {
      const { rect, offsetNode } = curorPositon;
      if (offsetNode) {
        this.setSelection({
          anchorRect: rect,
          anchorNode: offsetNode,
          anchorOffset: curorPositon.offset,
          focusNode: offsetNode,
          focusOffset: curorPositon.offset,
        });
      } else {
        return;
      }
    }
    this.draw();
    this.startX = event.clientX;
    this.startY = event.clientY;
    container.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  onMouseMove = (event) => {
    const { selection } = this;
    let newFocusNode = selection.focusNode;
    let newFocusOffset = selection.focusOffset;
    let focusRect;
    const curorPositon = this.findCursorPosition(event);
    if (curorPositon.selection) {
      const voidElement = curorPositon.selection.element;
      const parentNode = voidElement.parentNode;
      const index = [].indexOf.call(parentNode.childNodes, voidElement);
      newFocusNode = parentNode;
      newFocusOffset = index;
      focusRect = undefined;
    }
    if (curorPositon.offsetNode) {
      newFocusNode = curorPositon.offsetNode;
      newFocusOffset = curorPositon.offset;
      focusRect = curorPositon.rect;
    }
    if (
      newFocusOffset !== selection.focusOffset ||
      newFocusNode !== selection.focusNode
    ) {
      const newSelection = {
        ...selection,
      };
      newSelection.focusOffset = newFocusOffset;
      newSelection.focusNode = newFocusNode;
      newSelection.focusRect = focusRect;
      this.setSelection(newSelection);
      this.draw();
    }
  };

  onMouseUp = () => {
    container.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
}
