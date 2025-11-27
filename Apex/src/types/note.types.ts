export type BlockType = 'text' | 'checklist' | 'heading';

export interface BaseBlock {
  id: string;
  type: BlockType;
  createdAt: Date;
  updatedAt: Date;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
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

export type Block = TextBlock | ChecklistBlock | HeadingBlock;

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  color?: string;
}

export interface NoteConnection {
  fromNoteId: string;
  toNoteId: string;
  createdAt: Date;
}
