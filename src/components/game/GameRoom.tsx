import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, LogOut, Award, Users } from 'lucide-react';
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
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

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

  // Show welcome message for players joining in-progress games
  useEffect(() => {
    if (game && game.status === 'playing') {
      const currentPlayer = game.players.find(p => p.id === user.id);
      if (currentPlayer && currentPlayer.isActive) {
        // Check if the player just joined (by looking at the current round's submissions)
        const currentRound = game.rounds[game.currentRound - 1];
        
        // Only show welcome message if:
        // 1. The player is not the host (who started the game)
        // 2. The player hasn't submitted in the current round
        // 3. There are already submissions from other players (indicating the game is in progress)
        if (currentRound && 
            !currentPlayer.isHost && 
            !currentRound.submissions.some(s => s.playerId === user.id) &&
            currentRound.submissions.length > 0) {
          setShowWelcomeMessage(true);
          // Hide the message after 5 seconds
          const timer = setTimeout(() => {
            setShowWelcomeMessage(false);
          }, 5000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [game, user.id]);

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
      toast.success('Left the game');
      navigate('/');
    } catch (error: any) {
      console.error('Error leaving game:', error);
      toast.error(error.message || 'Failed to leave game');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading game...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
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
    <div className="min-h-screen bg-gray-900 text-white">
      <GameHeader 
        game={game} 
        onCopyInvite={handleCopyInvite} 
        onLeaveGame={handleLeaveGame}
        copied={copied}
      />
      
      {showWelcomeMessage && (
        <motion.div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-90 border border-purple-600 rounded-xl p-6 shadow-lg backdrop-blur-sm max-w-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <h3 className="text-xl font-bold text-center mb-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Welcome to the Game!
          </h3>
          <p className="text-gray-300 text-center">
            You've joined an in-progress game. You'll be able to participate in the next round.
          </p>
        </motion.div>
      )}
      
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
  
  return (
    <motion.div 
      className="bg-black bg-opacity-80 border-b border-purple-600 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="glitch-text bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent text-2xl font-bold">
              GIF BATTLE
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-xl">{game.name}</span>
          </div>
          
          <div className="flex items-center gap-4">
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
                  <span className="hidden sm:inline">Copy Invite</span>
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
              <span className="hidden sm:inline">Exit Game</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameRoom;