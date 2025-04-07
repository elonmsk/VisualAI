import { NextRequest, NextResponse } from 'next/server';

const PUBMED_API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function GET(request: NextRequest) {
  // Récupérer le terme de recherche et les paramètres optionnels de la requête
  const searchParams = request.nextUrl.searchParams;
  const term = searchParams.get('term');
  // Utiliser une valeur très élevée pour récupérer tous les résultats possibles
  const max = 999999; 
  
  if (!term) {
    return NextResponse.json(
      { error: 'Le paramètre "term" est requis' },
      { status: 400 }
    );
  }

  try {
    // Étape 1: Effectuer une recherche ESearch pour obtenir les identifiants PubMed
    const esearchUrl = `${PUBMED_API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=${max}&sort=relevance`;
    
    const esearchResponse = await fetch(esearchUrl);
    if (!esearchResponse.ok) {
      throw new Error(`Erreur lors de la recherche PubMed: ${esearchResponse.status} ${esearchResponse.statusText}`);
    }
    
    const esearchData = await esearchResponse.json();
    
    // Vérifier si nous avons des résultats
    const idList = esearchData?.esearchresult?.idlist || [];
    if (idList.length === 0) {
      return NextResponse.json(
        { 
          pmids: [],
          message: `Aucun article trouvé pour "${term}"` 
        },
        { status: 200 }
      );
    }
    
    console.log(`Trouvé ${idList.length} articles pour "${term}" (total dans la base PubMed: ${esearchData?.esearchresult?.count || 'inconnu'})`);
    
    // Retourner les PMIDs trouvés
    return NextResponse.json({
      pmids: idList,
      count: idList.length,
      term,
      total: esearchData?.esearchresult?.count || idList.length
    });
  } catch (error) {
    console.error('Erreur lors de la recherche PubMed:', error);
    return NextResponse.json(
      { error: `Erreur lors de la recherche PubMed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 