import { NextResponse } from 'next/server';
import type { GraphData, GraphNode, GraphEdge } from '@/app/indra/types';

// Type pour la validation des PMIDs
const PMID_REGEX = /^\\d{1,8}$/;

// Configuration
const MAX_PMIDS_PER_REQUEST = Infinity; // Aucune limite de PMIDs
const INDRA_API_URL = 'https://discovery.indra.bio/api/get_stmts_for_pmids';
const REQUEST_TIMEOUT = 60000; // 60 secondes (augmenté pour les grandes requêtes)

// Type pour les réponses d'erreur
interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

/**
 * Vérifie si un PMID est valide
 */
function isValidPMID(pmid: string): boolean {
  return PMID_REGEX.test(pmid.trim());
}

/**
 * Fonction pour récupérer les statements associés à des PMIDs
 * avec timeout et gestion d'erreur améliorée
 */
async function fetchStatementsWithTimeout(pmids: string[]): Promise<any> {
  // Créer une promesse pour la requête fetch
  const fetchPromise = fetch(INDRA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ pmids }),
  }).then(response => {
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Trop de requêtes envoyées à l\\'API INDRA. Veuillez réessayer plus tard.');
      } else if (response.status === 404) {
        throw new Error('Aucune donnée trouvée pour les PMIDs fournis.');
      } else if (response.status >= 500) {
        throw new Error(`Erreur serveur INDRA (${response.status}). Le service peut être temporairement indisponible.`);
      } else {
        throw new Error(`L'API INDRA a répondu avec le code: ${response.status}`);
      }
    }
    return response.json();
  });

  // Créer une promesse pour le timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('La requête a expiré après 30 secondes. Le service INDRA peut être lent ou indisponible.'));
    }, REQUEST_TIMEOUT);
  });

  // Retourner la première promesse qui se résout
  return Promise.race([fetchPromise, timeoutPromise]);
}

/**
 * Convertit les statements INDRA en données de graphe pour la visualisation
 * Et calcule les positions des nœuds pour éviter ce calcul côté client
 */
