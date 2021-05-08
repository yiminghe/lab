import Input from './Input.js';
import Selection from './Selection.js';
import { emptyText, textAreaStyle } from './constants.js';
import { setDataset } from './utils.js';

function createMarker(datasetMap) {
    let marker = document.createElement('span');
    setDataset(marker, datasetMap.string);
    marker.appendChild(document.createTextNode(emptyText));
    return marker;
}

const defaultDatasetMap = {
    string: ['string', 'true'],
    void: ['void', 'true'],
    inline: ['inline', 'true'],
    paragraph: ['paragraph', 'true'],
}

export default class ContentEditable {
    constructor(props) {
        const { data, content } = props;
        const textArea = document.createElement('textarea');
        textArea.rows = 1;

        this.props = props;

        const datasetMap = props.datasetMap = props.datasetMap || defaultDatasetMap;

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
            datasetMap,
            textArea,
        });

        this.draw(content, data);
    }

    draw(content, data) {
        const { datasetMap } = this.props;
        for (const p of data) {
            const line = document.createElement('div');
            setDataset(line, datasetMap.paragraph);
            line.style.position = 'relative';
            for (const c of p) {
                let node;
                if (typeof c === 'string') {
                    node = document.createElement('span');
                    setDataset(node, datasetMap.string);
                    node.appendChild(document.createTextNode(c || emptyText));
                } else if (c.type) {
                    node = document.createElement('div');
                    if (c.style?.display !== 'block') {
                        Object.assign(node.style, {
                            display: 'inline-block',
                            marginLeft: '2px',
                            marginRight: '2px',
                        });
                        setDataset(node, datasetMap.void);
                        setDataset(node, datasetMap.inline);
                    }
                    setDataset(node, datasetMap.void);
                    node.appendChild(createMarker(this.props.datasetMap));
                    const inside = document.createElement(c.type);
                    const { style, type, ...attr } = c;
                    Object.assign(inside, attr);

                    if (style) {
                        Object.assign(inside.style, style);
                    }
                    node.appendChild(inside);
                    node.appendChild(createMarker(this.props.datasetMap));
                }
                line.appendChild(node);
            }
            content.appendChild(line);
        }
    }
}

