import { createElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';

export function renderRateLimitedResponse() {
  return new Promise((resolve, reject) => {
    // 在真正的 HTTP 服务里应该是 res.statusCode = 429，然后在 pipe 之前
    console.log('[rateLimit] res.statusCode = 429\n');
    const { pipe } = renderToPipeableStream(
      createElement(
        'html',
        null,
        createElement('head', null, createElement('title', null, '429')),
        createElement(
          'body',
          null,
          createElement('h1', null, '429 Too Many Requests'),
          createElement('p', null, 'Rate limit exceeded.'),
        ),
      ),
      {
        onShellReady() {
          console.log('[onShellReady] 429 shell ready, start pipe\n');
          pipe(process.stdout);
        },
        onAllReady() {
          console.log('[onAllReady] 429 response complete\n');
          resolve();
        },
        onShellError(err) {
          reject(err);
        },
        onError(err) {
          reject(err);
        },
      },
    );
  });
}
