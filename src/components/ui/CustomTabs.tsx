import React, { useState } from 'react';

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
      <div className="flex rounded-md bg-gray-900 p-1 shadow-sm border border-gray-800">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`flex-1 rounded-md px-4 py-3 text-center font-medium transition-all duration-200
              ${activeTabIndex === index 
                ? 'bg-gray-800 text-white shadow-[0_0_10px_rgba(236,72,153,0.3)] border border-gray-700' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            onClick={() => setActiveTabIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs[activeTabIndex]?.content}
      </div>
    </div>
  );
};

export default CustomTabs; 