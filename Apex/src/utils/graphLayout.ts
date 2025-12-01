import { Graph, GraphNode, LayoutConfig } from '@/src/types/graph.types';

/**
 * Configuração padrão de layout
 */
const DEFAULT_CONFIG: LayoutConfig = {
  levelSpacing: 150,
  nodeSpacing: 100,
  nodeSize: {
    root: 30,
    parent: 24,
    child: 18,
    orphan: 16,
  },
  margin: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 120, // Aumentado para dar espaço aos labels "NÍVEL X"
  },
};

/**
 * Aplica layout hierárquico ao grafo
 * Centraliza filhos em relação aos pais
 */
export function applyHierarchicalLayout(
  graph: Graph,
  config: LayoutConfig = DEFAULT_CONFIG
): Graph {
  const { nodes, edges } = graph;

  if (nodes.length === 0) {
    return { ...graph, width: 0, height: 0 };
  }

  // 1. Agrupar nós por profundidade
  const nodesByDepth = groupNodesByDepth(nodes);
  const maxDepth = Math.max(...nodes.map((n) => n.depth ?? 0));

  // 2. Calcular posições verticais (baseado em depth)
  const yPositions = calculateVerticalPositions(maxDepth, config);

  // 3. Criar mapa de relacionamentos pai-filho
  const childrenMap = buildChildrenMap(nodes, edges);

  // 4. Calcular posições horizontais usando algoritmo de árvore
  const positionedNodes = calculateTreeLayout(
    nodes,
    edges,
    childrenMap,
    nodesByDepth,
    yPositions,
    config
  );

  // 5. Calcular dimensões do canvas
  const width = calculateCanvasWidth(positionedNodes, config);
  const height = yPositions.get(maxDepth)! + config.margin.bottom;

  return {
    ...graph,
    nodes: positionedNodes,
    width,
    height,
  };
}

/**
 * Agrupa nós por profundidade
 */
function groupNodesByDepth(nodes: GraphNode[]): Map<number, GraphNode[]> {
  const map = new Map<number, GraphNode[]>();

  nodes.forEach((node) => {
    const depth = node.depth ?? 0;
    if (!map.has(depth)) {
      map.set(depth, []);
    }
    map.get(depth)!.push(node);
  });

  return map;
}

/**
 * Calcula posições verticais para cada nível
 */
function calculateVerticalPositions(
  maxDepth: number,
  config: LayoutConfig
): Map<number, number> {
  const positions = new Map<number, number>();

  for (let depth = 0; depth <= maxDepth; depth++) {
    positions.set(depth, config.margin.top + depth * config.levelSpacing);
  }

  return positions;
}

/**
 * Constrói mapa de filhos para cada nó
 */
function buildChildrenMap(
  nodes: GraphNode[],
  edges: { source: string; target: string }[]
): Map<string, string[]> {
  const childrenMap = new Map<string, string[]>();

  // Inicializar todos os nós
  nodes.forEach((node) => {
    childrenMap.set(node.id, []);
  });

  // Preencher com filhos
  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    children.push(edge.target);
    childrenMap.set(edge.source, children);
  });

  return childrenMap;
}

/**
 * Calcula layout em árvore com centralização de filhos
 */
function calculateTreeLayout(
  nodes: GraphNode[],
  edges: { source: string; target: string }[],
  childrenMap: Map<string, string[]>,
  nodesByDepth: Map<number, GraphNode[]>,
  yPositions: Map<number, number>,
  config: LayoutConfig
): GraphNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const positionedNodes = new Map<string, GraphNode>();

  // Encontrar nós raiz (depth = 0)
  const rootNodes = nodesByDepth.get(0) || [];

  // Posicionar nós raiz uniformemente
  let currentX = config.margin.left;
  rootNodes.forEach((rootNode, index) => {
    const subtreeWidth = calculateSubtreeWidth(rootNode.id, childrenMap, nodeMap, config);
    const nodeX = currentX + subtreeWidth / 2;

    positionedNodes.set(rootNode.id, {
      ...rootNode,
      x: nodeX,
      y: yPositions.get(0) || 0,
    });

    // Posicionar subárvore recursivamente
    positionSubtree(
      rootNode.id,
      nodeX,
      childrenMap,
      nodeMap,
      yPositions,
      positionedNodes,
      config
    );

    currentX += subtreeWidth + config.nodeSpacing;
  });

  // Converter para array
  return Array.from(positionedNodes.values());
}

