import Input from './Input.js';
import Selection from './Selection.js';
import { emptyText, textAreaStyle } from './constants.js';

function createMarker() {
    let marker = document.createElement('span');
    marker.dataset.voidMarker = true;
    marker.appendChild(document.createTextNode(emptyText));
    return marker;
}

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
            line.dataset.paragraph = 'true';
            line.style.position = 'relative';
            for (const c of p) {
                let node;
                if (typeof c === 'string') {
                    node = document.createElement('span');
                    node.dataset.string = true;
                    node.appendChild(document.createTextNode(c || emptyText));
                } else if (c.type) {
                    node = document.createElement('div');
                    if (c.style?.display !== 'block') {
                        Object.assign(node.style, {
                            display: 'inline-block',
                            marginLeft: '2px',
                            marginRight: '2px',
                        });
                        node.dataset.void = 'inline';
                    } else {
                        node.dataset.void = 'block';
                    }
                    node.appendChild(createMarker());
                    const inside = document.createElement(c.type);
                    const { style, type, ...attr } = c;
                    Object.assign(inside, attr);

                    if (style) {
                        Object.assign(inside.style, style);
                    }
                    node.appendChild(inside);
                    node.appendChild(createMarker());
                }
                line.appendChild(node);
            }
            content.appendChild(line);
        }
    }
}

