import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* En-tête simplifié */}
      <header className="border-b border-gray-100 bg-white py-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-indigo-600">VisualAI</span>
              </h1>
              <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-xs">Beta</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-indigo-600 font-medium text-sm">Accueil</Link>
              <Link href="/indra" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm">Recherche</Link>
              <a href="https://github.com/visualai/visualai" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 transition-colors text-sm">GitHub</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero section épurée */}
      <section className="pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Visualisez les relations biologiques dans la littérature scientifique
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explorez les connexions entre entités biologiques extraites automatiquement à partir d&apos;articles scientifiques.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link 
              href="/indra" 
              className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium text-base hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Commencer une recherche
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça fonctionne - Version simplifiée */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">Comment ça fonctionne</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">1. Recherchez un terme</h3>
                <p className="text-gray-600 text-sm">
                  Entrez un terme de recherche pour que l&apos;application trouve les articles scientifiques pertinents.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">2. Visualisez les relations</h3>
                <p className="text-gray-600 text-sm">
                  Explorez le réseau interactif des relations biologiques extraites automatiquement des articles.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3. Analysez en détail</h3>
                <p className="text-gray-600 text-sm">
                  Consultez les détails complets des statements biologiques avec leurs preuves et sources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Exemples de recherche */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Exemples pour commencer</h2>
            <p className="text-gray-600 text-center mb-10">Cliquez sur un terme pour voir les résultats d&apos;une recherche pré-définie.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { term: 'medulloblastoma', description: 'Tumeur cérébrale de l&apos;enfant' },
                { term: 'breast cancer', description: 'Cancer du sein' },
                { term: 'alzheimer', description: 'Maladie neurodégénérative' },
                { term: 'EGFR', description: 'Récepteur du facteur de croissance épidermique' },
                { term: 'p53', description: 'Protéine suppresseur de tumeur' },
                { term: 'apoptosis', description: 'Mort cellulaire programmée' },
              ].map((example) => (
                <Link 
                  key={example.term}
                  href={`/indra?term=${encodeURIComponent(example.term)}`}
                  className="flex flex-col justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <h3 className="font-medium text-indigo-600 mb-1">{example.term}</h3>
                    <p className="text-gray-600 text-sm">{example.description}</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <span className="text-xs text-indigo-500">Explorer →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pied de page minimal */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <span className="text-gray-900 font-medium">VisualAI</span>
                <span className="ml-2 text-xs text-gray-500">Beta</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Visualisation des relations biologiques extraites de la littérature scientifique
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
              <Link href="/indra" className="text-gray-600 hover:text-indigo-600">
                Recherche
              </Link>
              <a 
                href="https://github.com/visualai/visualai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600"
              >
                GitHub
              </a>
              <a 
                href="https://pubmed.ncbi.nlm.nih.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-indigo-600"
              >
                PubMed
              </a>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} VisualAI. Tous droits réservés.</p>
            <p className="mt-2 sm:mt-0">
              Développé au <a href="https://sorger.med.harvard.edu/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                Laboratoire Sorger, Harvard Medical School
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
