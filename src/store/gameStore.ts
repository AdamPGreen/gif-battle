import { create } from 'zustand';
import type { GameState, Game, User, GifSubmission } from '../types';
import { 
  createGame, 
  joinGame, 
  leaveGame, 
  startGame, 
  submitGif, 
  selectWinner, 
  startNextRound, 
  setCustomPrompt, 
  getGameById,
  subscribeToGame,
  regenerateRoundPrompt,
  startCurrentRound,
  getUserGames,
  updatePlayerName
} from '../services/game';

interface GameStore extends GameState {
  setGame: (game: Game | null) => void;
  setCurrentUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  createNewGame: (hostId: string, hostName: string, gameName: string) => Promise<string>;
  joinExistingGame: (gameId: string, userId: string, userName: string) => Promise<void>;
  leaveCurrentGame: (gameId: string, userId: string) => Promise<void>;
  startCurrentGame: (gameId: string) => Promise<void>;
  submitGifToGame: (gameId: string, submission: GifSubmission) => Promise<void>;
  selectWinningGif: (gameId: string, submissionId: string) => Promise<void>;
  startNextGameRound: (gameId: string) => Promise<void>;
  setCustomGamePrompt: (gameId: string, promptText: string) => Promise<void>;
  regenerateGamePrompt: (gameId: string) => Promise<void>;
  startCurrentGameRound: (gameId: string) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  subscribeToGameUpdates: (gameId: string) => () => void;
  resetGameState: () => void;
  userGames: Game[];
  getUserGames: (userId: string) => Promise<Game[]>;
  updatePlayerName: (gameId: string, playerId: string, playerName: string) => Promise<void>;
}

const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  userGames: [],
  currentUser: null,
  loading: false,
  error: null,
  
  setGame: (game) => set({ game }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  createNewGame: async (hostId, hostName, gameName) => {
    set({ loading: true, error: null });
    try {
      const gameId = await createGame(hostId, hostName, gameName);
      await get().loadGame(gameId);
      return gameId;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  joinExistingGame: async (gameId, userId, userName) => {
    set({ loading: true, error: null });
    try {
      await joinGame(gameId, { 
        id: userId, 
        name: userName,
        isHost: false,
        isJudge: false,
        score: 0,
        isActive: true
      });
      await get().loadGame(gameId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  leaveCurrentGame: async (gameId, userId) => {
    set({ loading: true, error: null });
    try {
      await leaveGame(gameId, userId);
      set({ game: null });
      
      // Fetch user games after leaving to update the list
      await get().getUserGames(userId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  startCurrentGame: async (gameId) => {
    set({ loading: true, error: null });
    try {
      await startGame(gameId);
      await get().loadGame(gameId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  submitGifToGame: async (gameId, submission) => {
    set({ loading: true, error: null });
    try {
      await submitGif(gameId, submission);
      await get().loadGame(gameId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  selectWinningGif: async (gameId, submissionId) => {
    set({ loading: true, error: null });
    try {
      await selectWinner(gameId, submissionId);
      await get().loadGame(gameId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  startNextGameRound: async (gameId) => {
    set({ loading: true, error: null });
    try {
      await startNextRound(gameId);
      await get().loadGame(gameId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  setCustomGamePrompt: async (gameId, promptText) => {
    set({ loading: true, error: null });
    try {
      await setCustomPrompt(gameId, promptText);
      await get().loadGame(gameId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  regenerateGamePrompt: async (gameId) => {
    set({ loading: true, error: null });
    try {
      const newPrompt = await regenerateRoundPrompt(gameId);
      const currentGame = get().game;
      
      if (currentGame) {
        const currentRoundIndex = currentGame.currentRound - 1;
        
        const updatedRounds = [...currentGame.rounds];
        updatedRounds[currentRoundIndex] = {
          ...updatedRounds[currentRoundIndex],
          prompt: newPrompt
        };
        
        set({ 
          game: { 
            ...currentGame, 
            rounds: updatedRounds 
          },
          loading: false
        });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  startCurrentGameRound: async (gameId) => {
    set({ loading: true, error: null });
    try {
      await startCurrentRound(gameId);
      await get().loadGame(gameId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  loadGame: async (gameId) => {
    set({ loading: true, error: null });
    try {
      const gameData = await getGameById(gameId);
      set({ game: gameData });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  subscribeToGameUpdates: (gameId) => {
    const unsubscribe = subscribeToGame(gameId, (game) => {
      set({ game });
    });
    return unsubscribe;
  },
  
  resetGameState: () => {
    set({ 
      game: null,
      error: null,
      loading: false
    });
  },

  getUserGames: async (userId) => {
    set({ loading: true, error: null });
    try {
      const games = await getUserGames(userId);
      set({ userGames: games });
      return games;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePlayerName: async (gameId, playerId, playerName) => {
    try {
      await updatePlayerName(gameId, playerId, playerName);
      // Reload the game to reflect the updated player name
      await get().loadGame(gameId);
    } catch (error: any) {
      console.error('Error updating player name:', error);
      throw error;
    }
  }
}));

export default useGameStore;