import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import toast from 'react-hot-toast';
import type { User } from '../../types';

interface JoinGameProps {
  user: User;
}

const JoinGame: React.FC<JoinGameProps> = ({ user }) => {
  const [gameId, setGameId] = useState('');
  const { joinExistingGame, loading } = useGameStore();
  const navigate = useNavigate();

  const extractGameId = (input: string): string | null => {
    // Try to match a full URL first
    const urlMatch = input.match(/\/invite\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // If no URL match, assume it's a direct game ID
    // Game IDs are 8 characters long and alphanumeric
    if (/^[a-zA-Z0-9]{8}$/.test(input)) {
      return input;
    }
    
    return null;
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameId.trim()) {
      toast.error('Please enter a game ID or invite link');
      return;
    }
    
    const extractedGameId = extractGameId(gameId.trim());
    if (!extractedGameId) {
      toast.error('Invalid game ID or invite link format');
      return;
    }
    
    // Check if displayName is null or undefined and use a default value
    const playerName = user.displayName || `Player_${user.id.slice(0, 5)}`;
    
    try {
      await joinExistingGame(
        extractedGameId, 
        user.id, 
        playerName
      );
      
      navigate(`/game/${extractedGameId}`);
    } catch (error: any) {
      console.error('Error joining game:', error);
      toast.error(error.message || 'Failed to join game');
    }
  };

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="bg-black bg-opacity-80 rounded-xl p-8 shadow-lg backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <Users size={48} className="text-cyan-400" />
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Join Game</h2>
        
        <p className="text-gray-300 text-center mb-6">
          Enter a game ID or paste the invite link to join an existing game. You can join games that are waiting for players or already in progress.
        </p>
        
        <form onSubmit={handleJoinGame} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Game ID or invite link"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full py-3 px-4 text-gray-200 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <motion.button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 hover:from-cyan-700 hover:to-blue-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Joining Game...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Play className="h-5 w-5" />
                Join Game
              </span>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default JoinGame;