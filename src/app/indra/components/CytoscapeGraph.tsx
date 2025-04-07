'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import cytoscape, { ElementDefinition } from 'cytoscape';
import { GraphData, GraphNode, GraphEdge } from '../types';

interface CytoscapeGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  onLinkClick?: (edge: GraphEdge) => void;
  onError?: (error: Error) => void;
  precomputedPositions?: Record<string, { x: number, y: number }>;
}

// Définition des couleurs pour les nœuds et les arêtes
const NODE_COLORS: Record<string, string> = {
  protein: '#6366f1', // indigo-500
  gene: '#2563eb',    // blue-600
  drug: '#dc2626',    // red-600
  disease: '#d97706', // amber-600
  default: '#4b5563'  // gray-600
};

const EDGE_COLORS: Record<string, string> = {
  Activation: '#16a34a',    // green-600
  Inhibition: '#dc2626',    // red-600 
  Phosphorylation: '#2563eb', // blue-600
  Complex: '#9333ea',      // purple-600
  default: '#4b5563'       // gray-600
};

export default function CytoscapeGraph({ data, onNodeClick, onLinkClick, onError, precomputedPositions }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  
  // Effet pour réinitialiser le graphe quand de nouvelles positions sont fournies
  useEffect(() => {
    if (precomputedPositions && Object.keys(precomputedPositions).length > 0 && cyRef.current) {
      cyRef.current.nodes().forEach((node) => {
        const id = node.id();
        if (precomputedPositions[id]) {
          node.position(precomputedPositions[id]);
        }
      });
      
      // Appliquer la nouvelle vue après un court délai
      setTimeout(() => {
        if (cyRef.current) {
          cyRef.current.fit();
        }
      }, 100);
    }
  }, [precomputedPositions]);

  // Fonction pour réinitialiser le zoom et la position
  const resetZoomPan = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.zoom(1);
      cyRef.current.center();
    }
  }, []);

  // Convertir les données en format compatible avec Cytoscape
  const prepareCytoscapeElements = useCallback((): ElementDefinition[] => {
    const elements: ElementDefinition[] = [];
    
    // Calculer la centralité des nœuds
    const degreeCentrality: Record<string, number> = {};
    data.edges.forEach(edge => {
      const source = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const target = typeof edge.target === 'string' ? edge.target : edge.target.id;
      
      degreeCentrality[source] = (degreeCentrality[source] || 0) + 1;
      degreeCentrality[target] = (degreeCentrality[target] || 0) + 1;
    });
    
    // Ajouter les nœuds
    data.nodes.forEach(node => {
      const nodeDegree = degreeCentrality[node.id] || 0;
      const nodeData = {
        id: node.id,
        label: (node.name || node.id).split('-')[0],
        type: node.type || 'default',
        centralityDegree: nodeDegree
      };
      
      // Fusionner avec les autres propriétés du nœud
      const element: ElementDefinition = {
        data: { ...nodeData, ...node },
        classes: node.type ? node.type.toLowerCase() : 'default'
      };
      
      // Si des positions pré-calculées sont fournies, les utiliser
      if (precomputedPositions && precomputedPositions[node.id]) {
        element.position = {
          x: precomputedPositions[node.id].x,
          y: precomputedPositions[node.id].y
        };
      }
      
      elements.push(element);
    });
    
    // Ajouter les arêtes
    data.edges.forEach(edge => {
      const edgeData = {
        id: edge.id,
        source: typeof edge.source === 'string' ? edge.source : edge.source.id,
        target: typeof edge.target === 'string' ? edge.target : edge.target.id,
        label: edge.label,
        type: edge.type || 'default',
        pmid: edge.pmid,
        pmids: edge.pmids
      };
      
      elements.push({
        data: { ...edgeData, ...edge },
        classes: edge.type ? edge.type.toLowerCase() : 'default'
      });
    });
    
    return elements;
  }, [data, precomputedPositions]);
  
  // Configuration du style pour Cytoscape - utilisation de any pour éviter des problèmes de typage complexes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cytoscapeStylesheet = useMemo((): any[] => [
    // Style global
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'color': '#000000',
        'font-size': '16px',
        'font-weight': 'bold',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': 'data(color)',
        'text-outline-width': 1.5,
        'text-outline-color': '#ffffff',
        'text-margin-y': 0,
        'text-max-width': '120px',
        'text-wrap': 'wrap',
        'width': '60px',
        'height': '60px',
        'shape': 'ellipse',
        'z-index': 10,
        'border-width': 1.5,
        'border-color': '#000000',
        'border-opacity': 0.2,
        'text-background-opacity': 0
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 'mapData(pmids.length, 1, 10, 0.8, 3)',
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'arrow-scale': 0.8,
        'opacity': 0.7,
        'line-style': 'solid',
        'overlay-opacity': 0
      }
    },
    // Styles par type de nœud
    ...Object.entries(NODE_COLORS).map(([type, color]) => ({
      selector: `node.${type.toLowerCase()}`,
      style: {
        'background-color': color
      }
    })),
    // Styles par type d'arête
    ...Object.entries(EDGE_COLORS).map(([type, color]) => ({
      selector: `edge.${type.toLowerCase()}`,
      style: {
        'line-color': color,
        'target-arrow-color': color
      }
    })),
    // Style pour nœuds sélectionnés
    {
      selector: 'node:selected',
      style: {
        'border-width': 3,
        'border-color': '#4263eb',
        'border-opacity': 1,
        'background-opacity': 1,
        'text-outline-color': '#4263eb'
      }
    },
    // Style pour arêtes sélectionnées
    {
      selector: 'edge:selected',
      style: {
        'width': 'mapData(pmids.length, 1, 10, 4, 12)',
        'line-color': '#4263eb',
        'target-arrow-color': '#4263eb',
        'z-index': 30
      }
    },
    // Style pour les nœuds survolés
    {
      selector: 'node:hover',
      style: {
        'background-opacity': 0.8,
        'border-width': 2,
        'border-color': '#4263eb',
        'border-opacity': 0.8
      }
    },
    // Style pour les arêtes survolées
    {
      selector: 'edge:hover',
      style: {
        'width': 'mapData(pmids.length, 1, 10, 3, 10)',
        'opacity': 1,
        'z-index': 20
      }
    }
  ], []);
  
  // Initialisation de Cytoscape
  useEffect(() => {
    if (!containerRef.current) {
      console.warn("Conteneur du graphe introuvable");
      return;
    }
    
    // Vérifier que les données sont valides
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      console.error("Données de graphe invalides:", data);
      if (onError) onError(new Error("Données de graphe invalides ou manquantes"));
      return;
    }
    
    // Vérifier qu'il y a des données à afficher
    if (data.nodes.length === 0) {
      console.warn("Aucun nœud à afficher");
      return;
    }
    
    try {
      // Préparer les éléments du graphe
      const elements = prepareCytoscapeElements();
      
      if (!elements || elements.length === 0) {
        throw new Error("Impossible de préparer les éléments du graphe");
      }
      
      // Toujours utiliser le layout preset pour éviter les calculs côté client
      const initialLayoutOptions = { 
        name: 'preset', 
        animate: false, 
        fit: true, 
        padding: 180 
      };
      
      // Initialisation de l'instance Cytoscape
      const cy = cytoscape({
        container: containerRef.current,
        elements,
        style: cytoscapeStylesheet,
        layout: initialLayoutOptions,
        wheelSensitivity: 0.2,
        minZoom: 0.05,
        maxZoom: 2.5,
        selectionType: 'single'
      });
      
      // Vérifier que l'instance a été créée correctement
      if (!cy) {
        throw new Error("Échec de l'initialisation de Cytoscape");
      }
      
      // Appliquer les couleurs aux nœuds et arêtes
      cy.nodes().forEach(node => {
        const type = node.data('type') || 'default';
        node.data('color', NODE_COLORS[type.toLowerCase()] || NODE_COLORS.default);
      });
      
      cy.edges().forEach(edge => {
        const type = edge.data('type') || 'default';
        edge.data('color', EDGE_COLORS[type.toLowerCase()] || EDGE_COLORS.default);
      });
      
      // Optimiser le zoom initial après un court délai
      setTimeout(() => {
        try {
          if (cy) {
            cy.fit(undefined, 150); // Padding de vue beaucoup plus grand
            
            // Toujours réduire le zoom pour avoir une vue d'ensemble plus large
            const currentZoom = cy.zoom();
            cy.zoom({
              level: currentZoom * 0.7, // Zoom out plus important (30%)
              renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
            });
          }
        } catch (zoomError) {
          console.warn("Erreur lors de l'ajustement du zoom:", zoomError);
        }
      }, 300); // Délai plus long pour assurer que le rendu initial est terminé
      
      // Gestion des événements
      try {
        cy.on('tap', 'node', event => {
          const nodeId = event.target.id();
          const node = data.nodes.find(n => n.id === nodeId);
          if (node && onNodeClick) {
            onNodeClick(node);
          }
        });
        
        cy.on('tap', 'edge', event => {
          const edgeId = event.target.id();
          const edge = data.edges.find(e => e.id === edgeId);
          if (edge && onLinkClick) {
            onLinkClick(edge);
          }
        });
      } catch (eventError) {
        console.warn("Erreur lors de la configuration des événements:", eventError);
        // Ne pas faire échouer tout le graphe pour une erreur d'événements
      }
      
      // Sauvegarder l'instance pour référence future
      cyRef.current = cy;
      
      // Log de succès pour le débogage
      console.log("Cytoscape initialisé avec succès:", {
        nodes: data.nodes.length,
        edges: data.edges.length,
        layout: initialLayoutOptions.name
      });
      
    } catch (error) {
      console.error("Erreur lors de l'initialisation de Cytoscape:", error);
      if (onError) onError(error instanceof Error ? error : new Error(String(error)));
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      try {
        if (cyRef.current) {
          cyRef.current.destroy();
          cyRef.current = null;
        }
      } catch (cleanupError) {
        console.error("Erreur lors du nettoyage de Cytoscape:", cleanupError);
      }
    };
  }, [data, precomputedPositions, onNodeClick, onLinkClick, onError, prepareCytoscapeElements, cytoscapeStylesheet]);
  
  return (
    <div className="relative w-full h-[800px] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Barre d'outils en haut du graphe */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-2 bg-white bg-opacity-95 border-b">
        <div className="flex space-x-1.5">
          <div className="text-xs px-2 py-1 text-indigo-700 bg-indigo-100 rounded">
            Layout calculé côté serveur
          </div>
        </div>
        
        <div className="flex space-x-1.5">
          <button
            onClick={() => cyRef.current?.fit()}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md font-medium flex items-center"
            title="Ajuster la vue"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Ajuster
          </button>
          <button
            onClick={resetZoomPan}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md font-medium flex items-center"
            title="Réinitialiser la vue"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Réinitialiser
          </button>
        </div>
      </div>
      
      {/* Légende des arêtes */}
      <div className="absolute bottom-2 right-2 z-10 bg-white bg-opacity-95 p-3 rounded-md shadow-md text-xs">
        <div className="font-medium mb-2 text-gray-700">Types de relations</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {Object.entries(EDGE_COLORS).filter(([key]) => key !== 'default').map(([type, color]) => (
            <div key={type} className="flex items-center">
              <div className="w-8 h-1" style={{ backgroundColor: color }}></div>
              <span className="ml-2">{type}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Conteneur du graphe */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
} 