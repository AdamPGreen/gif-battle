# GIF Battle Notification System

This document outlines the implementation of the notification system for GIF Battle.

## Overview

Instead of SMS notifications through Twilio, we've implemented a Progressive Web App (PWA) with Web Push Notifications. This provides a superior user experience while eliminating per-message costs.

## Features

The notification system enables:

1. **Players**: Receive notifications when a new round starts
2. **Players**: Receive notifications when they win a round
3. **Judges**: Receive notifications when all GIFs have been submitted

## Implementation Details

### PWA Setup
- Added a web manifest file (`public/manifest.json`)
- Created a service worker (`public/service-worker.js`) for:
  - Caching assets for offline use
  - Handling push notifications
  - Managing notification click events
- Updated `index.html` with necessary PWA meta tags and links

### Notification Service
- Created a client-side notification service (`src/services/notifications.ts`)
- Implemented functions for:
  - Checking notification support
  - Requesting permission
  - Managing push subscriptions
  - Saving user notification preferences

### Firebase Cloud Functions
- Implemented three cloud functions to trigger notifications:
  - `onRoundStart`: Notifies players when a round begins
  - `onWinnerSelected`: Notifies players about the winner
  - `onAllGifsSubmitted`: Notifies the judge when everyone has submitted

### User Interface
- Added a notification settings component (`src/components/NotificationSettings.tsx`)
- Integrated it into the Profile page
- Allows users to:
  - Enable/disable notifications
  - Choose which notifications to receive

## Technical Notes

### Web Push
- Uses the Web Push API with VAPID keys
- Generated VAPID keys with the `web-push` library
- Public key is used client-side, private key on the server

### Database Structure
- Stores subscription info in the user's document:
  - `pushSubscription`: Stringified subscription object
  - `notificationsEnabled`: Boolean flag
  - `notificationPreferences`: Object with preferences

## Deployment

Run the deployment script to deploy both the PWA and Firebase functions:

```bash
./deploy-pwa.sh
```

## Testing Notifications

To test notifications:
1. Enable notifications in your profile
2. Start a game with at least one other player
3. Begin a round to trigger "new round" notifications
4. Submit GIFs to trigger "all GIFs submitted" notification
5. Select a winner to trigger "winner picked" notifications 