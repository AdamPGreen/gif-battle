import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
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

// Initialize Firestore with memory cache
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true, // Use long polling instead of WebSockets
  ignoreUndefinedProperties: true
});

// Try to enable multi-tab persistence (but don't crash if it fails)
if (typeof window !== 'undefined') {
  try {
    enableMultiTabIndexedDbPersistence(db).catch(err => {
      console.warn('Failed to enable persistence:', err);
    });
  } catch (err) {
    console.warn('Failed to initialize persistence:', err);
  }
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

export { auth, db, googleProvider, trackEvent, analytics };