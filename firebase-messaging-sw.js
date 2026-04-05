importScripts('./firebase-config.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

if (self.MILO_FIREBASE_CONFIG && self.MILO_FIREBASE_CONFIG.apiKey) {
  firebase.initializeApp(self.MILO_FIREBASE_CONFIG);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notification = payload?.notification || {};
    const data = payload?.data || {};
    const title = notification.title || 'Milo';
    const options = {
      body: notification.body || '',
      tag: data.notificationType ? `milo-${data.eventId || 'event'}-${data.notificationType}` : 'milo-reminder',
      data: {
        url: data.clickUrl || '/'
      }
    };

    self.registration.showNotification(title, options);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil((async () => {
    const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windowClients) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) {
          await client.navigate(targetUrl);
        }
        return;
      }
    }

    if (clients.openWindow) {
      await clients.openWindow(targetUrl);
    }
  })());
});