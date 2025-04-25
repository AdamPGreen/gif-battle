import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { User } from '../types';

// Helper function to handle auth errors
const handleAuthError = (error: any) => {
  console.error('Auth error:', error);
  if (error.code === 'auth/network-request-failed') {
    throw new Error('Network error. Please check your internet connection.');
  }
  throw error;
};

export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }
    
    // Create user document
    await createUserDocument(userCredential.user.uid, {
      id: userCredential.user.uid,
      displayName,
      email: userCredential.user.email,
      photoURL: userCredential.user.photoURL
    });
    
    return userCredential.user;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user document exists, if not create it
    const userRef = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await createUserDocument(result.user.uid, {
        id: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      });
    }
    
    return result.user;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    return handleAuthError(error);
  }
};

export const createUserDocument = async (userId: string, userData: User) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { 
      ...userData,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    return handleAuthError(error);
  }
};

export const updateUserProfile = async (
  displayName: string,
  avatarFile: File | null,
  phoneNumber?: string,
  mobileCarrier?: string
) => {
  try {
    if (!auth.currentUser) {
      throw new Error('No authenticated user found');
    }
    
    let photoURL = auth.currentUser.photoURL;
    
    // If a new avatar file is provided, upload it to Firebase Storage
    if (avatarFile) {
      // Get file extension
      const fileExtension = avatarFile.name.split('.').pop();
      const fileName = `avatar.${fileExtension}`;
      const storagePath = `avatars/${auth.currentUser.uid}/${fileName}`;
      
      const storageRef = ref(storage, storagePath);
      // Upload with metadata (content type)
      await uploadBytes(storageRef, avatarFile, { contentType: avatarFile.type });
      photoURL = await getDownloadURL(storageRef);
    }
    
    // Update the auth profile
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL
    });
    
    // Prepare update data
    const updateData: Record<string, any> = {
      displayName,
      photoURL
    };
    
    // Add phone number and carrier if provided
    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }
    
    if (mobileCarrier !== undefined) {
      updateData.mobileCarrier = mobileCarrier;
    }
    
    // Update the user document in Firestore
    const userRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userRef, updateData);
    
    return {
      displayName,
      photoURL,
      phoneNumber,
      mobileCarrier
    };
  } catch (error) {
    return handleAuthError(error);
  }
};