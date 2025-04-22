import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, PlayCircle, Clock, Check, AlertTriangle } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import type { Game, User } from '../../types';

interface ActiveGamesListProps {
  user: User;
}

const ActiveGamesList: React.FC<ActiveGamesListProps> = ({ user }) => {
  const { userGames, getUserGames, loading } = useGameStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserGames = async () => {
      try {
        setIsLoading(true);
        await getUserGames(user.id);
      } catch (error) {
        console.error('Error fetching user games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserGames();
  }, [getUserGames, user.id]);

  const handleGameClick = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  const getGameStatusInfo = (game: Game) => {
    const isPlayerActive = game.players.some(p => p.id === user.id && p.isActive);
    
    if (!isPlayerActive) {
      return {
        icon: <AlertTriangle size={16} className="text-yellow-500" />,
        text: "You left this game",
        color: "border-yellow-600 bg-yellow-950 bg-opacity-20"
      };
    }
    
    switch (game.status) {
      case 'waiting':
        return {
          icon: <Clock size={16} className="text-blue-400" />,
          text: "Waiting for players",
          color: "border-blue-600 bg-blue-950 bg-opacity-20"
        };
      case 'playing':
        return {
          icon: <PlayCircle size={16} className="text-green-400" />,
          text: "In progress",
          color: "border-green-600 bg-green-950 bg-opacity-20"
        };
      case 'completed':
        return {
          icon: <Check size={16} className="text-purple-400" />,
          text: "Completed",
          color: "border-purple-600 bg-purple-950 bg-opacity-20"
        };
      default:
        return {
          icon: <Clock size={16} className="text-gray-400" />,
          text: "Unknown status",
          color: "border-gray-600 bg-gray-800"
        };
    }
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
                {!isPlayerActive && (
                  <div className="text-xs mt-1 text-yellow-400">
                    Rejoin to play
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