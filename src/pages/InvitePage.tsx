import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useGameStore from '../store/gameStore';
import AuthForm from '../components/auth/AuthForm';
import toast from 'react-hot-toast';
import { PowerGlitch } from 'powerglitch';

const InvitePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { joinExistingGame, loading: gameLoading } = useGameStore();
  const [joinAttempted, setJoinAttempted] = useState(false);
  
  useEffect(() => {
    PowerGlitch.glitch('.glitch-text', {
      playMode: 'always',
      createContainers: true,
      hideOverflow: false,
      timing: {
        duration: 2000,
        iterations: Infinity
      },
      glitchTimeSpan: {
        start: 0.5,
        end: 0.7,
      },
      shake: {
        velocity: 15,
        amplitudeX: 0.2,
        amplitudeY: 0.2,
      },
      slice: {
        count: 6,
        velocity: 15,
        minHeight: 0.02,
        maxHeight: 0.15,
        hueRotate: true,
      },
      pulse: false
    });
    
    // If user is logged in and there's a gameId, auto-join the game
    const autoJoinGame = async () => {
      if (user && gameId && !joinAttempted) {
        setJoinAttempted(true);
        try {
          await joinExistingGame(
            gameId, 
            user.id, 
            user.displayName as string
          );
          
          toast.success('Joined game successfully!');
          navigate(`/game/${gameId}`);
        } catch (error: any) {
          console.error('Error joining game:', error);
          toast.error(error.message || 'Failed to join game');
        }
      }
    };
    
    if (user && gameId && !authLoading && !gameLoading && !joinAttempted) {
      autoJoinGame();
    }
  }, [user, gameId, authLoading, gameLoading, joinExistingGame, navigate, joinAttempted]);
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(110, 0, 255, 0.15) 0%, transparent 25%),
          radial-gradient(circle at 80% 20%, rgba(0, 209, 255, 0.15) 0%, transparent 20%),
          radial-gradient(circle at 50% 80%, rgba(255, 0, 153, 0.15) 0%, transparent 30%)
        `
      }}
    >
      <div className="w-full max-w-md">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center gap-3 mb-4">
            <span className="glitch-text bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400">GIF BATTLE</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-black bg-opacity-90 backdrop-blur-sm border border-purple-600 rounded-xl p-8 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center text-white">
            You've Been Invited!
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Join the GIF Battle game and show off your GIF-finding skills!
          </p>
          
          {user ? (
            <motion.button
              onClick={() => navigate(`/game/${gameId}`)}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 hover:from-cyan-700 hover:to-blue-700"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              disabled={gameLoading}
            >
              {gameLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Joining Game...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Join Game
                </span>
              )}
            </motion.button>
          ) : (
            <div>
              <p className="text-gray-400 text-center mb-4">
                Sign in to join the game:
              </p>
              <AuthForm onSuccess={() => {}} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InvitePage;