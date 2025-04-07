'use client';

import { GraphNode, GraphEdge } from '../types';

interface EdgeDetailsProps {
  edge: GraphEdge | null;
  onClose: () => void;
}

export default function EdgeDetails({ edge, onClose }: EdgeDetailsProps) {
  if (!edge) return null;

  // Convertir source/target en objets si ce sont des chaînes de caractères
  const sourceNode = typeof edge.source === 'string'
    ? { id: edge.source, name: edge.source, type: 'unknown' } as GraphNode
    : edge.source;
  
  const targetNode = typeof edge.target === 'string'
    ? { id: edge.target, name: edge.target, type: 'unknown' } as GraphNode
    : edge.target;

  // Couleur basée sur le type de relation
  const getTypeColor = (type: string) => {
    const colorMap: Record<string, { bg: string, text: string }> = {
      Activation: { bg: 'bg-green-600', text: 'text-white' },
      Inhibition: { bg: 'bg-red-600', text: 'text-white' },
      Phosphorylation: { bg: 'bg-blue-600', text: 'text-white' },
      Complex: { bg: 'bg-purple-600', text: 'text-white' },
    };
    return colorMap[type] || { bg: 'bg-gray-600', text: 'text-white' };
  };

  // Formatage du niveau de confiance
  const confidencePercent = edge.confidence !== undefined
    ? Math.round(edge.confidence * 100)
    : null;
  
  // Ouvrir PubMed quand un PMID est cliqué
  const handlePmidClick = (pmid?: string) => {
    if (pmid) {
      window.open(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, '_blank');
    }
  };

  const colors = getTypeColor(edge.type);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-h-[500px]">
      <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <div>
          <div className={`inline-block px-2 py-0.5 text-xs rounded-md font-medium ${colors.bg} ${colors.text}`}>
            {edge.type}
          </div>
          <h3 className="font-bold text-base text-gray-900 mt-1">Relation</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Fermer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="p-3 overflow-y-auto">
        {/* Entités impliquées */}
        <div className="mb-3">
          <h4 className="font-medium text-gray-800 mb-1 text-xs">Entités</h4>
          <div className="grid gap-2">
            <div className="bg-blue-100 border border-blue-200 p-2 rounded-lg">
              <div className="text-xs text-blue-800 font-semibold mb-0.5">Source</div>
              <div className="font-medium text-gray-800 text-sm">{sourceNode.name.split('-')[0]}</div>
              {sourceNode.type !== 'unknown' && (
                <div className="text-xs text-gray-700 mt-0.5">Type: {sourceNode.type}</div>
              )}
            </div>
            
            <div className="bg-purple-100 border border-purple-200 p-2 rounded-lg">
              <div className="text-xs text-purple-800 font-semibold mb-0.5">Cible</div>
              <div className="font-medium text-gray-800 text-sm">{targetNode.name.split('-')[0]}</div>
              {targetNode.type !== 'unknown' && (
                <div className="text-xs text-gray-700 mt-0.5">Type: {targetNode.type}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Niveau de confiance */}
        {confidencePercent !== null && (
          <div className="mb-3">
            <h4 className="font-medium text-gray-800 mb-1 text-xs">Confiance</h4>
            <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${confidencePercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-700">
                <span>0%</span>
                <span className="font-medium text-indigo-800">{confidencePercent}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Preuve textuelle */}
        {edge.evidence && (
          <div className="mb-3">
            <h4 className="font-medium text-gray-800 mb-1 text-xs">Evidence textuelle</h4>
            <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg">
              <blockquote className="text-xs italic text-gray-800">
                &quot;{edge.evidence}&quot;
              </blockquote>
            </div>
          </div>
        )}
        
        {/* PMID source */}
        {(edge.pmid || (edge.pmids && edge.pmids.length > 0)) && (
          <div>
            <h4 className="font-medium text-gray-800 mb-1 text-xs">Publications sources ({edge.pmids?.length || 1})</h4>
            
            {/* Afficher le PMID principal */}
            {edge.pmid && (
              <div 
                className="bg-gray-50 border border-gray-200 px-2 py-1.5 rounded text-xs hover:bg-blue-50 cursor-pointer flex items-center mb-1"
                onClick={() => handlePmidClick(edge.pmid)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span className="text-gray-800">PMID: {edge.pmid}</span>
              </div>
            )}
            
            {/* Afficher tous les PMIDs additionnels */}
            {edge.pmids && edge.pmids.length > 0 && edge.pmids
              .filter(p => p !== edge.pmid) // Éviter de répéter le PMID principal
              .map((pmid, index) => (
                <div 
                  key={`pmid-${pmid}-${index}`}
                  className="bg-gray-50 border border-gray-200 px-2 py-1.5 rounded text-xs hover:bg-blue-50 cursor-pointer flex items-center mb-1"
                  onClick={() => handlePmidClick(pmid)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <span className="text-gray-800">PMID: {pmid}</span>
                </div>
              ))
            }
          </div>
        )}
      </div>
      
      <div className="p-2 bg-gray-100 text-xs text-gray-700 border-t">
        Cliquez sur la publication pour ouvrir PubMed
      </div>
    </div>
  );
} 