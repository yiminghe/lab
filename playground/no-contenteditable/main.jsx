import ContentEditable from './ContentEditable.js';

const data = [
    [''],

    [
        'image:',
        {
            type: 'image',
            src: 'http://gw.alicdn.com/tfs/TB176rg4VP7gK0jSZFjXXc5aXXa-286-118.png',
            style: {
                width: '286px',
                height: '118px'
            }
        },
        ['test a long paragraph,test a long paragraph,test a long paragraph,test a long paragraph,test a long paragraph,test a long paragraph,',
            'soft line, soft line',
        ].join('\n'),
    ]
];

new ContentEditable({
    data,
    content: document.getElementById('content'),
});
