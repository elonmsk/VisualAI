'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useIndraData } from './hooks/useIndraData';
import { useStatementFiltering } from './hooks/useStatementFiltering';
import { calculateNodePositions } from './hooks/useServerLayout';
import { ErrorBoundary } from 'react-error-boundary';

import SearchForm from './components/SearchForm';
import StatementFilters from './components/StatementFilters';
import ResultTabs from './components/ResultTabs';
import GraphVisualization from './components/GraphVisualization';
import InstructionsPanel from './components/InstructionsPanel';
import StatusIndicator from './components/StatusIndicator';
import { GraphData } from './types';

// Composant de chargement pour Suspense
function IndraPageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// Composant principal wrapped dans Suspense
function IndraPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('form');
  const [layoutType, setLayoutType] = useState<'equilibré' | 'aéré' | 'compact' | 'concentric' | 'ultra-dispersé'>('equilibré');
  const [graphPositions, setGraphPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [layoutStatusMessage, setLayoutStatusMessage] = useState<string>('');
  
  // Utiliser nos hooks personnalisés
  const {
    searchTerm,
    setSearchTerm,
    results,
    loading: indraDataLoading,
    error: indraDataError,
    statusMessage,
    fetchIndraData
  } = useIndraData();
  
  const {
    filteredResults,
    filterType,
    setFilterType,
    getUniqueStatementTypes
  } = useStatementFiltering(results);
  
  // Création d'un graphe filtré basé sur le type de relation sélectionné
  const [filteredGraphData, setFilteredGraphData] = useState<GraphData | null>(null);
  
  // Mise à jour du graphe filtré lorsque le type de filtre change
  useEffect(() => {
    if (!results?.graph) {
      setFilteredGraphData(null);
      return;
    }
    
    // Si aucun filtre n'est sélectionné, utiliser les données complètes
    if (!filterType) {
      setFilteredGraphData(results.graph);
      return;
    }
    
    // Filtrer les arêtes selon le type sélectionné
    const filteredEdges = results.graph.edges.filter(edge => edge.type === filterType);
    
    // Créer un ensemble des IDs de nœuds qui sont connectés aux arêtes filtrées
    const connectedNodeIds = new Set<string>();
    filteredEdges.forEach(edge => {
      connectedNodeIds.add(typeof edge.source === 'string' ? edge.source : edge.source.id);
      connectedNodeIds.add(typeof edge.target === 'string' ? edge.target : edge.target.id);
    });
    
    // Filtrer les nœuds pour ne garder que ceux connectés aux arêtes filtrées
    const filteredNodes = results.graph.nodes.filter(node => connectedNodeIds.has(node.id));
    
    // Créer les données filtrées du graphe
    setFilteredGraphData({
      ...results.graph,
      nodes: filteredNodes,
      edges: filteredEdges
    });
  }, [results?.graph, filterType]);
  
  // Effet pour gérer les paramètres d'URL
  useEffect(() => {
    const termParam = searchParams.get('term');
    if (termParam) {
      setSearchTerm(termParam);
      
      // Déclenchement de la recherche automatique avec délai pour s'assurer que le composant est monté
      setTimeout(() => {
        fetchIndraData(termParam);
      }, 0);
    }
  }, [searchParams, setSearchTerm, fetchIndraData]);
  
  // Fonction pour mettre à jour les positions du graphe côté serveur
  const updateGraphPositions = useCallback(async () => {
    if (!results?.graph?.nodes?.length) return;
    
    try {
      setLayoutStatusMessage('Calcul des positions en cours...');
      const positions = await calculateNodePositions(results.graph, layoutType);
      setGraphPositions(positions);
    } catch (error) {
      console.error("Erreur lors du calcul des positions:", error);
    } finally {
      setLayoutStatusMessage('');
    }
  }, [results, layoutType]);
  
  // Mettre à jour les positions lorsque les données ou le type de layout changent
  useEffect(() => {
    if (results?.graph?.nodes?.length) {
      updateGraphPositions();
    }
  }, [results, layoutType, updateGraphPositions]);
  
  // Gestionnaire de changement de layout
  const changeLayout = (layoutName: string) => {
    setLayoutType(layoutName as 'equilibré' | 'aéré' | 'compact' | 'concentric' | 'ultra-dispersé');
  };
  
  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetchIndraData(searchTerm);
    if (activeTab === 'form') {
      setActiveTab('graph');
    }
  };
  
  // Fonction pour afficher les statements détaillés dans la section statements
  const renderStatements = () => {
    if (!filteredResults || filteredResults.length === 0) {
      return (
        <div className="bg-white p-8 rounded-lg text-center text-gray-500 border border-gray-100 shadow-sm">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600">Aucun résultat trouvé avec les filtres actuels.</p>
          <button 
            onClick={() => setFilterType('')} 
            className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {filteredResults.map((stmt, index) => (
          <div key={stmt.id || index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-xl text-gray-800">{stmt.type}</h3>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                {stmt.belief !== undefined ? `Confiance: ${(stmt.belief * 100).toFixed(1)}%` : 'Score non disponible'}
              </span>
            </div>
        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs uppercase tracking-wider text-blue-700 font-semibold mb-2">Sujet</p>
                {stmt.subj ? (
                  <p className="font-medium text-gray-800">{stmt.subj.name}</p>
                ) : (
                  <p className="italic text-gray-500">Donnée non disponible</p>
                )}
                {stmt.subj?.db_refs && Object.keys(stmt.subj.db_refs).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
                    {Object.entries(stmt.subj.db_refs).map(([db, id]) => (
                      <span key={db} className="px-2 py-0.5 bg-white rounded">
                        <span className="font-medium">{db}:</span> {id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
          
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs uppercase tracking-wider text-purple-700 font-semibold mb-2">Objet</p>
                {stmt.obj ? (
                  <p className="font-medium text-gray-800">{stmt.obj.name}</p>
                ) : (
                  <p className="italic text-gray-500">Donnée non disponible</p>
                )}
                {stmt.obj?.db_refs && Object.keys(stmt.obj.db_refs).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
                    {Object.entries(stmt.obj.db_refs).map(([db, id]) => (
                      <span key={db} className="px-2 py-0.5 bg-white rounded">
                        <span className="font-medium">{db}:</span> {id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
        
            {stmt.evidence && stmt.evidence.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Preuves ({stmt.evidence.length})
                </h4>
                <div className="max-h-48 overflow-y-auto">
                  {stmt.evidence.map((ev, i) => (
                    <div key={i} className="mb-2 text-sm p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1 flex justify-between">
                        <span>
                          PMID: <a 
                            href={`https://pubmed.ncbi.nlm.nih.gov/${ev.pmid}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                          >
                            {ev.pmid}
                          </a>
                        </span>
                        <span>Source: {ev.source_api}</span>
                      </div>
                      <div className="italic text-gray-700 bg-white p-2 rounded border border-gray-100">&quot;{ev.text}&quot;</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-indigo-600">VisualAI</span>
              <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs font-normal">Beta</span>
            </h1>
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href="https://github.com/visualai/visualai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 text-sm font-medium"
              >
                GitHub
              </a>
              <a 
                href="https://pubmed.ncbi.nlm.nih.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 text-sm font-medium"
              >
                PubMed
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <InstructionsPanel />
        
        <StatusIndicator 
          loading={indraDataLoading || !!layoutStatusMessage} 
          error={indraDataError} 
          statusMessage={layoutStatusMessage || statusMessage}
        />
        
        <section className="mb-8">
          <SearchForm 
            searchTerm={searchTerm} 
            onSearchTermChange={setSearchTerm} 
            onSubmit={handleSubmit} 
            loading={indraDataLoading}
          />
        </section>
        
        {results && (
          <div className="mb-6">
            <ResultTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showGraph={!!results?.graph}
              showStmts={!!filteredResults && filteredResults.length > 0}
            />
            
            <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {activeTab === 'graph' && results?.graph && (
                <div>
                  <GraphVisualization
                    graphData={results.graph}
                    filteredGraphData={filteredGraphData}
                    graphPositions={graphPositions}
                    layoutName={layoutType}
                    onLayoutChange={changeLayout}
                    isApplyingLayout={!!layoutStatusMessage}
                    edgeTypes={getUniqueStatementTypes()}
                    activeEdgeFilter={filterType}
                    onEdgeFilterChange={setFilterType}
                  />
                </div>
              )}
              
              {activeTab === 'stmts' && (
                <div className="p-4">
                  {filteredResults && filteredResults.length > 0 && (
                    <div className="mb-4">
                      <StatementFilters
                        statementTypes={getUniqueStatementTypes()}
                        activeFilter={filterType}
                        onFilterChange={setFilterType}
                        totalCount={filteredResults.length}
                        filteredCount={filterType ? filteredResults.filter(s => s.type === filterType).length : undefined}
                      />
                    </div>
                  )}
                  
                  {/* Gestion des erreurs potentielles */}
                  <ErrorBoundary fallback={
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-700">Une erreur s&apos;est produite lors de l&apos;affichage des résultats. Veuillez réessayer ultérieurement.</p>
                      <button 
                        onClick={() => window.location.reload()} 
                        className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded"
                      >
                        Actualiser la page
                      </button>
                    </div>
                  }>
                    {renderStatements()}
                  </ErrorBoundary>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} VisualAI. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function IndraPage() {
  return (
    <Suspense fallback={<IndraPageLoading />}>
      <IndraPageContent />
    </Suspense>
  );
} 
