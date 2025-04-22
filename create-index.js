// Create index script for Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createIndex() {
  try {
    console.log('Creating index for games collection...');
    
    // Define the index configuration
    const index = {
      collectionGroup: 'games',
      queryScope: 'COLLECTION',
      fields: [
        {
          fieldPath: 'players',
          arrayConfig: 'CONTAINS'
        },
        {
          fieldPath: 'updatedAt',
          order: 'DESCENDING'
        }
      ]
    };
    
    // Use the Admin API to create the index
    // Note: This is actually using the Firestore Admin API directly, which requires more setup
    // For a simple case, we'll recommend using the Firebase Console UI
    
    console.log('Index definition ready for Firebase Console');
    console.log(JSON.stringify(index, null, 2));
    console.log('\nPlease create this index manually in the Firebase Console: https://console.firebase.google.com/project/gif-battle-bceab/firestore/indexes');
    
  } catch (error) {
    console.error('Error creating index:', error);
  }
}

createIndex(); 