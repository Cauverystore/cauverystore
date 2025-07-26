/* global navigator */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered with scope:', registration.scope);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('🔁 New content is available and will be used when all tabs are closed.');
                } else {
                  console.log('🎉 Content is cached for offline use.');
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}
