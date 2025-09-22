
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

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

// Example of how to use the message event to show a notification.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload;
    event.waitUntil(
      self.registration.showNotification(title, {
        ...options,
        icon: '/icons/icon.svg',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const hadWindowToFocus = clientsArr.length > 0;
      if (hadWindowToFocus) {
        // If an app window is already open, focus it
        const appWindow = clientsArr[0];
        appWindow.focus();
        appWindow.postMessage({ type: 'notification-clicked', eventId: event.notification.tag });
      } else {
        // Otherwise, open a new window
        self.clients.openWindow('/');
      }
    })
  );
});

export {};
