/**
 * Tipos para representação de nós e arestas
 */
export type NodeType = 'root' | 'parent' | 'child' | 'orphan';
export type EdgeType = 'hierarchy' | 'link' | 'direct' | 'reference' | 'tag';

export interface GraphNode {
  id: string;
  noteId: string;
  title: string;
  connections: number; // Número de conexões
  tags: string[];
  x?: number; // Posição no grafo (calculada)
  y?: number;

  // 🆕 CAMPOS DE HIERARQUIA
  type?: NodeType;
  depth?: number;
  isRoot?: boolean;
  childrenCount?: number;
  color?: string;
  size?: number; // Raio do círculo
}

export interface GraphEdge {
  id: string;
  source: string; // noteId
  target: string; // noteId
  weight: number; // Força da conexão (número de links)
  type: 'direct' | 'reference' | 'tag' | 'hierarchy' | 'link'; // Tipo de conexão

  // 🆕 CAMPOS VISUAIS
  color?: string;
  width?: number;
  style?: 'solid' | 'dashed';
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];

  // 🆕 METADADOS DE HIERARQUIA
  width?: number;
  height?: number;
  rootNodes?: string[];
}

export interface GraphFilter {
  tags?: string[];
  minConnections?: number;
  noteIds?: string[];
  searchQuery?: string;
}

/**
 * Configurações de layout
 */
export interface LayoutConfig {
  levelSpacing: number;
  nodeSpacing: number;
  nodeSize: {
    root: number;
    parent: number;
    child: number;
    orphan: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/**
 * Cache de layout
 */
export interface LayoutCache {
  notesHash: string;
  graph: Graph;
  timestamp: number;
}

/**
 * Estatísticas do grafo
 */
export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  hierarchyEdges: number;
  linkEdges: number;
  rootCount: number;
  maxDepth: number;
  avgChildrenCount: number;
}
