import Input from './Input.js';
import Selection from './Selection.js';
import { emptyText, textAreaStyle } from './constants.js';

export default class ContentEditable {
    constructor(props) {
        const { data, content } = props;
        const textArea = document.createElement('textarea');
        textArea.rows = 1;

        Object.assign(textArea.style, textAreaStyle);

        document.body.appendChild(textArea);

        this.input = new Input({
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

        this.selection = new Selection({
            content: content,
            textArea,
        });

        this.draw(content, data);
    }

    draw(content, data) {
        for (const p of data) {
            const line = document.createElement('div');
            line.className = 'p';
            line.style.position = 'relative';
            for (const c of p) {
                let node;
                if (typeof c === 'string') {
                    node = document.createTextNode(c || emptyText);
                } else if (c.type) {
                    node = document.createElement(c.type);
                    const { style, type, ...attr } = c;
                    Object.assign(node, attr);
                    node.dataset.void = 'true';
                    if (style) {
                        Object.assign(node.style, style);
                    }
                }
                line.appendChild(node);
            }
            content.appendChild(line);
        }
    }
}

