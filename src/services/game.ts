import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { nanoid } from 'nanoid';
import type { Game, Player, Round, Prompt, GifSubmission } from '../types';

// Default prompts for the game
const DEFAULT_PROMPTS: Prompt[] = [
  { id: 'p1', text: 'When you realize it\'s Monday morning' },
  { id: 'p2', text: 'That feeling when you finally finish a project' },
  { id: 'p3', text: 'Me trying to adult' },
  { id: 'p4', text: 'When someone says "we need to talk"' },
  { id: 'p5', text: 'How I look waiting for my code to compile' },
  { id: 'p6', text: 'My reaction to bad news' },
  { id: 'p7', text: 'When the WiFi goes out' },
  { id: 'p8', text: 'Me at 3 AM looking for snacks' },
  { id: 'p9', text: 'When someone spoils a show I\'m watching' },
  { id: 'p10', text: 'How I dance when no one is watching' }
];

// Last request timestamps to implement rate limiting
const lastRequestTimestamps = {
  create: 0,
  join: 0,
  submit: 0
};

// Rate limit configuration (in milliseconds)
const RATE_LIMITS = {
  create: 5000,  // 5 seconds between game creations
  join: 2000,    // 2 seconds between joining games
  submit: 2000   // 2 seconds between submissions
};

// Helper function to check rate limits
const checkRateLimit = (action) => {
  const now = Date.now();
  const lastRequest = lastRequestTimestamps[action];
  
  if (now - lastRequest < RATE_LIMITS[action]) {
    throw new Error(`Please wait before performing this action again (${Math.ceil((RATE_LIMITS[action] - (now - lastRequest)) / 1000)} seconds)`);
  }
  
  lastRequestTimestamps[action] = now;
};

// Helper function to handle errors
const handleError = (error: any) => {
  console.error('Firestore error:', error);
  
  // Network errors
  if (error.code === 'unavailable' || error.code === 'network-request-failed') {
    throw new Error('Network connection issue. Please check your internet connection and try again.');
  }
  
  // Permission errors
  if (error.code === 'permission-denied') {
    throw new Error('You do not have permission to perform this action.');
  }
  
  // Rate limiting
  if (error.message?.includes('Please wait')) {
    throw error;
  }
  
  // Transaction failures
  if (error.code === 'aborted') {
    throw new Error('Operation was interrupted. Please try again.');
  }
  
  // Default error
  throw new Error('An error occurred. Please try again later.');
};

export const createGame = async (hostId: string, hostName: string, gameName: string) => {
  try {
    // Check rate limit
    checkRateLimit('create');
    
    const gameId = nanoid(8);
    console.log(`Creating game with ID: ${gameId} in database: gifbattle`);
    
    const gameRef = doc(db, 'games', gameId);
    
    const newGame: Game = {
      id: gameId,
      name: gameName,
      hostId,
      players: [{
        id: hostId,
        name: hostName,
        isHost: true,
        isJudge: true,
        score: 0,
        isActive: true
      }],
      rounds: [],
      currentRound: 0,
      status: 'waiting',
      maxPlayers: 8,
      maxRounds: 10,
      maxScore: 5,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Use a transaction for better reliability
    await runTransaction(db, async (transaction) => {
      // First check if a game with this ID already exists
      const gameSnapshot = await transaction.get(gameRef);
      if (gameSnapshot.exists()) {
        throw new Error(`Game with ID ${gameId} already exists`);
      }
      
      // Create the game
      transaction.set(gameRef, newGame);
      return gameId;
    });
    
    console.log(`Game created successfully with ID: ${gameId}`);
    return gameId;
  } catch (error) {
    console.error('Error creating game:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied. Check Firestore rules.');
    } else if (error.code === 'unavailable') {
      console.error('Firestore is currently unavailable');
    } else if (error.code === 'resource-exhausted') {
      console.error('Quota exceeded');
    } else if (error.code === 'cancelled') {
      console.error('Operation was cancelled');
    } else if (error.code === 'deadline-exceeded') {
      console.error('Deadline exceeded on operation');
    } else if (error.message) {
      console.error(`Error message: ${error.message}`);
    }
    
    return handleError(error);
  }
};

