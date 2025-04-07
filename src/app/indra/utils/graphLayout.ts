'use server';

import { GraphData, GraphNode, GraphEdge } from '../types';

// Définition des types pour les nœuds et arêtes utilisés dans les fonctions de layout
interface LayoutNode extends GraphNode {
  vx?: number;
  vy?: number;
  position: { x: number; y: number };
}

interface LayoutEdge extends GraphEdge {
  source: string | LayoutNode;
  target: string | LayoutNode;
}

interface LayoutOptions {
  width: number;
  height: number;
  iterations?: number;
  k?: number;
  gravity?: number;
  initialTemperature?: number;
  coolingFactor?: number;
}

/**
 * Implémentation simplifiée d'un layout force-directed pour le serveur
 * Basé sur l'algorithme Fruchterman-Reingold, optimisé pour grands graphes
 */
function simpleForceLayout(nodes: LayoutNode[], edges: LayoutEdge[], options: Partial<LayoutOptions> = {}) {
  // Paramètres du layout
  const width = options.width || 1000;
  const height = options.height || 800;
  const iterations = options.iterations || 200;
  const k = options.k || 30; // Force optimale
  const gravity = options.gravity || 0.1;
  const initialTemperature = options.initialTemperature || 0.5;
  const coolingFactor = options.coolingFactor || 0.98;
  
  // Facteur d'aération supplémentaire
  const aerationFactor = 1.5; // Augmenter pour plus d'espace entre les nœuds
  
  // Positionner les nœuds aléatoirement dans un espace plus grand
  nodes.forEach(node => {
    if (!node.position) {
      node.position = {
        x: (Math.random() - 0.5) * width * 0.8,
        y: (Math.random() - 0.5) * height * 0.8
      };
    }
    // Vitesse initiale
    node.vx = 0;
    node.vy = 0;
  });
  
  // Créer un index des nœuds pour référence rapide
  const nodeIndex: Record<string, LayoutNode> = {};
  nodes.forEach(node => {
    nodeIndex[node.id] = node;
  });
  
  // Convertir les arêtes pour qu'elles utilisent les références directes aux nœuds
  const processedEdges = edges.map(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    
    return {
      source: nodeIndex[sourceId],
      target: nodeIndex[targetId]
    };
  }).filter(edge => edge.source && edge.target);
  
  // Température pour le refroidissement simulé
  let temperature = initialTemperature;
  
  // Optimisation: grille de proximité pour réduire les calculs de répulsion
  const gridSize = Math.max(width, height) / 10;
  const grid: Record<string, LayoutNode[]> = {};
  
  // Fonction pour obtenir la clé de grille
  const getGridKey = (x: number, y: number) => `${Math.floor(x / gridSize)},${Math.floor(y / gridSize)}`;
  
  // Fonction pour mettre à jour la grille
  const updateGrid = () => {
    // Réinitialiser la grille
    Object.keys(grid).forEach(key => delete grid[key]);
    
    // Placer les nœuds dans la grille
    nodes.forEach(node => {
      const key = getGridKey(node.position.x, node.position.y);
      if (!grid[key]) grid[key] = [];
      grid[key].push(node);
    });
  };
  
  // Exécuter l'algorithme
  for (let i = 0; i < iterations; i++) {
    // Mettre à jour la grille de proximité
    if (i % 5 === 0) updateGrid();
    
    // Forces répulsives entre nœuds proches uniquement
    nodes.forEach(node1 => {
      const key1 = getGridKey(node1.position.x, node1.position.y);
      const neighborKeys = [key1];
      
      // Ajouter les cellules adjacentes
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const x = Math.floor(node1.position.x / gridSize) + dx;
          const y = Math.floor(node1.position.y / gridSize) + dy;
          neighborKeys.push(`${x},${y}`);
        }
      }
      
      // Calculer les répulsions uniquement avec les nœuds des cellules voisines
      neighborKeys.forEach(key => {
        if (!grid[key]) return;
        
        grid[key].forEach(node2 => {
          if (node1 === node2) return;
          
          const dx = node1.position.x - node2.position.x;
          const dy = node1.position.y - node2.position.y;
          const distanceSq = dx * dx + dy * dy;
          const distance = Math.sqrt(distanceSq) || 1;
          
          // Optimisation: ignorer les répulsions des nœuds très éloignés
          if (distance > k * 3) return;
          
          // Force répulsive (inversement proportionnelle à la distance)
          // Augmentée par le facteur d'aération
          const force = (k * k / distance) * aerationFactor;
          
          node1.vx = (node1.vx || 0) + dx / distance * force;
          node1.vy = (node1.vy || 0) + dy / distance * force;
        });
      });
      
      // Force d'attraction vers le centre (gravité) - réduite pour plus d'espace
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = node1.position.x - centerX;
      const dy = node1.position.y - centerY;
      
      // Gravité réduite pour permettre plus d'expansion
      node1.vx = (node1.vx || 0) - dx * gravity * 0.8;
      node1.vy = (node1.vy || 0) - dy * gravity * 0.8;
    });
    
    // Forces attractives le long des arêtes - réduites pour permettre plus d'espace
    processedEdges.forEach(edge => {
      const dx = edge.target.position.x - edge.source.position.x;
      const dy = edge.target.position.y - edge.source.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Force attractive (proportionnelle à la distance) - réduite pour plus d'espace
      const force = (distance / k) * 0.8;
      
      edge.source.vx = (edge.source.vx || 0) + dx / distance * force;
      edge.source.vy = (edge.source.vy || 0) + dy / distance * force;
      edge.target.vx = (edge.target.vx || 0) - dx / distance * force;
      edge.target.vy = (edge.target.vy || 0) - dy / distance * force;
    });
    
    // Mise à jour des positions avec limitation par la température
    nodes.forEach(node => {
      const displacement = Math.sqrt((node.vx || 0) * (node.vx || 0) + (node.vy || 0) * (node.vy || 0));
      if (displacement > 0) {
        // Limiter le déplacement par la température
        const limitedDisplacement = Math.min(displacement, temperature);
        
        node.position.x += (node.vx || 0) / displacement * limitedDisplacement;
        node.position.y += (node.vy || 0) / displacement * limitedDisplacement;
        
        // Maintenir dans la zone visible mais avec une zone plus large
        node.position.x = Math.max(-width * 0.2, Math.min(width * 1.2, node.position.x));
        node.position.y = Math.max(-height * 0.2, Math.min(height * 1.2, node.position.y));
      }
      
      // Réinitialiser les forces
      node.vx = 0;
      node.vy = 0;
    });
    
    // Refroidissement plus lent pour une meilleure expansion
    temperature *= Math.max(0.97, coolingFactor);
    
    // Optimisation: pour les grands graphes, réduire le nombre d'itérations
    if (nodes.length > 1000 && i > iterations / 2) {
      break; // Sortir plus tôt pour les grands graphes
    }
  }
  
  // Après le layout initial, appliquer une expansion finale pour plus d'aération
  applyFinalExpansion(nodes, width, height, aerationFactor);
  
  // Retourner les positions calculées
  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach(node => {
    positions[node.id] = {
      x: node.position.x,
      y: node.position.y
    };
  });
  
  return positions;
}

/**
 * Applique une expansion finale au graphe pour plus d'aération
 */
function applyFinalExpansion(nodes: LayoutNode[], width: number, height: number, expansionFactor: number) {
  // Trouver le centre actuel du graphe
  let sumX = 0, sumY = 0;
  nodes.forEach(node => {
    sumX += node.position.x;
    sumY += node.position.y;
  });
  
  const centerX = sumX / nodes.length;
  const centerY = sumY / nodes.length;
  
  // Expansion depuis le centre
  nodes.forEach(node => {
    // Vecteur du centre vers le nœud
    const dx = node.position.x - centerX;
    const dy = node.position.y - centerY;
    
    // Expansion proportionnelle à la distance du centre
    node.position.x = centerX + dx * expansionFactor;
    node.position.y = centerY + dy * expansionFactor;
  });
}

/**
 * Calcule les positions des nœuds selon le layout spécifié
 * Adapté pour gérer de très grands graphes
 */
export async function computeGraphLayout(graphData: GraphData, layoutName: string = 'equilibré'): Promise<Record<string, { x: number, y: number }>> {
  // Si pas de données, retourner un objet vide
  if (!graphData || !graphData.nodes || !graphData.edges || graphData.nodes.length === 0) {
    return {};
  }
  
  try {
    // Adapter les paramètres selon la taille du graphe
    const nodeCount = graphData.nodes.length;
    
    console.log(`Calcul du layout ${layoutName} pour ${nodeCount} nœuds`);
    
    // Pour les très grands graphes, utiliser des paramètres spéciaux pour accélérer le calcul
    const layoutOptions: LayoutOptions = {
      width: 4000,
      height: 2500,
      iterations: nodeCount > 1000 ? 100 : (nodeCount > 500 ? 200 : 300),
      k: 200,
      gravity: 0.1,
      initialTemperature: 0.8,
      coolingFactor: 0.98
    };
    
    // Créer des copies des nœuds et des arêtes
    const nodes = graphData.nodes.map(node => ({
      ...node,
      id: node.id,
      position: node.position || { x: 0, y: 0 }
    })) as LayoutNode[];
    
    const edges = graphData.edges.map(edge => ({
      ...edge,
      id: edge.id,
      source: typeof edge.source === 'string' ? edge.source : edge.source.id,
      target: typeof edge.target === 'string' ? edge.target : edge.target.id
    })) as LayoutEdge[];
    
    // Pour les graphes extrêmement larges, utiliser l'échantillonnage
    if (nodeCount > 5000) {
      console.log(`Graphe très large (${nodeCount} nœuds). Utilisation des optimisations spéciales.`);
      
      // Pour les graphes très larges, utiliser uniquement certains layouts
      if (!['equilibré', 'grid', 'circle'].includes(layoutName)) {
        layoutName = 'equilibré'; // Forcer le layout équilibré pour les très grands graphes
      }
      
      // Optimiser les paramètres pour des calculs plus rapides
      layoutOptions.iterations = Math.min(50, Math.max(20, Math.floor(10000 / nodeCount)));
      layoutOptions.width = Math.max(6000, Math.min(12000, nodeCount));
      layoutOptions.height = Math.max(4000, Math.min(9000, nodeCount * 0.8));
    }
    
    // Ajuster les paramètres en fonction du layout et de la taille du graphe
    if (layoutName === 'equilibré') {
      layoutOptions.k = nodeCount > 1000 ? 180 : 280;
      layoutOptions.gravity = nodeCount > 1000 ? 0.12 : 0.06;
      layoutOptions.width = nodeCount > 1000 ? 6000 : 5000;
      layoutOptions.height = nodeCount > 1000 ? 3600 : 3000;
    } else if (layoutName === 'compact') {
      layoutOptions.k = nodeCount > 1000 ? 120 : 150;
      layoutOptions.gravity = nodeCount > 1000 ? 0.2 : 0.15;
      layoutOptions.width = nodeCount > 1000 ? 3500 : 2800;
      layoutOptions.height = nodeCount > 1000 ? 2500 : 1800;
    } else if (layoutName === 'spread' || layoutName === 'aéré') {
      layoutOptions.k = nodeCount > 1000 ? 400 : 500;
      layoutOptions.gravity = nodeCount > 1000 ? 0.04 : 0.02;
      layoutOptions.width = nodeCount > 1000 ? 8000 : 7000;
      layoutOptions.height = nodeCount > 1000 ? 5000 : 4000;
    }
    
    // Pour les graphes extrêmement larges, utiliser l'algorithme par lots
    if (nodeCount > 8000) {
      // Utiliser une approche hiérarchique pour les très grands graphes
      return await computeLayoutForVeryLargeGraph(nodes, edges, layoutOptions);
    }
    
    // Pour les grands graphes, layouts spéciaux
    if (nodeCount > 2000) {
      if (layoutName === 'grid') {
        // Placement en grille
        const cols = Math.ceil(Math.sqrt(nodeCount));
        const gridPositions: Record<string, { x: number, y: number }> = {};
        
        nodes.forEach((node, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          
          gridPositions[node.id] = {
            x: col * 150 + 100,
            y: row * 150 + 100
          };
        });
        
        return gridPositions;
      } else if (layoutName === 'circle') {
        // Pour les grands graphes, utiliser plusieurs cercles concentriques
        const circlePositions: Record<string, { x: number, y: number }> = {};
        const centerX = layoutOptions.width / 2;
        const centerY = layoutOptions.height / 2;
        const nodesPerCircle = 200; // Nombre maximum de nœuds par cercle
        
        nodes.forEach((node, index) => {
          const circleIndex = Math.floor(index / nodesPerCircle);
          const indexInCircle = index % nodesPerCircle;
          const radius = 500 + circleIndex * 300; // Rayon croissant pour chaque cercle
          
          const angle = (indexInCircle / nodesPerCircle) * 2 * Math.PI;
          circlePositions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        });
        
        return circlePositions;
      }
    } else {
      // Pour les graphes plus petits, utiliser les layouts spéciaux normaux
      if (layoutName === 'grid') {
        // Placement en grille
        const cols = Math.ceil(Math.sqrt(nodeCount));
        const gridPositions: Record<string, { x: number, y: number }> = {};
        
        nodes.forEach((node, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          
          gridPositions[node.id] = {
            x: col * 200 + 100,
            y: row * 200 + 100
          };
        });
        
        return gridPositions;
      } else if (layoutName === 'circle') {
        // Placement en cercle
        const radius = Math.min(800, 100 + nodeCount * 2);
        const circlePositions: Record<string, { x: number, y: number }> = {};
        const centerX = 2000;
        const centerY = 1500;
        
        nodes.forEach((node, index) => {
          const angle = (index / nodeCount) * 2 * Math.PI;
          circlePositions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        });
        
        return circlePositions;
      } else if (layoutName === 'concentric') {
        // Placement concentrique basé sur le degré
        const numNodes = nodes.length;
        const circlePositions: Record<string, { x: number, y: number }> = {};
        const centerX = 2000;
        const centerY = 1500;
        
        // Calculer le degré de chaque nœud
        const nodeDegrees: Record<string, number> = {};
        nodes.forEach(node => {
          nodeDegrees[node.id] = 0;
        });
        
        edges.forEach(edge => {
          const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
          const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
          
          nodeDegrees[sourceId] = (nodeDegrees[sourceId] || 0) + 1;
          nodeDegrees[targetId] = (nodeDegrees[targetId] || 0) + 1;
        });
        
        // Trier les nœuds par degré
        const sortedNodes = [...nodes].sort((a, b) => 
          (nodeDegrees[b.id] || 0) - (nodeDegrees[a.id] || 0)
        );
        
        // Répartir en cercles concentriques
        const numLevels = Math.min(5, Math.ceil(Math.sqrt(numNodes) / 2));
        const nodesPerLevel = Math.ceil(numNodes / numLevels);
        
        sortedNodes.forEach((node, index) => {
          const level = Math.floor(index / nodesPerLevel) + 1;
          const indexInLevel = index % nodesPerLevel;
          const nodesInThisLevel = Math.min(nodesPerLevel, numNodes - (level - 1) * nodesPerLevel);
          
          const radius = level * 200;
          const angle = (indexInLevel / nodesInThisLevel) * 2 * Math.PI;
          
          circlePositions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        });
        
        return circlePositions;
      }
    }
    
    // Message pour les très grands graphes
    if (nodeCount > 3000) {
      console.log(`Attention: calcul de layout pour un très grand graphe (${nodeCount} nœuds). Cela peut prendre du temps.`);
    }
    
    // Exécuter l'algorithme force-directed
    return simpleForceLayout(nodes, edges, layoutOptions);
    
  } catch (error) {
    console.error('Erreur lors du calcul du layout côté serveur:', error);
    // En cas d'erreur, retourner un objet vide
    return {};
  }
}

