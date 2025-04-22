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
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { nanoid } from 'nanoid';
import type { Game, Player, Round, Prompt, GifSubmission } from '../types';

// Default prompts for the game
const DEFAULT_PROMPTS: Prompt[] = [
  { id: 'p1', text: 'When the edible hits during a job interview...' },
  { id: 'p2', text: 'Trying to remember if you took your birth control...' },
  { id: 'p3', text: 'When your ex texts \'I miss you\' at 2am...' },
  { id: 'p4', text: 'Watching your friend lie to their therapist...' },
  { id: 'p5', text: 'When the group chat turns into a crime scene...' },
  { id: 'p6', text: 'Realizing mid-hookup that they live with their parents...' },
  { id: 'p7', text: 'When your boss calls you \'family\' but denies your raise...' },
  { id: 'p8', text: 'Trying to look innocent after deleting browser history...' },
  { id: 'p9', text: 'When the bartender cuts you off and you\'re not even close...' },
  { id: 'p10', text: 'Your face when someone says \'crypto is the future\'...' },
  { id: 'p11', text: 'When the condom breaks and you both pretend it\'s fine...' },
  { id: 'p12', text: 'Reacting to your own nudes like it\'s a Yelp review...' },
  { id: 'p13', text: 'Trying to ghost someone but they keep showing up...' },
  { id: 'p14', text: 'When the guy with a podcast starts talking about women...' },
  { id: 'p15', text: 'When someone starts a sentence with \'I\'m not racist, but\'...' },
  { id: 'p16', text: 'Realizing you\'ve been in a situationship for 8 months...' },
  { id: 'p17', text: 'Watching your friend spiral over someone they met once...' },
  { id: 'p18', text: 'Seeing your therapist at the bar while blackout drunk...' },
  { id: 'p19', text: 'When your hookup starts talking about crystals mid-stroke...' },
  { id: 'p20', text: 'Trying not to laugh at a funeral because someone farted...' },
  { id: 'p21', text: 'When you hear your neighbor\'s OnlyFans content through the wall...' },
  { id: 'p22', text: 'Explaining your job to your boomer uncle at Thanksgiving...' },
  { id: 'p23', text: 'When your friends roast your new situationship...' },
  { id: 'p24', text: 'Watching your Uber driver hit on your date...' },
  { id: 'p25', text: 'When the kink goes too far but you\'re too polite to say no...' },
  { id: 'p26', text: 'Reacting to your own bank account after a night out...' },
  { id: 'p27', text: 'Trying to look hot while mid-anxiety attack...' },
  { id: 'p28', text: 'When the guy you slept with starts quoting Joe Rogan...' },
  { id: 'p29', text: 'When you realize you\'re the toxic one...' },
  { id: 'p30', text: 'Trying to sext while holding in a poop...' },
  { id: 'p31', text: 'When your one-night stand wants to cuddle...' },
  { id: 'p32', text: 'When you thought it was a date but it was a pyramid scheme...' },
  { id: 'p33', text: 'Reacting to a 45-minute voice memo from your unstable friend...' },
  { id: 'p34', text: 'That feeling when the walk of shame turns into a parade...' },
  { id: 'p35', text: 'When your therapist starts crying...' },
  { id: 'p36', text: 'Realizing too late that it\'s not an open bar...' },
  { id: 'p37', text: 'When you open Hinge and see your boss...' },
  { id: 'p38', text: 'Trying to look chill after saying \'I love you\' too soon...' },
  { id: 'p39', text: 'When the Zoom camera turns on and you\'re naked...' },
  { id: 'p40', text: 'Watching your friend go back to their toxic ex for the 7th time...' },
  { id: 'p41', text: 'Trying to fake a kink you definitely don\'t have...' },
  { id: 'p42', text: 'When your vibrator dies mid-session...' },
  { id: 'p43', text: 'When your roommate walks in mid-orgasm...' },
  { id: 'p44', text: 'Trying to flirt but sounding like a cult leader...' },
  { id: 'p45', text: 'When your hookup says \'I\'ve never done this before\' and clearly has...' },
  { id: 'p46', text: 'When the hot person in the group chat says something wildly stupid...' },
  { id: 'p47', text: 'Trying to sneak out without saying goodbye after a one-night stand...' },
  { id: 'p48', text: 'When you realize the couple you\'re with wants a third...' },
  { id: 'p49', text: 'Reacting to a bad tattoo like it\'s a baby photo...' },
  { id: 'p50', text: 'When the roleplay starts but you forgot the safe word...' },
  { id: 'p51', text: 'Realizing you\'ve been talking to an AI for the last hour...' },
  { id: 'p52', text: 'When the raccoon you were feeding starts giving you life advice...' },
  { id: 'p53', text: 'Trying to seduce someone using only IKEA instructions...' },
  { id: 'p54', text: 'When you realize your Uber driver is also your therapist...' },
  { id: 'p55', text: 'Watching a goose steal your vape...' },
  { id: 'p56', text: 'When you accidentally join a cult but the vibes are immaculate...' },
  { id: 'p57', text: 'Mid-orgy and someone brings up climate change...' },
  { id: 'p58', text: 'Realizing you\'ve been live-streaming to LinkedIn for 2 hours...' },
  { id: 'p59', text: 'Getting emotionally attached to a traffic cone...' },
  { id: 'p60', text: 'When the mushrooms kick in and the trees start flirting...' },
  { id: 'p61', text: 'Trying to win an argument using nothing but astrology...' },
  { id: 'p62', text: 'When your clone shows up and starts dating your ex...' },
  { id: 'p63', text: 'Stuck in a group chat with your exes and a raccoon named Kevin...' },
  { id: 'p64', text: 'When the AI you trained starts roasting you...' },
  { id: 'p65', text: 'Reacting to your roommate starting a pyramid scheme for ferrets...' },
  { id: 'p66', text: 'When you walk in on your grandma hotboxing the bathroom...' },
  { id: 'p67', text: 'Falling in love with someone who only speaks in riddles...' },
  { id: 'p68', text: 'Trying to do taxes while being chased by a goose...' },
  { id: 'p69', text: 'When your reflection starts gaslighting you...' },
  { id: 'p70', text: 'Joining a protest you don\'t understand for the free snacks...' },
  { id: 'p71', text: 'Explaining your soul to a TSA agent...' },
  { id: 'p72', text: 'Being the only sober person at a mime convention...' },
  { id: 'p73', text: 'When your sleep paralysis demon asks for relationship advice...' },
  { id: 'p74', text: 'Trying to flirt in the metaverse...' },
  { id: 'p75', text: 'That moment when you realize the haunted doll is kind of hot...' },
  { id: 'p76', text: 'When your pet starts speaking Latin and levitating...' },
  { id: 'p77', text: 'When your kink is being ignored by customer service...' },
  { id: 'p78', text: 'Trying to pick a safe word during an exorcism...' },
  { id: 'p79', text: 'Realizing the \'edible\' was actually a communion wafer...' },
  { id: 'p80', text: 'When your Hinge date brings their emotional support snake...' },
  { id: 'p81', text: 'Falling in love with someone mid-heist...' },
  { id: 'p82', text: 'Trying to explain to your grandma why you\'re covered in glitter and regret...' },
  { id: 'p83', text: 'When you accidentally sext your dentist and they respond with floss tips...' },
  { id: 'p84', text: 'That feeling when the simulation crashes and you have to reboot reality...' },
  { id: 'p85', text: 'When your new roommate is definitely a Victorian ghost...' },
  { id: 'p86', text: 'Trying to vibe but your shadow starts arguing with you...' },
  { id: 'p87', text: 'When your NFT comes to life and demands alimony...' },
  { id: 'p88', text: 'Getting arrested at a Renaissance fair for tax fraud...' },
  { id: 'p89', text: 'When the acid kicks in and your houseplants start judging your life choices...' },
  { id: 'p90', text: 'Trying to hold eye contact with someone who\'s chewing loudly...' },
  { id: 'p91', text: 'When your one-night stand asks if you believe in lizard people...' },
  { id: 'p92', text: 'Trapped in a group project with your ex, your therapist, and Nicolas Cage...' },
  { id: 'p93', text: 'When your cat starts a podcast about your trauma...' },
  { id: 'p94', text: 'That moment when your sleep tracker calls 911...' },
  { id: 'p95', text: 'Trying to ghost someone but they send a singing telegram...' },
  { id: 'p96', text: 'When your clone starts dating hotter people than you...' },
  { id: 'p97', text: 'Getting roasted by a toddler with terrifying accuracy...' },
  { id: 'p98', text: 'When the Ouija board just says \'ew\' over and over...' }
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
  join: 5000,    // 5 seconds between joining games (increased from 2000)
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
      
      if (gameData.status === 'completed') {
        throw new Error('Game has already ended');
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
    
    // Prepare the first round
    const firstJudge = gameData.players.find(p => p.isHost);
    if (!firstJudge) throw new Error('No host found');
    
    const prompt = getRandomPrompt();
    const round: Round = {
      id: 1,
      prompt,
      judgeId: firstJudge.id,
      submissions: [],
      isComplete: false,
      hasStarted: false // Mark that the round hasn't started yet
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
      isComplete: false,
      hasStarted: false // Mark that the round hasn't started yet
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

// Helper function to get a new random prompt that's different from the current one
export const getNewRandomPrompt = (currentPromptId?: string): Prompt => {
  let newPrompt = getRandomPrompt();
  
  // Make sure we don't get the same prompt twice
  if (currentPromptId) {
    while (newPrompt.id === currentPromptId) {
      newPrompt = getRandomPrompt();
    }
  }
  
  return newPrompt;
};

// Regenerate a random prompt for the current round
export const regenerateRoundPrompt = async (gameId: string): Promise<Prompt> => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data() as Game;
    const currentRound = gameData.rounds[gameData.currentRound - 1];
    
    // Get a new prompt that's different from the current one
    const newPrompt = getNewRandomPrompt(currentRound.prompt.id);
    
    // Update the round with the new prompt
    const updatedRounds = [...gameData.rounds];
    updatedRounds[gameData.currentRound - 1].prompt = newPrompt;
    
    await updateDoc(gameRef, {
      rounds: updatedRounds,
      updatedAt: Date.now()
    });
    
    return newPrompt;
  } catch (error: any) {
    console.error('Error regenerating round prompt:', error);
    throw error;
  }
};

// Start the current prepared round (make it visible to players)
export const startCurrentRound = async (gameId: string) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    
    if (!gameDoc.exists()) {
      throw new Error('Game not found');
    }
    
    const gameData = gameDoc.data() as Game;
    const currentRound = gameData.rounds[gameData.currentRound - 1];
    
    // Mark the round as started
    const updatedRounds = [...gameData.rounds];
    updatedRounds[gameData.currentRound - 1].hasStarted = true;
    
    await updateDoc(gameRef, {
      rounds: updatedRounds,
      updatedAt: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error starting current round:', error);
    throw error;
  }
};

export const getUserGames = async (userId: string) => {
  try {
    const gamesRef = collection(db, 'games');
    const q = query(
      gamesRef,
      where('players', 'array-contains-any', [
        { id: userId, isActive: true },
        { id: userId, isActive: false }
      ]),
      orderBy('updatedAt', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const games: Game[] = [];
    
    querySnapshot.forEach((doc) => {
      const gameData = doc.data() as Game;
      games.push({
        ...gameData,
        id: doc.id
      });
    });
    
    return games;
  } catch (error) {
    console.error('Error getting user games:', error);
    throw error;
  }
};