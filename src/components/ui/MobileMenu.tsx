import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen,
  toggleMenu
}) => {
  return (
    <motion.button
      onClick={toggleMenu}
      className="p-2 rounded-lg bg-gray-800/70 text-white relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle menu"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </motion.button>
  );
};

export default MobileMenu; 