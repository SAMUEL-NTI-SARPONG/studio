let notificationTimeout;

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  if (type === 'SCHEDULE_NOTIFICATION') {
    const { title, options } = payload;
    const delay = options.timestamp - Date.now();

    if (delay > 0) {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
      notificationTimeout = setTimeout(() => {
        self.registration.showNotification(title, {
          body: options.body,
          tag: options.tag,
          renotify: true,
          vibrate: [200, 100, 200],
        });
      }, delay);
    }
  } else if (type === 'CANCEL_NOTIFICATIONS') {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      notificationTimeout = null;
    }
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(notification => notification.close());
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Fallback for basic push notifications if ever needed
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'CollabTime';
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    ...data.options,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
