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
    return <div className="text-gray-300">Loading notification settings...</div>;
  }

  if (!notificationsSupported) {
    return (
      <div className="bg-gray-800 border border-amber-700 rounded-md p-3 text-amber-400 text-sm">
        Push notifications are not supported in your browser.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-md p-3 space-y-4">
      <div>
        <div className="mb-2">
          <label htmlFor="enable-notifications" className="text-white font-medium block mb-1">
            Enable Push Notifications
          </label>
          <p className="text-sm text-gray-400 mb-2">
            Get notified about game events even when you're not actively viewing the game.
          </p>
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
        </div>
      </div>

      {notificationsEnabled && (
        <div className="pt-2 border-t border-gray-700">
          <h4 className="text-white font-medium mb-2">Notification Types</h4>
          
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
    </div>
  );
} 