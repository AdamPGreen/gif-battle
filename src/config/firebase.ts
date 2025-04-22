import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { 
  initializeFirestore,
  connectFirestoreEmulator,
  FirestoreSettings,
  getFirestore
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

// Define Firestore settings with our specific configuration
const firestoreSettings: FirestoreSettings = {
  experimentalForceLongPolling: true, // Use long polling instead of WebSockets
  ignoreUndefinedProperties: true
};

// Check if we're in development environment
const isLocalEnv = process.env.NODE_ENV === 'development';

// Initialize Firestore with appropriate settings
const db = getFirestore(app);

// Log successful Firestore initialization
console.log('Successfully configured Firestore using default database');

// Connect to Firebase emulators in development environment
if (isLocalEnv) {
  console.log('Using Firebase emulators for local development');
  connectFirestoreEmulator(db, 'localhost', 8090);
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