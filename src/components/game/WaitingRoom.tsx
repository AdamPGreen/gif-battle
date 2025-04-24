import React from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Crown, Clock, Copy, Share } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import toast from 'react-hot-toast';
import type { Game, Player, User } from '../../types';
import PlayersList from './PlayersList';

interface WaitingRoomProps {
  game: Game;
  isHost: boolean;
  currentPlayer: Player;
  currentUser?: User;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  game, 
  isHost, 
  currentPlayer,
  currentUser 
}) => {
  const { startCurrentGame, loading } = useGameStore();
  
  const activePlayers = game.players.filter(p => p.isActive);
  
  const handleStartGame = async () => {
    if (activePlayers.length < 2) {
      toast.error('You need at least 2 players to start the game');
      return;
    }
    
    try {
      await startCurrentGame(game.id);
      toast.success('Game started!');
    } catch (error: any) {
      console.error('Error starting game:', error);
      toast.error(error.message || 'Failed to start game');
    }
  };
  
  const handleCopyGameId = () => {
    navigator.clipboard.writeText(game.id);
    toast.success('Game ID copied to clipboard!');
  };
  
  const handleShareGame = async () => {
    const shareUrl = `${window.location.origin}/invite/${game.id}`;
    
    // Check if the Web Share API is available (mostly on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my GIF Battle game!',
          text: 'Click to join my GIF Battle game',
          url: shareUrl
        });
        toast.success('Game shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy if share was cancelled or failed
        navigator.clipboard.writeText(shareUrl);
        toast.success('Game link copied to clipboard!');
      }
    } else {
      // Fallback for desktop browsers
      navigator.clipboard.writeText(shareUrl);
      toast.success('Game link copied to clipboard!');
    }
  };
  
  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-black md:bg-opacity-90 md:backdrop-blur-sm md:border md:border-purple-600 rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Waiting for Players
          </h2>
          <p className="text-gray-300">
            Share the invite link with friends to join your game
          </p>
        </div>
        
        <div className="mb-6 flex justify-center items-center gap-3">
          <div className="bg-gray-800 rounded-lg px-4 py-2 text-gray-300 flex items-center gap-2">
            <span>Game ID:</span>
            <span className="font-mono text-cyan-400">{game.id}</span>
            <motion.button
              onClick={handleCopyGameId}
              className="ml-1 p-1 text-gray-300 hover:text-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Copy Game ID"
            >
              <Copy size={16} />
            </motion.button>
          </div>
          <motion.button
            onClick={handleShareGame}
            className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Share Game"
          >
            <Share size={18} />
          </motion.button>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-cyan-400" />
            <span>Players ({activePlayers.length}/{game.maxPlayers})</span>
          </h3>
          
          <PlayersList 
            game={game} 
            currentPlayer={currentPlayer} 
            currentUser={currentUser} 
          />
        </div>
        
        <div className="text-center">
          {isHost ? (
            <motion.button
              onClick={handleStartGame}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 mx-auto hover:from-purple-700 hover:to-pink-700 disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || activePlayers.length < 2}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Play size={20} />
                  <span>Start Game</span>
                </>
              )}
            </motion.button>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Clock size={24} className="animate-pulse" />
              <p>Waiting for the host to start the game...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WaitingRoom;