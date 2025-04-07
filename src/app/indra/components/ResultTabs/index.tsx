'use client';

import React, { useState } from 'react';

interface ResultTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  graphNode: number;
  graphEdge: number;
  statementCount: number;
  onLayoutChange: (layoutName: string) => void;
  layoutType: string;
}

const ResultTabs: React.FC<ResultTabsProps> = ({
  activeTab,
  setActiveTab,
  graphNode,
  graphEdge,
  statementCount,
  onLayoutChange,
  layoutType
}) => {
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <div className="flex justify-between items-center">
        <nav className="flex -mb-px space-x-8 px-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('graph')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'graph'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Graphe
            <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
              {graphNode}n / {graphEdge}r
            </span>
          </button>

          <button
            onClick={() => setActiveTab('statements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'statements'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Relations
            <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
              {statementCount}
            </span>
          </button>
        </nav>

        {/* Options du graphe - seulement visibles dans l'onglet graphe */}
        {activeTab === 'graph' && (
          <div className="relative px-4">
            <button
              onClick={() => setShowLayoutOptions(!showLayoutOptions)}
              className="flex items-center py-2 px-3 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Mise en page: {layoutType}
              <svg 
                className={`w-4 h-4 ml-1 text-gray-500 transition-transform ${showLayoutOptions ? 'transform rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLayoutOptions && (
              <div className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {['equilibré', 'aéré', 'compact', 'concentric', 'ultra-dispersé'].map((layout) => (
                    <button
                      key={layout}
                      onClick={() => {
                        onLayoutChange(layout);
                        setShowLayoutOptions(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        layoutType === layout
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      role="menuitem"
                    >
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultTabs;