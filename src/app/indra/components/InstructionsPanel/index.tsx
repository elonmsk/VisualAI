'use client';

export default function InstructionsPanel() {
  return (
    <div className="bg-indigo-50 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-indigo-800">
          Comment utiliser INDRA Explorer
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-indigo-700 mb-2">
            1. Recherche par terme
          </h3>
          <p className="text-gray-600">
            Entrez un terme de recherche (comme &quot;cancer&quot;, &quot;alzheimer&quot;, etc.) dans le champ de
            recherche. L&apos;application cherchera des articles pertinents et analysera les relations.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-indigo-700 mb-2">
            2. Explorer les résultats
          </h3>
          <p className="text-gray-600">
            Après la recherche, un graphe de connaissances sera généré montrant
            les relations biologiques extraites des articles. Vous pouvez :
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Filtrer par type de relation</li>
            <li>Changer la disposition du graphe</li>
            <li>
              Cliquer sur les nœuds et les connexions pour voir les détails
            </li>
            <li>Zoomer et déplacer le graphe pour mieux l&apos;explorer</li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-indigo-700 mb-2">
            3. Voir les statements détaillés
          </h3>
          <p className="text-gray-600">
            L&apos;onglet &quot;Statements&quot; montre les déclarations biologiques complètes
            extraites des articles, avec les références et le texte d&apos;évidence.
          </p>
        </div>

        <div className="pt-2">
          <p className="text-sm text-indigo-600">
            Pour plus d&apos;informations sur INDRA (Integrated Network and
            Dynamical Reasoning Assembler), visitez{" "}
            <a
              href="https://indra.bio"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              indra.bio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 