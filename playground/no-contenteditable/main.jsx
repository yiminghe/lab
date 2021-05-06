import InputDetector from './InputDetector.js';
import CursorDetector from './CursorDetector.js';
import { emptyText, textAreaStyle } from './constants.js';

const root = document.getElementById('root');
const textArea = document.createElement('textarea');
textArea.rows = 1;

Object.assign(textArea.style, textAreaStyle);

document.body.appendChild(textArea);

new InputDetector({
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

const ps = [
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
    'soft line, soft line',
].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n'),
    '',
    ['test a long paragraph, test a long paragraph,test a long paragraph test a long paragraph, test a long paragraph, test a long paragraph,',
        'soft line, soft line',
    ].join('\n')
];

for (const p of ps) {
    const line = document.createElement('div');
    line.className = 'p';
    line.style.position = 'relative';
    line.innerText = p || emptyText;
    root.appendChild(line);
}

const cursor = new CursorDetector({
    content: root,
    textArea,
});

