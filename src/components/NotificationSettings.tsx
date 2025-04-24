import { useState, useEffect } from 'react';
import { 
  checkNotificationSupport, 
  requestNotificationPermission, 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToNotifications,
  saveNotificationPreferences
} from '../services/notifications';

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [notificationsSupported, setNotificationsSupported] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState({
    newRound: true,
    winnerPicked: true,
    allGifsSubmitted: true
  });

  // Check if notifications are supported and enabled on component mount
  useEffect(() => {
    if (!userId) return;

    const checkNotifications = async () => {
      const supported = checkNotificationSupport();
      setNotificationsSupported(supported);

      if (supported) {
        const subscribed = await isSubscribedToNotifications(userId);
        setNotificationsEnabled(subscribed);
      }

      setIsLoading(false);
    };

    checkNotifications();
  }, [userId]);

  // Toggle notifications
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

  // Update notification preferences
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

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return <div className="p-4">Loading notification settings...</div>;
  }

  if (!notificationsSupported) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
        Push notifications are not supported in your browser.
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label htmlFor="enable-notifications" className="font-medium">
            Enable Push Notifications
          </label>
          <button
            id="enable-notifications"
            disabled={isLoading}
            onClick={toggleNotifications}
            className={`px-4 py-2 rounded-md ${
              notificationsEnabled
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {isLoading ? 'Loading...' : notificationsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Get notified about game events even when you're not actively viewing the game.
        </p>
      </div>

      {notificationsEnabled && (
        <div className="space-y-3">
          <h4 className="font-medium">Notification Types</h4>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="new-round"
              checked={preferences.newRound}
              onChange={(e) => handlePreferenceChange('newRound', e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="new-round">New Round Started (For Players)</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="winner-picked"
              checked={preferences.winnerPicked}
              onChange={(e) => handlePreferenceChange('winnerPicked', e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="winner-picked">Winner Picked</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="all-gifs-submitted"
              checked={preferences.allGifsSubmitted}
              onChange={(e) => handlePreferenceChange('allGifsSubmitted', e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="all-gifs-submitted">All GIFs Submitted (For Judges)</label>
          </div>
        </div>
      )}
    </div>
  );
} 