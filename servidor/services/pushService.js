const webpush = require('web-push');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:admin@fccanaveral.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

let subscriptions = [];

function addSubscription(sub) {
  const exists = subscriptions.find(s => s.endpoint === sub.endpoint);
  if (!exists) subscriptions.push(sub);
}

function removeSubscription(endpoint) {
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
}

async function notifyAll(title, body, icon, url) {
  const payload = JSON.stringify({ title, body, icon, url });
  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(sub, payload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          removeSubscription(sub.endpoint);
        }
        console.error('Error push a', sub.endpoint, err.message);
      })
    )
  );
  return results;
}

async function notifyMatch(title, body) {
  return notifyAll(
    title,
    body,
    '/pwa-icon-192.svg',
    '/'
  );
}

async function notifyProduct(title, body) {
  return notifyAll(
    title,
    body,
    '/pwa-icon-192.svg',
    '/tienda'
  );
}

module.exports = { addSubscription, removeSubscription, notifyMatch, notifyProduct, notifyAll };
