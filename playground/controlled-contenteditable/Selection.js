import { findSortedIndexWithInRange } from './findSortedIndex.js';
import { activeOverlayStyle, cursorStyle, selectionOverlayStyle } from './constants.js';
import {
    closest,
    constrain,
    getEqDatasetQuery,
    eqDataset,
    sameSign,
    isTextNode,
    findNodesInBlock,
    px,
} from './utils.js';

function caretPositionFromPoint(clientX, clientY) {
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
        //textArea.addEventListener('blur', this.blur);
        this.cursor = document.createElement('div');
        this.cursor.dataset.cursor = true;
        this.overlay = document.createElement('div');
        Object.assign(this.cursor.style, cursorStyle);
        this.visible = false;
        topLayer.appendChild(this.cursor);
        underLayer.appendChild(this.overlay);
    }

    closest(el, s) {
        return closest(el, s, this.props.content)
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

    focus() {
        this.visible = true;
        this.startTimer();
    }

    blink = () => {
        this.cursor.style.opacity = this.visible ? 1 : 0;
        this.visible = !this.visible;
        this.startTimer();
    }

    blur = () => {
        if (this.blinkTimer) {
            clearTimeout(this.blinkTimer);
            this.blinkTimer = null;
        }
        this.cursor.style.opacity = 0;
        this.visible = false;
    }

    destroy() {
        const { container } = props;
        container.removeEventListener('mousedown', this.onMouseDown);
    }

    findTextSpan(textSpans, clientX, clientY) {
        let find;
        let findRect;
        let minDistance = undefined;
        let minHorizon = undefined;

        for (const textSpan of textSpans) {
            const rects = textSpan.getClientRects();
            for (const rect of rects) {
                let distance;
                let horizonDistance;
                if (clientY <= rect.bottom && clientY >= rect.top) {
                    distance = 0;
                } else {
                    distance = clientY - rect.top;
                }
                horizonDistance = Math.min(Math.abs(clientX - rect.left), Math.abs(clientX - rect.right));
                const check = () => {
                    minHorizon = horizonDistance;
                    minDistance = distance;
                    find = textSpan;
                    findRect = rect;
                };
                if (minDistance === undefined) {
                    check();
                } else if (minDistance === distance) {
                    if (horizonDistance < minHorizon) {
                        check();
                    }
                } else if (sameSign(distance, minDistance)) {
                    if (distance > 0 && distance < minDistance) {
                        check()
                    } else if (distance < 0 && distance > minDistance) {
                        check();
                    }
                } else if (minDistance && distance < minDistance) {
                    check();
                }
            }
        }

        return {
            textSpan: find,
            rect: findRect,
        };
    }

    findCursorPosition(event) {
        let { clientX, clientY } = event;
        const { paragraph, string, } = this.props.datasetMap;
        const { content } = this.props;
        // const paragraphCssQuery = getEqDatasetQuery(paragraph);
        const ps = [content.firstElementChild, content.lastElementChild];
        const psRects = [].map.call(ps, p => p.getClientRects()[0]);
        const firstRect = psRects[0];
        const lastRect = psRects[psRects.length - 1];

        clientY = constrain(clientY, firstRect.top + 1, lastRect.bottom - 1,);
        clientX = constrain(clientX, firstRect.left + 1, lastRect.right - 1,);

        const p = document.elementFromPoint(clientX, clientY);

        if (p === content) {
            return {};
        }

        if (p.dataset && (p.dataset.cursor || p.dataset.selectionOverlay)) {
            return {};
        }

        const voidElement = this.closest(p, getEqDatasetQuery(this.props.datasetMap.void));

        if (voidElement) {
            return {
                selection: {
                    element: voidElement,
                }
            };
        }

        if (!p) {
            return {};
        }

        const caretPosition = caretPositionFromPoint(clientX, clientY);

        const { datasetMap } = this.props;

        if (caretPosition) {
            let { offsetNode, offset } = caretPosition;
            if (!isTextNode(offsetNode) && eqDataset(offsetNode, datasetMap.void)) {
                if (!eqDataset(offsetNode, datasetMap.inline)) {
                    return {
                        selection: {
                            element: offsetNode,
                        }
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

        if (p.textContent === '\ufeff') {
            const textNode = p.firstChild;
            let range = document.createRange();
            range.setStart(textNode, 0);
            range.setEnd(textNode, 0);
            const rect = range.getClientRects()[0];
            return {
                offsetNode: textNode,
                rect,
                offset: 0,
            };
        } else {
            let textSpan;

            if (eqDataset(p, string)) {
                textSpan = p;
            } else {
                const textSpans = p.querySelectorAll(getEqDatasetQuery(string));
                const findedTextSpan = this.findTextSpan(textSpans, clientX, clientY);
                textSpan = findedTextSpan.textSpan;
                const findRect = findedTextSpan.rect;
                clientY = constrain(clientY, findRect.top + 1, findRect.bottom - 1);
            }

            if (!textSpan) {
                throw new Error('invalid target', p);
            }

            const textNode = textSpan.firstChild;

            const findedTextIndex = findSortedIndexWithInRange(0, textNode.textContent.length, (offset) => {
                const range = document.createRange();
                range.setStart(textNode, offset);
                range.setEnd(textNode, offset);
                const rect = range.getClientRects()[0];

                if (clientY < rect.top) {
                    return 1;
                }
                if (clientY > rect.bottom) {
                    return -1;
                }
                if (clientX > rect.right) {
                    return -1;
                }
                if (clientX < rect.left) {
                    return 1;
                }
                return 0;
            });

            let { index } = findedTextIndex;
            const range = document.createRange();
            range.setStart(textNode, index);
            range.setEnd(textNode, index);
            let rect = range.getClientRects()[0];
            if (!findedTextIndex.result && index) {
                const range = document.createRange();
                range.setStart(textNode, index - 1);
                range.setEnd(textNode, index - 1);
                // chrome: auto underLayer will return two
                const lowRects = range.getClientRects();
                let minDistance = Math.abs(rect.left - clientX);
                let lowIndex = index - 1;
                for (const lowRect of lowRects) {
                    const distance = Math.abs(lowRect.left - clientX);
                    if (distance < minDistance) {
                        rect = lowRect;
                        minDistance = distance;
                        index = lowIndex;
                    }
                }
            }

            return {
                rect,
                offsetNode: textNode,
                offset: index,
            };
        }
    }

    isCollapsed() {
        if (this.selection) {
            const { anchorNode, anchorOffset, focusNode, focusOffset } = this.selection;
            return isTextNode(anchorNode) && isTextNode(focusNode) && anchorNode === focusNode && anchorOffset === focusOffset && anchorNode === focusNode;
        }
        return false;
    }

    isBlockVoid(el) {
        return el && eqDataset(el, this.props.datasetMap.void) && (!eqDataset(el, this.props.datasetMap.inline));
    }

    isInlineVoid(el) {
        return el && eqDataset(el, this.props.datasetMap.void) && (eqDataset(el, this.props.datasetMap.inline));
    }

    draw() {
        const { overlay } = this;
        const { datasetMap, underLayer, topLayer } = this.props;
        if (this.isCollapsed()) {
            let { anchorRect } = this.selection;
            const topLayerRect = topLayer.getClientRects()[0];

            this.blur();
            const cursorPos = {
                left: anchorRect.left - topLayerRect.left + 'px',
                top: anchorRect.top - topLayerRect.top + 'px',
                height: anchorRect.height + 'px',
                opacity: 1,
            };
            Object.assign(this.cursor.style, cursorPos);
            const pRect = underLayer.getClientRects()[0];
            const left = anchorRect.left - pRect.left;
            const top = anchorRect.top - pRect.top;
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
            this.blur();
            let { anchorNode, anchorOffset, focusNode, focusOffset } = this.selection;

            let anchorElement = anchorNode;
            if (!isTextNode(anchorElement)) {
                anchorElement = anchorNode.childNodes[anchorOffset];
            }
            let focusElement = focusNode;
            if (!isTextNode(focusElement)) {
                focusElement = focusNode.childNodes[focusOffset];
            }

            if (anchorNode === focusNode) {
                if (anchorOffset > focusOffset) {
                    [anchorOffset, focusOffset] = [focusOffset, anchorOffset];
                    [anchorElement, focusElement] = [focusElement, anchorElement];
                }
            } else if (focusElement.compareDocumentPosition(anchorElement) & Node.DOCUMENT_POSITION_FOLLOWING) {
                [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
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
                nodes.push(...findNodesInBlock(anchorBlock, datasetMap, { start: anchorElement, end: focusElement }));
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
                            debugger
                        }
                        nodes.push(nextBlock.querySelectorAll(`${getEqDatasetQuery(datasetMap.string)},${getEqDatasetQuery(datasetMap.void)}`));
                    }
                    nextBlock = nextBlock.nextElementSibling;
                }
                if (this.isBlockVoid(focusElement)) {
                    nodes.push(focusElement)
                } else {
                    nodes.push(...findNodesInBlock(focusBlock, datasetMap, { end: focusElement }));
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
                        }
                    }
                } else {
                    nodes[0] = {
                        getClientRects() {
                            const range = document.createRange();
                            range.setStart(focusNode, anchorOffset);
                            range.setEnd(focusNode, focusOffset);
                            return range.getClientRects();
                        }
                    }
                }
            }
            if (isTextNode(focusNode) && focusNode !== anchorNode) {
                nodes[nodes.length - 1] = {
                    getClientRects() {
                        const range = document.createRange();
                        range.setStart(focusNode, 0);
                        range.setEnd(focusNode, focusOffset);
                        return range.getClientRects();
                    }
                }
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

            const lineDiv = Array.from(overlay.querySelectorAll('[data-selection-overlay]'));
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

            const containerRect = underLayer.getClientRects()[0];



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

    onMouseDown = (event) => {
        event.preventDefault();
        this.props.textArea.focus({
            preventScroll: true,
        });
        this.focus();
        const curorPositon = this.findCursorPosition(event);
        if (curorPositon.selection) {
            const voidElement = curorPositon.selection.element;
            const parentNode = voidElement.parentNode;
            const index = [].indexOf.call(parentNode.childNodes, voidElement);
            this.selection = {
                anchorNode: parentNode,
                anchorOffset: index,
                focusNode: parentNode,
                focusOffset: index,
            };
            this.blur();
        }
        if (!curorPositon.offsetNode) {
            return;
        }
        const { rect, offsetNode } = curorPositon;
        this.selection = {
            anchorRect: rect,
            anchorNode: offsetNode,
            anchorOffset: curorPositon.offset,
            focusNode: offsetNode,
            focusOffset: curorPositon.offset,
        };
        this.draw();
        this.startX = event.clientX;
        this.startY = event.clientY;
        container.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

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
        if (newFocusOffset !== selection.focusOffset || newFocusNode !== selection.focusNode) {
            selection.focusOffset = newFocusOffset;
            selection.focusNode = newFocusNode;
            selection.focusRect = focusRect;
            this.draw();
        }
    }

    onMouseUp = () => {
        container.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }
}
