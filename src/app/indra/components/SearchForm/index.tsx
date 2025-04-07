'use client';

import React from 'react';

interface SearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  onSubmit, 
  loading 
}) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Recherche biologique</h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-1">
            Terme de recherche
          </label>
          <input
            id="search-term"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ex: EGFR, medulloblastoma, alzheimer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
          />
        </div>
        
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading || !searchTerm.trim()
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche en cours...
              </>
            ) : (
              'Rechercher'
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p className="mb-1">Exemples de recherches:</p>
        <div className="flex flex-wrap gap-1">
          {['p53', 'breast cancer', 'EGFR', 'medulloblastoma'].map((term) => (
            <button
              key={term}
              onClick={() => setSearchTerm(term)}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;