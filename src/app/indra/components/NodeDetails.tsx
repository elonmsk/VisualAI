'use client';

import { GraphNode } from '../types';
import { useState, useEffect } from 'react';

interface NodeDetailsProps {
  node: GraphNode | null;
  onClose: () => void;
}

interface Variant {
  description: string;
  hgvs?: string;
  id?: string;
  source?: string;
}

// Nouvelles interfaces pour remplacer les types any
interface Pathway {
  id?: string;
  name?: string;
  description?: string;
  database?: string;
  data?: {
    db_id?: string;
    name?: string;
    db_ns?: string;
  };
}

interface Tissue {
  id?: string;
  name?: string;
  description?: string;
  database?: string;
  data?: {
    db_id?: string;
    name?: string;
    db_ns?: string;
  };
}

interface Phenotype {
  id?: string;
  name?: string;
  description?: string;
  database?: string;
  data?: {
    db_id?: string;
    name?: string;
    db_ns?: string;
  };
}

interface Domain {
  id?: string;
  name?: string;
  description?: string;
  database?: string;
  data?: {
    db_id?: string;
    name?: string;
    db_ns?: string;
  };
}

interface Enzyme {
  id?: string;
  name?: string;
  description?: string;
  database?: string;
  data?: {
    db_id?: string;
    name?: string;
    db_ns?: string;
  };
}

interface CellLine {
  id?: string;
  name?: string;
  description?: string;
  database?: string;
  data?: {
    db_id?: string;
    name?: string;
    db_ns?: string;
  };
}

