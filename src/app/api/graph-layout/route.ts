import { NextRequest, NextResponse } from 'next/server';
import { computeGraphLayout } from '@/app/indra/utils/graphLayout';

// Délai maximum pour le calcul (en ms)
const MAX_COMPUTATION_TIME = 30000; // 30 secondes

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données JSON du corps de la requête
    const reqData = await request.json();
    const { graphData, layoutName = 'equilibré' } = reqData;
    
    // Vérifier que les données du graphe sont fournies
    if (!graphData || !graphData.nodes || !graphData.edges) {
      return NextResponse.json(
        { error: 'Données de graphe incomplètes ou manquantes' },
        { status: 400 }
      );
    }
    
    // Valider que le layout demandé est valide
    const validLayouts = ['equilibré', 'cose', 'spread', 'compact', 'concentric', 'grid', 'circle', 'breadthfirst'];
    const actualLayoutName = validLayouts.includes(layoutName) ? layoutName : 'equilibré';
    
    console.log(`Calcul du layout '${actualLayoutName}' pour ${graphData.nodes.length} nœuds et ${graphData.edges.length} arêtes`);
    
    try {
      // Créer une promesse qui rejettera après le délai maximum
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Délai de calcul dépassé')), MAX_COMPUTATION_TIME);
      });
      
      // Calculer le layout côté serveur avec un timeout
      const layoutPromise = computeGraphLayout(graphData, actualLayoutName);
      
      // Attendre le résultat ou le timeout, selon ce qui arrive en premier
      const positions = await Promise.race([layoutPromise, timeoutPromise]) as Record<string, { x: number, y: number }>;
      
      // Vérifier que des positions ont été générées
      if (!positions || Object.keys(positions).length === 0) {
        throw new Error('Aucune position générée');
      }
      
      console.log(`Positions calculées pour ${Object.keys(positions).length} nœuds`);
      
      // Retourner les positions calculées
      return NextResponse.json({ 
        positions,
        layoutName: actualLayoutName,
        nodeCount: graphData.nodes.length,
        edgeCount: graphData.edges.length
      });
    } catch (layoutError) {
      // Si c'est une erreur de timeout, retourner un message spécifique
      if (layoutError instanceof Error && layoutError.message === 'Délai de calcul dépassé') {
        console.warn('Délai de calcul dépassé pour le layout. Recommandation: utiliser un layout plus simple comme "grid" ou "circle".');
        
        return NextResponse.json(
          { 
            error: 'Temps de calcul trop long', 
            details: 'Le calcul du layout prend trop de temps. Essayez avec un layout plus simple comme "grid" ou "circle", ou réduisez la taille du graphe.',
            recommendation: 'grid'
          },
          { status: 408 } // Request Timeout
        );
      }
      
      console.error('Erreur lors du calcul du layout:', layoutError);
      return NextResponse.json(
        { error: 'Erreur lors du calcul des positions des nœuds', details: String(layoutError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur globale:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement de la requête', details: String(error) },
      { status: 500 }
    );
  }
} 