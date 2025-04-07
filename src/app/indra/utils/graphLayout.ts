/**
 * Utilitaires pour calculer différentes mises en page de graphe
 */

import { GraphData, GraphNode, GraphEdge } from '../types';

interface Vector {
  x: number;
  y: number;
}

/**
 * Calcule la mise en page optimale pour un graphe donné
 */
export async function computeGraphLayout(
  graphData: GraphData,
  layoutName: string = 'cose'
): Promise<Record<string, { x: number, y: number }>> {
  // Dimensions par défaut pour le calcul du layout
  const width = graphData.width || 800;
  const height = graphData.height || 600;
  
  // Si le graphe est vide, retourner un objet vide
  if (!graphData.nodes || graphData.nodes.length === 0) {
    return {};
  }
  
  // Si le graphe est très petit, utiliser un layout simple
  if (graphData.nodes.length <= 5) {
    return computeCircularLayout(graphData, width, height);
  }
  
  // En fonction du type de layout demandé, appliquer l'algorithme approprié
  switch (layoutName) {
    case 'circle':
    case 'circulaire':
      return computeCircularLayout(graphData, width, height);
      
    case 'grid':
    case 'grille':
      return computeGridLayout(graphData, width, height);
      
    case 'concentric':
    case 'concentrique':
      return computeConcentricLayout(graphData, width, height);
      
    case 'breadthfirst':
    case 'compact':
      return computeTreeLayout(graphData, width, height);
      
    case 'spread':
    case 'aéré':
      return computeSpreadLayout(graphData, width, height);
      
    case 'cose':
    case 'equilibré':
    default:
      return computeForceDirectedLayout(graphData, width, height);
  }
}

/**
 * Layout circulaire simple - place les nœuds en cercle
 */
