'use client';

interface LayoutControlsProps {
  currentLayout: string;
  onLayoutChange: (layoutName: string) => void;
  isApplyingLayout?: boolean;
}

export default function LayoutControls({
  currentLayout,
  onLayoutChange,
  isApplyingLayout = false,
}: LayoutControlsProps) {
  return (
    <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium text-gray-800 mb-2">Changer de layout</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onLayoutChange('equilibré')}
          className={`px-2 py-1 rounded text-xs ${
            currentLayout === 'equilibré'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          disabled={isApplyingLayout}
        >
          Équilibré
        </button>
        <button
          onClick={() => onLayoutChange('cose')}
          className={`px-2 py-1 rounded text-xs ${
            currentLayout === 'cose'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          disabled={isApplyingLayout}
        >
          COSE
        </button>
        <button
          onClick={() => onLayoutChange('spread')}
          className={`px-2 py-1 rounded text-xs ${
            currentLayout === 'spread'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          disabled={isApplyingLayout}
        >
          Aéré
        </button>
        <button
          onClick={() => onLayoutChange('compact')}
          className={`px-2 py-1 rounded text-xs ${
            currentLayout === 'compact'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          disabled={isApplyingLayout}
        >
          Compact
        </button>
        <button
          onClick={() => onLayoutChange('concentric')}
          className={`px-2 py-1 rounded text-xs ${
            currentLayout === 'concentric'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          disabled={isApplyingLayout}
        >
          Concentrique
        </button>
      </div>
      
      {isApplyingLayout && (
        <div className="mt-2 text-sm text-indigo-600 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Application du layout en cours...
        </div>
      )}
    </div>
  );
} 