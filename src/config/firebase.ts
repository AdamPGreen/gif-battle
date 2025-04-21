import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

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

// Initialize Firestore with memory cache and specific database
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  databaseId: 'gifbattle'
});

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };