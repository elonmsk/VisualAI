'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { GraphData, GraphNode, GraphEdge } from '../../types';

interface GraphVisualizationProps {
  graphData: GraphData;
  nodePositions?: Record<string, { x: number; y: number }>;
  layoutType?: string;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ 
  graphData, 
  nodePositions,
  layoutType = 'equilibré'
}) => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphEdge | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // Palette de couleurs pour différents types de nœuds
  const nodeColors: Record<string, string> = {
    'gene': '#4f46e5',    // indigo-600
    'protein': '#059669', // emerald-600
    'drug': '#d97706',    // amber-600
    'disease': '#dc2626', // red-600
    'default': '#6b7280'  // gray-500
  };
  
  // Palette de couleurs pour différents types de relations
  const edgeColors: Record<string, string> = {
    'Phosphorylation': '#4f46e5',   // indigo-600
    'Activation': '#059669',        // emerald-600
    'Inhibition': '#dc2626',        // red-600
    'Complex': '#8b5cf6',           // violet-500
    'IncreaseAmount': '#0891b2',    // cyan-600
    'DecreaseAmount': '#ea580c',    // orange-600
    'default': '#9ca3af'            // gray-400
  };
  
  // Appliquer des transformations aux données du graphe
  const processedData = React.useMemo(() => {
    // Vérifier si les données sont valides
    if (!graphData || !graphData.nodes || !graphData.edges) {
      return { nodes: [], links: [] };
    }
    
    // Ajuster les données du graphe pour la visualisation
    const nodes = graphData.nodes.map(node => ({
      ...node,
      val: node.count || 1,        // Taille des nœuds proportionnelle au nombre d'occurrences
      color: nodeColors[node.type] || nodeColors.default
    }));
    
    const links = graphData.edges.map(edge => ({
      ...edge,
      color: edgeColors[edge.type] || edgeColors.default,
      value: edge.confidence || 0.5, // Épaisseur des liens proportionnelle à la confiance
    }));
    
    return { nodes, links };
  }, [graphData]);
  
  // Mettre à jour les dimensions du graphe en fonction du conteneur
  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        const { offsetWidth, offsetHeight } = containerRef.current!;
        setDimensions({ 
          width: offsetWidth, 
          height: Math.max(500, offsetHeight) // Hauteur minimale pour garantir la visibilité
        });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);
  
  // Appliquer les positions prédéfinies des nœuds si disponibles
  useEffect(() => {
    if (graphRef.current && nodePositions && Object.keys(nodePositions).length > 0) {
      // Figer le graphe pour appliquer les positions
      graphRef.current.d3Force('center', null);
      graphRef.current.d3Force('charge', null);
      
      const graphInstance = graphRef.current;
      
      // Mettre à jour les positions de chaque nœud
      processedData.nodes.forEach(node => {
        const pos = nodePositions[node.id];
        if (pos) {
          node.fx = pos.x;
          node.fy = pos.y;
        }
      });
      
      // Mise à jour et centrage du graphe
      setTimeout(() => {
        graphInstance.zoomToFit(400, 50);
      }, 300);
    }
  }, [nodePositions, processedData.nodes]);
  
  // Gérer la mise en surbrillance des nœuds et liens
  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNode(node);
    
    if (graphRef.current) {
      graphRef.current.centerAt(
        node?.x, 
        node?.y, 
        300  // durée de l'animation en ms
      );
    }
  };
  
  // Gérer la sélection des nœuds
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(prevNode => prevNode?.id === node.id ? null : node);
    
    if (graphRef.current) {
      // Centrer le graphe sur le nœud sélectionné
      graphRef.current.centerAt(node.x, node.y, 800);
      // Zoomer légèrement pour voir le contexte du nœud
      graphRef.current.zoom(3, 800);
    }
  };
  
  // Fonctions auxiliaires pour le rendu personnalisé
  const getNodeLabel = (node: GraphNode) => {
    return node.name;
  };
  
  const getLinkLabel = (link: GraphEdge) => {
    return link.label || link.type || '';
  };
  
  return (
    <div className="flex flex-col space-y-2">
      {/* Légende simplifiée */}
      <div className="flex flex-wrap gap-2 pb-2 px-2">
        {Object.entries(nodeColors).filter(([type]) => type !== 'default').map(([type, color]) => (
          <div key={type} className="flex items-center text-xs text-gray-700">
            <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }}></span>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>
      
      {/* Graphe */}
      <div ref={containerRef} className="graph-container">
        <ForceGraph2D
          ref={graphRef}
          graphData={processedData}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel={getNodeLabel}
          linkLabel={getLinkLabel}
          nodeRelSize={5}
          linkWidth={link => (link.value || 0.5) * 3}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={link => ((link as GraphEdge).confidence || 0.5) * 2}
          onNodeHover={handleNodeHover}
          onLinkHover={setHoveredLink}
          onNodeClick={handleNodeClick}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const { x, y, color, name, id } = node as GraphNode & { color: string };
            const size = (node.val || 1) * 4;
            const fontSize = 12 / globalScale;
            
            // Dessiner l'arrière-plan du nœud
            ctx.beginPath();
            ctx.arc(x!, y!, size, 0, 2 * Math.PI);
            ctx.fillStyle = hoveredNode?.id === id || selectedNode?.id === id
              ? 'rgba(255, 255, 255, 0.9)' // Fond blanc pour le nœud survolé ou sélectionné
              : 'rgba(255, 255, 255, 0.7)'; // Fond blanc semi-transparent pour les autres nœuds
            ctx.fill();
            
            // Dessiner le cercle coloré du nœud
            ctx.beginPath();
            ctx.arc(x!, y!, size * 0.8, 0, 2 * Math.PI);
            ctx.fillStyle = hoveredNode?.id === id || selectedNode?.id === id
              ? '#3b82f6' // Bleu vif si survolé ou sélectionné
              : color;
            ctx.fill();
            
            // Afficher l'étiquette pour les nœuds survolés ou sélectionnés, ou si le zoom est suffisant
            if (hoveredNode?.id === id || selectedNode?.id === id || globalScale > 0.8) {
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.fillText(name, x!, y! + size + fontSize);
            }
          }}
          cooldownTicks={50}
        />
      </div>
      
      {/* Détails du nœud ou du lien sélectionné */}
      {(hoveredNode || hoveredLink || selectedNode) && (
        <div className="p-3 mt-2 bg-white rounded-md border border-gray-200 text-sm">
          {selectedNode && (
            <div>
              <h3 className="font-medium text-gray-900">{selectedNode.name}</h3>
              <p className="text-gray-500 text-xs mt-1">Type: {selectedNode.type}</p>
              {selectedNode.references && Object.keys(selectedNode.references).length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-700 font-medium">Références:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(selectedNode.references).map(([db, id]) => (
                      <span key={db} className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {db}: {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!selectedNode && hoveredNode && (
            <div>
              <span className="text-gray-700">{hoveredNode.name}</span>
              <span className="text-gray-500 text-xs ml-2">({hoveredNode.type})</span>
            </div>
          )}
          
          {!selectedNode && !hoveredNode && hoveredLink && (
            <div className="flex items-center">
              <span className="text-gray-700">{hoveredLink.label || hoveredLink.type}</span>
              {hoveredLink.confidence !== undefined && (
                <span className="text-gray-500 text-xs ml-2">
                  Confiance: {(hoveredLink.confidence * 100).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;