function computeCircularLayout(
  graphData: GraphData,
  width: number,
  height: number
): Record<string, { x: number, y: number }> {
  const positions: Record<string, { x: number, y: number }> = {};
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.4; // 40% de la plus petite dimension
  
  graphData.nodes.forEach((node, index) => {
    const angle = (index / graphData.nodes.length) * 2 * Math.PI;
    positions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  return positions;
}

/**
 * Layout en grille - place les nœuds dans une grille régulière
 */
function computeGridLayout(
  graphData: GraphData,
  width: number,
  height: number
): Record<string, { x: number, y: number }> {
  const positions: Record<string, { x: number, y: number }> = {};
  const nodeCount = graphData.nodes.length;
  
  // Calculer le nombre optimal de colonnes pour la grille
  const cols = Math.ceil(Math.sqrt(nodeCount));
  const rows = Math.ceil(nodeCount / cols);
  
  // Calculer l'espacement entre les nœuds
  const cellWidth = width / (cols + 1);
  const cellHeight = height / (rows + 1);
  
  graphData.nodes.forEach((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    positions[node.id] = {
      x: (col + 1) * cellWidth,
      y: (row + 1) * cellHeight
    };
  });
  
  return positions;
}

/**
 * Layout concentrique - place les nœuds en cercles concentriques
 * Les nœuds avec le plus de connexions sont au centre
 */
function computeConcentricLayout(
  graphData: GraphData,
  width: number,
  height: number
): Record<string, { x: number, y: number }> {
  const positions: Record<string, { x: number, y: number }> = {};
  const nodeCount = graphData.nodes.length;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Calculer le degré de chaque nœud (nombre de connexions)
  const nodeDegrees: Record<string, number> = {};
  graphData.nodes.forEach(node => {
    nodeDegrees[node.id] = 0;
  });
  
  graphData.edges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    
    nodeDegrees[sourceId] = (nodeDegrees[sourceId] || 0) + 1;
    nodeDegrees[targetId] = (nodeDegrees[targetId] || 0) + 1;
  });
  
  // Trier les nœuds par degré décroissant
  const sortedNodes = [...graphData.nodes].sort((a, b) => 
    (nodeDegrees[b.id] || 0) - (nodeDegrees[a.id] || 0)
  );
  
  // Nombre de cercles concentrique (adapté en fonction du nombre de nœuds)
  const numCircles = Math.min(5, Math.ceil(Math.sqrt(nodeCount / 2)));
  const nodesPerCircle = Math.ceil(nodeCount / numCircles);
  
  // Placer les nœuds en cercles concentriques
  sortedNodes.forEach((node, index) => {
    const circleIndex = Math.floor(index / nodesPerCircle);
    const positionInCircle = index % nodesPerCircle;
    
    // Radius pour ce cercle (plus petit à l'intérieur, plus grand à l'extérieur)
    const maxRadius = Math.min(width, height) * 0.45;
    const radius = maxRadius * ((circleIndex + 1) / numCircles);
    
    // Angle dans le cercle
    const angle = (positionInCircle / nodesPerCircle) * 2 * Math.PI;
    
    positions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  return positions;
}

/**
 * Layout en arbre - organise les nœuds dans une structure hiérarchique
 */
function computeTreeLayout(
  graphData: GraphData,
  width: number,
  height: number
): Record<string, { x: number, y: number }> {
  const positions: Record<string, { x: number, y: number }> = {};
  
  if (graphData.nodes.length === 0) return positions;
  
  // Trouver une racine potentielle (nœud avec le plus de connexions sortantes)
  const outgoingEdges: Record<string, number> = {};
  graphData.edges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    outgoingEdges[sourceId] = (outgoingEdges[sourceId] || 0) + 1;
  });
  
  let rootId = graphData.nodes[0].id;
  let maxOutgoing = 0;
  
  Object.entries(outgoingEdges).forEach(([nodeId, count]) => {
    if (count > maxOutgoing) {
      maxOutgoing = count;
      rootId = nodeId;
    }
  });
  
  // Trouver tous les nœuds accessibles depuis la racine
  const visited = new Set<string>();
  const levels: Record<string, number> = {};
  const queue: { id: string, level: number }[] = [{ id: rootId, level: 0 }];
  
  // BFS pour déterminer les niveaux
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    
    if (visited.has(id)) continue;
    visited.add(id);
    levels[id] = level;
    
    // Trouver les voisins
    const neighbors = graphData.edges
      .filter(edge => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        return sourceId === id || targetId === id;
      })
      .map(edge => {
        const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        return sourceId === id ? targetId : sourceId;
      });
    
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, level: level + 1 });
      }
    });
  }
  
  // Gérer les nœuds non visités (isolés)
  graphData.nodes.forEach(node => {
    if (!visited.has(node.id)) {
      levels[node.id] = Object.keys(levels).length > 0 
        ? Math.max(...Object.values(levels)) + 1 
        : 0;
    }
  });
  
  // Calculer le nombre maximum de nœuds par niveau
  const nodesPerLevel: Record<number, number> = {};
  Object.values(levels).forEach(level => {
    nodesPerLevel[level] = (nodesPerLevel[level] || 0) + 1;
  });
  
  const maxLevel = Math.max(...Object.keys(levels).map(Number));
  
  // Distribuer les nœuds horizontalement par niveau
  graphData.nodes.forEach(node => {
    const level = levels[node.id] || 0;
    
    // Trouver la position du nœud dans son niveau
    const nodesAtSameLevel = graphData.nodes.filter(n => levels[n.id] === level);
    const positionInLevel = nodesAtSameLevel.findIndex(n => n.id === node.id);
    
    const levelCount = nodesPerLevel[level] || 1;
    const levelWidth = width * 0.8;
    const levelPadding = width * 0.1;
    const nodeSpacing = levelWidth / (levelCount + 1);
    
    positions[node.id] = {
      x: levelPadding + (positionInLevel + 1) * nodeSpacing,
      y: (level + 1) * (height / (maxLevel + 2))
    };
  });
  
  return positions;
}

/**
 * Layout étendu - maximise l'espace entre les nœuds
 */
function computeSpreadLayout(
  graphData: GraphData,
  width: number,
  height: number
): Record<string, { x: number, y: number }> {
  // Commencer par un layout force-directed standard
  const positions = computeForceDirectedLayout(graphData, width, height);
  
  // Augmenter la distance entre les nœuds
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 1.5; // Facteur d'échelle
  
  Object.entries(positions).forEach(([nodeId, pos]) => {
    // Calculer le vecteur du centre à la position
    const dx = pos.x - centerX;
    const dy = pos.y - centerY;
    
    // Redimensionner en s'éloignant du centre
    positions[nodeId] = {
      x: centerX + dx * scale,
      y: centerY + dy * scale
    };
    
    // Limiter aux dimensions du conteneur
    positions[nodeId].x = Math.max(20, Math.min(width - 20, positions[nodeId].x));
    positions[nodeId].y = Math.max(20, Math.min(height - 20, positions[nodeId].y));
  });
  
  return positions;
}

/**
 * Layout dirigé par forces - simule des forces physiques entre les nœuds
 */
function computeForceDirectedLayout(
  graphData: GraphData,
  width: number,
  height: number
): Record<string, { x: number, y: number }> {
  const positions: Record<string, { x: number, y: number }> = {};
  const nodeCount = graphData.nodes.length;
  
  // Initialiser les positions aléatoirement
  graphData.nodes.forEach(node => {
    positions[node.id] = {
      x: Math.random() * width,
      y: Math.random() * height
    };
  });
  
  // Si le graphe est trop petit, terminer tôt
  if (nodeCount <= 1) return positions;
  
  // Paramètres pour l'algorithme force-directed
  const iterations = 50;
  const k = Math.sqrt(width * height / nodeCount) * 0.8; // Distance idéale entre nœuds
  const gravity = 0.01;
  const friction = 0.9;
  
  // Dictionnaire pour un accès rapide aux nœuds par ID
  const nodeDict: Record<string, GraphNode> = {};
  graphData.nodes.forEach(node => {
    nodeDict[node.id] = {
      ...node,
      x: positions[node.id].x,
      y: positions[node.id].y,
      vx: 0,
      vy: 0
    };
  });
  
  // Créer des liens force-directed
  const links: { source: GraphNode, target: GraphNode }[] = [];
  graphData.edges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    
    if (nodeDict[sourceId] && nodeDict[targetId]) {
      links.push({
        source: nodeDict[sourceId],
        target: nodeDict[targetId]
      });
    }
  });
  
  // Exécuter les itérations de l'algorithme
  for (let i = 0; i < iterations; i++) {
    // Forces répulsives (nœuds se repoussent)
    for (let j = 0; j < nodeCount; j++) {
      for (let k = j + 1; k < nodeCount; k++) {
        const nodeA = graphData.nodes[j];
        const nodeB = graphData.nodes[k];
        
        const posA = nodeDict[nodeA.id];
        const posB = nodeDict[nodeB.id];
        
        if (!posA || !posB) continue;
        
        const dx = posB.x! - posA.x!;
        const dy = posB.y! - posA.y!;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Limiter la distance minimale pour éviter des forces excessives
        const limitedDist = Math.max(dist, 1);
        
        // Force inversement proportionnelle à la distance
        const repulsiveForce = k * k / limitedDist;
        
        const fx = dx / limitedDist * repulsiveForce;
        const fy = dy / limitedDist * repulsiveForce;
        
        posA.vx! -= fx;
        posA.vy! -= fy;
        posB.vx! += fx;
        posB.vy! += fy;
      }
    }
    
    // Forces attractives (liens tirent les nœuds ensemble)
    links.forEach(link => {
      const dx = link.target.x! - link.source.x!;
      const dy = link.target.y! - link.source.y!;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Force proportionnelle à la distance
      const attractiveForce = dist / k * 0.1;
      
      const fx = dx * attractiveForce;
      const fy = dy * attractiveForce;
      
      link.source.vx! += fx;
      link.source.vy! += fy;
      link.target.vx! -= fx;
      link.target.vy! -= fy;
    });
    
    // Appliquer gravité et frictions, puis mettre à jour les positions
    graphData.nodes.forEach(node => {
      const pos = nodeDict[node.id];
      if (!pos) return;
      
      // Gravité vers le centre
      const dx = width / 2 - pos.x!;
      const dy = height / 2 - pos.y!;
      pos.vx! += dx * gravity;
      pos.vy! += dy * gravity;
      
      // Friction
      pos.vx! *= friction;
      pos.vy! *= friction;
      
      // Mettre à jour la position
      pos.x! += pos.vx!;
      pos.y! += pos.vy!;
      
      // Garder les nœuds dans les limites
      pos.x = Math.max(20, Math.min(width - 20, pos.x!));
      pos.y = Math.max(20, Math.min(height - 20, pos.y!));
    });
  }
  
  // Copier les positions finales
  graphData.nodes.forEach(node => {
    const pos = nodeDict[node.id];
    if (pos) {
      positions[node.id] = { x: pos.x!, y: pos.y! };
    }
  });
  
  return positions;
}