import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Home, PlusCircle, Users, X, UserCircle } from 'lucide-react';
import { signOut } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/auth/AuthForm';
import CreateGame from '../components/game/CreateGame';
import JoinGame from '../components/game/JoinGame';
import ActiveGamesList from '../components/game/ActiveGamesList';
import toast from 'react-hot-toast';
import { PowerGlitch } from 'powerglitch';
import CustomTabs from '../components/ui/CustomTabs';
import MobileMenu from '../components/ui/MobileMenu';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Handle body scroll locking when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);
  
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
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
      className="min-h-screen bg-gray-900 flex flex-col items-center p-4"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(110, 0, 255, 0.15) 0%, transparent 25%),
          radial-gradient(circle at 80% 20%, rgba(0, 209, 255, 0.15) 0%, transparent 20%),
          radial-gradient(circle at 50% 80%, rgba(255, 0, 153, 0.15) 0%, transparent 30%)
        `
      }}
    >
      {user ? (
        <>
          {/* Full-width mobile top bar */}
          <div className="fixed top-0 left-0 right-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-sm z-[90] shadow-md">
            <div className="w-full flex justify-between items-center p-4">
              <span className="glitch-text bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 text-3xl font-extrabold">
                GIF BATTLE
              </span>
              
              <div className="md:hidden">
                <MobileMenu 
                  isOpen={menuOpen}
                  toggleMenu={toggleMenu}
                />
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <Link to="/profile">
                  <motion.button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserCircle size={18} />
                    <span>Profile</span>
                  </motion.button>
                </Link>
                
                <motion.button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Overlay - positioned outside any container to be full screen */}
          <AnimatePresence>
            {menuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[997]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleMenu}
                />
                
                {/* Menu */}
                <motion.div
                  className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black z-[998] p-6 overflow-y-auto"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-xl font-bold text-white">Menu</span>
                      <motion.button
                        onClick={toggleMenu}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={24} className="text-gray-400" />
                      </motion.button>
                    </div>
                    
                    {/* User Info */}
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                      <p className="text-gray-300 text-sm mb-1">Signed in as:</p>
                      <p className="font-semibold text-white">{user.displayName || 'Player'}</p>
                    </div>
                    
                    {/* Navigation Links */}
                    <nav className="flex-1">
                      <ul className="space-y-2">
                        <li>
                          <a 
                            href="/"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 text-white"
                            onClick={toggleMenu}
                          >
                            <Home size={20} />
                            <span>Home</span>
                          </a>
                        </li>
                        <li>
                          <Link 
                            to="/profile"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 text-white"
                            onClick={toggleMenu}
                          >
                            <UserCircle size={20} />
                            <span>Profile</span>
                          </Link>
                        </li>
                        <li>
                          <a 
                            href="/#create"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 text-white"
                            onClick={toggleMenu}
                          >
                            <PlusCircle size={20} />
                            <span>Create Game</span>
                          </a>
                        </li>
                        <li>
                          <a 
                            href="/#join"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 text-white"
                            onClick={toggleMenu}
                          >
                            <Users size={20} />
                            <span>Join Game</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                    
                    {/* Footer/Actions */}
                    <div className="mt-auto pt-6 border-t border-gray-800">
                      <motion.button
                        onClick={() => {
                          handleSignOut();
                          toggleMenu();
                        }}
                        className="flex items-center gap-3 w-full p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-white text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          <div className="w-full max-w-6xl flex flex-col mt-16">
            <motion.div 
              className="text-center mt-4 mb-6 md:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Welcome, {user.displayName || 'Player'}!
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
                Challenge your friends to find the perfect GIF that matches the prompt. Create a new game or join an existing one to get started!
              </p>
            </motion.div>
            
            <div className="min-h-[500px]">
              <CustomTabs 
                tabs={[
                  {
                    label: 'Create a Game',
                    content: (
                      <div className="bg-black bg-opacity-70 border border-purple-800 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
                        <CreateGame user={user} />
                      </div>
                    )
                  },
                  {
                    label: 'Join a Game',
                    content: (
                      <div className="bg-black bg-opacity-70 border border-purple-800 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
                        <JoinGame user={user} />
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </>
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
                {/* Removed Zap icon */}
              </motion.div>
              <span className="glitch-text bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400">
                GIF BATTLE
              </span>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              The ultimate party game where you compete to find the perfect GIF for each prompt. Sign in to create or join a game!
            </p>
          </motion.div>
          
          <AuthForm onSuccess={() => {}} />
        </div>
      )}
    </div>
  );
};

export default HomePage;