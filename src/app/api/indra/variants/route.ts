import { NextResponse } from 'next/server';

// URL de l'API INDRA pour les variants
const INDRA_VARIANTS_API_URL = 'https://discovery.indra.bio/api/get_variants_for_gene';
const REQUEST_TIMEOUT = 15000; // 15 secondes

interface ErrorResponse {
  error: string;
  details?: string;
}

// Types pour les variants
interface Variant {
  description: string;
  hgvs?: string;
  id?: string;
  source?: string;
}

/**
 * Proxy pour récupérer les variants d'un gène depuis l'API INDRA
 */
export async function POST(request: Request) {
  console.log('🔍 Requête POST reçue sur /api/indra/variants');
  
  try {
    // Récupérer l'ID HGNC de la requête
    const body = await request.json();
    const { hgnc_id } = body;
    
    // Valider que le corps contient un ID HGNC
    if (!hgnc_id) {
      console.log('❌ Erreur: Aucun ID HGNC fourni');
      return NextResponse.json<ErrorResponse>(
        { error: 'Veuillez fournir un ID HGNC valide' }, 
        { status: 400 }
      );
    }
    
    console.log(`ℹ️ Recherche de variants pour le gène HGNC:${hgnc_id}`);
    
    // Créer une promesse pour la requête fetch
    const fetchPromise = fetch(INDRA_VARIANTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        gene: ["HGNC", hgnc_id] 
      }),
    }).then(async response => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur API INDRA (${response.status}): ${errorText}`);
        
        if (response.status === 429) {
          throw new Error('Trop de requêtes envoyées à l\'API INDRA. Veuillez réessayer plus tard.');
        } else if (response.status === 404) {
          throw new Error('Aucun variant trouvé pour cet identifiant HGNC.');
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
        reject(new Error('La requête a expiré après 15 secondes. Le service INDRA peut être lent ou indisponible.'));
      }, REQUEST_TIMEOUT);
    });

    // Retourner la première promesse qui se résout
    const rawData = await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log(`✅ Données brutes récupérées pour HGNC:${hgnc_id}`, rawData);
    
    // Transformer les données brutes en format attendu par le frontend
    const variants = transformVariantsData(rawData);
    
    // Retourner les résultats
    return NextResponse.json({ variants }, {
      headers: {
        'Cache-Control': 'max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la requête des variants:', error);
    
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
      } else if (error.message.includes('Aucun variant trouvé')) {
        statusCode = 404; // Not Found
      }
    }
    
    return NextResponse.json<ErrorResponse>(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * Transforme les données brutes de l'API INDRA en format utilisable par le frontend
 */
function transformVariantsData(rawData: unknown): Variant[] {
  // Si les données sont undefined ou null, retourner un tableau vide
  if (!rawData) return [];
  
  // Si les données ne sont pas un tableau, vérifier si c'est peut-être un objet avec des propriétés
  if (!Array.isArray(rawData)) {
    // Essayer de l'extraire comme un objet
    if (typeof rawData === 'object' && rawData !== null) {
      const dataObj = rawData as Record<string, unknown>;
      if (Array.isArray(dataObj.variants)) return dataObj.variants as Variant[];
      // Essayer d'extraire d'autres propriétés possibles
      for (const key in dataObj) {
        if (Array.isArray(dataObj[key])) return transformVariantsArray(dataObj[key] as Record<string, unknown>[]);
      }
    }
    return [];
  }
  
  return transformVariantsArray(rawData as Record<string, unknown>[]);
}

/**
 * Transforme un tableau de variants au format brut en format attendu par le frontend
 */
function transformVariantsArray(variantsArray: Record<string, unknown>[]): Variant[] {
  try {
    // Mapper chaque élément du tableau pour extraire les informations pertinentes
    return variantsArray.map(item => {
      // Format attendu par l'API : item.data.db_id, item.data.db_ns, item.data.name, item.labels
      if (item && typeof item.data === 'object' && item.data !== null) {
        const data = item.data as Record<string, unknown>;
        return {
          description: typeof data.name === 'string' ? data.name : 'Variant sans nom',
          id: typeof data.db_id === 'string' ? data.db_id : undefined,
          source: typeof data.db_ns === 'string' ? data.db_ns : undefined,
          hgvs: undefined // HGVS n'est pas fourni dans ce format de réponse
        };
      }
      // Si l'élément ne correspond pas à la structure attendue, essayer d'extraire les données disponibles
      return {
        description: typeof item === 'string' ? item : JSON.stringify(item),
        id: typeof item.id === 'string' ? item.id : 
            typeof item.variant_id === 'string' ? item.variant_id : undefined,
        source: typeof item.source === 'string' ? item.source : 
                typeof item.database === 'string' ? item.database : undefined,
        hgvs: typeof item.hgvs === 'string' ? item.hgvs : undefined
      };
    });
  } catch (error) {
    console.error('❌ Erreur lors de la transformation des données de variants:', error);
    return [];
  }
} 