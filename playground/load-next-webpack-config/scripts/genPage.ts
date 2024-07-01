import fs from 'fs';
import path from 'path';

if (fs.existsSync(path.join(__dirname, '../_next')))
  fs.rmSync(path.join(__dirname, '../_next'), { recursive: true });

fs.renameSync(
  path.join(__dirname, '../.next'),
  path.join(__dirname, '../_next'),
);

const manifest = require(path.join(__dirname, '../_next/chunks-manifest.json'));
// polyfills
const scripts: string[] = [];

for (const p of Object.keys(manifest)) {
  let data = [...manifest[p].styles]
    .map((s: string) => `<link rel="stylesheet" href="${s}"/>`)
    .join('\n');
  data += [...scripts, ...manifest[p].scripts]
    .map((s: string) => `<script defer src="${s}"></script>`)
    .join('\n');
  fs.writeFileSync(path.join(__dirname, '../_next', p + '-build.html'), data);
}
