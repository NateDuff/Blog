importScripts('https://www.gstatic.com/firebasejs/7.2.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.2.1/firebase-messaging.js');

firebase.initializeApp({
  'messagingSenderId': '275924356890'
});

const messaging = firebase.messaging();

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

 self.addEventListener("push", function (event) {
   if (event.data) {
     showLocalNotification(event.data.text(), self.registration);
   } else {
     console.log("Push event contains no data");
   }
 });

const showLocalNotification = (notificationBody, swRegistration) => {
  const body = JSON.parse(notificationBody);

  const message_title = body.notification.title;
  const message_body = body.notification.body;
  const icon = body.notification.icon;
  const image = body.notification.image;
  const tag = body.notification.tag;

  const actionTitle = body.data['gcm.notification.actionTitle'];
  const actionIcon = body.data['gcm.notification.actionIcon'];
  const badge = body.data['gcm.notification.badge'];
  const forceClick = body.data['gcm.notification.forceClick'];

  const options = {
    body: message_body,
    icon: icon,
    image: image,
    badge: badge,
    tag: tag,
    requireInteraction: forceClick,
    actions: [{ action: "Detail", title: actionTitle, icon: actionIcon }],
  };

  swRegistration.showNotification(message_title, options);
};

self.addEventListener("notificationclose", function (e) {
  var notification = e.notification;
  var primaryKey = notification.data;

  console.log("Closed notification: " + primaryKey);
});

self.addEventListener("notificationclick", function (e) {
  var notification = e.notification;
  var action = e.action;

  if (action === "close") {
    notification.close();
  } else {
    console.log(`SW Opening App from Notification: ${notification}`);
    clients.openWindow("https://blog.nateduff.com");
    notification.close();
  }
});

// show a notification after 15 seconds (the notification
// permission must be granted first)
setTimeout(() => {
    self.registration.showNotification("Hello, world!")
}, 15000)
    
// register a custom navigation route
// const customRoute = new workbox.routing.NavigationRoute(({ event }) => {
    
// }, 
// {
//     blacklist: [/^(?!\/.auth\/)/]
// })

// workbox.routing.registerRoute(customRoute)