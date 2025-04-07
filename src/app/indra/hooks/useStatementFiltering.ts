'use client';

import { useState, useEffect } from 'react';
import { Statement, ApiResponse } from '../types';

export interface UseStatementFilteringReturn {
  filteredResults: Statement[] | null;
  filterType: string;
  setFilterType: (type: string) => void;
  getUniqueStatementTypes: () => string[];
  resetFilters: () => void;
}

/**
 * Extrait et filtre les statements depuis différents formats de réponse API
 */
const extractValidStatements = (statements: Statement[] | Record<string, Statement[]> | { statements: Statement[] }): Statement[] => {
  let allStatements: Statement[] = [];
  
  // Extraire les statements selon le format de la réponse
  if (Array.isArray(statements)) {
    // Format 1: Tableau direct de statements
    allStatements = statements;
  } else if (typeof statements === 'object') {
    if ('statements' in statements && Array.isArray(statements.statements)) {
      // Format 2: { statements: [...] }
      allStatements = statements.statements;
    } else {
      // Format 3: { pmid1: [...], pmid2: [...] }
      allStatements = Object.values(statements as Record<string, Statement[]>)
        .flatMap(statements => statements || []);
    }
  }
  
  // Filtrer les statements invalides (sans sujet ou objet)
  return allStatements.filter(stmt => 
    stmt && stmt.type && 
    stmt.subj && stmt.subj.name && 
    stmt.obj && stmt.obj.name
  );
};

export function useStatementFiltering(results: ApiResponse | null): UseStatementFilteringReturn {
  const [filteredResults, setFilteredResults] = useState<Statement[] | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  
  // Effet pour filtrer les résultats quand filterType change
  useEffect(() => {
    if (!results?.statements) {
      setFilteredResults(null);
      return;
    }
    
    try {
      const allStatements = extractValidStatements(results.statements);
      
      if (filterType) {
        setFilteredResults(allStatements.filter(stmt => stmt.type === filterType));
      } else {
        setFilteredResults(allStatements);
      }
    } catch (error) {
      console.error('Erreur lors du filtrage des résultats:', error);
      setFilteredResults([]);
    }
  }, [results, filterType]);
  
  // Fonction pour obtenir les types de statements uniques
  const getUniqueStatementTypes = (): string[] => {
    if (!results?.statements) return [];
    
    try {
      const allStatements = extractValidStatements(results.statements);
      return [...new Set(allStatements.map(stmt => stmt.type))];
    } catch (error) {
      console.error('Erreur lors de l\'extraction des types de statements:', error);
      return [];
    }
  };
  
  return {
    filteredResults,
    filterType,
    setFilterType,
    getUniqueStatementTypes,
    resetFilters: () => setFilterType('')
  };
} 