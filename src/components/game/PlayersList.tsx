import React from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Star } from 'lucide-react';
import type { Game, Player } from '../../types';

interface PlayersListProps {
  game: Game;
  currentPlayer: Player;
}

const PlayersList: React.FC<PlayersListProps> = ({ game, currentPlayer }) => {
  const activePlayers = game.players
    .filter(p => p.isActive)
    .sort((a, b) => b.score - a.score);
  
  return (
    <motion.div 
      className="bg-black bg-opacity-90 backdrop-blur-sm border border-purple-600 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h2 className="text-xl font-semibold mb-4">Players</h2>
      
      <div className="space-y-2">
        {activePlayers.map((player) => (
          <motion.div 
            key={player.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              player.id === currentPlayer.id 
                ? 'bg-purple-900 bg-opacity-50' 
                : player.isJudge
                  ? 'bg-gray-700'
                  : 'bg-gray-800'
            }`}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              player.isJudge 
                ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                : 'bg-gradient-to-br from-pink-500 to-purple-600'
            }`}>
              <User size={16} className="text-white" />
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <span className="font-medium">{player.name}</span>
                {player.isHost && (
                  <Crown size={14} className="text-yellow-500" />
                )}
                {player.isJudge && (
                  <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">Judge</span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Star size={14} className="text-yellow-500" />
                <span>Score: {player.score}</span>
              </div>
            </div>
            
            {player.id === currentPlayer.id && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlayersList;