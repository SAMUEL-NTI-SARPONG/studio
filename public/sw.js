"use strict";
/// <reference lib="webworker" />
Object.defineProperty(exports, "__esModule", { value: true });
// The following is boilerplate from next-pwa to ensure it works correctly.
// You can ignore this part.
self.addEventListener('push', (event) => {
    var _a;
    const data = JSON.parse(((_a = event.data) === null || _a === void 0 ? void 0 : _a.text()) || '{}');
    event.waitUntil(self.registration.showNotification(data.title, {
        body: data.message,
        icon: '/icons/icon.svg',
    }));
});
// Example of how to use the message event to show a notification.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data.payload;
        event.waitUntil(self.registration.showNotification(title, Object.assign(Object.assign({}, options), { icon: '/icons/icon.svg' })));
    }
});
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const tag = event.notification.tag;
    let eventId = tag;
    let notificationType = 'start'; // Default
    if (tag.startsWith('start-') || tag.startsWith('end-')) {
        const parts = tag.split('-');
        notificationType = parts[0];
        eventId = parts.slice(1).join('-');
    }
    event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
        const hadWindowToFocus = clientsArr.length > 0;
        if (hadWindowToFocus) {
            // If an app window is already open, focus it
            const appWindow = clientsArr[0];
            appWindow.focus();
            appWindow.postMessage({ type: 'notification-clicked', eventId, notificationType });
        }
        else {
            // Otherwise, open a new window
            self.clients.openWindow('/');
        }
    }));
});
// This is required to make the service worker installable.
self.addEventListener('fetch', (event) => {
    // You can add custom fetch handling here if needed,
    // but for a basic PWA, this is often sufficient to just have the event listener.
});
