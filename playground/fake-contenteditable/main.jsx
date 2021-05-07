import ContentEditable from './ContentEditable.js';

const data = [
    [''],
    [
        'image:',
        {
            type: 'img',
            src: 'http://gw.alicdn.com/tfs/TB176rg4VP7gK0jSZFjXXc5aXXa-286-118.png',
            style: {
                width: '286px',
                height: '118px'
            }
        },
        'test a long paragraph,test a long paragraph,test a long paragraph,test a long paragraph,',
        {
            type: 'img',
            src: 'http://gw.alicdn.com/tfs/TB176rg4VP7gK0jSZFjXXc5aXXa-286-118.png',
            style: {
                width: '286px',
                height: '118px'
            }
        },
        'test a long paragraph,test a long paragraph,',
        {
            type: 'br'
        },
        'soft line, soft line',
    ]
];

const ce = new ContentEditable({
    data,
    content: document.getElementById('content'),
});

ce.draw(document.getElementById('content2'), data);
