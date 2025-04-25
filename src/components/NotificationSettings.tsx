import { useState, useEffect } from 'react';
import { 
  checkNotificationSupport, 
  requestNotificationPermission, 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToNotifications,
  saveNotificationPreferences,
  updateSmsDetails,
  toggleSmsNotifications,
  saveSmsNotificationPreferences
} from '../services/notifications';
import { PhoneCall } from 'lucide-react';
import { carriers, formatPhoneNumber, isValidPhoneNumber } from '../utils/smsGateways';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [notificationsSupported, setNotificationsSupported] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Push notification preferences
  const [preferences, setPreferences] = useState({
    newRound: true,
    winnerPicked: true,
    allGifsSubmitted: true
  });
  
  // SMS notification states
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [mobileCarrier, setMobileCarrier] = useState<string>('');
  const [smsEnabled, setSmsEnabled] = useState<boolean>(false);
  const [phoneNumberError, setPhoneNumberError] = useState<string>('');
  const [carrierError, setCarrierError] = useState<string>('');
  const [isSmsInfoSaved, setIsSmsInfoSaved] = useState<boolean>(false);
  
  // SMS notification preferences
  const [smsPreferences, setSmsPreferences] = useState({
    newRound: true,
    winnerPicked: true,
    allGifsSubmitted: true
  });

  // Load user data on mount
  useEffect(() => {
    if (!userId) return;

    const loadUserData = async () => {
      setIsLoading(true);
      
      try {
        // Check push notification support and status
        const supported = checkNotificationSupport();
        setNotificationsSupported(supported);

        if (supported) {
          const subscribed = await isSubscribedToNotifications(userId);
          setNotificationsEnabled(subscribed);
        }
        
        // Load user data for SMS settings
        const userDocRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Load SMS settings if they exist
          if (userData.phoneNumber) {
            setPhoneNumber(userData.phoneNumber);
          }
          
          if (userData.mobileCarrier) {
            setMobileCarrier(userData.mobileCarrier);
          }
          
          setSmsEnabled(userData.smsNotificationsEnabled || false);
          setIsSmsInfoSaved(
            !!(userData.phoneNumber && userData.mobileCarrier)
          );
          
          // Load SMS preferences if they exist
          if (userData.smsNotificationPreferences) {
            setSmsPreferences(userData.smsNotificationPreferences);
          }
          
          // Load push notification preferences if they exist
          if (userData.notificationPreferences) {
            setPreferences(userData.notificationPreferences);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  // Toggle push notifications
  const toggleNotifications = async () => {
    if (!notificationsSupported) return;

    setIsLoading(true);

    try {
      if (notificationsEnabled) {
        // Unsubscribe from notifications
        await unsubscribeFromPushNotifications(userId);
        setNotificationsEnabled(false);
      } else {
        // Subscribe to notifications
        const success = await subscribeToPushNotifications(userId);
        setNotificationsEnabled(success);
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }

    setIsLoading(false);
  };

  // Update push notification preferences
  const handlePreferenceChange = async (
    preference: 'newRound' | 'winnerPicked' | 'allGifsSubmitted',
    value: boolean
  ) => {
    try {
      const updatedPreferences = {
        ...preferences,
        [preference]: value
      };

      setPreferences(updatedPreferences);
      await saveNotificationPreferences(userId, updatedPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };
  
  // Handle phone number input
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    if (value && !isValidPhoneNumber(value)) {
      setPhoneNumberError('Please enter a valid 10-digit US phone number');
    } else {
      setPhoneNumberError('');
    }
  };
  
  // Handle carrier selection
  const handleCarrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setMobileCarrier(value);
    
    if (!value) {
      setCarrierError('Please select your mobile carrier');
    } else {
      setCarrierError('');
    }
  };
  
  // Save SMS information
  const handleSaveSmsInfo = async () => {
    if (!phoneNumber || !mobileCarrier) {
      if (!phoneNumber) {
        setPhoneNumberError('Phone number is required');
      }
      if (!mobileCarrier) {
        setCarrierError('Mobile carrier is required');
      }
      return;
    }
    
    if (!isValidPhoneNumber(phoneNumber)) {
      setPhoneNumberError('Please enter a valid 10-digit US phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save phone number and carrier
      const success = await updateSmsDetails(
        userId,
        formatPhoneNumber(phoneNumber),
        mobileCarrier
      );
      
      if (success) {
        setIsSmsInfoSaved(true);
      }
    } catch (error) {
      console.error('Error saving SMS info:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle SMS notifications
  const handleToggleSms = async () => {
    if (!isSmsInfoSaved) return;
    
    setIsLoading(true);
    
    try {
      const newEnabledState = !smsEnabled;
      const success = await toggleSmsNotifications(userId, newEnabledState);
      
      if (success) {
        setSmsEnabled(newEnabledState);
      }
    } catch (error) {
      console.error('Error toggling SMS notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update SMS notification preferences
  const handleSmsPreferenceChange = async (
    preference: 'newRound' | 'winnerPicked' | 'allGifsSubmitted',
    value: boolean
  ) => {
    try {
      const updatedPreferences = {
        ...smsPreferences,
        [preference]: value
      };

      setSmsPreferences(updatedPreferences);
      await saveSmsNotificationPreferences(userId, updatedPreferences);
    } catch (error) {
      console.error('Error updating SMS preferences:', error);
    }
  };

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return <div className="text-gray-300">Loading notification settings...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-md p-3 space-y-6">
      {/* Push Notification Settings */}
      <div>
        <div className="mb-2">
          <label htmlFor="enable-notifications" className="text-white font-medium block mb-1">
            Enable Push Notifications
          </label>
          <p className="text-sm text-gray-400 mb-2">
            Get notified about game events even when you're not actively viewing the game.
          </p>
          
          {!notificationsSupported ? (
            <div className="bg-gray-800 border border-amber-700 rounded-md p-3 text-amber-400 text-sm">
              Push notifications are not supported in your browser.
            </div>
          ) : (
            <button
              id="enable-notifications"
              disabled={isLoading}
              onClick={toggleNotifications}
              className={`px-4 py-2 rounded-md text-sm ${
                notificationsEnabled
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {isLoading ? 'Loading...' : notificationsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          )}
        </div>
      </div>

      {/* Push Notification Preferences */}
      {notificationsSupported && notificationsEnabled && (
        <div className="pt-2 border-t border-gray-700">
          <h4 className="text-white font-medium mb-2">Push Notification Types</h4>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new-round"
                checked={preferences.newRound}
                onChange={(e) => handlePreferenceChange('newRound', e.target.checked)}
                className="mr-3 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="new-round" className="text-white text-sm">New Round Started (For Players)</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="winner-picked"
                checked={preferences.winnerPicked}
                onChange={(e) => handlePreferenceChange('winnerPicked', e.target.checked)}
                className="mr-3 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="winner-picked" className="text-white text-sm">Winner Picked</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="all-gifs-submitted"
                checked={preferences.allGifsSubmitted}
                onChange={(e) => handlePreferenceChange('allGifsSubmitted', e.target.checked)}
                className="mr-3 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="all-gifs-submitted" className="text-white text-sm">All GIFs Submitted (For Judges)</label>
            </div>
          </div>
        </div>
      )}
      
      {/* SMS Notification Settings */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <PhoneCall size={18} className="text-purple-400" />
          <h3 className="text-white font-medium">SMS Notifications</h3>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          Receive game notifications via SMS using carrier email-to-SMS gateways. Message and data rates may apply.
        </p>
        
        <div className="space-y-4">
          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone-number" className="text-sm text-gray-300 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone-number"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="1234567890"
              disabled={isSmsInfoSaved && smsEnabled}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {phoneNumberError && (
              <p className="text-red-400 text-xs mt-1">{phoneNumberError}</p>
            )}
          </div>
          
          {/* Mobile Carrier Selection */}
          <div>
            <label htmlFor="mobile-carrier" className="text-sm text-gray-300 block mb-1">
              Mobile Carrier
            </label>
            <select
              id="mobile-carrier"
              value={mobileCarrier}
              onChange={handleCarrierChange}
              disabled={isSmsInfoSaved && smsEnabled}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Select your carrier</option>
              {carriers.map((carrier) => (
                <option key={carrier} value={carrier}>
                  {carrier}
                </option>
              ))}
            </select>
            {carrierError && (
              <p className="text-red-400 text-xs mt-1">{carrierError}</p>
            )}
          </div>
          
          {/* Save Button or Toggle */}
          {!isSmsInfoSaved ? (
            <button
              onClick={handleSaveSmsInfo}
              disabled={isLoading || !phoneNumber || !mobileCarrier}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save SMS Info'}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Enable SMS Notifications</span>
                <button
                  onClick={handleToggleSms}
                  disabled={isLoading}
                  className={`px-4 py-1 rounded-md text-sm ${
                    smsEnabled
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {isLoading ? 'Loading...' : smsEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              
              <button
                onClick={() => {
                  setIsSmsInfoSaved(false);
                  setSmsEnabled(false);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 underline self-start"
              >
                Edit SMS Information
              </button>
            </div>
          )}
          
          {/* SMS Notification Preferences */}
          {isSmsInfoSaved && smsEnabled && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <h4 className="text-white font-medium mb-2">SMS Notification Types</h4>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-new-round"
                    checked={smsPreferences.newRound}
                    onChange={(e) => handleSmsPreferenceChange('newRound', e.target.checked)}
                    className="mr-3 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="sms-new-round" className="text-white text-sm">New Round Started (For Players)</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-winner-picked"
                    checked={smsPreferences.winnerPicked}
                    onChange={(e) => handleSmsPreferenceChange('winnerPicked', e.target.checked)}
                    className="mr-3 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="sms-winner-picked" className="text-white text-sm">Winner Picked</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms-all-gifs-submitted"
                    checked={smsPreferences.allGifsSubmitted}
                    onChange={(e) => handleSmsPreferenceChange('allGifsSubmitted', e.target.checked)}
                    className="mr-3 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor="sms-all-gifs-submitted" className="text-white text-sm">All GIFs Submitted (For Judges)</label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 