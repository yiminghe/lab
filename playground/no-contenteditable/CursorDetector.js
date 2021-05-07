import { findSortedIndexWithInRange } from './findSortedIndex.js';
import { cursorStyle } from './constants.js';

function constrain(v, min, max) {
    return Math.min(max, Math.max(v, min));
}

export default class CursorDetector {
    constructor(props) {
        this.selection = null;
        this.props = props;
        const { content, textArea } = props;
        content.addEventListener('mousedown', this.onMouseDown);
        //textArea.addEventListener('blur', this.blur);
        this.cursor = document.createElement('div');
        Object.assign(this.cursor.style, cursorStyle);
        this.visible = true;
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

    findTextIndex(event) {
        let { clientX, clientY } = event;

        const { content } = this.props;
        const ps = content.querySelectorAll('.p:first-child,.p:last-child');
        const psRects = [].map.call(ps, p => p.getClientRects()[0]);
        const firstRect = psRects[0];
        const lastRect = psRects[psRects.length - 1];

        clientY = constrain(clientY, firstRect.top + 1, lastRect.bottom - 1,);
        clientX = constrain(clientX, firstRect.left + 1, lastRect.right - 1,);

        const p = document.elementFromPoint(clientX, clientY);
        const voidElement = p.closest('[data-void]');

        if (voidElement) {
            return {
                selection: {
                    element: voidElement
                }
            };
        }

        // ff:
        if (document.caretPositionFromPoint) {

            const { offsetNode, offset } = document.caretPositionFromPoint(clientX, clientY);
            const range = document.createRange();
            range.setStart(offsetNode, offset);
            range.setEnd(offsetNode, offset);
            // ff : auto wrap will not return two
            const rects = range.getClientRects();
            const rect = rects[0];
            return {
                rect,
                offsetNode,
                offset,
            };
        }



        if (!p) {
            return {};
        }

        if (p.innerHTML === '\ufeff') {
            const textNode = p.firstChild;
            let range = document.createRange();
            range.setStart(textNode, 0);
            range.setEnd(textNode, 0);
            const rect = range.getClientRects()[0];
            return {
                textNode,
                rect,
                index: 0,
            };
        } else {
            const textNodes = [].filter.call(p.childNodes, (n) => n.nodeType === 3);

            if (!textNodes.length) {
                throw new Error('invalid target', p);
            }
            const textNodeRet = findSortedIndexWithInRange(0, textNodes.length, (index) => {
                const textNode = textNodes[index];
                let range = document.createRange();
                range.setStart(textNode, 0);
                range.setEnd(textNode, textNode.textContent.length);
                const rects = range.getClientRects();
                let rect = rects[0];
                if (clientY < rect.top) {
                    return 1;
                }
                rect = rects[rects.length - 1];
                if (clientY > rect.bottom) {
                    return -1;
                }
                return 0;
            });

            let textNodeIndex = textNodeRet.index;

            if (!textNodeRet.result && textNodeIndex) {
                textNodeIndex -= 1;
            }

            const textNode = textNodes[textNodeIndex];

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
            offsetNode,
            offset: ret.offsetNode,
        };
        const p = offsetNode.parentNode;
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
    }
}