/**
 * Calcule le layout pour les très grands graphes en utilisant une approche hiérarchique
 */
async function computeLayoutForVeryLargeGraph(
  nodes: LayoutNode[], 
  edges: LayoutEdge[], 
  options: LayoutOptions
): Promise<Record<string, { x: number, y: number }>> {
  const nodeCount = nodes.length;
  console.log(`Utilisation de l'algorithme pour très grands graphes (${nodeCount} nœuds)`);
  
  // Calculer le layout de manière asynchrone pour éviter de bloquer le serveur
  return new Promise(resolve => {
    // Utiliser setTimeout pour permettre au serveur de continuer à répondre
    setTimeout(() => {
      // 1. Trouver les nœuds les plus connectés (hubs)
      const nodeDegrees: Record<string, number> = {};
      edges.forEach(edge => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        
        nodeDegrees[sourceId] = (nodeDegrees[sourceId] || 0) + 1;
        nodeDegrees[targetId] = (nodeDegrees[targetId] || 0) + 1;
      });
      
      // 2. Générer une grille en spirale pour placer les nœuds
      const centerX = options.width / 2;
      const centerY = options.height / 2;
      const positions: Record<string, { x: number, y: number }> = {};
      
      // Placer les nœuds les plus connectés au centre
      let layerSize = Math.ceil(Math.sqrt(nodeCount) / 4);
      let itemsPlaced = 0;
      let radius = 150;
      
      nodes.forEach(node => {
        // Déterminer la position dans la spirale
        if (itemsPlaced >= layerSize) {
          layerSize = Math.ceil(layerSize * 1.5);
          radius += 100;
        }
        
        // Calculer l'angle
        const angle = (itemsPlaced / layerSize) * 2 * Math.PI;
        
        // Positionner le nœud
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
        
        itemsPlaced++;
      });
      
      // 4. Appliquer quelques itérations locales pour améliorer le layout
      // Cette étape est simplifiée par rapport au layout complet
      for (let i = 0; i < 20; i++) {
        // Appliquer uniquement les forces attractives le long des arêtes
        edges.forEach(edge => {
          const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
          const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
          
          const source = positions[sourceId];
          const target = positions[targetId];
          
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Si la distance est trop grande, rapprocher légèrement les nœuds
            if (distance > 400) {
              const force = 0.05;
              
              const moveX = dx * force;
              const moveY = dy * force;
              
              source.x += moveX;
              source.y += moveY;
              target.x -= moveX;
              target.y -= moveY;
            }
          }
        });
      }
      
      // 5. Ajuster l'échelle pour utiliser tout l'espace disponible
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      // Trouver les bornes actuelles
      Object.values(positions).forEach(pos => {
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x);
        maxY = Math.max(maxY, pos.y);
      });
      
      // Calculer les facteurs d'échelle
      const width = maxX - minX || 1;
      const height = maxY - minY || 1;
      const scaleX = options.width / width;
      const scaleY = options.height / height;
      const scale = Math.min(scaleX, scaleY) * 0.8;
      
      // Appliquer l'échelle et la translation
      Object.values(positions).forEach(pos => {
        pos.x = (pos.x - minX) * scale + options.width * 0.1;
        pos.y = (pos.y - minY) * scale + options.height * 0.1;
      });
      
      resolve(positions);
    }, 0);
  });
}

/**
 * Applique les positions pré-calculées aux nœuds du graphe
 * @param graphData Données du graphe
 * @param positions Positions pré-calculées
 * @returns Graphe avec positions mises à jour
 */
export async function applyPositionsToGraph(graphData: GraphData, positions: Record<string, { x: number, y: number }>): Promise<GraphData> {
  // Copier les données pour ne pas modifier l'original
  const updatedGraphData: GraphData = {
    nodes: [...graphData.nodes],
    edges: [...graphData.edges],
    width: graphData.width,
    height: graphData.height
  };
  
  // Appliquer les positions aux nœuds
  updatedGraphData.nodes = updatedGraphData.nodes.map(node => ({
    ...node,
    position: positions[node.id] 
      ? { x: positions[node.id].x, y: positions[node.id].y }
      : node.position, // Garder la position existante si pas de nouvelle position
  }));
  
  return updatedGraphData;
} 