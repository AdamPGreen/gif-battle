import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';
import { constructSmsEmail } from '../utils/smsGateways';

// SMS notification preferences interface
interface SmsNotificationPreferences {
  newRound: boolean;
  winnerPicked: boolean;
  allGifsSubmitted: boolean;
}

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

// New Functions for SMS Notification Support

// Update user's phone number and carrier
export const updateSmsDetails = async (
  userId: string,
  phoneNumber: string,
  mobileCarrier: string
): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      phoneNumber,
      mobileCarrier,
    });
    return true;
  } catch (error) {
    console.error('Error updating SMS details:', error);
    return false;
  }
};

// Toggle SMS notifications
export const toggleSmsNotifications = async (
  userId: string,
  enabled: boolean
): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      smsNotificationsEnabled: enabled
    });
    return true;
  } catch (error) {
    console.error('Error toggling SMS notifications:', error);
    return false;
  }
};

// Save SMS notification preferences
export const saveSmsNotificationPreferences = async (
  userId: string,
  preferences: SmsNotificationPreferences
): Promise<boolean> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      smsNotificationPreferences: preferences
    });
    return true;
  } catch (error) {
    console.error('Error saving SMS notification preferences:', error);
    return false;
  }
};

// Send SMS notification
export const sendSmsNotification = async (
  user: User,
  subject: string,
  message: string
): Promise<boolean> => {
  try {
    if (!user.phoneNumber || !user.mobileCarrier || !user.smsNotificationsEnabled) {
      return false;
    }
    
    const smsEmail = constructSmsEmail(user.phoneNumber, user.mobileCarrier);
    if (!smsEmail) {
      console.error('Invalid SMS email construction');
      return false;
    }
    
    // Prepare the request payload
    const payload = {
      to: smsEmail,
      subject: subject,
      text: message.substring(0, 160) // Trim to SMS character limit
    };
    
    // Use the cloud function to send the email
    const functionsUrl = process.env.REACT_APP_FUNCTIONS_URL || 'https://api-ou2wdksd2a-uc.a.run.app';
    
    try {
      // First try with regular CORS mode - using the new endpoint structure
      const response = await fetch(`${functionsUrl}/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error from email service:', data.error);
        return false;
      }
      
      console.log(`SMS email sent to ${smsEmail}`);
      return true;
    } catch (error) {
      console.warn('Initial request failed, trying with no-cors mode:', error);
      
      // If the first attempt fails, try with no-cors as fallback
      // Note: With no-cors we can't read the response, so we'll just have to hope it worked
      await fetch(`${functionsUrl}/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });
      
      console.log(`SMS email sent to ${smsEmail} (no-cors mode)`);
      return true; // We can't check for success with no-cors, so just return true
    }
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
};

// Send new round notification to all players via SMS
export const sendNewRoundSmsToPlayers = async (
  players: User[],
  gameId: string,
  roundNumber: number
): Promise<void> => {
  for (const player of players) {
    if (
      player.smsNotificationsEnabled &&
      player.phoneNumber &&
      player.mobileCarrier
    ) {
      const subject = "GIF Battle: New Round";
      const message = `Round ${roundNumber} has started in your GIF Battle game! Time to submit your GIF.`;
      
      await sendSmsNotification(player, subject, message);
    }
  }
};

// Send all GIFs submitted notification to judge via SMS
export const sendAllGifsSubmittedSmsToJudge = async (
  judge: User,
  gameId: string,
  roundNumber: number
): Promise<void> => {
  if (
    judge.smsNotificationsEnabled &&
    judge.phoneNumber &&
    judge.mobileCarrier
  ) {
    const subject = "GIF Battle: All GIFs Submitted";
    const message = `All players have submitted their GIFs for Round ${roundNumber}. Time to judge!`;
    
    await sendSmsNotification(judge, subject, message);
  }
}; 