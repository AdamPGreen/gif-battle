import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

// Check if browser supports notifications
export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request permission for notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (userId: string): Promise<boolean> => {
  try {
    if (!checkNotificationSupport()) {
      throw new Error('Push notifications not supported in this browser');
    }

    const permission = await requestNotificationPermission();
    if (!permission) {
      throw new Error('Notification permission denied');
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // This is a public VAPID key that should be generated and stored securely
        // For now, we're using a placeholder - this needs to be replaced with your actual VAPID key
        'BMJSXo8ZMbq53HcvrIU-Ejxe9jMxWJ1kS_fOT8-mm8df4MGS3VAq3I8ke3IXUWydEgTAWanpVwW7dKwBRH9PCZk'
      )
    });

    // Store subscription in Firestore
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      await updateDoc(userDocRef, {
        pushSubscription: JSON.stringify(subscription),
        notificationsEnabled: true
      });
    } else {
      await setDoc(userDocRef, {
        id: userId,
        pushSubscription: JSON.stringify(subscription),
        notificationsEnabled: true,
        createdAt: Date.now()
      });
    }

    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (userId: string): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    // Update user document
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      pushSubscription: null,
      notificationsEnabled: false
    });

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

// Check if user is subscribed to notifications
export const isSubscribedToNotifications = async (userId: string): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    return userData.notificationsEnabled === true && userData.pushSubscription !== null;
  } catch (error) {
    console.error('Error checking notification subscription:', error);
    return false;
  }
};

// Save notification preferences for a user
export const saveNotificationPreferences = async (
  userId: string, 
  preferences: {
    newRound: boolean;
    winnerPicked: boolean;
    allGifsSubmitted: boolean;
  }
): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      notificationPreferences: preferences
    });
    return true;
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return false;
  }
};

// Helper function to convert base64 to Uint8Array
// This is needed for the applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 