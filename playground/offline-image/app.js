import db, { fakeUrl } from './db.js';

(async function () {
  const img = document.getElementById('img');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', {
      type: 'module',
    }).then(registration => {
      console.log(
        'sevice worker registration successful with scope: ',
        registration.scope);
    }).catch(err => {
      console.log('service worker registration failed: ', err);
    });

    if (navigator.serviceWorker.controller) {
      img.disabled = false;
    } else {
      img.disabled = true;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        img.disabled = false;
      });
    }
  }

  const display = document.getElementById('display');

  img.addEventListener('change', (e) => {
    let file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async function (e) {
      const blob = new Blob([e.target.result], {
        type: file.type,
      });
      const id = await db.images.add({
        img: blob
      });
      display.src = fakeUrl + id;
    }
  });
})();
