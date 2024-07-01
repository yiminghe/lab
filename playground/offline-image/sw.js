import db, { fakeUrl } from './db.js';

self.addEventListener('activate', (event) => {
  console.log('activating service worker');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(fakeUrl)) {
    return;
  }

  async function getResponse() {
    const id = parseInt(event.request.url.slice(fakeUrl.length));
    const { img } = await db.images.where('id').equals(id).first();
    const response = new Response(img, {
      headers: {
        'Content-Type': img.type,
        'Content-Length': img.size,
      },
    });
    return response;
  }

  event.respondWith(getResponse());
});

function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = (event) => {
      resolve(event.target.result || new ArrayBuffer(0));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}
