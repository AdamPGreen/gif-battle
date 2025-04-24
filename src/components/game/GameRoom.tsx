import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, LogOut, Award, Users, Menu, X, Clock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import toast from 'react-hot-toast';
import type { User, Player, Game } from '../../types';
import WaitingRoom from './WaitingRoom';
import GameRound from './GameRound';
import GameResults from './GameResults';
import RoundHistory from './RoundHistory';
import RoundResultsModal from './RoundResultsModal';
import UserProfileMenu from '../user/UserProfileMenu';
import { PowerGlitch } from 'powerglitch';

interface GameRoomProps {
  user: User;
}

const GameRoom: React.FC<GameRoomProps> = ({ user: initialUser }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { 
    game, 
    loading, 
    error, 
    loadGame, 
    joinExistingGame, 
    leaveCurrentGame,
    setCurrentUser,
    subscribeToGameUpdates
  } = useGameStore();
  
  const [copied, setCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showRoundResultsModal, setShowRoundResultsModal] = useState(false);
  const [lastCompletedRoundId, setLastCompletedRoundId] = useState<number | null>(null);
  const [currentUser, setLocalUser] = useState<User>(initialUser);
  
  // Refs for tracking notification states
  const roundStartRef = useRef<{ [key: number]: boolean }>({});
  const roundCompleteRef = useRef<{ [key: number]: boolean }>({});
  
  // Initialize PowerGlitch
  useEffect(() => {
    PowerGlitch.glitch('.glitch-text', {
      playMode: 'always',
      createContainers: true,
      hideOverflow: false,
      timing: {
        duration: 2000,
        iterations: Infinity
      },
      glitchTimeSpan: {
        start: 0.5,
        end: 0.7,
      },
      shake: {
        velocity: 15,
        amplitudeX: 0.2,
        amplitudeY: 0.2,
      },
      slice: {
        count: 6,
        velocity: 15,
        minHeight: 0.02,
        maxHeight: 0.15,
        hueRotate: true,
      },
      pulse: false
    });
  }, []);
  
  // Load the game and set up real-time updates
  useEffect(() => {
    if (gameId) {
      // Initial load of the game
      loadGame(gameId);
      
      // Set up real-time updates
      const unsubscribe = subscribeToGameUpdates(gameId);
      
      // Clean up the subscription when component unmounts
      return () => {
        unsubscribe();
      };
    }
  }, [gameId, loadGame, subscribeToGameUpdates]);
  
  // Find the last completed round
  useEffect(() => {
    if (game?.rounds) {
      // Find the most recently completed round
      const completedRounds = game.rounds.filter(r => r.isComplete);
      if (completedRounds.length > 0) {
        const mostRecentRound = completedRounds.reduce((latest, round) => 
          round.id > latest.id ? round : latest
        );
        
        // Update the lastCompletedRoundId
        setLastCompletedRoundId(mostRecentRound.id);
      }
    }
  }, [game?.rounds]);
  
  // Notify users about important game state changes
  useEffect(() => {
    if (!game) return;
    
    // Show toast when a round starts
    const currentRound = game.rounds[game.currentRound - 1];
    
    if (currentRound?.hasStarted && !roundStartRef.current[game.currentRound]) {
      // Record that we've shown this notification
      roundStartRef.current[game.currentRound] = true;
      
      toast.success(`Round ${game.currentRound} has started!`, {
        id: `round-start-${game.currentRound}`,
        duration: 3000
      });
    }
    
    // Show toast when a round completes
    if (currentRound?.isComplete && !roundCompleteRef.current[game.currentRound]) {
      // Record that we've shown this notification
      roundCompleteRef.current[game.currentRound] = true;
      
      const winnerName = currentRound.winningSubmission?.playerName;
      if (winnerName) {
        toast.success(`Round over! ${winnerName} won the round!`, {
          id: `round-complete-${game.currentRound}`,
          duration: 4000
        });
      }
    }
    
  }, [game]);
  
  // Add event listener for "VIEW_LAST_ROUND_RESULTS" event
  useEffect(() => {
    const handleViewLastRoundResults = () => {
      setShowRoundResultsModal(true);
    };
    
    window.addEventListener('VIEW_LAST_ROUND_RESULTS', handleViewLastRoundResults);
    
    return () => {
      window.removeEventListener('VIEW_LAST_ROUND_RESULTS', handleViewLastRoundResults);
    };
  }, []);
  
  const handleCopyInvite = () => {
    if (!gameId) return;
    
    const inviteLink = `${window.location.origin}/invite/${gameId}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Invite link copied!');
      })
      .catch(() => {
        toast.error('Failed to copy invite link');
      });
  };
  
  const handleLeaveGame = async () => {
    if (!gameId) return;
    
    try {
      await leaveCurrentGame(gameId, currentUser.id);
      navigate('/');
    } catch (error: any) {
      console.error('Error leaving game:', error);
      toast.error(error.message || 'Failed to leave game');
    }
  };
  
  const handleUserUpdate = async (updatedUser: User) => {
    // Update local state
    setLocalUser(updatedUser);
    
    // Update the store
    setCurrentUser(updatedUser);
    
    // Also update the player name in the game if we're in a game
    if (gameId && game) {
      try {
        // Extract the updatePlayerName from the store
        const { updatePlayerName } = useGameStore.getState();
        // Call the function with the updated user display name
        await updatePlayerName(gameId, updatedUser.id, updatedUser.displayName || '');
      } catch (error) {
        console.error('Failed to update player name in game:', error);
        // Don't show error toast as the profile was successfully updated
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black md:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading game...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black md:bg-gray-900">
        <div className="text-center text-red-500 bg-black bg-opacity-70 p-8 rounded-xl">
          <p className="text-2xl mb-4">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black md:bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Game not found</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }
  
  const currentPlayer = game.players.find(p => p.id === currentUser.id);
  const isHost = currentPlayer?.isHost || false;
  
  if (!currentPlayer || !currentPlayer.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black md:bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">You are not a player in this game</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black md:bg-gray-900 text-white">
      <GameHeader 
        game={game} 
        onCopyInvite={handleCopyInvite} 
        onLeaveGame={handleLeaveGame}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onViewLastRoundResults={() => setShowRoundResultsModal(true)}
        copied={copied}
        user={currentUser}
        onUserUpdate={handleUserUpdate}
        hasCompletedRounds={lastCompletedRoundId !== null}
      />
      
      <div className="container mx-auto px-4 py-2 md:py-8">
        {game.status === 'waiting' && (
          <WaitingRoom 
            game={game} 
            isHost={isHost} 
            currentPlayer={currentPlayer} 
            currentUser={currentUser}
          />
        )}
        
        {game.status === 'playing' && (
          <GameRound 
            game={game} 
            currentPlayer={currentPlayer} 
            user={currentUser}
          />
        )}
        
        {game.status === 'completed' && (
          <GameResults game={game} />
        )}
      </div>
      
      <AnimatePresence>
        {isHistoryOpen && (
          <RoundHistory 
            game={game} 
            isOpen={isHistoryOpen} 
            onClose={() => setIsHistoryOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Add the RoundResultsModal for completed rounds */}
      {game?.rounds.length > 0 && lastCompletedRoundId && (
        <RoundResultsModal
          isOpen={showRoundResultsModal}
          onClose={() => setShowRoundResultsModal(false)}
          round={game.rounds.find(r => r.id === lastCompletedRoundId)!}
          currentPlayer={currentPlayer!}
        />
      )}
    </div>
  );
};

interface GameHeaderProps {
  game: Game;
  onCopyInvite: () => void;
  onLeaveGame: () => void;
  onOpenHistory: () => void;
  onViewLastRoundResults: () => void;
  copied: boolean;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  hasCompletedRounds: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
  game, 
  onCopyInvite, 
  onLeaveGame, 
  onOpenHistory, 
  onViewLastRoundResults,
  copied,
  user,
  onUserUpdate,
  hasCompletedRounds
}) => {
  const activePlayers = game.players.filter(p => p.isActive);
  
  return (
    <motion.div 
      className="bg-black bg-opacity-80 border-b border-purple-600 backdrop-blur-sm sticky top-0 z-[90]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 h-[60px] flex items-center">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-shrink-1 mr-3">
            <span className="glitch-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent text-xl md:text-2xl font-bold whitespace-nowrap flex-shrink-0">
              <span className="md:hidden">GB</span>
              <span className="hidden md:inline">GIF BATTLE</span>
            </span>
            <span className="text-gray-400 text-xl md:text-2xl flex-shrink-0">|</span>
            <span className="text-xl md:text-2xl truncate w-full max-w-[calc(100vw-130px)] xs:max-w-[220px] sm:max-w-[360px] md:max-w-[500px]">{game.name}</span>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Copy Invite Button */}
            <motion.button
              onClick={onCopyInvite}
              className="h-9 flex items-center justify-center gap-1 text-white bg-gray-800 hover:bg-gray-700 px-3 rounded-lg text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <span className="py-1.5">Copied!</span>
              ) : (
                <>
                  <Copy size={16} className="flex-shrink-0" />
                  <span className="hidden sm:inline py-1.5">Copy Invite</span>
                </>
              )}
            </motion.button>
            
            {/* User Profile Menu with Game Actions */}
            <div className="flex items-center">
              <UserProfileMenu 
                user={user} 
                onUserUpdate={onUserUpdate} 
                gameActions={{
                  onCopyInvite,
                  onLeaveGame,
                  onOpenHistory,
                  onViewLastRoundResults,
                  hasCompletedRounds,
                  playersCount: activePlayers.length,
                  maxPlayers: game.maxPlayers,
                  copied
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameRoom;