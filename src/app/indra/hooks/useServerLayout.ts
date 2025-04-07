'use client';

import { useState } from 'react';
import { GraphData } from '../types';

// Cette fonction fait appel à l'API du serveur pour calculer les positions des nœuds
export async function calculateNodePositions(
  graphData: GraphData, 
  layoutType: 'equilibré' | 'aéré' | 'compact' | 'concentric' | 'ultra-dispersé' = 'equilibré'
): Promise<Record<string, { x: number, y: number }>> {
  // Mapper les types de layout utilisateur vers des algorithmes spécifiques
  const layoutMapping: Record<string, string> = {
    'equilibré': 'cose',      // Equilibré: utilise l'algorithme de CoSE (Compound Spring Embedder)
    'aéré': 'spread',         // Aéré: maximise l'espace entre les nœuds
    'compact': 'breadthfirst', // Compact: organise les nœuds en arbre
    'concentric': 'concentric', // Concentrique: organise les nœuds en cercles concentriques
    'ultra-dispersé': 'cose'   // Ultra-dispersé: comme CoSE mais avec plus d'espace
  };
  
  // Paramètres spécifiques pour le layout ultra-dispersé
  let layoutParams = {};
  if (layoutType === 'ultra-dispersé') {
    layoutParams = {
      nodeSpacing: 100,      // Augmente l'espace entre les nœuds
      idealEdgeLength: 200,  // Augmente la longueur idéale des arêtes
      springStrength: 400    // Augmente la force des ressorts
    };
  }
  
  // Si le graphe est trop petit, appliquer un layout simple localement
  if (graphData.nodes.length <= 5) {
    console.log('Petit graphe détecté, calcul local du layout...');
    return calculateSimpleLayout(graphData);
  }
  
  try {
    const response = await fetch('/api/graph-layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        graphData,
        layoutName: layoutMapping[layoutType] || 'cose',
        params: layoutParams
      }),
    });
    
    if (!response.ok) {
      // Si le serveur ne peut pas calculer le layout, essayer une solution de secours locale
      console.warn(`Erreur du serveur (${response.status}), utilisation d'un layout de secours`);
      return calculateSimpleLayout(graphData);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.warn('Erreur retournée par le serveur:', data.error);
      return calculateSimpleLayout(graphData);
    }
    
    return data.positions || {};
  } catch (error) {
    console.error('Erreur lors du calcul des positions:', error);
    // En cas d'erreur, calculer un layout simple localement
    return calculateSimpleLayout(graphData);
  }
}

// Fonction de secours qui calcule un layout simple (circulaire) localement
function calculateSimpleLayout(graphData: GraphData): Record<string, { x: number, y: number }> {
  const positions: Record<string, { x: number, y: number }> = {};
  const nodeCount = graphData.nodes.length;
  
  if (nodeCount === 0) return positions;
  
  // Paramètres pour le cercle
  const width = graphData.width || 800;
  const height = graphData.height || 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.4; // 80% du plus petit côté divisé par 2
  
  // Pour un seul nœud, placer au centre
  if (nodeCount === 1) {
    positions[graphData.nodes[0].id] = { x: centerX, y: centerY };
    return positions;
  }
  
  // Placer les nœuds en cercle
  graphData.nodes.forEach((node, index) => {
    const angle = (index / nodeCount) * 2 * Math.PI; // Angle en radians
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    positions[node.id] = { x, y };
  });
  
  return positions;
}