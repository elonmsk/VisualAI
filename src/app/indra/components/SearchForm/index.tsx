'use client';

import { useState, FormEvent } from 'react';

interface SearchFormProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export default function SearchForm({ searchTerm, onSearchTermChange, onSubmit, loading }: SearchFormProps) {
  const [examples] = useState(['medulloblastoma', 'breast cancer', 'alzheimer']);

  const insertExample = (example: string) => {
    onSearchTermChange(example);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onSearchTermChange(text);
      }
    } catch (err) {
      console.error('Impossible d\'accéder au presse-papiers:', err);
    }
  };
  
  return (
    <div className="mb-6">
      <form id="indra-search-form" onSubmit={onSubmit} className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Terme de recherche</h2>
            <div className="flex space-x-1">
              {examples.map(example => (
                <button
                  key={example}
                  type="button"
                  onClick={() => insertExample(example)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <textarea
              id="searchTerm"
              name="searchTerm"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 resize-none"
              placeholder="Entrez un terme (ex: medulloblastoma, breast cancer...)"
              disabled={loading}
            />
            
            <button
              type="button"
              onClick={pasteFromClipboard}
              className="absolute top-2 right-2 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 flex items-center"
              title="Coller depuis le presse-papiers"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Coller
            </button>
          </div>
          
          <div className="mt-3 bg-gray-50 rounded-md p-3 text-sm text-gray-600">
            <p className="flex items-center">
              <svg className="h-4 w-4 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              L&apos;application recherchera les articles PubMed liés à ce terme, puis analysera les relations biologiques.
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-b from-white to-gray-50 p-6 pt-4">
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className={`px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                loading || !searchTerm.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recherche...
                </span>
              ) : (
                "Analyser"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 