export default function NodeDetails({ node, onClose }: NodeDetailsProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  
  // États pour les pathways avec type spécifique
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [loadingPathways, setLoadingPathways] = useState(false);
  const [pathwayError, setPathwayError] = useState<string | null>(null);

  // États pour les tissus avec type spécifique
  const [tissues, setTissues] = useState<Tissue[]>([]);
  const [loadingTissues, setLoadingTissues] = useState(false);
  const [tissueError, setTissueError] = useState<string | null>(null);
  
  // États pour les phénotypes avec type spécifique
  const [phenotypes, setPhenotypes] = useState<Phenotype[]>([]);
  const [loadingPhenotypes, setLoadingPhenotypes] = useState(false);
  const [phenotypeError, setPhenotypeError] = useState<string | null>(null);

  // États pour les domaines protéiques avec type spécifique
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);

  // États pour les activités enzymatiques avec type spécifique
  const [enzymes, setEnzymes] = useState<Enzyme[]>([]);
  const [loadingEnzymes, setLoadingEnzymes] = useState(false);
  const [enzymeError, setEnzymeError] = useState<string | null>(null);
  
  // États pour les lignées cellulaires avec CNA avec type spécifique
  const [cellLines, setCellLines] = useState<CellLine[]>([]);
  const [loadingCellLines, setLoadingCellLines] = useState(false);
  const [cellLineError, setCellLineError] = useState<string | null>(null);

  // État pour indiquer si le gène est une kinase
  const [isKinase, setIsKinase] = useState<boolean | null>(null);
  const [loadingKinase, setLoadingKinase] = useState(false);
  // Suppression de kinaseError car non utilisé
  const [, setKinaseError] = useState<string | null>(null);

  // État pour indiquer si le gène est une phosphatase
  const [isPhosphatase, setIsPhosphatase] = useState<boolean | null>(null);
  const [loadingPhosphatase, setLoadingPhosphatase] = useState(false);
  // Suppression de phosphataseError car non utilisé
  const [, setPhosphataseError] = useState<string | null>(null);

  // État pour indiquer si le gène est un facteur de transcription
  const [isTF, setIsTF] = useState<boolean | null>(null);
  const [loadingTF, setLoadingTF] = useState(false);
  // Suppression de tfError car non utilisé
  const [, setTFError] = useState<string | null>(null);

  // État pour gérer les onglets
  const [activeTab, setActiveTab] = useState<string>('identifiants');
  
  // État pour le filtre de recherche
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Charger les variants si le nœud est de type "gene" et a un identifiant HGNC
  useEffect(() => {
    async function fetchVariants() {
      if (node && node.type?.toLowerCase() === 'gene' && node.references?.HGNC) {
        setLoadingVariants(true);
        setVariantError(null);
        
        try {
          console.log(`Récupération des variants pour le gène HGNC:${node.references.HGNC}`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/variants', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              hgnc_id: node.references.HGNC
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Variants récupérés:', data);
          setVariants(data.variants || []);
        } catch (error) {
          console.error('Erreur lors de la récupération des variants:', error);
          setVariantError(`${(error as Error).name}: ${(error as Error).message}`);
        } finally {
          setLoadingVariants(false);
        }
      }
    }
    
    fetchVariants();
  }, [node]);

  // Charger les pathways si le nœud est de type "gene" et a un identifiant HGNC
  useEffect(() => {
    async function fetchPathways() {
      if (node && node.type?.toLowerCase() === 'gene' && node.references?.HGNC) {
        setLoadingPathways(true);
        setPathwayError(null);
        
        try {
          console.log(`Récupération des pathways pour le gène HGNC:${node.references.HGNC}`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/pathways', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gene: ['HGNC', node.references.HGNC]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Pathways récupérés:', data);
          setPathways(data || []);
        } catch (error) {
          console.error('Erreur lors de la récupération des pathways:', error);
          setPathwayError(`${(error as Error).name}: ${(error as Error).message}`);
        } finally {
          setLoadingPathways(false);
        }
      }
    }
    
    fetchPathways();
  }, [node]);

  // Charger les tissus si le nœud est de type "gene" et a un identifiant HGNC
  useEffect(() => {
    async function fetchTissues() {
      if (node && node.type?.toLowerCase() === 'gene' && node.references?.HGNC) {
        setLoadingTissues(true);
        setTissueError(null);
        
        try {
          console.log(`Récupération des tissus pour le gène HGNC:${node.references.HGNC}`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/tissues', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gene: ['HGNC', node.references.HGNC]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Tissus récupérés:', data);
          setTissues(data || []);
        } catch (error) {
          console.error('Erreur lors de la récupération des tissus:', error);
          setTissueError(`${(error as Error).name}: ${(error as Error).message}`);
        } finally {
          setLoadingTissues(false);
        }
      }
    }
    
    fetchTissues();
  }, [node]);

  // Charger les phénotypes si le nœud est de type "gene" et a un identifiant HGNC
  useEffect(() => {
    async function fetchPhenotypes() {
      if (node && node.type?.toLowerCase() === 'gene' && node.references?.HGNC) {
        setLoadingPhenotypes(true);
        setPhenotypeError(null);
        
        try {
          console.log(`Récupération des phénotypes pour le gène HGNC:${node.references.HGNC}`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/phenotypes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gene: ['HGNC', node.references.HGNC]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Phénotypes récupérés:', data);
          setPhenotypes(data || []);
        } catch (error) {
          console.error('Erreur lors de la récupération des phénotypes:', error);
          setPhenotypeError(`${(error as Error).name}: ${(error as Error).message}`);
        } finally {
          setLoadingPhenotypes(false);
        }
      }
    }
    
    fetchPhenotypes();
  }, [node]);

  // Charger les domaines protéiques si le nœud est de type "gene" et a un identifiant HGNC
  useEffect(() => {
    async function fetchDomains() {
      if (node && node.type?.toLowerCase() === 'gene' && node.references?.HGNC) {
        setLoadingDomains(true);
        setDomainError(null);
        
        try {
          console.log(`Récupération des domaines protéiques pour le gène HGNC:${node.references.HGNC}`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/domains', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gene: ['HGNC', node.references.HGNC]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Domaines protéiques récupérés:', data);
          setDomains(data || []);
        } catch (error) {
          console.error('Erreur lors de la récupération des domaines protéiques:', error);
          setDomainError(`${(error as Error).name}: ${(error as Error).message}`);
        } finally {
          setLoadingDomains(false);
        }
      }
    }
    
    fetchDomains();
  }, [node]);

  // Charger les activités enzymatiques si le nœud est de type "gene" et a un identifiant HGNC
  useEffect(() => {
    async function fetchEnzymes() {
      if (node && node.type?.toLowerCase() === 'gene' && node.references?.HGNC) {
        setLoadingEnzymes(true);
        setEnzymeError(null);
        
        try {
          console.log(`Récupération des activités enzymatiques pour le gène HGNC:${node.references.HGNC}`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/enzymes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gene: ['HGNC', node.references.HGNC]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Activités enzymatiques récupérées:', data);
          setEnzymes(data || []);
        } catch (error) {
          console.error('Erreur lors de la récupération des activités enzymatiques:', error);
          setEnzymeError(`${(error as Error).name}: ${(error as Error).message}`);
        } finally {
          setLoadingEnzymes(false);
        }
      }
    }
    
    fetchEnzymes();
  }, [node]);

  // Charger les lignées cellulaires avec CNA si le nœud est de type "gene" et a un identifiant HGNC
  useEffect(() => {
    async function fetchCellLines() {
      if (node && node.type?.toLowerCase() === 'gene' && node.references?.HGNC) {
        setLoadingCellLines(true);
        setCellLineError(null);
        
        try {
          console.log(`Récupération des lignées cellulaires avec CNA pour le gène HGNC:${node.references.HGNC}`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/celllines', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gene: ['HGNC', node.references.HGNC]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Lignées cellulaires avec CNA récupérées:', data);
          setCellLines(data || []);
        } catch (error) {
          console.error('Erreur lors de la récupération des lignées cellulaires avec CNA:', error);
          setCellLineError(`${(error as Error).name}: ${(error as Error).message}`);
        } finally {
          setLoadingCellLines(false);
        }
      }
    }
    
    fetchCellLines();
  }, [node]);

  // Vérifier si le gène est une kinase
  useEffect(() => {
    async function checkIsKinase() {
      if (node && node.type?.toLowerCase() === 'gene' && node.name) {
        setLoadingKinase(true);
        setKinaseError(null);
        
        try {
          console.log(`Vérification si ${node.name} est une kinase`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/iskinase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              genes: [node.name]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Résultat de la vérification kinase:', data);
          
          // Le résultat est un objet avec le nom du gène comme clé et un booléen comme valeur
          if (data && typeof data[node.name] === 'boolean') {
            setIsKinase(data[node.name]);
          } else {
            setIsKinase(null);
            console.log('Format de réponse inattendu:', data);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification kinase:', error);
          setKinaseError(`${(error as Error).name}: ${(error as Error).message}`);
          setIsKinase(null);
        } finally {
          setLoadingKinase(false);
        }
      }
    }
    
    checkIsKinase();
  }, [node]);

  // Vérifier si le gène est une phosphatase
  useEffect(() => {
    async function checkIsPhosphatase() {
      if (node && node.type?.toLowerCase() === 'gene' && node.name) {
        setLoadingPhosphatase(true);
        setPhosphataseError(null);
        
        try {
          console.log(`Vérification si ${node.name} est une phosphatase`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/isphosphatase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              genes: [node.name]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Résultat de la vérification phosphatase:', data);
          
          // Le résultat est un objet avec le nom du gène comme clé et un booléen comme valeur
          if (data && typeof data[node.name] === 'boolean') {
            setIsPhosphatase(data[node.name]);
          } else {
            setIsPhosphatase(null);
            console.log('Format de réponse inattendu:', data);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification phosphatase:', error);
          setPhosphataseError(`${(error as Error).name}: ${(error as Error).message}`);
          setIsPhosphatase(null);
        } finally {
          setLoadingPhosphatase(false);
        }
      }
    }
    
    checkIsPhosphatase();
  }, [node]);

  // Vérifier si le gène est un facteur de transcription
  useEffect(() => {
    async function checkIsTF() {
      if (node && node.type?.toLowerCase() === 'gene' && node.name) {
        setLoadingTF(true);
        setTFError(null);
        
        try {
          console.log(`Vérification si ${node.name} est un facteur de transcription`);
          
          // Utiliser une route proxy locale pour éviter les problèmes CORS
          const response = await fetch('/api/indra/istranscriptionfactor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              genes: [node.name]
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Résultat de la vérification facteur de transcription:', data);
          
          // Le résultat est un objet avec le nom du gène comme clé et un booléen comme valeur
          if (data && typeof data[node.name] === 'boolean') {
            setIsTF(data[node.name]);
          } else {
            setIsTF(null);
            console.log('Format de réponse inattendu:', data);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification facteur de transcription:', error);
          setTFError(`${(error as Error).name}: ${(error as Error).message}`);
          setIsTF(null);
        } finally {
          setLoadingTF(false);
        }
      }
    }
    
    checkIsTF();
  }, [node]);

  if (!node) return null;

  // Déterminer la couleur associée au type de nœud
  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      protein: 'bg-indigo-600 text-white',
      gene: 'bg-blue-600 text-white',
      drug: 'bg-red-600 text-white',
      disease: 'bg-amber-600 text-white',
    };
    return colorMap[type] || 'bg-gray-600 text-white';
  };

  // Ouvrir la référence dans la base de données appropriée
  const handleReferenceClick = (dbName: string, id: string) => {
    let url = '#';
    
    // URLs pour les bases de données courantes en biologie
    switch (dbName) {
      case 'HGNC':
        url = `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:${id}`;
        break;
      case 'UP':
      case 'UNIPROT':
        url = `https://www.uniprot.org/uniprot/${id}`;
        break;
      case 'PUBCHEM':
        url = `https://pubchem.ncbi.nlm.nih.gov/compound/${id}`;
        break;
      case 'MESH':
        url = `https://meshb.nlm.nih.gov/record/ui?ui=${id}`;
        break;
      case 'CHEBI':
        url = `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${id}`;
        break;
      default:
        return; // Ne pas ouvrir de lien si la base de données n'est pas reconnue
    }
    
    window.open(url, '_blank');
  };

  // Ouvrir la référence du variant dans sa base de données
  const handleVariantClick = (id: string, source: string = 'DBSNP') => {
    let url = '#';
    
    if (source === 'DBSNP' && id.startsWith('rs')) {
      url = `https://www.ncbi.nlm.nih.gov/snp/${id}`;
    } else {
      // Autres sources potentielles
      switch (source) {
        case 'COSMIC':
          url = `https://cancer.sanger.ac.uk/cosmic/mutation/overview?id=${id}`;
          break;
        case 'ClinVar':
          url = `https://www.ncbi.nlm.nih.gov/clinvar/variation/${id}`;
          break;
        default:
          if (id.startsWith('rs')) {
            url = `https://www.ncbi.nlm.nih.gov/snp/${id}`;
          } else {
            return; // Ne pas ouvrir de lien si l'ID n'est pas reconnu
          }
      }
    }
    
    window.open(url, '_blank');
  };

  // Ouvrir la page du pathway dans sa base de données
  const handlePathwayClick = (id: string, source: string) => {
    let url = '#';
    
    if (source === 'WIKIPATHWAYS' || source === 'WP') {
      // Format WP1234 pour WikiPathways
      url = `https://www.wikipathways.org/pathways/${id}`;
    } else if (source === 'REACTOME') {
      // Format R-HSA-1234567 pour Reactome
      url = `https://reactome.org/content/detail/${id}`;
    } else if (source === 'KEGG') {
      // Format hsa00010 pour KEGG
      url = `https://www.genome.jp/kegg-bin/show_pathway?${id}`;
    } else {
      console.log(`Source de pathway non reconnue: ${source}`);
      return; // Ne pas ouvrir de lien si la source n'est pas reconnue
    }
    
    window.open(url, '_blank');
  };

  // Ouvrir la page du tissue dans sa base de données
  const handleTissueClick = (id: string, source: string, event?: React.MouseEvent) => {
    // Prévenir la fermeture du panneau
    event?.preventDefault();
    event?.stopPropagation();
    
    let url = '#';
    
    if (source === 'UBERON') {
      url = `https://www.ebi.ac.uk/ols/ontologies/uberon/terms?iri=http://purl.obolibrary.org/obo/UBERON_${id}`;
    } else if (source === 'MESH') {
      url = `https://meshb.nlm.nih.gov/record/ui?ui=${id}`;
    } else if (source === 'GO') {
      url = `http://amigo.geneontology.org/amigo/term/GO:${id}`;
    } else {
      console.log(`Source de tissu non reconnue: ${source}`);
      return; // Ne pas ouvrir de lien si la source n'est pas reconnue
    }
    
    // Ouvrir l'URL dans un nouvel onglet
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Ouvrir la page du phénotype dans sa base de données
  const handlePhenotypeClick = (id: string, source: string) => {
    let url = '#';
    
    if (source === 'MESH') {
      url = `https://meshb.nlm.nih.gov/record/ui?ui=${id}`;
    } else if (source === 'HP') {
      url = `https://hpo.jax.org/app/browse/term/${id}`;
    } else if (source === 'OMIM') {
      url = `https://www.omim.org/entry/${id}`;
    } else {
      console.log(`Source de phénotype non reconnue: ${source}`);
      return; // Ne pas ouvrir de lien si la source n'est pas reconnue
    }
    
    window.open(url, '_blank');
  };

  // Ouvrir la page du domaine protéique dans sa base de données
  const handleDomainClick = (id: string, source: string) => {
    let url = '#';
    
    console.log(`Tentative d'ouverture du domaine: ID=${id}, Source=${source}`);
    
    // Normaliser la source en majuscules pour comparaison
    const normalizedSource = source.toUpperCase();
    
    if (normalizedSource.includes('INTERPRO') || normalizedSource === 'IPR') {
      url = `https://www.ebi.ac.uk/interpro/entry/InterPro/${id}/`;
    } else if (normalizedSource.includes('PFAM') || normalizedSource === 'PF') {
      url = `https://pfam.xfam.org/family/${id}`;
    } else if (normalizedSource.includes('SMART')) {
      url = `https://smart.embl.de/smart/do_annotation.pl?DOMAIN=${id}`;
    } else if (normalizedSource.includes('PROSITE') || normalizedSource === 'PS') {
      url = `https://prosite.expasy.org/${id}`;
    } else {
      // Par défaut, essayer InterPro qui est la source la plus probable
      console.log(`Source de domaine protéique non reconnue: ${source} - Tentative avec InterPro par défaut`);
      url = `https://www.ebi.ac.uk/interpro/entry/InterPro/${id}/`;
    }
    
    console.log(`Ouverture de l'URL: ${url}`);
    window.open(url, '_blank');
  };

  // Ouvrir la page de l'activité enzymatique dans sa base de données
  const handleEnzymeClick = (id: string) => {
    // Le format ID doit être EC:x.x.x.x ou EC-x.x.x.x
    let formattedId = id;
    
    // Nettoyer et formater l'ID si nécessaire
    if (!id.includes('.')) {
      console.error("Format d'identifiant enzymatique non reconnu:", id);
      return;
    }
    
    // Supprimer tout préfixe comme "EC:" ou "EC-" pour la construction de l'URL
    if (id.includes(':')) {
      formattedId = id.split(':')[1];
    } else if (id.includes('-')) {
      formattedId = id.split('-')[1];
    }
    
    // Vérifier si l'ID est au format x.x.x.x
    const ecPattern = /^\d+(\.\d+)*$/;
    if (!ecPattern.test(formattedId)) {
      console.error("Format d'identifiant EC non valide:", formattedId);
      return;
    }
    
    console.log(`Ouverture de l'activité enzymatique: ${formattedId}`);
    
    // URL BRENDA pour les codes EC
    const url = `https://www.brenda-enzymes.org/enzyme.php?ecno=${formattedId}`;
    window.open(url, '_blank');
  };

  // Ouvrir la page d'une lignée cellulaire directement dans Cellosaurus
  const handleCellLineClick = (id: string) => {
    if (!id) {
      console.error("Identifiant de lignée cellulaire manquant");
      return;
    }
    
    console.log("Lignée cellulaire cliquée:", id);
    
    // Extraire l'identifiant de la lignée cellulaire
    const parts = id.split('_');
    if (parts.length < 2) {
      console.error("Format d'identifiant de lignée cellulaire non reconnu:", id);
      return;
    }
    
    // La première partie est généralement le nom de la lignée cellulaire
    const cellLineName = parts[0];
    
    console.log(`Ouverture de la lignée cellulaire dans Cellosaurus: ${cellLineName}`);
    
    // URL Cellosaurus 
    const url = `https://www.cellosaurus.org/search?input=${cellLineName}`;
    
    try {
      window.open(url, '_blank');
    } catch (error) {
      console.error(`Erreur lors de l'ouverture de l'URL: ${error}`);
    }
  };

  // Code pour le rendu des statistiques
  const renderStatCard = (title: string, value: number) => (
    <div className="text-center bg-white border border-gray-200 rounded-md p-2 shadow-sm">
      <div className="text-sm text-gray-600 font-medium">{title}</div>
      <div className="font-bold text-gray-800">{value}</div>
    </div>
  );

  // Fonction pour filtrer les éléments selon la recherche avec types génériques
  const filterItems = <T,>(items: T[], getTextFn: (item: T) => string) => {
    if (!searchFilter.trim()) return items;
    const lowerSearch = searchFilter.toLowerCase();
    return items.filter(item => getTextFn(item).toLowerCase().includes(lowerSearch));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[500px]">
      <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <div>
          <h3 className="font-bold text-base text-gray-900">{node.name.split('-')[0]}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`inline-block px-2 py-0.5 text-xs rounded-full ${getTypeColor(node.type)}`}>
            {node.type}
            </div>
            
            {/* Indicateurs de type de protéine pour les gènes */}
            {node.type?.toLowerCase() === 'gene' && (
              <>
                {loadingKinase ? (
                  <div className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    <div className="w-3 h-3 mr-1 rounded-full border-t-2 border-r-2 border-gray-600 animate-spin"></div>
                    Kinase?
                  </div>
                ) : isKinase === true ? (
                  <div className="inline-block px-2 py-0.5 text-xs bg-pink-100 text-pink-800 rounded-full font-medium">
                    Kinase
                  </div>
                ) : isKinase === false ? (
                  <div className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    Non-kinase
                  </div>
                ) : null}

                {loadingPhosphatase ? (
                  <div className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    <div className="w-3 h-3 mr-1 rounded-full border-t-2 border-r-2 border-gray-600 animate-spin"></div>
                    Phosphatase?
                  </div>
                ) : isPhosphatase === true ? (
                  <div className="inline-block px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-medium">
                    Phosphatase
                  </div>
                ) : isPhosphatase === false ? (
                  <div className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    Non-phosphatase
                  </div>
                ) : null}

                {loadingTF ? (
                  <div className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    <div className="w-3 h-3 mr-1 rounded-full border-t-2 border-r-2 border-gray-600 animate-spin"></div>
                    TF?
                  </div>
                ) : isTF === true ? (
                  <div className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                    Facteur de transcription
                  </div>
                ) : isTF === false ? (
                  <div className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    Non-TF
                  </div>
                ) : null}
              </>
            )}
          </div>
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
      
      {/* Statistiques */}
      <div className="px-3 py-2 border-b flex items-center justify-between gap-2 bg-gray-50 text-xs">
        {renderStatCard("Occurr.", node.count || 1)}
        {renderStatCard("IDs", node.references ? Object.keys(node.references).length : 0)}
        {node.type?.toLowerCase() === 'gene' && 
          renderStatCard("Variants", variants.length)}
      </div>
      
      {/* Barre de recherche */}
      {node.type?.toLowerCase() === 'gene' && (
        <div className="px-3 py-2 border-b">
          <div className="relative">
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher..." 
              className="w-full pl-8 pr-3 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500" 
            />
            <svg className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchFilter && (
              <button 
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Navigation par onglets pour les gènes */}
      {node.type?.toLowerCase() === 'gene' && (
        <div className="flex overflow-x-auto border-b bg-gray-50 sticky top-0 z-10">
          <button 
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'identifiants' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('identifiants')}
          >
            Identifiants
          </button>
          <button 
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'pathways' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('pathways')}
          >
            Pathways {pathways.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">{pathways.length}</span>}
          </button>
          <button 
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'tissus' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('tissus')}
          >
            Tissus {tissues.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">{tissues.length}</span>}
          </button>
          <button 
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'variants' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('variants')}
          >
            Variants {variants.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">{variants.length}</span>}
          </button>
          <button 
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'phenotypes' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('phenotypes')}
          >
            Phénotypes {phenotypes.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">{phenotypes.length}</span>}
          </button>
          <button 
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'domaines' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('domaines')}
          >
            Domaines {domains.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">{domains.length}</span>}
          </button>
          <button 
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'enzymes' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('enzymes')}
          >
            Enzymes {enzymes.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">{enzymes.length}</span>}
          </button>
          <button 
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'celllines' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('celllines')}
          >
            Lignées {cellLines.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">{cellLines.length}</span>}
          </button>
        </div>
      )}
      
      <div className="p-4 overflow-y-auto flex-grow">
        {/* Contenu basé sur le type de nœud et l'onglet actif */}
        {node.type?.toLowerCase() !== 'gene' && (
          // Contenu de base pour les nœuds non-gènes (références seulement)
          <>
        {/* Références dans des bases de données */}
        {node.references && Object.keys(node.references).length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Identifiants</h4>
            <div className="space-y-1">
              {Object.entries(node.references).map(([db, id]) => (
                <div 
                  key={db} 
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleReferenceClick(db, id)}
                >
                  <span className="font-medium text-gray-800">{db}</span>
                  <span className="text-blue-700 font-medium">{id}</span>
                </div>
              ))}
            </div>
          </div>
            )}
          </>
        )}
        
        {/* Contenu spécifique pour les gènes, organisé par onglets */}
        {node.type?.toLowerCase() === 'gene' && (
          <>
            {/* Onglet Identifiants */}
            {activeTab === 'identifiants' && node.references && Object.keys(node.references).length > 0 && (
              <div>
                <div className="space-y-1">
                  {filterItems(
                    Object.entries(node.references),
                    (entry) => `${entry[0]} ${entry[1]}`
                  ).map(([db, id]) => (
                    <div 
                      key={db} 
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleReferenceClick(db, id)}
                    >
                      <span className="font-medium text-gray-800">{db}</span>
                      <span className="text-blue-700 font-medium">{id}</span>
                    </div>
                  ))}
                </div>
                {searchFilter && filterItems(Object.entries(node.references), (entry) => `${entry[0]} ${entry[1]}`).length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">Aucun identifiant ne correspond à votre recherche.</p>
                )}
              </div>
            )}
            
            {/* Onglet Pathways */}
            {activeTab === 'pathways' && (
              <div>
                {loadingPathways && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-green-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Chargement des pathways...</p>
                  </div>
                )}
                
                {pathwayError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Impossible de charger les pathways</p>
                    <p className="text-xs">{pathwayError}</p>
                <button 
                  onClick={() => {
                        setLoadingPathways(true);
                        setPathwayError(null);
                        fetch('/api/indra/pathways', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            gene: ['HGNC', node.references?.HGNC]
                          })
                    })
                    .then(response => {
                      if (!response.ok) throw new Error(`Erreur: ${response.status}`);
                      return response.json();
                    })
                    .then(data => {
                          setPathways(data || []);
                    })
                    .catch(error => {
                          console.error('Erreur lors du rechargement des pathways:', error);
                          setPathwayError(`${error.name}: ${error.message}`);
                    })
                    .finally(() => {
                          setLoadingPathways(false);
                    });
                  }}
                      className="mt-2 text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                >
                  Réessayer
                </button>
                  </div>
              )}
                
                {!loadingPathways && !pathwayError && pathways.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Aucun pathway trouvé pour ce gène.</p>
            </div>
                )}
                
                {!loadingPathways && !pathwayError && pathways.length > 0 && (
                  <div className="space-y-2">
                    {filterItems(
                      pathways, 
                      (pathway) => `${pathway.data?.name || pathway.name || ''} ${pathway.data?.db_id || pathway.id || ''} ${pathway.data?.db_ns || pathway.database || ''}`
                    ).map((pathway, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-green-50 cursor-pointer"
                        onClick={() => {
                          const id = pathway.data?.db_id || pathway.id;
                          const source = pathway.data?.db_ns || pathway.database;
                          if (id && source) {
                            handlePathwayClick(id, source);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-green-700">
                            {pathway.data?.name || pathway.name || pathway.data?.db_id || pathway.id || "Pathway sans nom"}
                          </span>
                          {(pathway.data?.db_ns || pathway.database) && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              {pathway.data?.db_ns || pathway.database}
                            </span>
                          )}
                        </div>
                        {pathway.description && (
                          <p className="text-gray-700 mt-1 text-xs">{pathway.description}</p>
                        )}
                        {(pathway.data?.db_id || pathway.id) && (
                          <p className="text-gray-500 mt-1 text-xs">ID: {pathway.data?.db_id || pathway.id}</p>
                        )}
                      </div>
                    ))}
                    
                    {searchFilter && filterItems(pathways, (pathway) => `${pathway.data?.name || pathway.name || ''} ${pathway.data?.db_id || pathway.id || ''} ${pathway.data?.db_ns || pathway.database || ''}`).length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">Aucun pathway ne correspond à votre recherche.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Onglet Tissus */}
            {activeTab === 'tissus' && (
              <div>
                {loadingTissues && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Chargement des tissus...</p>
                  </div>
                )}
                
                {tissueError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Impossible de charger les tissus</p>
                    <p className="text-xs">{tissueError}</p>
                    <button 
                      onClick={() => {
                        setLoadingTissues(true);
                        setTissueError(null);
                        fetch('/api/indra/tissues', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            gene: ['HGNC', node.references?.HGNC]
                          })
                        })
                        .then(response => {
                          if (!response.ok) throw new Error(`Erreur: ${response.status}`);
                          return response.json();
                        })
                        .then(data => {
                          setTissues(data || []);
                        })
                        .catch(error => {
                          console.error('Erreur lors du rechargement des tissus:', error);
                          setTissueError(`${error.name}: ${error.message}`);
                        })
                        .finally(() => {
                          setLoadingTissues(false);
                        });
                      }}
                      className="mt-2 text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
                
                {!loadingTissues && !tissueError && tissues.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Aucun tissu avec expression significative trouvé pour ce gène.</p>
                  </div>
                )}
                
                {!loadingTissues && !tissueError && tissues.length > 0 && (
                  <div>
                    <div className="space-y-2">
                      {filterItems(
                        tissues,
                        (tissue) => `${tissue.data?.db_id || tissue.id || ''} ${tissue.data?.name || tissue.name || ''}`
                      ).map((tissue, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-blue-50 cursor-pointer"
                          onClick={(event) => {
                            const id = tissue.data?.db_id || tissue.id;
                            const source = tissue.data?.db_ns || tissue.database || 'UBERON';
                            if (id) {
                              handleTissueClick(id, source, event);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-blue-700">
                              {tissue.data?.name || tissue.name || tissue.data?.db_id || tissue.id}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {tissue.data?.db_ns || tissue.database || 'UBERON'}
                            </span>
                          </div>
                          {tissue.description && (
                            <p className="text-gray-700 mt-1 text-xs">{tissue.description}</p>
                          )}
                          {(tissue.data?.db_id || tissue.id) && (
                            <p className="text-gray-500 mt-1 text-xs">ID: {tissue.data?.db_id || tissue.id}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {searchFilter && filterItems(tissues, (tissue) => `${tissue.data?.db_id || tissue.id || ''} ${tissue.data?.name || tissue.name || ''}`).length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">Aucun tissu ne correspond à votre recherche.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Onglet Variants */}
            {activeTab === 'variants' && (
              <div>
            {loadingVariants && (
              <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500"></div>
                <p className="mt-2 text-sm text-gray-600">Chargement des variants...</p>
              </div>
            )}
            
            {variantError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Impossible de charger les variants</p>
                <p className="text-xs">{variantError}</p>
                    <button 
                      onClick={() => {
                        setLoadingVariants(true);
                        setVariantError(null);
                        fetch('/api/indra/variants', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            hgnc_id: node.references?.HGNC
                          })
                        })
                        .then(response => {
                          if (!response.ok) throw new Error(`Erreur: ${response.status}`);
                          return response.json();
                        })
                        .then(data => {
                          setVariants(data.variants || []);
                        })
                        .catch(error => {
                          console.error('Erreur lors du rechargement des variants:', error);
                          setVariantError(`${error.name}: ${error.message}`);
                        })
                        .finally(() => {
                          setLoadingVariants(false);
                        });
                      }}
                      className="mt-2 text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                    >
                      Réessayer
                    </button>
              </div>
            )}
            
            {!loadingVariants && !variantError && variants.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Aucun variant trouvé pour ce gène.</p>
              </div>
            )}
            
            {!loadingVariants && !variantError && variants.length > 0 && (
              <div className="space-y-2">
                    {filterItems(
                      variants,
                      (variant) => `${variant.id || ''} ${variant.description || ''} ${variant.hgvs || ''}`
                    ).map((variant, index) => (
                  <div 
                    key={index} 
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-purple-50 cursor-pointer"
                        onClick={() => {
                          if (variant.id && variant.source) {
                            handleVariantClick(variant.id, variant.source);
                          } else if (variant.id) {
                            handleVariantClick(variant.id);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-purple-700">
                            {variant.id || "Variant sans ID"}
                      </span>
                      {variant.source && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {variant.source}
                        </span>
                      )}
                    </div>
                    {variant.description && (
                      <p className="text-gray-700 mt-1 text-xs">{variant.description}</p>
                    )}
                        {variant.hgvs && (
                      <p className="text-gray-500 mt-1 text-xs">HGVS: {variant.hgvs}</p>
                    )}
                  </div>
                ))}
                    
                    {searchFilter && filterItems(variants, (variant) => `${variant.id || ''} ${variant.description || ''} ${variant.hgvs || ''}`).length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">Aucun variant ne correspond à votre recherche.</p>
                    )}
              </div>
            )}
          </div>
        )}
        
            {/* Onglet Phénotypes */}
            {activeTab === 'phenotypes' && (
              <div>
                {loadingPhenotypes && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-yellow-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Chargement des phénotypes...</p>
                  </div>
                )}
                
                {phenotypeError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Impossible de charger les phénotypes</p>
                    <p className="text-xs">{phenotypeError}</p>
                <button 
                  onClick={() => {
                        setLoadingPhenotypes(true);
                        setPhenotypeError(null);
                        fetch('/api/indra/phenotypes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        gene: ['HGNC', node.references?.HGNC]
                      })
                    })
                    .then(response => {
                      if (!response.ok) throw new Error(`Erreur: ${response.status}`);
                      return response.json();
                    })
                    .then(data => {
                          setPhenotypes(data || []);
                    })
                    .catch(error => {
                          console.error('Erreur lors du rechargement des phénotypes:', error);
                          setPhenotypeError(`${error.name}: ${error.message}`);
                    })
                    .finally(() => {
                          setLoadingPhenotypes(false);
                    });
                  }}
                      className="mt-2 text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                >
                  Réessayer
                </button>
                  </div>
              )}
                
                {!loadingPhenotypes && !phenotypeError && phenotypes.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Aucun phénotype trouvé pour ce gène.</p>
            </div>
                )}
                
                {!loadingPhenotypes && !phenotypeError && phenotypes.length > 0 && (
                  <div className="space-y-2">
                    {filterItems(
                      phenotypes,
                      (phenotype) => `${phenotype.data?.name || phenotype.name || ''} ${phenotype.data?.db_id || phenotype.id || ''}`
                    ).map((phenotype, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-yellow-50 cursor-pointer"
                        onClick={() => {
                          const id = phenotype.data?.db_id || phenotype.id;
                          const source = phenotype.data?.db_ns || phenotype.database || 'HP';
                          if (id) {
                            handlePhenotypeClick(id, source);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-yellow-700">
                            {phenotype.data?.name || phenotype.name || phenotype.data?.db_id || phenotype.id || "Phénotype sans nom"}
                          </span>
                          {(phenotype.data?.db_ns || phenotype.database) && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              {phenotype.data?.db_ns || phenotype.database || 'HP'}
                            </span>
                          )}
                        </div>
                        {phenotype.description && (
                          <p className="text-gray-700 mt-1 text-xs">{phenotype.description}</p>
                        )}
                        {(phenotype.data?.db_id || phenotype.id) && (
                          <p className="text-gray-500 mt-1 text-xs">ID: {phenotype.data?.db_id || phenotype.id}</p>
                        )}
                      </div>
                    ))}
                    
                    {searchFilter && filterItems(phenotypes, (phenotype) => `${phenotype.data?.name || phenotype.name || ''} ${phenotype.data?.db_id || phenotype.id || ''}`).length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">Aucun phénotype ne correspond à votre recherche.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Onglet Domaines */}
            {activeTab === 'domaines' && (
              <div>
                {loadingDomains && (
              <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-teal-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Chargement des domaines protéiques...</p>
              </div>
            )}
            
                {domainError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Impossible de charger les domaines protéiques</p>
                    <p className="text-xs">{domainError}</p>
                    <button 
                      onClick={() => {
                        setLoadingDomains(true);
                        setDomainError(null);
                        fetch('/api/indra/domains', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            gene: ['HGNC', node.references?.HGNC]
                          })
                        })
                        .then(response => {
                          if (!response.ok) throw new Error(`Erreur: ${response.status}`);
                          return response.json();
                        })
                        .then(data => {
                          setDomains(data || []);
                        })
                        .catch(error => {
                          console.error('Erreur lors du rechargement des domaines:', error);
                          setDomainError(`${error.name}: ${error.message}`);
                        })
                        .finally(() => {
                          setLoadingDomains(false);
                        });
                      }}
                      className="mt-2 text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                    >
                      Réessayer
                    </button>
              </div>
            )}
            
                {!loadingDomains && !domainError && domains.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Aucun domaine protéique trouvé pour ce gène.</p>
                    <p className="text-xs text-gray-500 mt-1">Les domaines protéiques sont des régions fonctionnelles conservées au sein des protéines.</p>
              </div>
            )}
            
                {!loadingDomains && !domainError && domains.length > 0 && (
              <div className="space-y-2">
                    {filterItems(
                      domains,
                      (domain) => `${domain.data?.name || domain.name || ''} ${domain.data?.db_id || domain.id || ''} ${domain.data?.db_ns || domain.database || ''}`
                    ).map((domain, index) => (
                  <div 
                    key={index} 
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-teal-50 cursor-pointer"
                        onClick={() => {
                          const id = domain.data?.db_id || domain.id;
                          const source = domain.data?.db_ns || domain.database || 'INTERPRO';
                          if (id) {
                            handleDomainClick(id, source);
                          }
                        }}
                  >
                    <div className="flex justify-between items-start">
                          <span className="font-medium text-teal-700">
                            {domain.data?.name || domain.name || domain.data?.db_id || domain.id || "Domaine sans nom"}
                      </span>
                          {(domain.data?.db_ns || domain.database) && (
                            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                              {domain.data?.db_ns || domain.database || 'INTERPRO'}
                        </span>
                      )}
                    </div>
                        {domain.description && (
                          <p className="text-gray-700 mt-1 text-xs">{domain.description}</p>
                    )}
                        {(domain.data?.db_id || domain.id) && (
                          <p className="text-gray-500 mt-1 text-xs">ID: {domain.data?.db_id || domain.id}</p>
                    )}
                  </div>
                ))}
                    
                    {searchFilter && filterItems(domains, (domain) => `${domain.data?.name || domain.name || ''} ${domain.data?.db_id || domain.id || ''} ${domain.data?.db_ns || domain.database || ''}`).length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">Aucun domaine ne correspond à votre recherche.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Onglet Enzymes */}
            {activeTab === 'enzymes' && (
              <div>
                {loadingEnzymes && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Chargement des activités enzymatiques...</p>
                  </div>
                )}
                
                {enzymeError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Impossible de charger les activités enzymatiques</p>
                    <p className="text-xs">{enzymeError}</p>
                    <button 
                      onClick={() => {
                        setLoadingEnzymes(true);
                        setEnzymeError(null);
                        fetch('/api/indra/enzymes', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            gene: ['HGNC', node.references?.HGNC]
                          })
                        })
                        .then(response => {
                          if (!response.ok) throw new Error(`Erreur: ${response.status}`);
                          return response.json();
                        })
                        .then(data => {
                          setEnzymes(data || []);
                        })
                        .catch(error => {
                          console.error('Erreur lors du rechargement des activités enzymatiques:', error);
                          setEnzymeError(`${error.name}: ${error.message}`);
                        })
                        .finally(() => {
                          setLoadingEnzymes(false);
                        });
                      }}
                      className="mt-2 text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
                
                {!loadingEnzymes && !enzymeError && enzymes.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Aucune activité enzymatique trouvée pour ce gène.</p>
                    <p className="text-xs text-gray-500 mt-1">Les activités enzymatiques représentent les réactions catalysées par les protéines codées par ce gène.</p>
                  </div>
                )}
                
                {!loadingEnzymes && !enzymeError && enzymes.length > 0 && (
                  <div className="space-y-2">
                    {filterItems(
                      enzymes,
                      (enzyme) => `${enzyme.data?.name || enzyme.name || ''} ${enzyme.data?.db_id || enzyme.id || ''} ${enzyme.description || ''}`
                    ).map((enzyme, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-indigo-50 cursor-pointer"
                        onClick={() => {
                          const id = enzyme.data?.db_id || enzyme.id;
                          if (id) {
                            handleEnzymeClick(id);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-indigo-700">
                            {enzyme.data?.name || enzyme.name || `EC ${enzyme.data?.db_id || enzyme.id}`}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            EC
                          </span>
                        </div>
                        {enzyme.description && (
                          <p className="text-gray-700 mt-1 text-xs">{enzyme.description}</p>
                        )}
                        {(enzyme.data?.db_id || enzyme.id) && (
                          <p className="text-gray-500 mt-1 text-xs">Code EC: {enzyme.data?.db_id || enzyme.id}</p>
                        )}
                      </div>
                    ))}
                    
                    {searchFilter && filterItems(enzymes, (enzyme) => `${enzyme.data?.name || enzyme.name || ''} ${enzyme.data?.db_id || enzyme.id || ''} ${enzyme.description || ''}`).length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">Aucune enzyme ne correspond à votre recherche.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Onglet Lignées cellulaires */}
            {activeTab === 'celllines' && (
              <div>
                {loadingCellLines && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Chargement des lignées cellulaires...</p>
                  </div>
                )}
                
                {cellLineError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Impossible de charger les lignées cellulaires</p>
                    <p className="text-xs">{cellLineError}</p>
                    <button 
                      onClick={() => {
                        setLoadingCellLines(true);
                        setCellLineError(null);
                        fetch('/api/indra/celllines', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            gene: ['HGNC', node.references?.HGNC]
                          })
                        })
                        .then(response => {
                          if (!response.ok) throw new Error(`Erreur: ${response.status}`);
                          return response.json();
                        })
                        .then(data => {
                          setCellLines(data || []);
                        })
                        .catch(error => {
                          console.error('Erreur lors du rechargement des lignées cellulaires:', error);
                          setCellLineError(`${error.name}: ${error.message}`);
                        })
                        .finally(() => {
                          setLoadingCellLines(false);
                        });
                      }}
                      className="mt-2 text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
                
                {!loadingCellLines && !cellLineError && cellLines.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Aucune lignée cellulaire avec altération du nombre de copies trouvée pour ce gène.</p>
                    <p className="text-xs text-gray-500 mt-1">Les altérations du nombre de copies (CNA) indiquent des modifications dans le nombre de copies du gène dans ces lignées cellulaires.</p>
                  </div>
                )}
                
                {!loadingCellLines && !cellLineError && cellLines.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs text-purple-700">
                      {cellLines.length} lignées cellulaires trouvées avec altération du nombre de copies
                    </div>
                    
                    <div className="space-y-1">
                      {filterItems(
                        cellLines,
                        (cell) => `${cell.data?.db_id || cell.id || ''}`
                      ).map((cellLine, index) => {
                        const id = cellLine.data?.db_id;
                        if (!id) return null;
                        
                        // Extraire le tissu d'origine (généralement la partie après le premier "_")
                        const parts = id.split('_');
                        const cellLineName = parts[0];
                        const tissue = parts.slice(1).join(' ').replace(/_/g, ' '); // Remplacer les underscores par des espaces
                        
                        return (
                          <div 
                            key={index} 
                            className="bg-gray-50 border border-gray-200 px-3 py-2 rounded text-sm hover:bg-purple-50 cursor-pointer"
                            onClick={() => handleCellLineClick(id)}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-purple-700">{cellLineName}</span>
                              {tissue && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                  {tissue}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 mt-1 text-xs">ID: {id}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    {searchFilter && filterItems(cellLines, (cell) => `${cell.data?.db_id || cell.id || ''}`).length === 0 && (
                      <p className="text-sm text-gray-500 mt-2">Aucune lignée cellulaire ne correspond à votre recherche.</p>
                    )}
                    
                    <p className="text-xs text-purple-700 mt-2">
                      Cliquez sur une lignée cellulaire pour accéder à ses informations dans Cellosaurus.
                </p>
              </div>
            )}
          </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-3 bg-gray-100 text-xs text-gray-700 border-t mt-auto">
        Cliquez sur un élément pour ouvrir sa référence dans sa base de données
      </div>
    </div>
  );
} 