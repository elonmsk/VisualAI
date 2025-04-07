'use server';

import cytoscape from 'cytoscape';
import { GraphData } from '../types';

/**
 * Calcule les positions des nœuds d'un graphe côté serveur
 * 
 * @param graphData Données du graphe
 * @param layoutType Type de layout à appliquer
 * @returns Un objet avec les positions des nœuds
 */
export async function calculateNodePositions(
  graphData: GraphData,
  layoutType: 'equilibré' | 'aéré' | 'compact' | 'concentric' | 'ultra-dispersé' = 'equilibré'
): Promise<Record<string, { x: number, y: number }>> {
  // Vérifier que les données sont valides
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
    console.error("Données de graphe invalides:", graphData);
    return {};
  }
  
  // Vérifier qu'il y a des données à afficher
  if (graphData.nodes.length === 0) {
    console.warn("Aucun nœud à afficher");
    return {};
  }
  
  try {
    // Créer une instance headless de Cytoscape (sans rendu visuel)
    const cy = cytoscape({
      headless: true
    });
    
    // Préparer les nœuds et les arêtes
    graphData.nodes.forEach(node => {
      // Créer un nouvel objet sans les propriétés que nous définissons explicitement
      const { id, name, type, ...restNodeData } = node;
      
      cy.add({
        group: 'nodes',
        data: {
          id: id,
          label: (name || id),
          type: type || 'default',
          ...restNodeData
        }
      });
    });
    
    graphData.edges.forEach(edge => {
      // Extraire les propriétés que nous allons définir explicitement
      const { id, source, target, label, type, ...restEdgeData } = edge;
      
      cy.add({
        group: 'edges',
        data: {
          id: id,
          source: typeof source === 'string' ? source : source.id,
          target: typeof target === 'string' ? target : target.id,
          label: label,
          type: type || 'default',
          ...restEdgeData
        }
      });
    });
    
    // Configurer les options du layout en fonction du type demandé
    const layoutOptions = getLayoutOptions(layoutType, graphData.nodes.length);
    
    // Appliquer le layout et attendre qu'il soit terminé
    const layout = cy.layout(layoutOptions);
    await new Promise<void>((resolve) => {
      layout.on('layoutstop', () => resolve());
      layout.run();
    });
    
    // Récupérer les positions calculées
    const positions: Record<string, { x: number, y: number }> = {};
    cy.nodes().forEach(node => {
      const position = node.position();
      positions[node.id()] = {
        x: position.x,
        y: position.y
      };
    });
    
    // Nettoyer l'instance Cytoscape
    cy.destroy();
    
    return positions;
  } catch (error) {
    console.error("Erreur lors du calcul des positions:", error);
    return {};
  }
}

/**
 * Retourne les options de layout optimisées en fonction du type demandé
 */
function getLayoutOptions(type: string, nodeCount: number): cytoscape.LayoutOptions {
  const baseOptions = {
    animate: false, // Pas d'animation en mode headless
    fit: true,
    padding: 180
  };
  
  if (type === 'equilibré') {
    return {
      name: 'cose',
      ...baseOptions,
      gravity: 45,             // Force d'attraction vers le centre modérée
      boundingBox: { 
        x1: 0, 
        y1: 0, 
        w: 4500, 
        h: 3000 
      },
      idealEdgeLength: () => 230,
      nodeOverlap: 5,
      refresh: 20,
      nodeRepulsion: () => 18000,
      edgeElasticity: () => 75,
      nestingFactor: 1.3,
      numIter: 3000,
      initialTemp: 900,
      coolingFactor: 0.99,
      minTemp: 1.0
    };
  } else if (type === 'ultra-dispersé') {
    return {
      name: 'cose',
      ...baseOptions,
      gravity: 10,
      boundingBox: { 
        x1: 0, 
        y1: 0, 
        w: 12000, 
        h: 9000 
      },
      idealEdgeLength: () => 600,
      nodeOverlap: 0,
      nodeRepulsion: () => 35000,
      initialTemp: 1500,
      coolingFactor: 0.99,
      numIter: 4000,
      refresh: 30
    };
  } else if (type === 'aéré') {
    return {
      name: 'cose',
      ...baseOptions,
      gravity: 20,
      boundingBox: { 
        x1: 0, 
        y1: 0, 
        w: 9000, 
        h: 7000 
      },
      idealEdgeLength: () => 450,
      nodeOverlap: 0,
      nodeRepulsion: () => 30000,
      initialTemp: 1300,
      coolingFactor: 0.99,
      numIter: 3500
    };
  } else if (type === 'compact') {
    return {
      name: 'cose',
      ...baseOptions,
      gravity: 60,
      idealEdgeLength: () => 180,
      nodeRepulsion: () => 16000,
      edgeElasticity: () => 90,
      nodeOverlap: 8,
      numIter: 2500
    };
  } else if (type === 'concentric') {
    return {
      name: 'concentric',
      ...baseOptions,
      minNodeSpacing: 220,
      spacingFactor: 2.25,
      concentric: (node: cytoscape.NodeSingular) => node.degree(false),
      levelWidth: (nodes: cytoscape.NodeCollection) => nodes.length
    };
  } else {
    // Par défaut utiliser les paramètres équilibrés
    return getLayoutOptions('equilibré', nodeCount);
  }
} 