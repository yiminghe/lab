import { Transform } from 'node:stream';
import { Buffer } from 'node:buffer';

// 类似 Next.js createMoveSuffixStream: 把 </body></html> 挪到最后
export function createMoveSuffixTransform() {
  const suffixStr = '</body></html>';
  const suffixBuf = Buffer.from(suffixStr);
  let afterSuffix = Buffer.alloc(0);
  let foundSuffix = false;

  return new Transform({
    transform(chunk, _encoding, callback) {
      if (foundSuffix) {
        afterSuffix = Buffer.concat([afterSuffix, chunk]);
        callback();
        return;
      }
      const str = chunk.toString('utf-8');
      const idx = str.indexOf(suffixStr);
      if (idx >= 0) {
        foundSuffix = true;
        const before = chunk.slice(0, idx);
        if (before.length) this.push(before);
        const after = chunk.slice(idx + suffixBuf.length);
        if (after.length) afterSuffix = after;
        callback();
      } else {
        this.push(chunk);
        callback();
      }
    },
    flush(callback) {
      if (foundSuffix) {
        this.push(afterSuffix);
        this.push(suffixBuf);
      } else if (afterSuffix.length) {
        this.push(afterSuffix);
      }
      callback();
    },
  });
}
