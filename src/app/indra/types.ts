// Types pour les résultats INDRA
export interface Statement {
  id: string;
  type: string;
  evidence: {
    text: string;
    source_api: string;
    pmid: string;
  }[];
  obj: {
    name: string;
    db_refs?: Record<string, string>;
  };
  subj: {
    name: string;
    db_refs?: Record<string, string>;
  };
  belief?: number;
}

// Types pour le graphe de connaissances
export interface GraphNode {
  id: string;
  name: string;
  type: string;
  references?: Record<string, string>;
  count?: number;
  pmids?: string[];
  position?: {
    x: number;
    y: number;
  };
  // Propriétés pour d3-force
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  label: string;
  type: string;
  evidence?: string;
  pmid?: string;
  pmids?: string[];
  confidence?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
}

// Types pour les réponses API
export interface ApiResponse {
  statements: Record<string, Statement[]> | Statement[] | { statements: Statement[] };
  graph: GraphData;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
} 