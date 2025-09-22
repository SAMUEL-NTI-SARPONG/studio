
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Example of how to use the message event to show a notification.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload;
    event.waitUntil(
      self.registration.showNotification(title, {
        ...options,
        icon: '/icons/icon.svg',
        sound: '/notification.mp3', // Note: sound is not supported by all browsers
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const hadWindowToFocus = clientsArr.length > 0;
      if (hadWindowToFocus) {
        // If an app window is already open, focus it
        clientsArr[0].focus();
      } else {
        // Otherwise, open a new window
        self.clients.openWindow('/');
      }
    })
  );
});

// The following is boilerplate from next-pwa to ensure it works correctly.
// You can ignore this part.
self.addEventListener('push', (event) => {
  const data = JSON.parse(event.data?.text() || '{}');
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: '/icons/icon.svg',
    })
  );
});

export {};
