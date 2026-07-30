// 最小 RSC + Flight 流渲染演示，并且随 Flight chunk 到达实时注入
// 把 Flight payload 内联进 HTML 输出（类似 Next.js 的 continueFizzStream）
// 不等待所有 Suspense resolve

import { spawn } from 'node:child_process';
import { createFromNodeStream } from 'react-server-dom-webpack/client.node';
import { renderToPipeableStream } from 'react-dom/server';

import { teeStream } from './stream/replayable.js';
import { createInlinedDataStream } from './stream/inlined-data.js';
import { createFlightDataInjectionTransformStream } from './stream/flight-injection.js';
import { createMoveSuffixTransform } from './stream/move-suffix.js';
import { flightServerCode } from './server/flight-server.js';
import { renderRateLimitedResponse } from './server/rate-limit.js';

async function main() {
  const RATE_LIMIT_SENTINEL = Symbol('rate-limit');
  let rateLimitDetected = false;
  let resolveRateLimit;
  const rateLimitPromise = new Promise((resolve) => {
    resolveRateLimit = resolve;
  });

  function markRateLimit() {
    if (!rateLimitDetected) {
      rateLimitDetected = true;
      resolveRateLimit(RATE_LIMIT_SENTINEL);
    }
  }

  const child = spawn(
    process.execPath,
    [
      '--conditions=react-server',
      '--input-type=module',
      '--eval',
      flightServerCode,
    ],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, RATE_LIMIT: process.env.RATE_LIMIT },
    },
  );

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    console.log(text);
    if (text.includes('_RATE_LIMITED;:429')) {
      markRateLimit();
    }
  });

  child.on('exit', (code) => {
    if (code === 429) markRateLimit();
  });

  // 1) tee: 一路给 Fizz 解码，一路给内联脚本
  const [decoderStream, inlineStream] = teeStream(child.stdout);

  // 2) 把 Flight 字节流转成 <script>self.__next_f.push(...)</script> 的 Readable
  const inlinedDataStream = createInlinedDataStream(
    inlineStream,
    undefined,
    null,
  );

  // 3) 解码 RSC
  const response = createFromNodeStream(
    decoderStream,
    {
      moduleMap: {},
      serverModuleMap: null,
      moduleLoading: { prefix: '', crossOrigin: null },
    },
    { nonce: undefined },
  );

  function responseAsPromise(response) {
    return new Promise((resolve, reject) => {
      response.then(resolve, reject);
    });
  }

  let decoded;
  try {
    const winner = await Promise.race([
      responseAsPromise(response),
      rateLimitPromise,
    ]);
    if (winner === RATE_LIMIT_SENTINEL || rateLimitDetected) {
      console.log('[rateLimit] RSC 阶段触发 ratelimit，渲染 429 fallback\n');
      await renderRateLimitedResponse();
      return;
    }
    decoded = winner;
  } catch (err) {
    if (rateLimitDetected) {
      console.log('[rateLimit] RSC 阶段触发 ratelimit，渲染 429 fallback\n');
      await renderRateLimitedResponse();
      return;
    }
    throw err;
  }

  console.log('\n====== 解码后的 payload seedData[0] ======\n');
  console.log('(包含 lazy 引用,Fizz 渲染时会继续等待它们)\n');

  // 4) Fizz => 实时注入 inline Flight 数据 => 把 </body></html> 挪到最后
  let shellReadyTime = 0;

  const { pipe } = renderToPipeableStream(decoded.seedData[0], {
    onShellReady() {
      shellReadyTime = Date.now();
      console.log(
        '[onShellReady] Fizz shell 已准备好，开始 pipe；inline Flight 数据会随 chunk 到达时注入\n',
      );
      const injection = createFlightDataInjectionTransformStream(
        inlinedDataStream,
        true,
      );
      const moveSuffix = createMoveSuffixTransform();
      pipe(injection).pipe(moveSuffix).pipe(process.stdout);
    },
    onAllReady() {
      console.log(
        `[onAllReady] 所有 Suspense boundary 已 resolve，耗时 ${
          Date.now() - shellReadyTime
        }ms\n`,
      );
    },
    onShellError(err) {
      console.log(`[onShellError] ${err}\n`);
    },
    onError(err) {
      console.log(`[onError] ${err?.message || err}\n`);
    },
  });
}

main().catch((err) => {
  console.log(`[unhandled error] ${err?.stack || err}\n`);
  process.exitCode = 1;
});
