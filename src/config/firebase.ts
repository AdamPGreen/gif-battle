import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOD1HJ_JVM7JuAeYxjQv1DB1SbhE_DogI",
  authDomain: "gif-battle-bceab.firebaseapp.com",
  projectId: "gif-battle-bceab",
  storageBucket: "gif-battle-bceab.firebasestorage.app",
  messagingSenderId: "550435143039",
  appId: "1:550435143039:web:8320bf8623ca670c282e4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Firebase persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.warn('Firebase persistence not supported by browser');
  }
});

export { auth, db, googleProvider };