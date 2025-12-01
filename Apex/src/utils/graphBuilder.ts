import { Note } from '@/src/types/note.types';
import { Graph, GraphNode, GraphEdge, NodeType } from '@/src/types/graph.types';
import { isRoot } from './hierarchyHelpers';

/**
 * Converte notas em grafo com suporte a hierarquia
 */
export function buildGraphFromNotes(notes: Note[]): Graph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const rootNodes: string[] = [];

  // 1. Criar nós
  notes.forEach((note) => {
    const nodeType = determineNodeType(note);
    const node: GraphNode = {
      id: note.id,
      noteId: note.id,
      title: note.title,
      connections: 0, // Será calculado depois
      tags: note.tags,
      x: 0, // Será calculado pelo layout
      y: 0,

      // Campos de hierarquia
      type: nodeType,
      depth: note.depth ?? 0,
      isRoot: note.isRoot ?? !note.parentId,
      childrenCount: note.childrenIds?.length ?? 0,
      color: getNodeColor(nodeType, note.depth ?? 0),
      size: getNodeSize(nodeType),
    };

    nodes.push(node);

    if (node.isRoot) {
      rootNodes.push(node.id);
    }
  });

  // 2. Criar arestas de hierarquia
  notes.forEach((note) => {
    if (note.childrenIds) {
      note.childrenIds.forEach((childId) => {
        edges.push({
          id: `hierarchy-${note.id}-${childId}`,
          source: note.id,
          target: childId,
          weight: 2, // Peso maior para hierarquia
          type: 'hierarchy',
          color: '#4A90E2',
          width: 2,
          style: 'solid',
        });
      });
    }
  });

  // 3. Criar arestas de links
  notes.forEach((note) => {
    note.blocks.forEach((block) => {
      if (block.type === 'text' && block.links) {
        block.links.forEach((link) => {
          if (link.targetNoteId) {
            // Só adicionar se não for relação de hierarquia
            const isHierarchyEdge = edges.some(
              (e) =>
                e.type === 'hierarchy' &&
                e.source === note.id &&
                e.target === link.targetNoteId
            );

            if (!isHierarchyEdge) {
              edges.push({
                id: `link-${note.id}-${link.targetNoteId}-${Math.random()}`,
                source: note.id,
                target: link.targetNoteId,
                weight: 1,
                type: 'link',
                color: '#95A5A6',
                width: 1,
                style: 'dashed',
              });
            }
          }
        });
      }
    });
  });

  // 4. Calcular número de conexões para cada nó
  nodes.forEach((node) => {
    const connectedEdges = edges.filter(
      (e) => e.source === node.id || e.target === node.id
    );
    node.connections = connectedEdges.length;
  });

  return {
    nodes,
    edges,
    width: 0, // Será calculado pelo layout
    height: 0,
    rootNodes,
  };
}

/**
 * Determina tipo do nó baseado na hierarquia
 */
function determineNodeType(note: Note): NodeType {
  const isRootNode = note.isRoot ?? !note.parentId;
  const hasChildren = (note.childrenIds?.length ?? 0) > 0;
  const hasParent = !!note.parentId;

  if (isRootNode) return 'root';
  if (hasChildren) return 'parent';
  if (hasParent) return 'child';
  return 'orphan';
}

/**
 * Cor do nó baseado em tipo e profundidade
 */
function getNodeColor(type: NodeType, depth: number): string {
  const depthColors = [
    '#4A90E2', // Depth 0 - Azul
    '#50C878', // Depth 1 - Verde
    '#F39C12', // Depth 2 - Laranja
    '#9B59B6', // Depth 3 - Roxo
    '#E74C3C', // Depth 4+ - Vermelho
  ];

  if (type === 'orphan') return '#95A5A6'; // Cinza para órfãos

  return depthColors[Math.min(depth, depthColors.length - 1)];
}

/**
 * Tamanho do nó baseado em tipo
 */
function getNodeSize(type: NodeType): number {
  const sizes: Record<NodeType, number> = {
    root: 30,
    parent: 24,
    child: 18,
    orphan: 16,
  };

  return sizes[type];
}
