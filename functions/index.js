/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Import the required modules
const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

// Initialize Firebase Admin
admin.initializeApp();

// Resend configuration
const { Resend } = require('resend');
// Use Firebase Functions config instead of process.env
const resend = new Resend(functions.config().resend.api_key);

// Web push configuration
const webpush = require('web-push');

// These VAPID keys should be generated using webpush.generateVAPIDKeys()
// and stored securely in environment variables
const vapidKeys = {
  publicKey: 'BMJSXo8ZMbq53HcvrIU-Ejxe9jMxWJ1kS_fOT8-mm8df4MGS3VAq3I8ke3IXUWydEgTAWanpVwW7dKwBRH9PCZk',
  privateKey: '5vHQBaJlHQWr9us5nelEKxVTj682Tgld5drushUDgWc'
};

// Configure web push with VAPID details
webpush.setVapidDetails(
  'https://gif-battle.vercel.app/', // Replace with your website URL
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Function to get user subscription from Firestore
async function getUserSubscription(userId) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    
    if (!userData.pushSubscription || !userData.notificationsEnabled) {
      return null;
    }
    
    // Check if user has notification preferences
    const notificationPreferences = userData.notificationPreferences || {
      newRound: true,
      winnerPicked: true,
      allGifsSubmitted: true
    };
    
    return {
      subscription: JSON.parse(userData.pushSubscription),
      preferences: notificationPreferences
    };
  } catch (error) {
    logger.error('Error getting user subscription:', error);
    return null;
  }
}

// Function to send push notification
async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    logger.error('Error sending push notification:', error);
    return false;
  }
}

// HTTP callable function to send email (for SMS gateway)
exports.sendEmail = onRequest({ 
  cors: true,
  region: "us-central1",
  memory: "256MiB" 
}, async (req, res) => {
  try {
    // Check request method
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    
    // Get data from request
    const { to, subject, text } = req.body;
    
    // Validate required fields
    if (!to || !subject || !text) {
      res.status(400).send('Missing required fields: to, subject, text');
      return;
    }
    
    // Send email using Resend
    const data = await resend.emails.send({
      from: 'GIF Battle <notifications@gif-battle.vercel.app>',
      to: to,
      subject: subject,
      text: text.substring(0, 160), // Trim to SMS character limit
    });
    
    logger.info('Email sent successfully:', { to, emailId: data.id });
    res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    logger.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Unknown error occurred'
    });
  }
});

// Trigger on game round start
exports.onRoundStart = onDocumentUpdated({
  document: "games/{gameId}",
  region: "us-central1",
  memory: "256MiB"
}, async (event) => {
  const gameDataBefore = event.data.before.data();
  const gameDataAfter = event.data.after.data();
  
  if (!gameDataBefore || !gameDataAfter) {
    return;
  }
  
  // Check if a new round just started
  const currentRound = gameDataAfter.rounds[gameDataAfter.currentRound - 1];
  const previousRound = gameDataBefore.rounds[gameDataBefore.currentRound - 1];
  
  if (gameDataAfter.status === 'playing' && 
      currentRound && previousRound && 
      (currentRound.hasStarted === true && previousRound.hasStarted === false)) {
    
    // Notify all players except the judge about the new round
    const players = gameDataAfter.players.filter(p => p.isActive && p.id !== currentRound.judgeId);
    
    // Create notification payload
    const payload = {
      title: 'New Round Started!',
      body: `It's time to submit your GIF for: "${currentRound.prompt.text}"`,
      data: {
        url: `/game/${gameDataAfter.id}`,
        gameId: gameDataAfter.id,
        roundId: currentRound.id
      }
    };
    
    // Send notifications to all players
    const promises = [];
    for (const player of players) {
      try {
        const userSubscription = await getUserSubscription(player.id);
        if (userSubscription && userSubscription.preferences.newRound) {
          promises.push(sendPushNotification(userSubscription.subscription, payload));
        }
      } catch (error) {
        logger.error('Error in onRoundStart:', error);
      }
    }
    
    await Promise.all(promises);
  }
});

