'use client';

import React from 'react';

interface StatementFiltersProps {
  uniqueTypes: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const StatementFilters: React.FC<StatementFiltersProps> = ({
  uniqueTypes,
  selectedType,
  onTypeChange
}) => {
  if (uniqueTypes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Filtrer par type de relation</h3>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            id="filter-all"
            name="filter-type"
            type="radio"
            checked={selectedType === ''}
            onChange={() => onTypeChange('')}
            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
          />
          <label htmlFor="filter-all" className="ml-2 block text-sm text-gray-700">
            Toutes les relations <span className="text-xs text-gray-500">({uniqueTypes.length} types)</span>
          </label>
        </div>
        
        <div className="max-h-60 overflow-y-auto pr-1 space-y-1 mt-2">
          {uniqueTypes.map(type => (
            <div key={type} className="flex items-center">
              <input
                id={`filter-${type}`}
                name="filter-type"
                type="radio"
                checked={selectedType === type}
                onChange={() => onTypeChange(type)}
                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor={`filter-${type}`} className="ml-2 block text-sm text-gray-700 truncate" title={type}>
                {type.replace(/_/g, ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {selectedType && (
        <button
          onClick={() => onTypeChange('')}
          className="mt-4 text-xs text-indigo-600 hover:text-indigo-800"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
};

export default StatementFilters;