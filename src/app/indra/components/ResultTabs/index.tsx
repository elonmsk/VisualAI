'use client';

interface ResultTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showGraph: boolean;
  showStmts: boolean;
}

export default function ResultTabs({
  activeTab,
  onTabChange,
  showGraph,
  showStmts,
}: ResultTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          onClick={() => onTabChange('form')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'form'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Formulaire
        </button>
        
        {showGraph && (
          <button
            onClick={() => onTabChange('graph')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'graph'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Graphe de connaissances
          </button>
        )}
        
        {showStmts && (
          <button
            onClick={() => onTabChange('stmts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stmts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statements
          </button>
        )}
      </nav>
    </div>
  );
} 