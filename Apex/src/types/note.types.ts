export type BlockType = 'text' | 'checklist' | 'heading' | 'list' | 'divider' | 'callout' | 'link' | 'embed' | 'table' | 'links';

export interface BaseBlock {
  id: string;
  type: BlockType;
  createdAt: number;  // Timestamp em vez de Date
  updatedAt: number;  // Timestamp em vez de Date
  order: number;
  parentId?: string;
  selected?: boolean; // Estado de seleção do bloco
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  links?: NoteLink[]; // [[links]] encontrados no texto
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistBlock extends BaseBlock {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3;
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  items: string[];
  ordered: boolean;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  content: string;
  icon?: string;
  color?: string;
}

export interface LinkBlock extends BaseBlock {
  type: 'link';
  targetNoteId: string;
  targetBlockId?: string;
  displayText?: string;
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  targetNoteId: string;
  targetBlockId?: string;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

/**
 * 🆕 ETAPA 7: Bloco de Links/Referências
 * Substitui o sistema antigo de links bidirecionais
 */
export interface LinksBlock extends BaseBlock {
  type: 'links';
  noteRefs: string[]; // Array de IDs de notas referenciadas
}

export type Block =
  | TextBlock
  | ChecklistBlock
  | HeadingBlock
  | ListBlock
  | DividerBlock
  | CalloutBlock
  | LinkBlock
  | EmbedBlock
  | TableBlock
  | LinksBlock;

export interface NoteLink {
  id: string;
  text: string; // Texto do link [[texto]]
  targetNoteId?: string; // ID da nota (quando resolvido)
  type: 'direct' | 'reference'; // [[link]] ou ((ref))
  position: { start: number; end: number }; // Posição no texto
}

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  tags: string[];
  createdAt: number;  // Timestamp em vez de Date
  updatedAt: number;  // Timestamp em vez de Date
  color?: string;
  // backlinks e connections removidos - serão calculados

  // 🆕 CAMPOS DE HIERARQUIA (todos opcionais para compatibilidade)
  parentId?: string;           // ID do ambiente pai
  childrenIds?: string[];      // IDs dos filhos diretos
  depth?: number;              // Profundidade na árvore (0 = raiz)
  path?: string[];             // [rootId, ...ancestorIds, parentId]
  isRoot?: boolean;            // Cache: se é raiz
  hierarchyOrder?: number;     // Ordem entre irmãos (para sorting)
}

export interface NoteConnection {
  fromNoteId: string;
  toNoteId: string;
  linkType: 'direct' | 'reference' | 'tag';
  createdAt: number;  // Timestamp em vez de Date
}

// 🆕 NOVOS TIPOS PARA HIERARQUIA

/**
 * Relação de hierarquia entre duas notas (parent-child)
 */
export interface HierarchyRelation {
  id: string;
  parentId: string;
  childId: string;
  order: number;               // Ordem entre irmãos
  createdAt: number;
  type: 'explicit' | 'implicit'; // Explícito (usuário define) ou Implícito (inferido de links)
}

/**
 * Metadados calculados de hierarquia de uma nota
 */
export interface HierarchyMetadata {
  depth: number;
  path: string[];
  childrenCount: number;
  descendantsCount: number;
  isRoot: boolean;
  isLeaf: boolean;
  hasParent: boolean;
}

/**
 * Sugestão de hierarquia (para auto-detecção)
 */
export interface HierarchySuggestion {
  childId: string;
  childTitle: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

// Tipos auxiliares
export type HierarchyType = 'explicit' | 'implicit';
export type HierarchyLevel = 0 | 1 | 2 | 3 | 4 | 5; // Profundidade máxima: 5

// View Model - usado na UI com campos calculados
export interface NoteViewModel extends Note {
  backlinks: string[];     // Calculado: IDs de notas que linkam para esta
  connections: number;     // Calculado: Número total de conexões

  // 🆕 HIERARQUIA (populado dinamicamente)
  parent?: Note;               // Ambiente pai
  children?: Note[];           // Filhos diretos
  siblings?: Note[];           // Irmãos (mesmo parent)
  ancestors?: Note[];          // Caminho até raiz
  descendants?: Note[];        // Todos os descendentes

  // 🆕 METADADOS (calculados)
  metadata?: HierarchyMetadata;
}
