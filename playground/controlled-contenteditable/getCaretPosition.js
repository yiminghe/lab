import {
    closest,
    constrain,
    getEqDatasetQuery,
    eqDataset,
    sameSign,
    isTextNode,
    findNodesInBlock,
    px,
    setDataset,
} from './utils.js';
import { findSortedIndexWithInRange } from './findSortedIndex.js';

function findTextSpan(textSpans, clientX, clientY) {
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

export default function (p, datasetMap, clientX, clientY) {
    const { string } = datasetMap;
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
            const findedTextSpan = findTextSpan(textSpans, clientX, clientY);
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
