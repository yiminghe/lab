import ContentEditable from './ContentEditable.js';

const value = [
    {
        type: 'paragraph',
        children: [
            {
                text: ''
            }
        ]
    },
    {
        type: 'image',
        url: 'http://alidocs.oss-accelerate.aliyuncs.com/a/RBLvJoVbNSebrvVB/deedb8442f54418e9f312ba8f0fa978b0521.png',
        width: 286,
        height: 118,
    },
    {
        type: 'paragraph',
        children: [
            {
                text: 'image:',
            },
            {
                type: 'image',
                url: 'http://alidocs.oss-accelerate.aliyuncs.com/a/RBLvJoVbNSebrvVB/deedb8442f54418e9f312ba8f0fa978b0521.png',
                width: 286,
                height: 118,
                children: [{ text: '' }],
            },
            {
                text: 'test a long paragraph,test a long paragraph,test a long paragraph,test a long paragraph,',
            },
            {
                type: 'image',
                url: 'http://alidocs.oss-accelerate.aliyuncs.com/a/RBLvJoVbNSebrvVB/deedb8442f54418e9f312ba8f0fa978b0521.png',
                width: 286,
                height: 118,
                children: [{ text: '' }],
            },
            {
                text: [
                    'test a long paragraph,test a long paragraph,',
                    'soft line, soft line',
                ].join('\n')
            }
        ]
    }
];

const ce = new ContentEditable({
    value,
    renderElement(props) {
        const { attributes, children, element } = props;
        let node;
        node = document.createElement('div');
        Object.keys(attributes).forEach((key) => {
            if (key !== 'style') {
                node.setAttribute(key, attributes[key]);
            }
        });
        if (attributes.style) {
            Object.assign(node.style, attributes.style);
        }
        if (element.type === 'image') {
            const img = document.createElement('img');
            img.src = element.url;
            Object.assign(img.style, {
                width: element.width + 'px',
                height: element.height + 'px',
            });
            if (children.length) {
                node.appendChild(children[0]);
            }
            node.appendChild(img);
            if (children.length) {
                node.appendChild(children[0].cloneNode(true));
            }
        } else {
            if (children.length) {
                for (const c of children) {
                    node.appendChild(c);
                }
            }
        }
        return node;
    },
    content: document.getElementById('content'),
    container: document.getElementById('container'),
});

ce.render();

ce.renderInternal(document.getElementById('content2'), value);

// ReactDOM.render(<input value="1" onChange={(e)=>{
//     console.log(e.target.value);
// }}/>,document.getElementById('content2'));
