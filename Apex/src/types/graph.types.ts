export interface GraphNode {
  id: string;
  noteId: string;
  title: string;
  connections: number; // Número de conexões
  tags: string[];
  x?: number; // Posição no grafo (calculada)
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string; // noteId
  target: string; // noteId
  weight: number; // Força da conexão (número de links)
  type: 'direct' | 'reference' | 'tag'; // Tipo de conexão
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphFilter {
  tags?: string[];
  minConnections?: number;
  noteIds?: string[];
  searchQuery?: string;
}
