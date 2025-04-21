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
    <div>
      <div className="mb-4 border-b border-gray-700 flex">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={`px-4 py-2 font-bold transition-colors duration-200 
              ${activeTabIndex === index 
                ? 'text-white border-b-2 border-purple-400' 
                : 'text-gray-400 hover:text-gray-200'
              }`}
            onClick={() => setActiveTabIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs[activeTabIndex]?.content}
      </div>
    </div>
  );
};

export default CustomTabs; 