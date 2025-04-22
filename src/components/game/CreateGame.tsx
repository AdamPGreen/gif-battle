import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Dice5, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import toast from 'react-hot-toast';
import type { User } from '../../types';

interface CreateGameProps {
  user: User;
}

const CreateGame: React.FC<CreateGameProps> = ({ user }) => {
  const [gameName, setGameName] = useState('');
  const { createNewGame, loading } = useGameStore();
  const navigate = useNavigate();

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameName.trim()) {
      toast.error('Please enter a game name');
      return;
    }
    
    try {
      const gameId = await createNewGame(
        user.id, 
        user.displayName || 'Anonymous', 
        gameName
      );
      
      toast.success('Game created successfully!');
      navigate(`/game/${gameId}`);
    } catch (error: any) {
      console.error('Error creating game:', error);
      toast.error(error.message || 'Failed to create game');
    }
  };

  const handleRandomName = () => {
    const adjectives = ['Epic', 'Awesome', 'Wild', 'Radical', 'Funky', 'Groovy', 'Neon', 'Cosmic', 'Digital', 'Cyber'];
    const nouns = ['GIFs', 'Battle', 'Showdown', 'Arena', 'Party', 'Clash', 'Duel', 'Rumble', 'Contest', 'Challenge'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    setGameName(`${randomAdjective} ${randomNoun}`);
  };

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-black bg-opacity-80 border border-purple-600 rounded-xl p-8 shadow-lg backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <Gift size={48} className="text-pink-500" />
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Create New Game</h2>
        
        <form onSubmit={handleCreateGame} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Game Name"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full py-3 px-4 text-gray-200 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center">
              <motion.button
                type="button"
                onClick={handleRandomName}
                className="text-cyan-400 hover:text-cyan-300"
                whileHover={{ 
                  rotate: [0, 15, -15, 0], 
                  scale: 1.2,
                  transition: {
                    rotate: { repeat: Infinity, duration: 0.5 },
                    scale: { duration: 0.2 }
                  }
                }}
                whileTap={{ scale: 0.9 }}
                title="Generate Random Name"
              >
                <Dice5 size={20} />
              </motion.button>
            </div>
          </div>
          
          <motion.button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Game...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Plus className="h-5 w-5" />
                Create Game
              </span>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateGame;