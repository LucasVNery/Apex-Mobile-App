import { Graph, GraphNode, GraphEdge, GraphStats } from '@/src/types/graph.types';

/**
 * Encontra nó por ID
 */
export function findNode(graph: Graph, nodeId: string): GraphNode | undefined {
  return graph.nodes.find((n) => n.id === nodeId);
}

/**
 * Encontra arestas conectadas a um nó
 */
export function findConnectedEdges(graph: Graph, nodeId: string): GraphEdge[] {
  return graph.edges.filter(
    (e) => e.source === nodeId || e.target === nodeId
  );
}

/**
 * Encontra vizinhos de um nó
 */
export function findNeighbors(graph: Graph, nodeId: string): GraphNode[] {
  const edges = findConnectedEdges(graph, nodeId);
  const neighborIds = new Set<string>();

  edges.forEach((edge) => {
    if (edge.source === nodeId) {
      neighborIds.add(edge.target);
    } else {
      neighborIds.add(edge.source);
    }
  });

  return graph.nodes.filter((n) => neighborIds.has(n.id));
}

/**
 * Filtra grafo por profundidade
 */
export function filterGraphByDepth(graph: Graph, maxDepth: number): Graph {
  const filteredNodes = graph.nodes.filter((n) => (n.depth ?? 0) <= maxDepth);
  const nodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = graph.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return {
    ...graph,
    nodes: filteredNodes,
    edges: filteredEdges,
  };
}

/**
 * Filtra grafo por IDs de notas
 */
export function filterGraphByNoteIds(
  graph: Graph,
  noteIds: string[]
): Graph {
  const idSet = new Set(noteIds);
  const filteredNodes = graph.nodes.filter((n) => idSet.has(n.id));
  const nodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = graph.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return {
    ...graph,
    nodes: filteredNodes,
    edges: filteredEdges,
  };
}

/**
 * Filtra grafo por tipo de nó
 */
export function filterGraphByNodeType(
  graph: Graph,
  types: Array<'root' | 'parent' | 'child' | 'orphan'>
): Graph {
  const typeSet = new Set(types);
  const filteredNodes = graph.nodes.filter((n) => n.type && typeSet.has(n.type));
  const nodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = graph.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return {
    ...graph,
    nodes: filteredNodes,
    edges: filteredEdges,
  };
}

/**
 * Calcula estatísticas do grafo
 */
export function calculateGraphStats(graph: Graph): GraphStats {
  const hierarchyEdges = graph.edges.filter((e) => e.type === 'hierarchy').length;
  const linkEdges = graph.edges.filter((e) => e.type === 'link').length;
  const rootCount = graph.rootNodes?.length ?? 0;
  const maxDepth = Math.max(...graph.nodes.map((n) => n.depth ?? 0), 0);

  const totalChildren = graph.nodes.reduce(
    (sum, n) => sum + (n.childrenCount ?? 0),
    0
  );
  const avgChildrenCount = graph.nodes.length > 0
    ? totalChildren / graph.nodes.length
    : 0;

  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    hierarchyEdges,
    linkEdges,
    rootCount,
    maxDepth,
    avgChildrenCount,
  };
}

/**
 * Encontra caminho entre dois nós (BFS)
 */
export function findPath(
  graph: Graph,
  startId: string,
  endId: string
): GraphNode[] | null {
  if (startId === endId) {
    const node = findNode(graph, startId);
    return node ? [node] : null;
  }

  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; path: GraphNode[] }> = [];
  const startNode = findNode(graph, startId);

  if (!startNode) return null;

  queue.push({ nodeId: startId, path: [startNode] });
  visited.add(startId);

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;

    const neighbors = findNeighbors(graph, nodeId);

    for (const neighbor of neighbors) {
      if (neighbor.id === endId) {
        return [...path, neighbor];
      }

      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push({
          nodeId: neighbor.id,
          path: [...path, neighbor],
        });
      }
    }
  }

  return null; // Não há caminho
}

/**
 * Verifica se dois nós estão conectados
 */
export function areNodesConnected(
  graph: Graph,
  nodeId1: string,
  nodeId2: string
): boolean {
  return graph.edges.some(
    (e) =>
      (e.source === nodeId1 && e.target === nodeId2) ||
      (e.source === nodeId2 && e.target === nodeId1)
  );
}

/**
 * Obtém subgrafo de uma nota e seus descendentes
 */
export function getSubgraph(graph: Graph, rootNodeId: string): Graph {
  const rootNode = findNode(graph, rootNodeId);
  if (!rootNode) {
    return { nodes: [], edges: [], rootNodes: [] };
  }

  const nodeIds = new Set<string>([rootNodeId]);
  const toVisit = [rootNodeId];

  // BFS para coletar todos descendentes
  while (toVisit.length > 0) {
    const currentId = toVisit.shift()!;
    const children = graph.edges
      .filter((e) => e.type === 'hierarchy' && e.source === currentId)
      .map((e) => e.target);

    children.forEach((childId) => {
      if (!nodeIds.has(childId)) {
        nodeIds.add(childId);
        toVisit.push(childId);
      }
    });
  }

  const subgraphNodes = graph.nodes.filter((n) => nodeIds.has(n.id));
  const subgraphEdges = graph.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return {
    nodes: subgraphNodes,
    edges: subgraphEdges,
    rootNodes: [rootNodeId],
  };
}
