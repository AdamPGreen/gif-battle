import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, LogOut } from 'lucide-react';
import { signOut } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/auth/AuthForm';
import CreateGame from '../components/game/CreateGame';
import JoinGame from '../components/game/JoinGame';
import toast from 'react-hot-toast';
import { PowerGlitch } from 'powerglitch';
import { Box, Tabs } from '@chakra-ui/react';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  
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
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
    }
  };
  
  if (loading) {
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
      {user ? (
        <div className="w-full max-w-6xl">
          <motion.div 
            className="flex justify-between items-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-5xl font-extrabold flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 5
                }}
              >
                <Zap size={48} className="text-yellow-400" />
              </motion.div>
              <span className="glitch-text bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400">
                GIF Battle
              </span>
            </div>
            
            <motion.button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </motion.button>
          </motion.div>
          
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome, {user.displayName || 'Player'}!
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Challenge your friends to find the perfect GIF that matches the prompt. Create a new game or join an existing one to get started!
            </p>
          </motion.div>
          
          <Box 
            bg="rgba(30, 30, 45, 0.7)" 
            borderRadius="xl" 
            p={6} 
            boxShadow="xl"
          >
            <Tabs.Root variant="line" colorScheme="purple" fitted defaultValue="create">
              <Tabs.List mb="1em">
                <Tabs.Trigger 
                  value="create"
                  _selected={{ color: 'white', borderColor: 'purple.400' }} 
                  color="gray.300"
                  fontWeight="bold"
                >
                  Create a Game
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="join"
                  _selected={{ color: 'white', borderColor: 'purple.400' }} 
                  color="gray.300"
                  fontWeight="bold"
                >
                  Join a Game
                </Tabs.Trigger>
              </Tabs.List>
              
              <Tabs.Content value="create" p={0}>
                <CreateGame user={user} />
              </Tabs.Content>
              <Tabs.Content value="join" p={0}>
                <Box className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">My Active Games</h2>
                  <div className="p-6 bg-gray-800 bg-opacity-50 rounded-xl text-center text-gray-400">
                    No active games found. Join a game below!
                  </div>
                </Box>
                <JoinGame user={user} />
              </Tabs.Content>
            </Tabs.Root>
          </Box>
        </div>
      ) : (
        <div className="w-full max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl font-extrabold flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 5
                }}
              >
                <Zap size={64} className="text-yellow-400" />
              </motion.div>
              <span className="glitch-text bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400">
                GIF Battle
              </span>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              The ultimate party game where you compete to find the perfect GIF for each prompt. Sign in to create or join a game!
            </p>
          </motion.div>
          
          <AuthForm onSuccess={() => toast.success('Welcome to GIF Battle!')} />
        </div>
      )}
    </div>
  );
};

export default HomePage;