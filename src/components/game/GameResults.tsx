import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../../types';

interface GameResultsProps {
  game: Game;
}

const GameResults: React.FC<GameResultsProps> = ({ game }) => {
  const navigate = useNavigate();
  
  const sortedPlayers = [...game.players]
    .filter(p => p.isActive)
    .sort((a, b) => b.score - a.score);
  
  const winners = sortedPlayers.filter((player, index, players) => 
    index === 0 || player.score === players[0].score
  );

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-black bg-opacity-90 backdrop-blur-sm border border-purple-600 rounded-xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Trophy size={40} className="text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Game Over!
          </h2>
          
          <p className="text-gray-300 mb-4">
            {winners.length === 1 
              ? `${winners[0].name} is the winner!` 
              : `It's a tie between ${winners.map(w => w.name).join(' and ')}!`}
          </p>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            <span>Final Scores</span>
          </h3>
          
          <div className="space-y-3 max-w-md mx-auto">
            {sortedPlayers.map((player, index) => (
              <motion.div 
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {index === 0 ? (
                    <Medal size={24} className="text-yellow-500" />
                  ) : index === 1 ? (
                    <Medal size={24} className="text-gray-400" />
                  ) : index === 2 ? (
                    <Medal size={24} className="text-amber-700" />
                  ) : (
                    <span className="text-gray-400 font-medium">{index + 1}</span>
                  )}
                </div>
                
                <span className="flex-grow font-medium">{player.name}</span>
                
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <span>{player.score}</span>
                  <Star size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <motion.button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 mx-auto hover:from-purple-700 hover:to-pink-700"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home size={20} />
            <span>Back to Home</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameResults;