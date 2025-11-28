export type BlockType =
  | 'text'
  | 'heading'
  | 'list'
  | 'checkbox'
  | 'link'
  | 'embed'
  | 'table'
  | 'divider'
  | 'callout';

export type BlockContent = string | ListContent | TableContent | EmbedContent;

export interface ListContent {
  items: string[];
  ordered: boolean;
}

export interface TableContent {
  headers: string[];
  rows: string[][];
}

export interface EmbedContent {
  blockId: string;
  noteId: string;
}

export interface BlockMetadata {
  created: Date;
  updated: Date;
  backlinks: string[]; // IDs de blocos que linkam para este
  tags: string[];
  mentions: string[]; // IDs de usuários mencionados (futuro)
}

export interface SmartBlock {
  id: string;
  type: BlockType;
  content: BlockContent;
  connections: string[]; // IDs de notas conectadas via links
  metadata: BlockMetadata;
  order: number; // Posição no documento
  parentId?: string; // Para blocos aninhados
}

export interface BlockLink {
  id: string;
  sourceBlockId: string;
  targetNoteId: string;
  targetBlockId?: string; // Link para bloco específico
  linkText: string;
  type: 'direct' | 'reference' | 'embed'; // [[link]], ((ref)), ou embed
}