// Trigger when a winner is selected
exports.onWinnerSelected = onDocumentUpdated({
  document: "games/{gameId}",
  region: "us-central1",
  memory: "256MiB"
}, async (event) => {
  const gameDataBefore = event.data.before.data();
  const gameDataAfter = event.data.after.data();
  
  if (!gameDataBefore || !gameDataAfter) {
    return;
  }
  
  // Check if a winner was just selected
  const currentRound = gameDataAfter.rounds[gameDataAfter.currentRound - 1];
  const previousRound = gameDataBefore.rounds[gameDataBefore.currentRound - 1];
  
  if (currentRound && previousRound && 
      (currentRound.isComplete === true && previousRound.isComplete === false) &&
      currentRound.winningSubmission) {
    
    // Get the winner
    const winningSubmission = currentRound.winningSubmission;
    const winner = gameDataAfter.players.find(p => p.id === winningSubmission.playerId);
    
    if (!winner) return;
    
    // Create winner notification payload
    const winnerPayload = {
      title: 'You Won This Round! 🎉',
      body: `Your GIF for "${currentRound.prompt.text}" was selected as the winner!`,
      data: {
        url: `/game/${gameDataAfter.id}`,
        gameId: gameDataAfter.id,
        roundId: currentRound.id
      }
    };
    
    // Create other players notification payload
    const othersPayload = {
      title: 'Round Winner Announced!',
      body: `${winner.name} won this round with their GIF submission.`,
      data: {
        url: `/game/${gameDataAfter.id}`,
        gameId: gameDataAfter.id,
        roundId: currentRound.id
      }
    };
    
    try {
      // Send notification to winner
      const winnerSubscription = await getUserSubscription(winner.id);
      if (winnerSubscription && winnerSubscription.preferences.winnerPicked) {
        await sendPushNotification(winnerSubscription.subscription, winnerPayload);
      }
      
      // Send notifications to other players
      const promises = [];
      for (const player of gameDataAfter.players) {
        if (player.id !== winner.id && player.isActive) {
          const userSubscription = await getUserSubscription(player.id);
          if (userSubscription && userSubscription.preferences.winnerPicked) {
            promises.push(sendPushNotification(userSubscription.subscription, othersPayload));
          }
        }
      }
      
      await Promise.all(promises);
    } catch (error) {
      logger.error('Error in onWinnerSelected:', error);
    }
  }
});

// Trigger when all GIFs have been submitted
exports.onAllGifsSubmitted = onDocumentUpdated({
  document: "games/{gameId}",
  region: "us-central1",
  memory: "256MiB"
}, async (event) => {
  const gameDataBefore = event.data.before.data();
  const gameDataAfter = event.data.after.data();
  
  if (!gameDataBefore || !gameDataAfter) {
    return;
  }
  
  // Check if a new submission was just added
  const currentRound = gameDataAfter.rounds[gameDataAfter.currentRound - 1];
  const previousRound = gameDataBefore.rounds[gameDataBefore.currentRound - 1];
  
  if (currentRound && previousRound && 
      currentRound.submissions.length > previousRound.submissions.length) {
    
    // Check if all active players except the judge have submitted
    const activePlayers = gameDataAfter.players.filter(p => p.isActive && !p.isJudge);
    const allSubmitted = activePlayers.length === currentRound.submissions.length;
    
    if (allSubmitted) {
      // Get the judge
      const judge = gameDataAfter.players.find(p => p.id === currentRound.judgeId);
      
      if (!judge) return;
      
      // Create notification payload for judge
      const judgePayload = {
        title: 'All GIFs Submitted!',
        body: 'Everyone has submitted their GIFs. Time to pick a winner!',
        data: {
          url: `/game/${gameDataAfter.id}`,
          gameId: gameDataAfter.id,
          roundId: currentRound.id
        }
      };
      
      try {
        // Send notification to judge
        const judgeSubscription = await getUserSubscription(judge.id);
        if (judgeSubscription && judgeSubscription.preferences.allGifsSubmitted) {
          await sendPushNotification(judgeSubscription.subscription, judgePayload);
        }
      } catch (error) {
        logger.error('Error in onAllGifsSubmitted:', error);
      }
    }
  }
});

// Simple test function to check if deployments work
exports.helloWorld = onCall({
  region: "us-central1",
  memory: "256MiB"
}, (request) => {
  logger.info("Hello logs!", {structuredData: true});
  return {message: "Hello from Firebase!"};
});
