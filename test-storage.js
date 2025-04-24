// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

// Firebase configuration from your project
const firebaseConfig = {
  apiKey: "AIzaSyDOD1HJ_JVM7JuAeYxjQv1DB1SbhE_DogI",
  authDomain: "gif-battle-bceab.firebaseapp.com",
  projectId: "gif-battle-bceab",
  storageBucket: "gif-battle-bceab.appspot.com",
  messagingSenderId: "550435143039",
  appId: "1:550435143039:web:8320bf8623ca670c282e4a",
  databaseURL: "https://gif-battle-bceab.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Test upload a string to Firebase Storage
async function testStorage() {
  try {
    // Create a reference to 'test.txt'
    const testRef = ref(storage, 'test.txt');
    
    // Upload a string
    await uploadString(testRef, 'This is a test file to verify Firebase Storage is working');
    
    // Get the download URL
    const url = await getDownloadURL(testRef);
    
    console.log('Upload successful!');
    console.log('File available at:', url);
    
    return { success: true, url };
  } catch (error) {
    console.error('Error testing Firebase Storage:', error);
    return { success: false, error };
  }
}

// Run the test
testStorage(); 