/**
 * Calcula largura total da subárvore de um nó
 */
function calculateSubtreeWidth(
  nodeId: string,
  childrenMap: Map<string, string[]>,
  nodeMap: Map<string, GraphNode>,
  config: LayoutConfig
): number {
  const children = childrenMap.get(nodeId) || [];

  if (children.length === 0) {
    return config.nodeSpacing; // Largura mínima para nós folha
  }

  // Somar larguras de todas as subárvores filhas
  const childrenWidths = children.map((childId) =>
    calculateSubtreeWidth(childId, childrenMap, nodeMap, config)
  );

  const totalWidth = childrenWidths.reduce((sum, width) => sum + width, 0);

  // Adicionar espaçamento entre filhos
  const spacingWidth = (children.length - 1) * config.nodeSpacing;

  return Math.max(totalWidth + spacingWidth, config.nodeSpacing);
}

/**
 * Posiciona subárvore recursivamente centralizando filhos
 */
function positionSubtree(
  nodeId: string,
  parentX: number,
  childrenMap: Map<string, string[]>,
  nodeMap: Map<string, GraphNode>,
  yPositions: Map<number, number>,
  positionedNodes: Map<string, GraphNode>,
  config: LayoutConfig
): void {
  const children = childrenMap.get(nodeId) || [];

  if (children.length === 0) {
    return; // Nó folha, sem filhos para posicionar
  }

  // Calcular larguras de cada filho
  const childWidths = children.map((childId) =>
    calculateSubtreeWidth(childId, childrenMap, nodeMap, config)
  );

  // Calcular largura total dos filhos
  const totalWidth = childWidths.reduce((sum, width) => sum + width, 0);
  const totalSpacing = (children.length - 1) * config.nodeSpacing;
  const totalChildrenWidth = totalWidth + totalSpacing;

  // Posição inicial (centralizada em relação ao pai)
  let currentX = parentX - totalChildrenWidth / 2;

  children.forEach((childId, index) => {
    const childNode = nodeMap.get(childId);
    if (!childNode) return;

    const childWidth = childWidths[index];
    const childX = currentX + childWidth / 2;
    const childY = yPositions.get(childNode.depth ?? 0) || 0;

    // Posicionar filho
    positionedNodes.set(childId, {
      ...childNode,
      x: childX,
      y: childY,
    });

    // Posicionar subárvore do filho recursivamente
    positionSubtree(
      childId,
      childX,
      childrenMap,
      nodeMap,
      yPositions,
      positionedNodes,
      config
    );

    currentX += childWidth + config.nodeSpacing;
  });
}

/**
 * Calcula largura do canvas
 * Adiciona margem extra para garantir que todos os nós sejam visíveis
 */
function calculateCanvasWidth(
  nodes: GraphNode[],
  config: LayoutConfig
): number {
  if (nodes.length === 0) {
    return 400;
  }

  const maxX = Math.max(...nodes.map((n) => n.x ?? 0));
  const minX = Math.min(...nodes.map((n) => n.x ?? 0));

  // Adicionar margem extra para garantir espaço para todos os nós
  // Margem esquerda + largura dos nós + margem direita + margem extra
  const extraMargin = 200; // Margem extra de segurança
  const width = maxX - minX + config.margin.left + config.margin.right + extraMargin;

  return Math.max(width, 800); // Mínimo aumentado para 800px
}

/**
 * Layout alternativo: Force-Directed (para futuro)
 */
export function applyForceDirectedLayout(graph: Graph): Graph {
  // TODO: Implementar algoritmo force-directed
  // Para agora, retornar o mesmo grafo com layout hierárquico
  return applyHierarchicalLayout(graph);
}
