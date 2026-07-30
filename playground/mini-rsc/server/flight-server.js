export const flightServerCode = `
import { createElement, Fragment, Suspense } from 'react'
import { renderToPipeableStream } from 'react-server-dom-webpack/server.node'

function rateLimit() {
  const err = new Error('Rate limited')
  err.digest = "NEXT_HTTP_ERROR_FALLBACK;429"
  throw err
}

async function Component({ children }) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return createElement('p', null, 'Hello from RSC')
}

async function Page() {
  return createElement('div', null,
    createElement(Suspense,
      { fallback: createElement('p', null, 'Loading component...') },
      createElement(Component)
    )
  )
}

function Layout({ children }) {
  if (process.env.RATE_LIMIT) {
    rateLimit()
  }
  return createElement('html', null, createElement('body', null, children))
}

const payload = {
  tree: ['$', { children: ['__PAGE__', {}] }],
  seedData: [
    createElement(Fragment, { key: '__PAGE__' }, createElement('div', { id: 'slot' })),
    null,
    false,
    null,
    false,
    null,
  ],
  head: createElement('title', null, 'RSC Test'),
}

const pipeable = renderToPipeableStream(
  payload,
  {
    onError(error) {
      if (error.digest === "NEXT_HTTP_ERROR_FALLBACK;429") {
        console.error('_RATE_LIMITED;:429')
        process.exit(429)
      }
      console.log("Flight render error:", error)
    }
  }
)
pipeable.pipe(process.stdout)
`;
