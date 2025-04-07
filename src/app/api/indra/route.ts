import { NextResponse } from 'next/server';
import type { GraphData, GraphNode, GraphEdge } from '@/app/indra/types';

// Type pour la validation des PMIDs
const PMID_REGEX = /^\d{1,8}$/;

// Configuration
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
async function fetchStatementsWithTimeout(pmids: string[]): Promise<Record<string, unknown>> {
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
        throw new Error('Trop de requêtes envoyées à l\'API INDRA. Veuillez réessayer plus tard.');
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
function convertToGraphData(statementsData: Record<string, unknown>): GraphData {
  const nodes: Map<string, GraphNode> = new Map();
  const edges: GraphEdge[] = [];
  const nodeTypes = new Set<string>();
  const edgeTypes = new Set<string>();

  // Dimensions par défaut pour le graphe
  const defaultWidth = 800;
  const defaultHeight = 600;

  // Vérifier si les données sont valides
  if (!statementsData || typeof statementsData !== 'object') {
    console.warn('❌ Format de données invalide reçu de l\'API INDRA');
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

  function processStatementArray(statements: unknown[], nodesMap: Map<string, GraphNode>, edgesArray: GraphEdge[], pmid: string) {
    statements.forEach((stmt, index) => {
      // Vérification préalable que stmt est un objet
      if (!stmt || typeof stmt !== 'object' || stmt === null) {
        console.warn(`❌ Statement invalide trouvé pour identifiant ${pmid} à l'index ${index}: n'est pas un objet`);
        return;
      }

      const statement = stmt as Record<string, unknown>;
      
      // Vérifier si le statement a une structure valide
      if (!statement.subj || !statement.obj) {
        console.warn(`❌ Statement invalide trouvé pour identifiant ${pmid} à l'index ${index}: manque subj ou obj`);
        return; // Continuer avec le prochain statement
      }

      try {
        // Identifier les entités (nœuds)
        const subjObj = statement.subj as Record<string, unknown>;
        const objObj = statement.obj as Record<string, unknown>;
        
        // Accéder de manière sécurisée aux db_refs
        const subjDbRefs = (typeof subjObj.db_refs === 'object' && subjObj.db_refs) 
          ? subjObj.db_refs as Record<string, unknown> 
          : {};
          
        const objDbRefs = (typeof objObj.db_refs === 'object' && objObj.db_refs) 
          ? objObj.db_refs as Record<string, unknown> 
          : {};
        
        const subjId = `${subjObj.name || 'unnamed'}-${subjDbRefs.HGNC || 'unknown'}`;
        const objId = `${objObj.name || 'unnamed'}-${objDbRefs.HGNC || 'unknown'}`;
        
        // Déterminer le type en fonction des identifiants disponibles
        const getEntityType = (dbRefs: Record<string, unknown>) => {
          if (!dbRefs) return 'protein';
          
          // Si HGNC est présent, c'est probablement un gène
          if (dbRefs.HGNC) return 'gene';
          
          // Autres identifiants pour déduire le type
          if (dbRefs.CHEBI || dbRefs.PUBCHEM) return 'drug';
          if (dbRefs.MESH && typeof dbRefs.MESH === 'string' && dbRefs.MESH.startsWith('D')) return 'disease';
          
          // Par défaut, considérer comme protéine
          return 'protein';
        };
        
        // Créer ou mettre à jour le nœud sujet
        if (!nodesMap.has(subjId)) {
          nodesMap.set(subjId, {
            id: subjId,
            name: String(subjObj.name || subjId),
            type: getEntityType(subjDbRefs),
            // Convertir les références en Record<string, string> pour correspondre à GraphNode
            references: subjDbRefs as unknown as Record<string, string>,
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
            name: String(objObj.name || objId),
            type: getEntityType(objDbRefs),
            // Convertir les références en Record<string, string> pour correspondre à GraphNode
            references: objDbRefs as unknown as Record<string, string>,
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
        const evidence = Array.isArray(statement.evidence) ? statement.evidence : [];
        const evidencePmids = evidence.map((ev: unknown) => {
          if (ev && typeof ev === 'object') {
            const evObj = ev as Record<string, unknown>;
            return typeof evObj.pmid === 'string' ? evObj.pmid : '';
          }
          return '';
        }).filter(Boolean);
        
        const allPmids = new Set<string>();
        
        // Ajouter le PMID principal s'il est valide
        if (pmid !== 'unknown') {
          allPmids.add(pmid);
        }
        
        // Ajouter les PMIDs des evidence
        evidencePmids.forEach((p: string) => allPmids.add(p));
        
        // Extraire l'evidence principale
        let evidenceText = '';
        if (evidence.length > 0 && typeof evidence[0] === 'object') {
          const firstEvidence = evidence[0] as Record<string, unknown>;
          evidenceText = typeof firstEvidence.text === 'string' ? firstEvidence.text : '';
        }
        
        // Créer l'arête
        const edgeId = `${subjId}-${statement.type || 'unknown'}-${objId}-${index}`;
        
        edgesArray.push({
          id: edgeId,
          source: subjId,
          target: objId,
          label: String(statement.type || 'unknown'),
          type: String(statement.type || 'unknown'),
          evidence: evidenceText,
          pmid: pmid !== 'unknown' ? pmid : evidencePmids[0] || '', // Utiliser le premier PMID d'evidence si pas de PMID principal
          pmids: Array.from(allPmids), // Tous les PMIDs associés
          confidence: typeof statement.belief === 'number' ? statement.belief : 0.5
        });
        
        // Collecter les types
        nodeTypes.add(getEntityType(subjDbRefs));
        nodeTypes.add(getEntityType(objDbRefs));
        edgeTypes.add(String(statement.type || 'unknown'));
      } catch (err) {
        console.error(`❌ Erreur lors du traitement du statement pour identifiant ${pmid} à l'index ${index}:`, err);
      }
    });
  }

  // Calculer les positions des nœuds en cercle (comme fait côté client actuellement)
  const nodeArray = Array.from(nodes.values());
  const nodeCount = nodeArray.length;
  
  if (nodeCount > 0) {
    // Layout organique - méthode avancée pour distribuer les nœuds
    generateOrganicLayout(nodeArray, edges, defaultWidth, defaultHeight);
  }

  console.log(`✅ Conversion en graphe réussie: ${nodes.size} nœuds et ${edges.length} relations`);
  
  return {
    nodes: nodeArray,
    edges: edges,
    width: defaultWidth,
    height: defaultHeight
  };
}

/**
 * Génère un layout organique pour les nœuds du graphe en utilisant une simulation de forces
 */
function generateOrganicLayout(
  nodes: GraphNode[], 
  edges: GraphEdge[], 
  width: number,
  height: number
) {
  // Adapter les constantes en fonction du nombre de nœuds
  const nodeCount = nodes.length;
  
  console.log(`🔄 Génération du layout organique pour ${nodeCount} nœuds et ${edges.length} relations`);
  
  // Constantes pour la simulation ajustées selon la taille du graphe
  const REPULSION = Math.max(300, 500 - nodeCount * 1.5);  // Diminue avec le nombre de nœuds
  const ATTRACTION = Math.min(0.6, 0.4 + nodeCount * 0.001); // Augmente légèrement avec le nombre de nœuds
  const GRAVITY = Math.min(0.2, 0.1 + nodeCount * 0.0005);  // Augmente légèrement avec le nombre de nœuds
  const DAMPING = 0.95;
  const MIN_DISTANCE = Math.max(50, 100 - nodeCount * 0.2); // Diminue avec le nombre de nœuds
  const ITERATIONS = Math.min(350, 200 + nodeCount); // Plus de nœuds = plus d'itérations
  
  console.log(`⚙️ Paramètres: REPULSION=${REPULSION.toFixed(1)}, ATTRACTION=${ATTRACTION.toFixed(3)}, GRAVITY=${GRAVITY.toFixed(3)}, ITERATIONS=${ITERATIONS}`);

  // Initialiser les positions et vitesses des nœuds aléatoirement
  nodes.forEach(node => {
    // Position initiale aléatoire mais dans un cercle au centre
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * Math.min(width, height) * 0.3;
    node.position = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
    
    // Vitesse initiale à zéro
    node.vx = 0;
    node.vy = 0;
  });

  // Structure pour conserver les liens entre nœuds
  type NodeLink = { source: GraphNode, target: GraphNode };
  const links: NodeLink[] = [];
  
  // Convertir les arêtes en liens entre nœuds
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === (typeof edge.source === 'string' ? edge.source : edge.source.id));
    const targetNode = nodes.find(n => n.id === (typeof edge.target === 'string' ? edge.target : edge.target.id));
    
    if (sourceNode && targetNode) {
      links.push({ source: sourceNode, target: targetNode });
    }
  });

  // Exécuter la simulation
  for (let i = 0; i < ITERATIONS; i++) {
    // Force de répulsion (les nœuds se repoussent)
    for (let j = 0; j < nodes.length; j++) {
      for (let k = j + 1; k < nodes.length; k++) {
        const nodeA = nodes[j];
        const nodeB = nodes[k];
        
        if (!nodeA.position || !nodeB.position) continue;
        
        const dx = nodeB.position.x - nodeA.position.x;
        const dy = nodeB.position.y - nodeA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Éviter les divisions par zéro
        if (distance < 0.1) continue;
        
        // Force de répulsion inversement proportionnelle au carré de la distance
        const force = REPULSION / (distance * distance);
        
        // Calculer les composantes de la force
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        // Appliquer la force avec des directions opposées
        nodeA.vx = ((nodeA.vx !== undefined) ? nodeA.vx : 0) - fx;
        nodeA.vy = ((nodeA.vy !== undefined) ? nodeA.vy : 0) - fy;
        nodeB.vx = ((nodeB.vx !== undefined) ? nodeB.vx : 0) + fx;
        nodeB.vy = ((nodeB.vy !== undefined) ? nodeB.vy : 0) + fy;
      }
    }
    
    // Force d'attraction (les nœuds connectés s'attirent)
    links.forEach(link => {
      if (!link.source.position || !link.target.position) return;
      
      const dx = link.target.position.x - link.source.position.x;
      const dy = link.target.position.y - link.source.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Force proportionnelle à la distance
      const force = distance * ATTRACTION;
      
      // Calculer les composantes de la force
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      
      // Appliquer la force
      link.source.vx = ((link.source.vx !== undefined) ? link.source.vx : 0) + fx;
      link.source.vy = ((link.source.vy !== undefined) ? link.source.vy : 0) + fy;
      link.target.vx = ((link.target.vx !== undefined) ? link.target.vx : 0) - fx;
      link.target.vy = ((link.target.vy !== undefined) ? link.target.vy : 0) - fy;
    });
    
    // Force de gravité (les nœuds sont attirés vers le centre)
    nodes.forEach(node => {
      if (!node.position) return;
      
      // Force proportionnelle à la distance au centre
      node.vx = ((node.vx !== undefined) ? node.vx : 0) - node.position.x * GRAVITY;
      node.vy = ((node.vy !== undefined) ? node.vy : 0) - node.position.y * GRAVITY;
    });
    
    // Mise à jour des positions avec amortissement
    nodes.forEach(node => {
      if (!node.position) return;
      
      // Amortir la vitesse
      node.vx = ((node.vx !== undefined) ? node.vx : 0) * DAMPING;
      node.vy = ((node.vy !== undefined) ? node.vy : 0) * DAMPING;
      
      // Mettre à jour la position
      node.position.x += (node.vx || 0);
      node.position.y += (node.vy || 0);
    });
  }
  
  // Ajuster les positions pour éviter les superpositions et centrer le graphe
  optimizeLayout(nodes, width, height, MIN_DISTANCE);

  console.log(`✅ Layout organique terminé après ${ITERATIONS} itérations`);
}

/**
 * Optimise le layout en évitant les superpositions et en centrant le graphe
 */
function optimizeLayout(
  nodes: GraphNode[], 
  width: number, 
  height: number, 
  minDistance: number // Utilisé pour l'espacement minimum entre les nœuds
) {
  // Trouver les limites actuelles du graphe
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  nodes.forEach(node => {
    if (!node.position) return;
    
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y);
  });
  
  // Calculer les dimensions actuelles
  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;
  
  // Éviter les divisions par zéro
  if (graphWidth === 0 || graphHeight === 0) return;
  
  // Facteur d'échelle pour ajuster à la taille souhaitée (en laissant une marge)
  const scale = Math.min(
    (width * 0.8) / graphWidth,
    (height * 0.8) / graphHeight
  );
  
  // Centre du graphe original
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  // Ajuster les positions pour centrer et mettre à l'échelle
  nodes.forEach(node => {
    if (!node.position) return;
    
    // Centrer et mettre à l'échelle
    node.position.x = (node.position.x - centerX) * scale;
    node.position.y = (node.position.y - centerY) * scale;
  });
  
  // Appliquer une répulsion minimale pour respecter la distance minimale
  if (minDistance > 0) {
    // Quelques itérations pour pousser les nœuds qui seraient trop proches
    for (let iter = 0; iter < 5; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          
          if (!nodeA.position || !nodeB.position) continue;
          
          const dx = nodeB.position.x - nodeA.position.x;
          const dy = nodeB.position.y - nodeA.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Si les nœuds sont trop proches, les pousser
          if (distance < minDistance) {
            const force = (minDistance - distance) / minDistance;
            const moveX = (dx / distance) * force * minDistance * 0.5;
            const moveY = (dy / distance) * force * minDistance * 0.5;
            
            if (nodeA.position && nodeB.position) {
              nodeA.position.x -= moveX;
              nodeA.position.y -= moveY;
              nodeB.position.x += moveX;
              nodeB.position.y += moveY;
            }
          }
        }
      }
    }
  }
}

/**
 * Route API pour récupérer divers types de données INDRA
 */
export async function POST(request: Request) {
  console.log('🔍 Requête POST reçue sur /api/indra');
  
  try {
    // Récupérer le corps de la requête
    const body = await request.json();
    
    // Déterminer quel type de requête est envoyé
    // 1. Requête de variants pour un gène
    if (body.hgnc_id) {
      return await fetchVariantsForGene(body.hgnc_id);
    }
    
    // 2. Requête de pathways pour un gène
    if (body.gene && Array.isArray(body.gene) && body.gene.length === 2) {
      return await fetchPathwaysForGene(body.gene);
    }
    
    // 3. Requête de statements INDRA à partir de PMIDs (comportement par défaut)
    const { pmids } = body;
    
    // Valider que le corps contient des PMIDs
    if (!pmids) {
      console.log('❌ Erreur: Aucun PMID fourni');
      return NextResponse.json<ErrorResponse>(
        { error: 'Veuillez fournir un tableau de PMIDs', code: 'MISSING_PMIDS' }, 
        { status: 400 }
      );
    }
    
    // Valider que pmids est un tableau
    if (!Array.isArray(pmids)) {
      console.log('❌ Erreur: Les PMIDs ne sont pas dans un tableau');
      return NextResponse.json<ErrorResponse>(
        { error: 'Les PMIDs doivent être fournis sous forme de tableau', code: 'INVALID_FORMAT' }, 
        { status: 400 }
      );
    }
    
    // Valider que le tableau n'est pas vide
    if (pmids.length === 0) {
      console.log('❌ Erreur: Tableau de PMIDs vide');
      return NextResponse.json<ErrorResponse>(
        { error: 'Veuillez fournir au moins un PMID valide', code: 'EMPTY_PMIDS' }, 
        { status: 400 }
      );
    }
    
    // Valider le format de chaque PMID
    const invalidPmids = pmids.filter(pmid => !isValidPMID(pmid));
    if (invalidPmids.length > 0) {
      console.log(`❌ Erreur: PMIDs invalides détectés: ${invalidPmids.join(', ')}`);
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Certains PMIDs sont dans un format invalide', 
          details: `PMIDs invalides: ${invalidPmids.join(', ')}`,
          code: 'INVALID_PMID_FORMAT'
        }, 
        { status: 400 }
      );
    }
    
    // Log des PMIDs valides
    console.log(`ℹ️ Recherche de statements pour ${pmids.length} PMIDs: ${pmids.join(', ')}`);
    
    // Appel à l'API INDRA avec timeout
    const startTime = Date.now();
    let data;
    try {
      data = await fetchStatementsWithTimeout(pmids);
      const duration = Date.now() - startTime;
      
      // Vérification des résultats
      if (!data || typeof data !== 'object') {
        console.error('❌ Format de réponse inattendu de l\'API INDRA');
        return NextResponse.json<ErrorResponse>(
          { error: 'Format de réponse inattendu de l\'API INDRA', code: 'INVALID_RESPONSE' },
          { status: 500 }
        );
      }
      
      // Essayer de compter les statements, mais gérer les erreurs potentielles
      let totalStatements = 0;
      try {
        totalStatements = Object.values(data as Record<string, unknown>).reduce((count: number, statements) => {
          return count + (Array.isArray(statements) ? statements.length : 0);
        }, 0);
      } catch (countError) {
        console.warn('⚠️ Impossible de compter les statements:', countError);
      }
      
      console.log(`✅ Réponse reçue de l'API INDRA en ${duration}ms avec environ ${totalStatements} statements`);
    } catch (fetchError) {
      console.error('❌ Erreur lors de la récupération des données INDRA:', fetchError);
      throw fetchError; // Propagation de l'erreur pour être gérée par le bloc catch global
    }
    
    // Convertir les données en format de graphe
    let graphData;
    try {
      graphData = convertToGraphData(data);
      console.log(`🔄 Conversion en graphe terminée: ${graphData.nodes.length} nœuds et ${graphData.edges.length} relations`);
    } catch (graphError) {
      console.error('❌ Erreur lors de la conversion en graphe:', graphError);
      // Continuer avec un graphe vide
      graphData = { nodes: [], edges: [], width: 800, height: 600 };
    }
    
    // Retourner les résultats avec les données originales et le graphe
    return NextResponse.json({
      statements: data,
      graph: graphData
    }, {
      headers: {
        'Cache-Control': 'max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la requête à l\'API INDRA:', error);
    
    // Déterminer le message d'erreur approprié
    let errorMessage = 'Une erreur est survenue lors de la communication avec l\'API INDRA';
    let statusCode = 500;
    
    if (error instanceof Error) {
      // Message d'erreur personnalisé basé sur l'erreur
      errorMessage = error.message;
      
      // Adapter le code d'état selon l'erreur
      if (error.message.includes('expiré')) {
        statusCode = 504; // Gateway Timeout
      } else if (error.message.includes('Trop de requêtes')) {
        statusCode = 429; // Too Many Requests
      } else if (error.message.includes('Aucune donnée trouvée')) {
        statusCode = 404; // Not Found
      }
    }
    
    return NextResponse.json<ErrorResponse>(
      { error: errorMessage, code: 'API_ERROR' },
      { status: statusCode }
    );
  }
}

// Récupérer les variants pour un gène
async function fetchVariantsForGene(hgncId: string) {
  try {
    console.log(`Récupération des variants pour le gène HGNC:${hgncId}`);
    
    const response = await fetch(`https://indra.biopragmatics.com/api/variants_by_gene?identifier=HGNC:${hgncId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API INDRA a retourné une erreur (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des variants:', error);
    return new Response(`Erreur: ${(error as Error).message}`, { status: 500 });
  }
}

// Récupérer les pathways pour un gène
async function fetchPathwaysForGene(gene: [string, string]) {
  try {
    console.log(`Récupération des pathways pour le gène ${gene[0]}:${gene[1]}`);
    
    // Correction de l'URL de l'API pour discovery.indra.bio
    const response = await fetch('https://discovery.indra.bio/api/get_pathways_for_gene', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        gene: gene
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API INDRA a retourné une erreur (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Pathways récupérés pour ${gene[0]}:${gene[1]}:`, data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pathways:', error);
    return new Response(`Erreur: ${(error as Error).message}`, { status: 500 });
  }
} 