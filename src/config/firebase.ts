import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { 
  initializeFirestore,
  connectFirestoreEmulator,
  FirestoreSettings
} from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOD1HJ_JVM7JuAeYxjQv1DB1SbhE_DogI",
  authDomain: "gif-battle-bceab.firebaseapp.com",
  projectId: "gif-battle-bceab",
  storageBucket: "gif-battle-bceab.firebasestorage.app",
  messagingSenderId: "550435143039",
  appId: "1:550435143039:web:8320bf8623ca670c282e4a",
  databaseURL: "https://gif-battle-bceab.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics in production only
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// CRITICAL FIX: We need to set the databaseId in multiple places to ensure it overrides the default
// Set it in app options first (this is how the SDK internally determines the database)
// @ts-ignore - we're accessing an internal property
if (!app.options.databaseId) {
  // @ts-ignore - Accessing internal properties
  app.options.databaseId = 'gifbattle';
}

// Define Firestore settings with our specific configuration
const firestoreSettings: FirestoreSettings = {
  experimentalForceLongPolling: true, // Use long polling instead of WebSockets
  ignoreUndefinedProperties: true,
  localCache: {
    lruGarbageCollection: true,
    sizeBytes: 100000000 // Approximately 100MB cache size
  }
};

// Check if we're in development environment
const isLocalEnv = process.env.NODE_ENV === 'development';

// Initialize Firestore with appropriate settings
const db = initializeFirestore(app, firestoreSettings);

// Last attempt to force the database ID to be respected
// We're hacking into the internals of the Firebase SDK here
try {
  // @ts-ignore - Accessing internal properties
  if (db._settings) {
    // @ts-ignore - Accessing internal properties
    db._settings.databaseId = 'gifbattle';
  }
  
  // This is the most important part - override the projectId+databaseId in the internal firestore instance
  // @ts-ignore - Accessing internal properties
  if (db._projectId && db._databaseId) {
    // @ts-ignore - Accessing internal properties
    db._databaseId = 'gifbattle';
  }
  
  console.log('Successfully configured Firestore to use database: gifbattle');
} catch (error) {
  console.error('Error configuring Firestore database ID:', error);
}

// Connect to Firebase emulators in development environment
if (isLocalEnv) {
  console.log('Using Firebase emulators for local development');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

const googleProvider = new GoogleAuthProvider();

// Analytics helper function
const trackEvent = (eventName: string, eventParams = {}) => {
  if (analytics && process.env.NODE_ENV === 'production') {
    logEvent(analytics, eventName, {
      ...eventParams,
      timestamp: Date.now()
    });
  }
};

// Make sure to include all the original exports
export { app, auth, db, googleProvider, trackEvent, analytics, isLocalEnv };