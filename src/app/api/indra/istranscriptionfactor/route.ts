import { NextResponse } from 'next/server';

// Vérifier si un gène est un facteur de transcription
export async function POST(request: Request) {
  try {
    // Récupérer le corps de la requête
    const body = await request.json();
    const genes = body.genes;
    
    if (!genes || !Array.isArray(genes) || genes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Format de requête invalide. Attendu: { genes: [nom_gene1, nom_gene2, ...] }' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Vérification si les gènes sont des facteurs de transcription:`, genes);
    
    // Appel à l'API discovery.indra.bio
    const response = await fetch('https://discovery.indra.bio/api/is_transcription_factor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        genes: genes
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API INDRA a retourné une erreur (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Résultats de la vérification des facteurs de transcription:`, data);
    
    // Retourner les données
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Erreur lors de la vérification des facteurs de transcription:', error);
    return new Response(
      JSON.stringify({ error: `${(error as Error).message}` }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 