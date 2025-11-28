export type BlockType = 'text' | 'checklist' | 'heading' | 'list' | 'divider' | 'callout' | 'link' | 'embed' | 'table';

export interface BaseBlock {
  id: string;
  type: BlockType;
  createdAt: number;  // Timestamp em vez de Date
  updatedAt: number;  // Timestamp em vez de Date
  order: number;
  parentId?: string;
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

export type Block =
  | TextBlock
  | ChecklistBlock
  | HeadingBlock
  | ListBlock
  | DividerBlock
  | CalloutBlock
  | LinkBlock
  | EmbedBlock
  | TableBlock;

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
}

export interface NoteConnection {
  fromNoteId: string;
  toNoteId: string;
  linkType: 'direct' | 'reference' | 'tag';
  createdAt: number;  // Timestamp em vez de Date
}

// View Model - usado na UI com campos calculados
export interface NoteViewModel extends Note {
  backlinks: string[];     // Calculado: IDs de notas que linkam para esta
  connections: number;     // Calculado: Número total de conexões
}
