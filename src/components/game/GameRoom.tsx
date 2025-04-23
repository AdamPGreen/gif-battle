import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, LogOut, Award, Users, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import toast from 'react-hot-toast';
import type { User, Player, Game } from '../../types';
import WaitingRoom from './WaitingRoom';
import GameRound from './GameRound';
import GameResults from './GameResults';

interface GameRoomProps {
  user: User;
}

const GameRoom: React.FC<GameRoomProps> = ({ user }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { 
    game, 
    loading, 
    error,
    loadGame, 
    subscribeToGameUpdates,
    leaveCurrentGame,
    setCurrentUser
  } = useGameStore();
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    
    // Load the game
    loadGame(gameId).catch(err => {
      console.error('Error loading game:', err);
      toast.error('Failed to load game');
      navigate('/');
    });
    
    // Set the current user
    setCurrentUser(user);
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToGameUpdates(gameId);
    
    // Clean up
    return () => {
      unsubscribe();
    };
  }, [gameId, user, loadGame, subscribeToGameUpdates, setCurrentUser, navigate]);

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/invite/${gameId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Invite link copied to clipboard!');
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLeaveGame = async () => {
    if (!gameId) return;
    
    try {
      await leaveCurrentGame(gameId, user.id);
      navigate('/');
    } catch (error: any) {
      console.error('Error leaving game:', error);
      toast.error(error.message || 'Failed to leave game');
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
  
  const currentPlayer = game.players.find(p => p.id === user.id);
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
        copied={copied}
      />
      
      <div className="container mx-auto px-4 py-8">
        {game.status === 'waiting' && (
          <WaitingRoom game={game} isHost={isHost} currentPlayer={currentPlayer} />
        )}
        
        {game.status === 'playing' && (
          <GameRound 
            game={game} 
            currentPlayer={currentPlayer} 
            user={user}
          />
        )}
        
        {game.status === 'completed' && (
          <GameResults game={game} />
        )}
      </div>
    </div>
  );
};

interface GameHeaderProps {
  game: Game;
  onCopyInvite: () => void;
  onLeaveGame: () => void;
  copied: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({ game, onCopyInvite, onLeaveGame, copied }) => {
  const activePlayers = game.players.filter(p => p.isActive);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <motion.div 
      className="bg-black bg-opacity-80 border-b border-purple-600 backdrop-blur-sm sticky top-0 z-[90]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <span className="glitch-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent text-base xs:text-xl sm:text-2xl md:text-2xl font-bold whitespace-nowrap">
              GIF BATTLE
            </span>
            <span className="text-gray-400 text-base xs:text-xl sm:text-2xl">|</span>
            <span className="text-base xs:text-xl sm:text-2xl md:text-2xl truncate max-w-[120px] xs:max-w-[160px] sm:max-w-xs">{game.name}</span>
          </div>
          
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-cyan-400 px-3 py-1 rounded-full bg-gray-800">
              <Users size={18} />
              <span>{activePlayers.length} / {game.maxPlayers}</span>
            </div>
            
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
          </div>
          
          {/* Mobile Controls */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-lg bg-gray-800 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              className="absolute top-full left-0 right-0 bg-black bg-opacity-95 border-b border-purple-600 p-4 md:hidden z-[100]"
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