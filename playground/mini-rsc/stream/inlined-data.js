import { Readable } from 'node:stream';
import { Buffer } from 'node:buffer';
import {
  htmlEscapeJsonString,
  htmlEscapeAttributeString,
} from '../utils/escape.js';
import {
  INLINE_FLIGHT_PAYLOAD_BOOTSTRAP,
  INLINE_FLIGHT_PAYLOAD_DATA,
  INLINE_FLIGHT_PAYLOAD_FORM_STATE,
  INLINE_FLIGHT_PAYLOAD_BINARY,
} from '../utils/constants.js';

// 类似 Next.js stream-ops/node.ts createInlinedDataStream
export function createInlinedDataStream(source, nonce, formState) {
  const startScriptTag = nonce
    ? `<script nonce="${htmlEscapeAttributeString(nonce)}">`
    : '<script>';
  let bootstrapped = false;
  let sourceDone = false;

  const stream = new Readable({
    read() {
      tryRead(this);
    },
  });

  function writeBootstrap() {
    if (bootstrapped) return;
    bootstrapped = true;
    let scriptContents = `self.__next_f=self.__next_f||[]).push(${htmlEscapeJsonString(
      JSON.stringify([INLINE_FLIGHT_PAYLOAD_BOOTSTRAP]),
    )})`;
    if (formState != null) {
      scriptContents += `self.__next_f.push(${htmlEscapeJsonString(
        JSON.stringify([INLINE_FLIGHT_PAYLOAD_FORM_STATE, formState]),
      )})`;
    }
    stream.push(Buffer.from(`${startScriptTag}${scriptContents}</script>\n\n`));
  }

  function tryRead() {
    writeBootstrap();
    let chunk;
    while ((chunk = source.read()) != null) {
      let payload;
      if (Buffer.isBuffer(chunk)) {
        payload = [INLINE_FLIGHT_PAYLOAD_DATA, chunk.toString('utf-8')];
      } else {
        payload = [INLINE_FLIGHT_PAYLOAD_BINARY, chunk.toString('base64')];
      }
      const script = Buffer.from(
        `${startScriptTag}self.__next_f.push(${htmlEscapeJsonString(
          JSON.stringify(payload),
        )})</script>\n\n`,
      );
      if (!stream.push(script)) {
        // 消费者背压，停止一次 _read
        break;
      }
    }
    if (sourceDone) {
      stream.push(null);
    }
  }

  source.on('readable', tryRead);
  source.on('end', () => {
    sourceDone = true;
    tryRead();
  });
  source.on('error', (err) => stream.destroy(err));

  return stream;
}
