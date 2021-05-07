import InputDetector from './InputDetector.js';
import CursorDetector from './CursorDetector.js';
import { emptyText, textAreaStyle } from './constants.js';

export default class ContentEditable {
    constructor(props) {
        const { data, content } = props;
        const textArea = document.createElement('textarea');
        textArea.rows = 1;

        Object.assign(textArea.style, textAreaStyle);

        document.body.appendChild(textArea);

        this.inputDetector = new InputDetector({
            textArea,
            onCompositionUpdate({ value }) {
                console.log('onCompositionUpdate', value);
            },
            onInsert({ value }) {
                console.log('onInsert', value);
            },
            onDeleteBackward({ value }) {
                console.log('onDeleteBackward', value);
            }
        });

        this.cursor = new CursorDetector({
            content: content,
            textArea,
        });

        for (const p of data) {
            const line = document.createElement('div');
            line.className = 'p';
            line.style.position = 'relative';
            for (const c of p) {
                let node;
                if (typeof c === 'string') {
                    node = document.createTextNode(c || emptyText);
                } else if (c.type === 'image') {
                    node = document.createElement('img');
                    node.src = c.src;
                    node.dataset.void=true;
                    Object.assign(node.style, c.style);
                }
                line.appendChild(node);
            }
            content.appendChild(line);
        }
    }
}

