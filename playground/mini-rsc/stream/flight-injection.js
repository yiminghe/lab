import { Transform } from 'node:stream';

// 类似 Next.js createFlightDataInjectionTransformStream (Node 版)
export function createFlightDataInjectionTransformStream(
  inlinedDataStream,
  delayDataUntilFirstHtmlChunk,
) {
  let startedPulling = !delayDataUntilFirstHtmlChunk;
  let htmlFinished = false;
  let inlinedDone = false;
  let pending = [];
  let flushCb = null;

  const transform = new Transform({
    transform(chunk, _encoding, callback) {
      // 先把当前 HTML chunk 输出，再开始拉取 inline 数据
      this.push(chunk);
      this.push('\n\n');
      if (!startedPulling) {
        startedPulling = true;
        startPulling();
      }
      callback();
    },
    flush(callback) {
      htmlFinished = true;
      if (inlinedDone) {
        flushPending();
        callback();
      } else {
        flushCb = callback;
      }
    },
  });

  function flushPending() {
    for (const chunk of pending) {
      transform.push(chunk);
    }
    pending.length = 0;
  }

  function readNext() {
    let chunk;
    while ((chunk = inlinedDataStream.read()) !== null) {
      pending.push(chunk);
      if (inlinedDataStream.read() === null) {
        inlinedDone = true;
        flushPending();
        if (flushCb) {
          const cb = flushCb;
          flushCb = null;
          cb();
        }
      }
    }
  }

  function startPulling() {
    readNext();
    inlinedDataStream.on('readable', readNext);
    inlinedDataStream.on('end', () => {
      inlinedDone = true;
      readNext();
    });
    inlinedDataStream.on('error', (err) => transform.destroy(err));
  }

  if (!delayDataUntilFirstHtmlChunk) {
    startPulling();
  }

  return transform;
}
