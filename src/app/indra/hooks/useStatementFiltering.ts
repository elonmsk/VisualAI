'use client';

import { useState, useEffect } from 'react';
import { Statement, ApiResponse } from '../types';

export interface UseStatementFilteringReturn {
  filteredResults: Statement[] | null;
  filterType: string;
  setFilterType: (type: string) => void;
  getUniqueStatementTypes: () => string[];
}

// Fonction pour extraire les statements à partir de différents formats de réponse API
function extractStatements(results: ApiResponse | null): Statement[] {
  if (!results) return [];
  
  let statements: Statement[] = [];
  
  // Cas 1: statements est directement un tableau
  if (Array.isArray(results.statements)) {
    statements = results.statements;
  }
  // Cas 2: statements est un objet avec des tableaux par PMID
  else if (typeof results.statements === 'object') {
    // Vérifier si c'est une structure avec { statements: Statement[] }
    if ('statements' in results.statements && Array.isArray(results.statements.statements)) {
      statements = results.statements.statements;
    } else {
      // C'est un objet avec des clés PMID et des tableaux de statements
      Object.values(results.statements).forEach(stmtArray => {
        if (Array.isArray(stmtArray)) {
          statements = statements.concat(stmtArray);
        }
      });
    }
  }
  
  return statements;
}

export function useStatementFiltering(results: ApiResponse | null): UseStatementFilteringReturn {
  const [filterType, setFilterType] = useState<string>('');
  const [filteredResults, setFilteredResults] = useState<Statement[] | null>(null);
  
  // Obtenir tous les types de statements uniques
  const getUniqueStatementTypes = (): string[] => {
    const statements = extractStatements(results);
    if (!statements.length) return [];
    
    const typesSet = new Set<string>();
    statements.forEach(stmt => {
      if (stmt.type) typesSet.add(stmt.type);
    });
    
    return Array.from(typesSet).sort();
  };
  
  // Mettre à jour les résultats filtrés lorsque le filtre ou les résultats changent
  useEffect(() => {
    const statements = extractStatements(results);
    
    if (!statements.length) {
      setFilteredResults(null);
      return;
    }
    
    if (!filterType) {
      // Aucun filtre actif: retourner tous les statements
      setFilteredResults(statements);
    } else {
      // Appliquer le filtre par type
      const filtered = statements.filter(stmt => stmt.type === filterType);
      setFilteredResults(filtered);
    }
  }, [results, filterType]);
  
  return {
    filteredResults,
    filterType,
    setFilterType,
    getUniqueStatementTypes
  };
}