function convertToGraphData(statementsData: Record<string, any>): GraphData {
  const nodes: Map<string, GraphNode> = new Map();
  const edges: GraphEdge[] = [];
  const nodeTypes = new Set<string>();
  const edgeTypes = new Set<string>();

  // Dimensions par défaut pour le graphe
  const defaultWidth = 800;
  const defaultHeight = 600;

  // Vérifier si les données sont valides
  if (!statementsData || typeof statementsData !== 'object') {
    console.warn('❌ Format de données invalide reçu de l\\'API INDRA');
    return { nodes: [], edges: [], width: defaultWidth, height: defaultHeight };
  }

  console.log('📊 Structure de la réponse INDRA:', JSON.stringify(statementsData).substring(0, 200) + '...');

  // Traiter les différents formats possibles de réponse de l'API INDRA
  try {
    // Si statementsData est directement un tableau de statements
    if (Array.isArray(statementsData)) {
      console.log('ℹ️ Format détecté: tableau direct de statements');
      processStatementArray(statementsData, nodes, edges, 'unknown');
    }
    // Si statementsData est un objet avec des PMIDs comme clés
    else if (typeof statementsData === 'object') {
      console.log('ℹ️ Format détecté: objet avec clés PMID');
      
      // Parcourir les clés de l'objet (PMIDs ou autres identifiants)
      Object.entries(statementsData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Format attendu: { "pmid1": [statements], "pmid2": [statements] }
          processStatementArray(value, nodes, edges, key);
        } else if (value && typeof value === 'object' && 'statements' in value && Array.isArray(value.statements)) {
          // Format alternatif: { "pmid1": { "statements": [statements] } }
          processStatementArray(value.statements, nodes, edges, key);
        } else if (key === 'statements' && Array.isArray(value)) {
          // Format alternatif: { "statements": [statements] }
          processStatementArray(value, nodes, edges, 'main');
        } else {
          console.warn(`❌ Format inattendu pour la clé ${key}: la valeur n'est pas un tableau ou un objet avec statements`);
        }
      });
    }
  } catch (err) {
    console.error('❌ Erreur lors de la conversion en graphe:', err);
  }

  function processStatementArray(statements: any[], nodesMap: Map<string, GraphNode>, edgesArray: GraphEdge[], pmid: string) {
    statements.forEach((stmt, index) => {
      // Vérifier si le statement a une structure valide
      if (!stmt || !stmt.subj || !stmt.obj) {
        console.warn(`❌ Statement invalide trouvé pour identifiant ${pmid} à l'index ${index}`);
        return; // Continuer avec le prochain statement
      }

      try {
        // Identifier les entités (nœuds)
        const subjId = `${stmt.subj.name}-${stmt.subj.db_refs?.HGNC || 'unknown'}`;
        const objId = `${stmt.obj.name}-${stmt.obj.db_refs?.HGNC || 'unknown'}`;
        
        // Déterminer le type en fonction des identifiants disponibles
        const getEntityType = (dbRefs: any) => {
          if (!dbRefs) return 'protein';
          
          // Si HGNC est présent, c'est probablement un gène
          if (dbRefs.HGNC) return 'gene';
          
          // Autres identifiants pour déduire le type
          if (dbRefs.CHEBI || dbRefs.PUBCHEM) return 'drug';
          if (dbRefs.MESH && dbRefs.MESH.startsWith('D')) return 'disease';
          
          // Par défaut, considérer comme protéine
          return 'protein';
        };
        
        // Créer ou mettre à jour le nœud sujet
        if (!nodesMap.has(subjId)) {
          nodesMap.set(subjId, {
            id: subjId,
            name: stmt.subj.name,
            type: getEntityType(stmt.subj.db_refs),
            references: stmt.subj.db_refs,
            count: 1,
            pmids: [pmid]
          });
        } else {
          const node = nodesMap.get(subjId)!;
          node.count = (node.count || 0) + 1;
          if (pmid !== 'unknown' && !node.pmids?.includes(pmid)) {
            node.pmids = [...(node.pmids || []), pmid];
          }
        }
        
        // Créer ou mettre à jour le nœud objet
        if (!nodesMap.has(objId)) {
          nodesMap.set(objId, {
            id: objId,
            name: stmt.obj.name,
            type: getEntityType(stmt.obj.db_refs),
            references: stmt.obj.db_refs,
            count: 1,
            pmids: [pmid]
          });
        } else {
          const node = nodesMap.get(objId)!;
          node.count = (node.count || 0) + 1;
          if (pmid !== 'unknown' && !node.pmids?.includes(pmid)) {
            node.pmids = [...(node.pmids || []), pmid];
          }
        }
        
        // Collecter les PMIDs depuis les evidence
        const evidencePmids = stmt.evidence?.map((ev: any) => ev.pmid).filter(Boolean) || [];
        const allPmids = new Set<string>();
        
        // Ajouter le PMID principal s'il est valide
        if (pmid !== 'unknown') {
          allPmids.add(pmid);
        }
        
        // Ajouter les PMIDs des evidence
        evidencePmids.forEach((p: string) => allPmids.add(p));
        
        // Extraire l'evidence principale
        const evidence = stmt.evidence?.[0]?.text || '';
        
        // Créer l'arête
        const edgeId = `${subjId}-${stmt.type}-${objId}-${index}`;
        
        edgesArray.push({
          id: edgeId,
          source: subjId,
          target: objId,
          label: stmt.type.replace(/_/g, ' '),
          type: stmt.type,
          evidence: evidence,
          pmids: Array.from(allPmids),
          confidence: stmt.belief || 0.5
        });
        
        edgeTypes.add(stmt.type);
      } catch (err) {
        console.error(`❌ Erreur lors du traitement du statement à l'index ${index}:`, err);
      }
    });
  }
  
  // Convertir la Map en tableau pour le résultat final
  const nodeArray = Array.from(nodes.values());
  
  console.log(`✅ Graphe créé avec ${nodeArray.length} nœuds et ${edges.length} arêtes`);
  
  if (nodeArray.length === 0 || edges.length === 0) {
    console.warn('⚠️ Graphe vide généré - vérifier la structure des données d\\'entrée');
  }

  return {
    nodes: nodeArray,
    edges,
    width: defaultWidth,
    height: defaultHeight
  };
}

/**
 * Génère un layout organique simple pour placer les nœuds
 * basé sur l'algorithme force-directed
 */
function generateOrganicLayout(
  nodes: GraphNode[], 
  edges: GraphEdge[], 
  width: number,
  height: number
) {
  // Position initiale aléatoire pour tous les nœuds
  nodes.forEach(node => {
    node.x = Math.random() * width;
    node.y = Math.random() * height;
    node.vx = 0;
    node.vy = 0;
  });
  
  // Créer un dictionnaire pour accéder rapidement aux nœuds par ID
  const nodeDict: Record<string, GraphNode> = {};
  nodes.forEach(node => {
    nodeDict[node.id] = node;
  });
  
  // Convertir les arêtes en liens source/target compatibles avec l'algorithme de force
  type NodeLink = { source: GraphNode, target: GraphNode };
  const links: NodeLink[] = [];
  
  edges.forEach(edge => {
    const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
    const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
    
    const sourceNode = nodeDict[sourceId];
    const targetNode = nodeDict[targetId];
    
    if (sourceNode && targetNode) {
      links.push({
        source: sourceNode,
        target: targetNode
      });
    }
  });
  
  // Appliquer l'algorithme force-directed simplifié
  // Paramètres
  const iterations = 50;
  const k = Math.sqrt(width * height / nodes.length) * 0.8; // Distance idéale entre nœuds
  const gravity = 0.01;
  const friction = 0.9;
  
  for (let i = 0; i < iterations; i++) {
    // Forces répulsives (nœuds se repoussent)
    for (let j = 0; j < nodes.length; j++) {
      for (let k = j + 1; k < nodes.length; k++) {
        const nodeA = nodes[j];
        const nodeB = nodes[k];
        
        const dx = nodeB.x! - nodeA.x!;
        const dy = nodeB.y! - nodeA.y!;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Force inversement proportionnelle au carré de la distance
        const force = k * k / dist;
        
        const fx = dx / dist * force;
        const fy = dy / dist * force;
        
        nodeA.vx! -= fx;
        nodeA.vy! -= fy;
        nodeB.vx! += fx;
        nodeB.vy! += fy;
      }
    }
    
    // Forces attractives (liens tirent les nœuds ensemble)
    links.forEach(link => {
      const dx = link.target.x! - link.source.x!;
      const dy = link.target.y! - link.source.y!;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Force proportionnelle à la distance
      const force = dist / k * 0.1;
      
      const fx = dx * force;
      const fy = dy * force;
      
      link.source.vx! += fx;
      link.source.vy! += fy;
      link.target.vx! -= fx;
      link.target.vy! -= fy;
    });
    
    // Force de centrage (gravité vers le centre)
    nodes.forEach(node => {
      const dx = width / 2 - node.x!;
      const dy = height / 2 - node.y!;
      
      node.vx! += dx * gravity;
      node.vy! += dy * gravity;
      
      // Limiter la vitesse (friction)
      node.vx! *= friction;
      node.vy! *= friction;
      
      // Mettre à jour la position
      node.x! += node.vx!;
      node.y! += node.vy!;
      
      // Limiter aux bords
      node.x = Math.max(50, Math.min(width - 50, node.x!));
      node.y = Math.max(50, Math.min(height - 50, node.y!));
    });
  }
  
  // Mise à l'échelle finale pour remplir l'espace disponible
  optimizeLayout(nodes, width, height, 50);
  
  // Copier les coordonnées calculées dans l'attribut position
  nodes.forEach(node => {
    node.position = { x: node.x!, y: node.y! };
  });
}

/**
 * Optimise le layout pour éviter les superpositions et étaler les nœuds
 */
