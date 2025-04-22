import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, PlayCircle, Clock, Check, AlertTriangle, Play, Award } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import type { Game, User } from '../../types';

interface ActiveGamesListProps {
  user: User;
}

const ActiveGamesList: React.FC<ActiveGamesListProps> = ({ user }) => {
  const { userGames, getUserGames, loading: isLoading } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    getUserGames(user.id);
  }, [getUserGames, user.id]);

  const getGameStatusInfo = (game: Game) => {
    if (game.status === 'waiting') {
      return {
        text: 'Waiting for players',
        color: 'bg-purple-900 bg-opacity-30 border-purple-600',
        icon: <Clock size={14} className="text-purple-400" />
      };
    } else if (game.status === 'playing') {
      return {
        text: 'In progress',
        color: 'bg-blue-900 bg-opacity-30 border-blue-600',
        icon: <Play size={14} className="text-blue-400" />
      };
    } else {
      return {
        text: 'Completed',
        color: 'bg-gray-800 bg-opacity-30 border-gray-600',
        icon: <Award size={14} className="text-gray-400" />
      };
    }
  };

  const handleGameClick = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-800 bg-opacity-50 rounded-xl text-center">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-400">Loading your games...</p>
      </div>
    );
  }

  if (userGames.length === 0) {
    return (
      <div className="p-6 bg-gray-800 bg-opacity-50 rounded-xl text-center text-gray-400">
        No active games found. Join a game below!
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {userGames.map((game) => {
        const statusInfo = getGameStatusInfo(game);
        const isPlayerActive = game.players.some(p => p.id === user.id && p.isActive);
        
        return (
          <motion.div
            key={game.id}
            className={`p-4 border rounded-lg ${statusInfo.color} cursor-pointer hover:bg-opacity-30 transition-colors`}
            onClick={() => handleGameClick(game.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-white">{game.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-300 mt-1">
                  {statusInfo.icon}
                  <span>{statusInfo.text}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-cyan-400 text-sm">
                  <Users size={14} />
                  <span>{game.players.filter(p => p.isActive).length} / {game.maxPlayers}</span>
                </div>
                {!isPlayerActive && game.status !== 'completed' && (
                  <div className="text-xs mt-1 text-yellow-400 flex items-center gap-1">
                    <Play size={12} />
                    <span>Join to play</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActiveGamesList; 