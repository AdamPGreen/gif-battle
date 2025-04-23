import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TabData {
  label: string;
  content: React.ReactNode;
}

interface CustomTabsProps {
  tabs: TabData[];
  initialTabIndex?: number;
}

const CustomTabs: React.FC<CustomTabsProps> = ({ tabs, initialTabIndex = 0 }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(initialTabIndex);

  return (
    <div className="mb-6">
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 w-full sm:w-auto bg-black/30 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.label}
              className={`relative flex-1 px-4 sm:px-10 py-3 font-medium text-center transition-all duration-300
                ${activeTabIndex === index 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
                }`}
              onClick={() => setActiveTabIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeTabIndex === index && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/80 via-pink-500/80 to-cyan-500/80 rounded-lg"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  style={{ 
                    boxShadow: '0 0 15px rgba(162, 89, 255, 0.5)'
                  }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <motion.div 
        className="mt-4"
        key={activeTabIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {tabs[activeTabIndex]?.content}
      </motion.div>
    </div>
  );
};

export default CustomTabs; 