'use client';

import { useState } from 'react';
import { ApiResponse, Statement, GraphData } from '../types';

export interface UseIndraDataReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  pmids: string[];
  results: ApiResponse | null;
  loading: boolean;
  error: string;
  statusMessage: string;
  fetchIndraData: (term: string) => Promise<void>;
}

export function useIndraData(): UseIndraDataReturn {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pmids, setPmids] = useState<string[]>([]);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const searchPubMedForPmids = async (term: string): Promise<string[]> => {
    setStatusMessage(`Recherche d'articles sur PubMed pour "${term}"...`);
    
    try {
      // On récupère tous les articles disponibles sans limite
      const response = await fetch(`/api/pubmed-search?term=${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la recherche PubMed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.pmids || data.pmids.length === 0) {
        throw new Error(`Aucun article trouvé pour "${term}"`);
      }
      
      // Afficher le nombre total d'articles disponibles
      if (data.total && data.total > data.pmids.length) {
        setStatusMessage(`${data.pmids.length} articles analysés sur ${data.total} trouvés pour "${term}"`);
      } else {
        setStatusMessage(`${data.pmids.length} articles trouvés pour "${term}"`);
      }
      
      return data.pmids;
    } catch (error) {
      console.error('Erreur lors de la recherche PubMed:', error);
      throw error;
    }
  };

  const fetchIndraData = async (term: string) => {
    if (!term.trim()) {
      setError('Veuillez entrer un terme de recherche');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      // Étape 1: Rechercher les PMIDs correspondant au terme
      const foundPmids = await searchPubMedForPmids(term);
      setPmids(foundPmids);
      
      if (foundPmids.length === 0) {
        throw new Error(`Aucun article trouvé pour "${term}"`);
      }
      
      // Étape 2: Récupérer les relations à partir des PMIDs trouvés
      setStatusMessage(`Analyse des relations dans ${foundPmids.length} articles...`);
      
      const response = await fetch('/api/indra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pmids: foundPmids }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      
      // Vérifier si les données sont valides
      if (!data || (!data.statements && !data.graph)) {
        throw new Error('Réponse invalide ou vide');
      }
      
      setResults(data);
      setStatusMessage('');
      
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    pmids,
    results,
    loading,
    error,
    statusMessage,
    fetchIndraData
  };
}