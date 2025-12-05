import { get, post, patch } from './axiosConfig';
import type { Graph, GraphNode, GraphEdge, GraphFilter, GraphStats, LayoutConfig } from '../types/graph.types';

/**
 * Interface para atualização de nó
 */
export interface UpdateNodeDto {
  x?: number;
  y?: number;
  color?: string;
  size?: number;
}

/**
 * Interface para configuração de força do layout
 */
export interface ForceLayoutConfig {
  strength?: number;
  distance?: number;
  iterations?: number;
}

/**
 * API de Grafos
 */
export const graphApi = {
  /**
   * Busca o grafo completo
   */
  getGraph: async (filters?: GraphFilter) => {
    const params = new URLSearchParams();
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.minConnections) params.append('minConnections', String(filters.minConnections));
    if (filters?.noteIds) params.append('noteIds', filters.noteIds.join(','));
    if (filters?.searchQuery) params.append('q', filters.searchQuery);

    const query = params.toString();
    return get<Graph>(`/graph${query ? `?${query}` : ''}`);
  },

  /**
   * Busca apenas os nós do grafo
   */
  getNodes: async (filters?: GraphFilter) => {
    const params = new URLSearchParams();
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.minConnections) params.append('minConnections', String(filters.minConnections));
    if (filters?.searchQuery) params.append('q', filters.searchQuery);

    const query = params.toString();
    return get<GraphNode[]>(`/graph/nodes${query ? `?${query}` : ''}`);
  },

  /**
   * Busca apenas as arestas do grafo
   */
  getEdges: async () => {
    return get<GraphEdge[]>('/graph/edges');
  },

  /**
   * Busca um nó específico
   */
  getNode: async (noteId: string) => {
    return get<GraphNode>(`/graph/nodes/${noteId}`);
  },

  /**
   * Atualiza um nó (posição, cor, tamanho)
   */
  updateNode: async (noteId: string, data: UpdateNodeDto) => {
    return patch<GraphNode>(`/graph/nodes/${noteId}`, data);
  },

  /**
   * Busca os vizinhos de um nó (nós conectados)
   */
  getNeighbors: async (noteId: string) => {
    return get<GraphNode[]>(`/graph/nodes/${noteId}/neighbors`);
  },

  /**
   * Busca o subgrafo de um nó (nó + vizinhos + conexões)
   */
  getSubgraph: async (noteId: string, depth: number = 1) => {
    return get<Graph>(`/graph/nodes/${noteId}/subgraph?depth=${depth}`);
  },

  /**
   * Busca o caminho mais curto entre dois nós
   */
  getShortestPath: async (sourceId: string, targetId: string) => {
    return get<{
      path: string[];
      length: number;
      exists: boolean;
    }>(`/graph/path/${sourceId}/${targetId}`);
  },

  /**
   * Busca todos os caminhos entre dois nós
   */
  getAllPaths: async (sourceId: string, targetId: string, maxLength?: number) => {
    const params = maxLength ? `?maxLength=${maxLength}` : '';
    return get<Array<{
      path: string[];
      length: number;
    }>>(`/graph/paths/${sourceId}/${targetId}${params}`);
  },

  /**
   * Busca nós por profundidade hierárquica
   */
  getByDepth: async (depth: number) => {
    return get<GraphNode[]>(`/graph/depth/${depth}`);
  },

  /**
   * Busca nós raiz (sem parent)
   */
  getRootNodes: async () => {
    return get<GraphNode[]>('/graph/roots');
  },

  /**
   * Busca nós órfãos (sem conexões)
   */
  getOrphanNodes: async () => {
    return get<GraphNode[]>('/graph/orphans');
  },

  /**
   * Busca nós mais conectados (hubs)
   */
  getHubs: async (limit: number = 10) => {
    return get<GraphNode[]>(`/graph/hubs?limit=${limit}`);
  },

  /**
   * Busca clusters/comunidades no grafo
   */
  getClusters: async () => {
    return get<Array<{
      id: string;
      nodes: string[];
      size: number;
    }>>('/graph/clusters');
  },

  /**
   * Calcula layout hierárquico do grafo
   */
  calculateHierarchicalLayout: async (config?: LayoutConfig) => {
    return post<Graph>('/graph/layout/hierarchical', config);
  },

  /**
   * Calcula layout de força (force-directed)
   */
  calculateForceLayout: async (config?: ForceLayoutConfig) => {
    return post<Graph>('/graph/layout/force', config);
  },

  /**
   * Calcula layout circular
   */
  calculateCircularLayout: async () => {
    return post<Graph>('/graph/layout/circular');
  },

  /**
   * Recalcula todo o grafo (nós + arestas)
   */
  rebuild: async () => {
    return post<Graph>('/graph/rebuild');
  },

  /**
   * Recalcula apenas os nós
   */
  rebuildNodes: async () => {
    return post<GraphNode[]>('/graph/rebuild/nodes');
  },

  /**
   * Recalcula apenas as arestas
   */
  rebuildEdges: async () => {
    return post<GraphEdge[]>('/graph/rebuild/edges');
  },

  /**
   * Busca estatísticas do grafo
   */
  getStats: async () => {
    return get<GraphStats>('/graph/stats');
  },

  /**
   * Busca métricas de centralidade de um nó
   */
  getNodeCentrality: async (noteId: string) => {
    return get<{
      degree: number;
      betweenness: number;
      closeness: number;
      eigenvector: number;
    }>(`/graph/nodes/${noteId}/centrality`);
  },

  /**
   * Busca nós mais centrais
   */
  getCentralNodes: async (limit: number = 10, metric: 'degree' | 'betweenness' | 'closeness' = 'degree') => {
    return get<GraphNode[]>(`/graph/central?limit=${limit}&metric=${metric}`);
  },

  /**
   * Busca componentes conectados
   */
  getConnectedComponents: async () => {
    return get<Array<{
      id: string;
      nodes: string[];
      size: number;
    }>>('/graph/components');
  },

  /**
   * Verifica se o grafo é conexo
   */
  isConnected: async () => {
    return get<{ connected: boolean; components: number }>('/graph/connected');
  },

  /**
   * Busca densidade do grafo
   */
  getDensity: async () => {
    return get<{ density: number }>('/graph/density');
  },

  /**
   * Busca diâmetro do grafo
   */
  getDiameter: async () => {
    return get<{ diameter: number }>('/graph/diameter');
  },

  /**
   * Exporta o grafo (formato JSON)
   */
  export: async () => {
    return get<Graph>('/graph/export');
  },

  /**
   * Exporta em formato GraphML
   */
  exportGraphML: async () => {
    return get<string>('/graph/export/graphml');
  },

  /**
   * Exporta em formato DOT (Graphviz)
   */
  exportDOT: async () => {
    return get<string>('/graph/export/dot');
  },

  /**
   * Importa grafo
   */
  import: async (graph: Graph) => {
    return post<Graph>('/graph/import', graph);
  },

  /**
   * Busca mini-graph para uma nota (vizinhança próxima)
   */
  getMiniGraph: async (noteId: string, depth: number = 1) => {
    return get<Graph>(`/graph/mini/${noteId}?depth=${depth}`);
  },

  /**
   * Busca grafo filtrado por tags
   */
  getByTags: async (tags: string[]) => {
    return get<Graph>(`/graph/tags?tags=${tags.join(',')}`);
  },

  /**
   * Busca sugestões de conexões para uma nota
   */
  getSuggestedConnections: async (noteId: string, limit: number = 5) => {
    return get<Array<{
      noteId: string;
      noteTitle: string;
      score: number;
      reason: string;
    }>>(`/graph/nodes/${noteId}/suggestions?limit=${limit}`);
  },

  /**
   * Limpa o cache do grafo
   */
  clearCache: async () => {
    return post<void>('/graph/cache/clear');
  },

  /**
   * Busca informações do cache
   */
  getCacheInfo: async () => {
    return get<{
      cached: boolean;
      timestamp: number;
      size: number;
    }>('/graph/cache/info');
  },
};

export default graphApi;
