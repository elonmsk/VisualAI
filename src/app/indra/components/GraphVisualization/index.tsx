'use client';

import { useState } from 'react';
import { GraphData, GraphNode, GraphEdge } from '../../types';
import CytoscapeGraph from '../CytoscapeGraph';
import NodeDetails from '../NodeDetails';
import EdgeDetails from '../EdgeDetails';

interface GraphVisualizationProps {
  graphData: GraphData;
  filteredGraphData?: GraphData | null;
  graphPositions?: Record<string, { x: number, y: number }>;
  layoutName: string;
  onLayoutChange: (layoutName: string) => void;
  isApplyingLayout?: boolean;
  edgeTypes?: string[];
  activeEdgeFilter?: string;
  onEdgeFilterChange?: (filter: string) => void;
}

export default function GraphVisualization({
  graphData,
  filteredGraphData,
  graphPositions,
  layoutName,
  onLayoutChange,
  isApplyingLayout,
  edgeTypes = [],
  activeEdgeFilter = '',
  onEdgeFilterChange = () => {},
}: GraphVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [graphError, setGraphError] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<'layout' | 'details' | 'info'>('info');
  const [reloadKey, setReloadKey] = useState<number>(0);
  
  // Utiliser les données filtrées si disponibles, sinon utiliser les données complètes
  const displayData = filteredGraphData || graphData;
  
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setActiveSection('details');
    setSidebarExpanded(true);
  };

  const handleEdgeClick = (edge: GraphEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setActiveSection('details');
    setSidebarExpanded(true);
  };

  const handleGraphError = (error: Error) => {
    console.error("Erreur de visualisation du graphe:", error);
    setGraphError(true);
  };
  
  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };
  
  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };

  // Fonction pour réinitialiser le graphe en cas d'erreur
  const retryLoadingGraph = () => {
    // Réinitialiser l'état d'erreur
    setGraphError(false);
    // Forcer le rechargement du composant CytoscapeGraph
    setReloadKey(key => key + 1);
  };

  // Composant de fallback en cas d'erreur
  const GraphErrorFallback = () => (
    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
      <div className="flex flex-col">
        <div className="flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-medium text-gray-800">Problème de visualisation du graphe</p>
            <p className="text-sm mt-1">
              La visualisation du graphe n&apos;a pas pu être chargée. Essayez de modifier les paramètres de recherche ou de rafraîchir la page.
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <button 
            onClick={retryLoadingGraph}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      <div className={`relative flex ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        {/* Panneau latéral gauche */}
        <div className={`bg-white border-r border-gray-200 h-[600px] ${isFullScreen ? 'h-full' : 'h-[600px]'} ${sidebarExpanded ? 'w-80' : 'w-12'} transition-all duration-300 flex-shrink-0 z-10 relative`}>
          {/* Bouton pour afficher/masquer le sidebar */}
          <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-3 bg-white rounded-full border border-gray-200 p-1 shadow-sm z-20"
            title={sidebarExpanded ? "Réduire" : "Développer"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${sidebarExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* En-tête avec onglets */}
          {sidebarExpanded && (
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`flex-1 py-3 text-xs font-medium text-center ${activeSection === 'info' ? 'text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-indigo-600'}`}
                  onClick={() => setActiveSection('info')}
                >
                  Infos
                </button>
                <button
                  className={`flex-1 py-3 text-xs font-medium text-center ${activeSection === 'layout' ? 'text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-indigo-600'}`}
                  onClick={() => setActiveSection('layout')}
                >
                  Mise en page
                </button>
                <button
                  className={`flex-1 py-3 text-xs font-medium text-center ${activeSection === 'details' ? 'text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-indigo-600'}`}
                  onClick={() => setActiveSection('details')}
                  disabled={!selectedNode && !selectedEdge}
                >
                  Détails
                </button>
              </div>
            </div>
          )}
          
          {/* Contenu du panneau */}
          {sidebarExpanded && (
            <div className="overflow-y-auto h-full" style={{ height: 'calc(100% - 42px)' }}>
              {/* Section 1: Informations */}
              {activeSection === 'info' && (
                <div className="p-4">
                  <h3 className="font-medium text-indigo-800 mb-3 text-sm">Comment explorer le graphe</h3>
                  <ul className="text-xs text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span><strong>Zoom</strong>: Molette de la souris ou pincer sur mobile</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span><strong>Déplacer</strong>: Glisser avec la souris/doigt</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span><strong>Sélectionner un nœud</strong>: Cliquer sur une entité pour afficher ses détails</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span><strong>Sélectionner une relation</strong>: Cliquer sur une connexion pour afficher ses détails</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-indigo-800 mb-3 text-sm">Statistiques</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-50 rounded-lg p-3 text-center">
                        <div className="text-indigo-800 font-bold">{displayData.nodes.length}</div>
                        <div className="text-xs text-gray-600">Nœuds</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-purple-800 font-bold">{displayData.edges.length}</div>
                        <div className="text-xs text-gray-600">Relations</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-indigo-800 mb-2 text-sm">Légende</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-xs">Protéines/Gènes</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-xs">Composés/Médicaments</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-orange-400 mr-2"></div>
                        <span className="text-xs">Maladies</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Section 2: Layouts */}
              {activeSection === 'layout' && (
                <div className="p-4">
                  <h3 className="font-medium text-indigo-800 mb-3 text-sm">Mise en page du graphe</h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Choisissez un style de mise en page pour organiser les nœuds du graphe.
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => onLayoutChange('equilibré')}
                      className={`w-full px-3 py-2 rounded-md text-xs text-left ${layoutName === 'equilibré' ? 'bg-indigo-100 text-indigo-800 font-medium border-l-4 border-indigo-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <div className="font-medium">Équilibré</div>
                      <div className="text-xs text-gray-500">Distribution uniforme des nœuds</div>
                    </button>
                    
                    <button
                      onClick={() => onLayoutChange('cose')}
                      className={`w-full px-3 py-2 rounded-md text-xs text-left ${layoutName === 'cose' ? 'bg-indigo-100 text-indigo-800 font-medium border-l-4 border-indigo-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <div className="font-medium">COSE</div>
                      <div className="text-xs text-gray-500">Force dirigée basée sur la physique</div>
                    </button>
                    
                    <button
                      onClick={() => onLayoutChange('spread')}
                      className={`w-full px-3 py-2 rounded-md text-xs text-left ${layoutName === 'spread' ? 'bg-indigo-100 text-indigo-800 font-medium border-l-4 border-indigo-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <div className="font-medium">Aéré</div>
                      <div className="text-xs text-gray-500">Maximise l&apos;espace entre les nœuds</div>
                    </button>
                    
                    <button
                      onClick={() => onLayoutChange('compact')}
                      className={`w-full px-3 py-2 rounded-md text-xs text-left ${layoutName === 'compact' ? 'bg-indigo-100 text-indigo-800 font-medium border-l-4 border-indigo-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      <div className="font-medium">Compact</div>
                      <div className="text-xs text-gray-500">Rapproche les nœuds connectés</div>
                    </button>
                  </div>
                  
                  {/* Filtres de types de relation */}
                  {edgeTypes.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-indigo-800 mb-3 text-sm flex justify-between items-center">
                        <span>Filtrer par type de relation</span>
                        {activeEdgeFilter && (
                          <button
                            onClick={() => onEdgeFilterChange('')}
                            className="text-xs text-gray-500 hover:text-indigo-600 flex items-center"
                            title="Effacer le filtre"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Effacer
                          </button>
                        )}
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => onEdgeFilterChange('')}
                          className={`w-full px-3 py-2 rounded-md text-xs text-left ${activeEdgeFilter === '' ? 'bg-indigo-100 text-indigo-800 font-medium border-l-4 border-indigo-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                        >
                          <div className="font-medium">Toutes les relations</div>
                          <div className="text-xs text-gray-500">{graphData.edges.length} relations</div>
                        </button>
                        
                        {edgeTypes.map(type => {
                          const count = graphData.edges.filter(edge => edge.type === type).length;
                          return (
                            <button
                              key={type}
                              onClick={() => onEdgeFilterChange(type)}
                              className={`w-full px-3 py-2 rounded-md text-xs text-left ${activeEdgeFilter === type ? 'bg-indigo-100 text-indigo-800 font-medium border-l-4 border-indigo-500' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                            >
                              <div className="font-medium">{type}</div>
                              <div className="text-xs text-gray-500">{count} relations</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Section 3: Détails */}
              {activeSection === 'details' && (
                <div className="p-4">
                  {selectedNode && (
                    <NodeDetails node={selectedNode} onClose={() => setSelectedNode(null)} />
                  )}
                  {selectedEdge && (
                    <EdgeDetails edge={selectedEdge} onClose={() => setSelectedEdge(null)} />
                  )}
                  {!selectedNode && !selectedEdge && (
                    <div className="text-center text-gray-500 py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">
                        Cliquez sur un nœud ou une relation du graphe pour voir ses détails.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Boutons flottants quand le panneau est réduit */}
          {!sidebarExpanded && (
            <div className="p-2 flex flex-col space-y-2">
              <button 
                onClick={() => {
                  setSidebarExpanded(true);
                  setActiveSection('info');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                title="Informations"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  setSidebarExpanded(true);
                  setActiveSection('layout');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                title="Mise en page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              
              <button 
                onClick={() => {
                  setSidebarExpanded(true);
                  setActiveSection('details');
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 ${(!selectedNode && !selectedEdge) ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Détails"
                disabled={!selectedNode && !selectedEdge}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {/* Zone principale pour le graphe */}
        <div className={`relative flex-grow bg-gray-50 overflow-hidden ${isFullScreen ? 'h-full' : 'h-[600px]'}`}>
          {/* Bouton plein écran */}
          <button 
            onClick={toggleFullScreen} 
            className="absolute top-2 right-2 z-20 bg-white rounded-full p-1.5 shadow-sm"
            title={isFullScreen ? "Quitter le plein écran" : "Plein écran"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isFullScreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 3h-6m0 9h6M3 3h6M3 14h6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              )}
            </svg>
          </button>

          {/* Indicateur de chargement du layout */}
          {isApplyingLayout && (
            <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="mt-3 text-sm text-indigo-800 font-medium">Calcul de la mise en page en cours...</p>
              </div>
            </div>
          )}

          {!graphError && displayData && displayData.nodes && displayData.nodes.length > 0 ? (
            <CytoscapeGraph
              key={reloadKey}
              data={displayData}
              onNodeClick={handleNodeClick}
              onLinkClick={handleEdgeClick}
              onError={handleGraphError}
              precomputedPositions={graphPositions}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              {graphError ? (
                <GraphErrorFallback />
              ) : (
                <div className="text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="font-medium text-lg">Aucune donnée à afficher</h3>
                  <p className="mt-1 max-w-md mx-auto">
                    Utilisez le formulaire de recherche pour générer un graphe de connaissances.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 