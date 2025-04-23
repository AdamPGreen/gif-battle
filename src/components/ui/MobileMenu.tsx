import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Home, PlusCircle, Users } from 'lucide-react';

interface MobileMenuProps {
  onSignOut: () => void;
  userName: string;
  isAuthenticated: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  onSignOut, 
  userName,
  isAuthenticated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <motion.button
        onClick={toggleMenu}
        className="p-2 rounded-lg bg-gray-800/70 text-white z-[101] relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />
            
            {/* Menu */}
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-4/5 max-w-xs bg-gradient-to-b from-gray-900 to-black border-l border-purple-900/50 z-[100] p-6 overflow-y-auto"
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
                
                {/* User Info (if authenticated) */}
                {isAuthenticated && (
                  <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                    <p className="text-gray-300 text-sm mb-1">Signed in as:</p>
                    <p className="font-semibold text-white">{userName}</p>
                  </div>
                )}
                
                {/* Navigation Links */}
                <nav className="flex-1">
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="/"
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 text-white"
                        onClick={() => setIsOpen(false)}
                      >
                        <Home size={20} />
                        <span>Home</span>
                      </a>
                    </li>
                    
                    {isAuthenticated && (
                      <>
                        <li>
                          <a 
                            href="/#create"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 text-white"
                            onClick={() => setIsOpen(false)}
                          >
                            <PlusCircle size={20} />
                            <span>Create Game</span>
                          </a>
                        </li>
                        <li>
                          <a 
                            href="/#join"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/70 text-white"
                            onClick={() => setIsOpen(false)}
                          >
                            <Users size={20} />
                            <span>Join Game</span>
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </nav>
                
                {/* Footer/Actions */}
                {isAuthenticated && (
                  <div className="mt-auto pt-6 border-t border-gray-800">
                    <motion.button
                      onClick={() => {
                        onSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 w-full p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-white text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut size={20} />
                      <span>Sign Out</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenu; 