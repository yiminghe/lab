import { Readable } from 'node:stream';

// 类似 Next.js app-render-prerender-utils.ts 的 ReplayableNodeStream
export class ReplayableNodeStream {
  constructor(stream) {
    this.source = stream;
    this.done = false;
    this.chunks = [];
    this.subscribers = new Set();

    stream.on('data', (chunk) => {
      const buf = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
      this.chunks.push(buf);
      for (const sub of this.subscribers) sub.onChunk(buf);
    });
    stream.on('end', () => {
      this.done = true;
      for (const sub of this.subscribers) sub.onEnd();
      this.subscribers.clear();
    });
    stream.on('error', (err) => {
      this.sourceError = err;
      for (const sub of this.subscribers) sub.onError(err);
      this.subscribers.clear();
    });
  }

  createReplayStream() {
    const bufferedChunks = this.chunks.slice();
    let bufferedTrained = false;
    const isDone = this.done;
    const sourceError = this.sourceError;

    const stream = new Readable({
      read() {
        if (!bufferedTrained) {
          bufferedTrained = true;
          for (const chunk of bufferedChunks) {
            this.push(chunk);
          }
          if (isDone) {
            this.push(null);
          }
        }
      },
    });

    if (sourceError) {
      process.nextTick(() => stream.destroy(sourceError));
      return stream;
    }
    if (isDone) {
      return stream;
    }

    const subscriber = {
      onChunk: (chunk) => stream.push(chunk),
      onEnd: () => stream.push(null),
      onError: (err) => stream.destroy(err),
    };
    this.subscribers.add(subscriber);
    stream.on('close', () => this.subscribers.delete(subscriber));
    return stream;
  }
}

export function teeStream(stream) {
  const replayable = new ReplayableNodeStream(stream);
  return [replayable.createReplayStream(), replayable.createReplayStream()];
}
