import Input from './Input.js';
import Selection from './Selection.js';
import { emptyText, textAreaStyle } from './constants.js';
import { setDataset } from './utils.js';

const defaultDatasetMap = {
    string: ['string', 'true'],
    void: ['void', 'true'],
    inline: ['inline', 'true'],
    paragraph: ['paragraph', 'true'],
}

export default class ContentEditable {
    constructor(props) {
        const { container, content } = props;
        const textArea = document.createElement('textarea');
        textArea.rows = 1;

        this.props = props;

        const datasetMap = props.datasetMap = props.datasetMap || defaultDatasetMap;

        Object.assign(textArea.style, textAreaStyle);

        this.textArea = textArea;

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

        this.underLayer = document.createElement('div');
        Object.assign(this.underLayer.style, {
            position: 'relative',
            zIndex: 50,
        });
        container.insertBefore(this.underLayer, content);

        this.topLayer = document.createElement('div');
        Object.assign(this.topLayer.style, {
            position: 'absolute',
            zIndex: 150,
            left: '0px',
            top: '0px',
        });
        container.insertBefore(this.underLayer, content);
        container.appendChild(this.topLayer);

        this.selection = new Selection({
            container,
            underLayer: this.underLayer,
            topLayer: this.topLayer,
            content,
            datasetMap,
            textArea,
        });
    }
    constructNode(element, block = true) {
        const { void: voidDataset, paragraph, inline, string } = this.props.datasetMap;

        if ('text' in element) {
            const node = document.createElement('span');
            setDataset(node, string);
            node.appendChild(document.createTextNode(element.text || emptyText));
            return node;
        }

        let children = [];

        if (element.children) {
            children = [];
            for (const c of element.children) {
                children.push(this.constructNode(c, false));
            }
        }

        let attributes = {};

        if (element.type === 'paragraph') {
            attributes['data-' + paragraph[0]] = paragraph[1];
        } else {
            attributes['data-' + voidDataset[0]] = voidDataset[1];
            if (!block) {
                attributes['data-' + inline[0]] = inline[1];
            }
            attributes.style = {
                // fontSize: 0,
                outlineStyle: 'none',
                marginLeft: '2px',
                marginRight: '2px',
                paddingTop: '1px',
                paddingLeft: '1px',
                paddingRight: '1px',
            };
        }
        if (block) {
            attributes.style = Object.assign({}, attributes.style, {
                position: 'relative',
            });
        } else {
            attributes.style = Object.assign({}, attributes.style, {
                display: 'inline-block',
            });
        }
        return this.props.renderElement({
            attributes,
            element,
            children,
        });
    }

    render() {
        this.underLayer.appendChild(this.textArea);
        const { value, content } = this.props;
        content.innerHTML = '';
        this.renderInternal(this.props.content, value);
    }

    renderInternal(content, value) {
        for (const element of value) {
            content.appendChild(this.constructNode(element));
        }
    }
}

