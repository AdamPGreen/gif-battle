const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Generated VAPID Keys:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('\nUse these keys in your functions/index.js file for the web push configuration.');
console.log('Make sure to keep the private key secret and consider using environment variables.'); 