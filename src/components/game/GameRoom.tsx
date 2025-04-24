import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, LogOut, Award, Users, Menu, X, Clock } from 'lucide-react';
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
    setCurrentUser 
  } = useGameStore();
  
  const [copied, setCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showRoundResultsModal, setShowRoundResultsModal] = useState(false);
  const [lastCompletedRoundId, setLastCompletedRoundId] = useState<number | null>(null);
  const [currentUser, setLocalUser] = useState<User>(initialUser);
  
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
  
  useEffect(() => {
    // Load the game when component mounts
    if (gameId) {
      loadGame(gameId);
    }
  }, [gameId, loadGame]);
  
  // Check for newly completed rounds
  useEffect(() => {
    if (game?.rounds) {
      // Find the most recently completed round
      const completedRounds = game.rounds.filter(r => r.isComplete);
      if (completedRounds.length > 0) {
        const mostRecentRound = completedRounds.reduce((latest, round) => 
          round.id > latest.id ? round : latest
        );
        
        // Show result modal only for newly completed rounds
        if (mostRecentRound.id !== lastCompletedRoundId) {
          setLastCompletedRoundId(mostRecentRound.id);
          setShowRoundResultsModal(true);
        }
      }
    }
  }, [game?.rounds, lastCompletedRoundId]);
  
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
  
  const handleUserUpdate = (updatedUser: User) => {
    // Update local state
    setLocalUser(updatedUser);
    
    // Update the store
    setCurrentUser(updatedUser);
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
        copied={copied}
        user={currentUser}
        onUserUpdate={handleUserUpdate}
      />
      
      <div className="container mx-auto px-4 py-2 md:py-8">
        {game.status === 'waiting' && (
          <WaitingRoom game={game} isHost={isHost} currentPlayer={currentPlayer} />
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
  copied: boolean;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
  game, 
  onCopyInvite, 
  onLeaveGame, 
  onOpenHistory, 
  copied,
  user,
  onUserUpdate
}) => {
  const activePlayers = game.players.filter(p => p.isActive);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if there are any completed rounds to show history button
  const hasCompletedRounds = game.rounds.some(round => round.isComplete);
  
  return (
    <motion.div 
      className="bg-black bg-opacity-80 border-b border-purple-600 backdrop-blur-sm sticky top-0 z-[90]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 h-[65px] flex items-center">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <span className="glitch-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent text-xl md:text-2xl font-bold whitespace-nowrap">
              <span className="md:hidden">GB</span>
              <span className="hidden md:inline">GIF BATTLE</span>
            </span>
            <span className="text-gray-400 text-xl md:text-2xl">|</span>
            <span className="text-xl md:text-2xl truncate max-w-[120px] xs:max-w-[160px] sm:max-w-xs">{game.name}</span>
          </div>
          
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-cyan-400 px-3 py-1 rounded-full bg-gray-800">
              <Users size={18} />
              <span>{activePlayers.length} / {game.maxPlayers}</span>
            </div>
            
            {hasCompletedRounds && (
              <motion.button
                onClick={onOpenHistory}
                className="flex items-center gap-2 text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded-lg text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock size={16} />
                <span>Round History</span>
              </motion.button>
            )}
            
            <motion.button
              onClick={onCopyInvite}
              className="flex items-center gap-2 text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Invite</span>
                </>
              )}
            </motion.button>
            
            <motion.button
              onClick={onLeaveGame}
              className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Return to homepage"
            >
              <LogOut size={16} />
              <span>Exit Game</span>
            </motion.button>
            
            <UserProfileMenu user={user} onUserUpdate={onUserUpdate} />
          </div>
          
          {/* Mobile Controls */}
          <div className="md:hidden flex items-center gap-4">
            <UserProfileMenu user={user} onUserUpdate={onUserUpdate} />
            
            {hasCompletedRounds && (
              <motion.button
                onClick={onOpenHistory}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="View round history"
              >
                <Clock size={20} />
              </motion.button>
            )}
            
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              className="absolute top-[65px] left-0 right-0 bg-black bg-opacity-95 border-b border-purple-600 p-4 md:hidden z-[100]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-cyan-400 px-3 py-2 rounded-lg bg-gray-800/50 mb-2">
                  <Users size={18} />
                  <span>Players: {activePlayers.length} / {game.maxPlayers}</span>
                </div>
                
                <motion.button
                  onClick={() => {
                    onCopyInvite();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 text-white bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Copy size={18} />
                  <span>Copy Invite Link</span>
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    onLeaveGame();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={18} />
                  <span>Exit Game</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GameRoom;