import { NextResponse } from 'next/server';

// Récupérer les pathways pour un gène
export async function POST(request: Request) {
  try {
    // Récupérer le corps de la requête
    const body = await request.json();
    const gene = body.gene;
    
    if (!gene || !Array.isArray(gene) || gene.length !== 2) {
      return new Response(
        JSON.stringify({ error: 'Format de requête invalide. Attendu: { gene: [type, id] }' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Récupération des pathways pour le gène ${gene[0]}:${gene[1]}`);
    
    // Appel à l'API discovery.indra.bio
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
    
    // Retourner les données
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des pathways:', error);
    return new Response(
      JSON.stringify({ error: `${(error as Error).message}` }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 