import { findSortedIndexWithInRange } from './findSortedIndex.js';
import { cursorStyle } from './constants.js';

function constrain(v, min, max) {
    return Math.min(max, Math.max(v, min));
}

function sameSign(a, b) {
    return a > 0 && b > 0 || a < 0 && b < 0;
}

export default class Selection {
    constructor(props) {
        this.selection = null;
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

    findTextNode(textNodes, clientX, clientY) {
        let find;
        let findRect;
        let minDistance = undefined;
        let minHorizon = undefined;

        for (const textNode of textNodes) {
            let range = document.createRange();
            range.setStart(textNode, 0);
            range.setEnd(textNode, textNode.textContent.length);
            const rects = range.getClientRects();
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
                    find = textNode;
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
            textNode: find,
            rect: findRect,
        };
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
        // if (document.caretPositionFromPoint) {

        //     const { offsetNode, offset } = document.caretPositionFromPoint(clientX, clientY);
        //     const range = document.createRange();
        //     range.setStart(offsetNode, offset);
        //     range.setEnd(offsetNode, offset);
        //     // ff : auto wrap will not return two
        //     const rects = range.getClientRects();
        //     const rect = rects[0];
        //     return {
        //         rect,
        //         offsetNode,
        //         offset,
        //     };
        // }

        if (!p) {
            return {};
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
            const textNodes = [].filter.call(p.childNodes, (n) => n.nodeType === 3);

            if (!textNodes.length) {
                throw new Error('invalid target', p);
            }

            const { textNode, rect: findRect } = this.findTextNode(textNodes, clientX, clientY);

            if (!textNode) {
                throw new Error('invalid target', p);
            }

            clientY = constrain(clientY, findRect.top + 1, findRect.bottom - 1);

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
            const { anchorNode: offsetNode, rect } = this.selection;
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
    }
}
