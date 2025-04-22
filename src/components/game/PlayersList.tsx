import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
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
        {activePlayers.map((player, index) => (
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
            {/* Rank position */}
            <div className="flex-shrink-0 w-6 font-bold text-center text-gray-400">
              #{index + 1}
            </div>
            
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              player.isJudge 
                ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                : 'bg-gradient-to-br from-pink-500 to-purple-600'
            }`}>
              <User size={16} className="text-white" />
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-medium truncate">{player.name}</span>
                
                <div className="flex flex-wrap gap-1">
                  {player.isJudge && (
                    <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">Judge</span>
                  )}
                  
                  {player.id === currentPlayer.id && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
              </div>
              
              <div className="text-gray-400 text-sm">
                <span>Score: {player.score}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PlayersList;