export const joinGame = async (gameId: string, player: Player) => {
  try {
    // Check rate limit
    checkRateLimit('join');
    
    const gameRef = doc(db, 'games', gameId);
    
    return await runTransaction(db, async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data() as Game;
      
      if (gameData.status !== 'waiting') {
        throw new Error('Game has already started');
      }
      
      if (gameData.players.length >= gameData.maxPlayers) {
        throw new Error('Game is full');
      }
      
      // Check if player is already in the game
      const existingPlayer = gameData.players.find(p => p.id === player.id);
      if (existingPlayer) {
        // If player exists but is inactive, set to active
        if (!existingPlayer.isActive) {
          transaction.update(gameRef, {
            players: gameData.players.map(p => 
              p.id === player.id ? { ...p, isActive: true } : p
            ),
            updatedAt: serverTimestamp()
          });
        }
        return gameId;
      }
      
      // Add new player
      transaction.update(gameRef, {
        players: arrayUnion({
          ...player,
          isHost: false,
          isJudge: false,
          score: 0,
          isActive: true
        }),
        updatedAt: serverTimestamp()
      });
      
      return gameId;
    });
  } catch (error) {
    return handleError(error);
  }
};

export const leaveGame = async (gameId: string, playerId: string) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data() as Game;
    
    // Set player to inactive instead of removing
    await updateDoc(gameRef, {
      players: gameData.players.map(p => 
        p.id === playerId ? { ...p, isActive: false } : p
      ),
      updatedAt: Date.now()
    });
    
    // If host leaves, assign a new host
    const host = gameData.players.find(p => p.id === playerId && p.isHost);
    if (host) {
      const activePlayers = gameData.players.filter(p => p.id !== playerId && p.isActive);
      if (activePlayers.length > 0) {
        const newHost = activePlayers[0];
        await updateDoc(gameRef, {
          players: gameData.players.map(p => 
            p.id === newHost.id ? { ...p, isHost: true } : p
          ),
          hostId: newHost.id
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error leaving game:', error);
    throw error;
  }
};

export const startGame = async (gameId: string) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data() as Game;
    
    if (gameData.players.filter(p => p.isActive).length < 2) {
      throw new Error('Need at least 2 active players to start');
    }
    
    // Start the first round
    const firstJudge = gameData.players.find(p => p.isHost);
    if (!firstJudge) throw new Error('No host found');
    
    const prompt = getRandomPrompt();
    const round: Round = {
      id: 1,
      prompt,
      judgeId: firstJudge.id,
      submissions: [],
      isComplete: false
    };
    
    await updateDoc(gameRef, {
      status: 'playing',
      currentRound: 1,
      rounds: [round],
      updatedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};

export const submitGif = async (gameId: string, submission: GifSubmission) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data() as Game;
    const currentRound = gameData.rounds[gameData.currentRound - 1];
    
    // Check if player is the judge
    const player = gameData.players.find(p => p.id === submission.playerId);
    if (!player) throw new Error('Player not found');
    if (player.isJudge) throw new Error('Judge cannot submit a GIF');
    
    // Check if player already submitted
    const existingSubmission = currentRound.submissions.find(s => s.playerId === submission.playerId);
    if (existingSubmission) throw new Error('Player already submitted');
    
    // Add submission
    const updatedRounds = [...gameData.rounds];
    updatedRounds[gameData.currentRound - 1].submissions.push(submission);
    
    await updateDoc(gameRef, {
      rounds: updatedRounds,
      updatedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error submitting gif:', error);
    throw error;
  }
};

export const selectWinner = async (gameId: string, submissionId: string) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data() as Game;
    const currentRound = gameData.rounds[gameData.currentRound - 1];
    
    // Find the winning submission
    const winningSubmission = currentRound.submissions.find(s => s.id === submissionId);
    if (!winningSubmission) throw new Error('Submission not found');
    
    // Update the round
    const updatedRounds = [...gameData.rounds];
    updatedRounds[gameData.currentRound - 1].winningSubmission = winningSubmission;
    updatedRounds[gameData.currentRound - 1].isComplete = true;
    
    // Update player score
    const updatedPlayers = gameData.players.map(p => 
      p.id === winningSubmission.playerId 
        ? { ...p, score: p.score + 1 } 
        : p
    );
    
    const winner = updatedPlayers.find(p => p.id === winningSubmission.playerId);
    let gameStatus = gameData.status;
    
    // Check if game is over
    if (winner && winner.score >= gameData.maxScore || gameData.currentRound >= gameData.maxRounds) {
      gameStatus = 'completed';
    }
    
    await updateDoc(gameRef, {
      rounds: updatedRounds,
      players: updatedPlayers,
      status: gameStatus,
      updatedAt: Date.now()
    });
    
    return winner;
  } catch (error) {
    console.error('Error selecting winner:', error);
    throw error;
  }
};

export const startNextRound = async (gameId: string) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data() as Game;
    
    if (gameData.status === 'completed') {
      throw new Error('Game is already completed');
    }
    
    // Determine next judge - rotate through active players
    const activePlayers = gameData.players.filter(p => p.isActive);
    const currentJudgeIndex = activePlayers.findIndex(p => p.id === gameData.rounds[gameData.currentRound - 1].judgeId);
    const nextJudgeIndex = (currentJudgeIndex + 1) % activePlayers.length;
    const nextJudge = activePlayers[nextJudgeIndex];
    
    // Create new round
    const prompt = getRandomPrompt();
    const newRound: Round = {
      id: gameData.currentRound + 1,
      prompt,
      judgeId: nextJudge.id,
      submissions: [],
      isComplete: false
    };
    
    // Update players (set new judge)
    const updatedPlayers = gameData.players.map(p => ({
      ...p,
      isJudge: p.id === nextJudge.id
    }));
    
    await updateDoc(gameRef, {
      players: updatedPlayers,
      rounds: [...gameData.rounds, newRound],
      currentRound: gameData.currentRound + 1,
      updatedAt: Date.now()
    });
    
    return newRound;
  } catch (error) {
    console.error('Error starting next round:', error);
    throw error;
  }
};

export const setCustomPrompt = async (gameId: string, promptText: string) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data() as Game;
    const currentRound = gameData.rounds[gameData.currentRound - 1];
    
    // Create custom prompt
    const customPrompt: Prompt = {
      id: `custom-${Date.now()}`,
      text: promptText,
      createdBy: currentRound.judgeId
    };
    
    // Update round with custom prompt
    const updatedRounds = [...gameData.rounds];
    updatedRounds[gameData.currentRound - 1].prompt = customPrompt;
    
    await updateDoc(gameRef, {
      rounds: updatedRounds,
      updatedAt: Date.now()
    });
    
    return customPrompt;
  } catch (error) {
    console.error('Error setting custom prompt:', error);
    throw error;
  }
};

export const getGameById = async (gameId: string) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    return gameDoc.data() as Game;
  } catch (error) {
    console.error('Error getting game:', error);
    throw error;
  }
};

export const subscribeToGame = (gameId: string, callback: (game: Game) => void) => {
  const gameRef = doc(db, 'games', gameId);
  
  return onSnapshot(gameRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Game);
    } else {
      console.error('Game not found');
    }
  });
};

// Utility function to get a random prompt
export const getRandomPrompt = (): Prompt => {
  const randomIndex = Math.floor(Math.random() * DEFAULT_PROMPTS.length);
  return DEFAULT_PROMPTS[randomIndex];
};

// Add a custom prompt to the game
export const addCustomPrompt = async (gameId: string, prompt: Prompt) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    
    await updateDoc(gameRef, {
      customPrompts: arrayUnion(prompt),
      updatedAt: Date.now()
    });
    
    return prompt;
  } catch (error) {
    console.error('Error adding custom prompt:', error);
    throw error;
  }
};