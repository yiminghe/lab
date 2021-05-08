import ContentEditable from './ContentEditable.js';

const data = [
    [''],
    [
        'image:',
        {
            type: 'img',
            src: 'http://alidocs.oss-accelerate.aliyuncs.com/a/RBLvJoVbNSebrvVB/deedb8442f54418e9f312ba8f0fa978b0521.png',
            style: {
                width: '286px',
                height: '118px'
            }
        },
        'test a long paragraph,test a long paragraph,test a long paragraph,test a long paragraph,',
        {
            type: 'img',
            src: 'http://alidocs.oss-accelerate.aliyuncs.com/a/RBLvJoVbNSebrvVB/deedb8442f54418e9f312ba8f0fa978b0521.png',
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
