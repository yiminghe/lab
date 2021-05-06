import { findSortedIndexWithInRange } from './findSortedIndex.js';
import { cursorStyle } from './constants.js';

const m = document.querySelector('.m');
const c = document.querySelector('.c');

function constrain(v, min, max) {
    return Math.min(max, Math.max(v, min));
}

export default class CursorDetector {
    constructor(props) {
        this.props = props;
        const { content, textArea } = props;
        content.addEventListener('mousedown', this.onMouseDown);
        textArea.addEventListener('blur', this.blur);
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
        const ps = content.querySelectorAll('.p');
        const psRects = [].map.call(ps, p => p.getClientRects()[0]);
        const firstRect = psRects[0];
        const lastRect = psRects[psRects.length - 1];

        clientY = constrain(clientY, firstRect.top, lastRect.bottom,);
        clientX = constrain(clientX, firstRect.left, lastRect.right,);

        const pRet = findSortedIndexWithInRange(0, psRects.length, (offset) => {
            const rect = psRects[offset];
            if (clientY < rect.top) {
                return 1;
            }
            if (clientY > rect.bottom) {
                return -1;
            }
            return 0;
        });

        let pIndex = pRet.index;

        if (!pRet.result && pIndex) {
            pIndex -= 1;
        }

        const p = ps[pIndex];
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
                // Object.assign(m.style, {
                //     display: 'block',
                //     left: rect.left + 'px',
                //     top: rect.top + 'px',
                //     width: 1 + 'px',
                //     height: rect.height + 'px',
                // });

                // Object.assign(c.style, {
                //     display: 'block',
                //     left: clientX + 'px',
                //     top: clientY + 'px',
                //     width: 1 + 'px',
                //     height: rect.height + 'px',
                // });

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
                const lowRect = range.getClientRects()[0];
                if (Math.abs(lowRect.left - clientX) < Math.abs(rect.left - clientX)) {
                    rect = lowRect;
                    index -= 1;
                }
            }
            
            return {
                rect,
                textNode,
                index,
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
        const { rect, textNode } = ret;
        const p = textNode.parentNode;
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