function optimizeLayout(
  nodes: GraphNode[], 
  width: number, 
  height: number, 
  minDistance: number
) {
  if (nodes.length === 0) return;
  
  // Trouver les limites actuelles
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  
  nodes.forEach(node => {
    minX = Math.min(minX, node.x!);
    maxX = Math.max(maxX, node.x!);
    minY = Math.min(minY, node.y!);
    maxY = Math.max(maxY, node.y!);
  });
  
  // Calculer les facteurs d'échelle pour remplir l'espace disponible
  const currentWidth = maxX - minX || 1;
  const currentHeight = maxY - minY || 1;
  
  const paddingX = width * 0.1;
  const paddingY = height * 0.1;
  
  const scaleX = (width - paddingX * 2) / currentWidth;
  const scaleY = (height - paddingY * 2) / currentHeight;
  
  const scale = Math.min(scaleX, scaleY);
  
  // Appliquer la mise à l'échelle et le centrage
  const centerX = width / 2;
  const centerY = height / 2;
  
  nodes.forEach(node => {
    // Normaliser par rapport au centre actuel
    const normalizedX = node.x! - (minX + currentWidth / 2);
    const normalizedY = node.y! - (minY + currentHeight / 2);
    
    // Appliquer l'échelle et centrer
    node.x = centerX + normalizedX * scale;
    node.y = centerY + normalizedY * scale;
  });
}

export async function POST(request: Request) {
  try {
    // Récupérer et valider les PMIDs dans le corps de la requête
    const reqData = await request.json();
    const rawPmids = reqData.pmids || [];
    
    // Vérifier que des PMIDs ont été fournis
    if (!Array.isArray(rawPmids) || rawPmids.length === 0) {
      const errorResponse: ErrorResponse = {
        error: 'Aucun PMID fourni',
        details: 'Veuillez fournir un tableau de PMIDs valides',
        code: 'NO_PMIDS'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Limiter le nombre de PMIDs pour éviter des requêtes trop lourdes
    const validPmids = rawPmids
      .slice(0, MAX_PMIDS_PER_REQUEST)
      .filter(id => isValidPMID(id));
    
    // Si aucun PMID valide, retourner une erreur
    if (validPmids.length === 0) {
      const errorResponse: ErrorResponse = {
        error: 'Aucun PMID valide parmi ceux fournis',
        details: 'Les PMIDs doivent être des chaînes numériques',
        code: 'INVALID_PMIDS'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    console.log(`Récupération des données INDRA pour ${validPmids.length} PMIDs.`);
    
    try {
      // Appeler l'API INDRA avec les PMIDs validés et filtrage supplémentaire
      const statementsData = await fetchStatementsWithTimeout(validPmids);
      
      // Si aucun résultat, retourner un message approprié
      if (!statementsData || Object.keys(statementsData).length === 0) {
        const errorResponse: ErrorResponse = {
          error: 'Aucune relation trouvée',
          details: 'Aucune relation biologique n\\'a été trouvée pour ces articles',
          code: 'NO_DATA'
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
      
      console.log(`Données INDRA reçues, traitement en cours...`);
      
      // Convertir les statements en données de graphe pour visualisation
      const graphData = convertToGraphData(statementsData);
      
      // Si le graphe est vide, retourner un message approprié
      if (graphData.nodes.length === 0 || graphData.edges.length === 0) {
        const errorResponse: ErrorResponse = {
          error: 'Graphe vide',
          details: 'Le traitement des données n\\'a pas généré de graphe visualisable',
          code: 'EMPTY_GRAPH'
        };
        return NextResponse.json(errorResponse, { status: 404 });
      }
      
      // Calculer le layout initial du graphe côté serveur
      generateOrganicLayout(graphData.nodes, graphData.edges, graphData.width || 800, graphData.height || 600);
      
      // Retourner les données sous une structure unifiée
      return NextResponse.json({
        statements: statementsData,
        graph: graphData
      });
      
    } catch (indraError) {
      console.error('Erreur lors de l\\'appel à l\\'API INDRA:', indraError);
      
      const errorResponse: ErrorResponse = {
        error: 'Erreur lors de la récupération des données INDRA',
        details: indraError instanceof Error ? indraError.message : String(indraError),
        code: 'INDRA_API_ERROR'
      };
      
      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error) {
    console.error('Erreur globale:', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : String(error),
      code: 'SERVER_ERROR'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}