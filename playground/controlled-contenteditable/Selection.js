import { findSortedIndexWithInRange } from './findSortedIndex.js';
import { cursorStyle } from './constants.js';
import { closest, constrain, getEqDatasetQuery, eqDataset, sameSign } from './utils.js';

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
        const { content, textArea } = props;
        content.addEventListener('mousedown', this.onMouseDown);
        textArea.addEventListener('blur', this.blur);
        this.cursor = document.createElement('div');
        this.cursor.dataset.cursor = true;
        Object.assign(this.cursor.style, cursorStyle);
        this.visible = true;
    }

    closest(el, s) {
        return closest(el, s, this.props.content)
    }

    destroy() {
        const { content, textArea } = props;
        content.removeEventListener('mousedown', this.onMouseDown);
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
        const { content } = props;
        content.removeEventListener('mousedown', this.onMouseDown);
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

    findTextIndex(event) {
        let { clientX, clientY } = event;
        const { paragraph, string } = this.props.datasetMap;
        const { content } = this.props;
        const paragraphCssQuery = getEqDatasetQuery(paragraph);
        const ps = content.querySelectorAll(`:scope > ${paragraphCssQuery}:first-child,
        :scope > ${paragraphCssQuery}:last-child`);
        const psRects = [].map.call(ps, p => p.getClientRects()[0]);
        const firstRect = psRects[0];
        const lastRect = psRects[psRects.length - 1];

        clientY = constrain(clientY, firstRect.top + 1, lastRect.bottom - 1,);
        clientX = constrain(clientX, firstRect.left + 1, lastRect.right - 1,);

        const p = document.elementFromPoint(clientX, clientY);

        if (p.dataset?.cursor) {
            return {};
        }

        const voidElement = this.closest(p, '[data-void]');

        if (voidElement) {
            return {
                selection: {
                    element: voidElement
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
            if (offsetNode.nodeType !== 3 && eqDataset(offsetNode, datasetMap.void)) {
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
            // ff : auto wrap will not return two
            const rect = findMatchRect(range.getClientRects(), clientX);
            if (!rect) {
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
                const ret = this.findTextSpan(textSpans, clientX, clientY);
                textSpan = ret.textSpan;
                const findRect = ret.rect;
                clientY = constrain(clientY, findRect.top + 1, findRect.bottom - 1);
            }

            if (!textSpan) {
                throw new Error('invalid target', p);
            }

            const textNode = textSpan.firstChild;

            const ret = findSortedIndexWithInRange(0, textNode.textContent.length, (offset) => {
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

            let { index } = ret;
            const range = document.createRange();
            range.setStart(textNode, index);
            range.setEnd(textNode, index);
            let rect = range.getClientRects()[0];
            if (!ret.result && index) {
                const range = document.createRange();
                range.setStart(textNode, index - 1);
                range.setEnd(textNode, index - 1);
                // chrome: auto wrap will return two
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

    draw() {
        if (this.selection.isCollapsed) {
            let { anchorNode: offsetNode, rect } = this.selection;
            const p = this.closest(offsetNode, '[data-paragraph]');
            const pRect = p.getClientRects()[0];
            const left = rect.left - pRect.left;
            const top = rect.top - pRect.top;
            this.blur();
            const cursorPos = {
                left: left + 'px',
                top: top + 'px',
                height: rect.height + 'px',
                opacity: 1,
            };
            Object.assign(this.cursor.style, cursorPos);
            Object.assign(this.props.textArea.style, {
                left: rect.left + 'px',
                top: rect.top + 'px',
            });
            p.appendChild(this.cursor);
            this.focus();
        } else {
            this.blur();
        }
    }

    onMouseDown = (event) => {
        event.preventDefault();
        this.props.textArea.focus({
            preventScroll: true,
        });
        this.focus();
        const ret = this.findTextIndex(event);
        if (ret.selection) {
            this.selection = ret.selection;
            this.blur();
        }
        if (!ret.offsetNode) {
            return;
        }
        const { rect, offsetNode } = ret;
        this.selection = {
            rect,
            anchorNode: offsetNode,
            anchorOffset: ret.offsetNode,
            focusNode: offsetNode,
            focusOffset: ret.offsetNode,
            isCollapsed: true,
        };
        this.draw();
        this.startX = event.clientX;
        this.startY = event.clientY;
        content.addEventListener('mousemove', this.onMouseMove);
        content.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseMove(event) {

    }

    onMouseUp() {
        content.removeEventListener('mousemove', this.onMouseMove);
        content.removeEventListener('mouseup', this.onMouseUp);
    }
}
