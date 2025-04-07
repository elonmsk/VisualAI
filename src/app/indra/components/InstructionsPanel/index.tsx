'use client';

import React from 'react';

const InstructionsPanel: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Comment utiliser cet outil</h3>
      
      <div className="space-y-4 text-sm text-gray-600">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
              1
            </div>
          </div>
          <div className="ml-4">
            <p>
              <strong className="text-gray-900">Entrez un terme de recherche</strong> dans le formulaire à gauche.
              Exemples : nom de gène (EGFR, TP53), maladie (Alzheimer, cancer), médicament, etc.
            </p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
              2
            </div>
          </div>
          <div className="ml-4">
            <p>
              <strong className="text-gray-900">Explorez le graphe interactif</strong> des relations biologiques
              extraites automatiquement de la littérature scientifique.
            </p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
              3
            </div>
          </div>
          <div className="ml-4">
            <p>
              <strong className="text-gray-900">Filtrez par type de relation</strong> pour simplifier la visualisation.
              Vous pouvez également changer le layout pour une meilleure lisibilité.
            </p>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
              4
            </div>
          </div>
          <div className="ml-4">
            <p>
              <strong className="text-gray-900">Consultez les détails des relations</strong> dans l'onglet "Relations"
              pour voir les preuves et les sources associées.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
        <p>
          Cette application utilise <a href="https://indra.bio/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">INDRA</a> pour extraire des relations biologiques structurées à partir d'articles scientifiques de <a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">PubMed</a>.
        </p>
      </div>
    </div>
  );
};

export default InstructionsPanel;