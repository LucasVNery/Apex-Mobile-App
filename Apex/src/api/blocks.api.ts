import { get, post, put, patch, del } from './axiosConfig';
import type { Block, BlockType } from '../types/note.types';

/**
 * Interface para criação de bloco
 */
export interface CreateBlockDto {
  noteId: string;
  type: BlockType;
  content?: any;
  order: number;
  parentId?: string;
  metadata?: any;
}

/**
 * Interface para atualização de bloco
 */
export interface UpdateBlockDto {
  type?: BlockType;
  content?: any;
  order?: number;
  parentId?: string;
  metadata?: any;
  selected?: boolean;
}

/**
 * Interface para mover blocos entre notas
 */
export interface MoveBlockDto {
  targetNoteId: string;
  order?: number;
}

/**
 * Interface para reordenar blocos
 */
export interface ReorderBlockDto {
  newOrder: number;
}

/**
 * API de Blocos
 */
export const blocksApi = {
  /**
   * Busca todos os blocos de uma nota
   */
  getByNoteId: async (noteId: string) => {
    return get<Block[]>(`/blocks/note/${noteId}`);
  },

  /**
   * Busca um bloco específico por ID
   */
  getById: async (id: string) => {
    return get<Block>(`/blocks/${id}`);
  },

  /**
   * Cria um novo bloco
   */
  create: async (data: CreateBlockDto) => {
    return post<Block>('/blocks', data);
  },

  /**
   * Cria múltiplos blocos de uma vez
   */
  createBatch: async (blocks: CreateBlockDto[]) => {
    return post<Block[]>('/blocks/batch', { blocks });
  },

  /**
   * Atualiza um bloco existente
   */
  update: async (id: string, data: UpdateBlockDto) => {
    return put<Block>(`/blocks/${id}`, data);
  },

  /**
   * Atualiza parcialmente um bloco
   */
  partialUpdate: async (id: string, data: Partial<UpdateBlockDto>) => {
    return patch<Block>(`/blocks/${id}`, data);
  },

  /**
   * Atualiza o conteúdo de um bloco
   */
  updateContent: async (id: string, content: any) => {
    return patch<Block>(`/blocks/${id}/content`, { content });
  },

  /**
   * Deleta um bloco
   */
  delete: async (id: string) => {
    return del<void>(`/blocks/${id}`);
  },

  /**
   * Deleta múltiplos blocos de uma vez
   */
  deleteBatch: async (ids: string[]) => {
    return del<void>('/blocks/batch', { data: { ids } });
  },

  /**
   * Move um bloco para outra nota
   */
  move: async (id: string, data: MoveBlockDto) => {
    return patch<Block>(`/blocks/${id}/move`, data);
  },

  /**
   * Reordena um bloco dentro da mesma nota
   */
  reorder: async (id: string, data: ReorderBlockDto) => {
    return patch<Block>(`/blocks/${id}/reorder`, data);
  },

  /**
   * Reordena múltiplos blocos de uma vez
   */
  reorderBatch: async (updates: Array<{ id: string; order: number }>) => {
    return patch<Block[]>('/blocks/reorder-batch', { updates });
  },

  /**
   * Duplica um bloco
   */
  duplicate: async (id: string) => {
    return post<Block>(`/blocks/${id}/duplicate`);
  },

  /**
   * Busca blocos por tipo
   */
  getByType: async (noteId: string, type: BlockType) => {
    return get<Block[]>(`/blocks/note/${noteId}/type/${type}`);
  },

  /**
   * Busca blocos selecionados em uma nota
   */
  getSelected: async (noteId: string) => {
    return get<Block[]>(`/blocks/note/${noteId}/selected`);
  },

  /**
   * Marca/desmarca bloco como selecionado
   */
  toggleSelection: async (id: string) => {
    return patch<Block>(`/blocks/${id}/select`);
  },

  /**
   * Seleciona múltiplos blocos
   */
  selectMultiple: async (ids: string[]) => {
    return patch<Block[]>('/blocks/select-multiple', { ids, selected: true });
  },

  /**
   * Desmarca múltiplos blocos
   */
  deselectMultiple: async (ids: string[]) => {
    return patch<Block[]>('/blocks/select-multiple', { ids, selected: false });
  },

  /**
   * Busca blocos com links
   */
  getWithLinks: async (noteId: string) => {
    return get<Block[]>(`/blocks/note/${noteId}/with-links`);
  },

  /**
   * Busca blocos que contêm uma tag específica
   */
  getByTag: async (noteId: string, tag: string) => {
    return get<Block[]>(`/blocks/note/${noteId}/tag/${encodeURIComponent(tag)}`);
  },

  /**
   * Busca blocos vazios em uma nota
   */
  getEmpty: async (noteId: string) => {
    return get<Block[]>(`/blocks/note/${noteId}/empty`);
  },

  /**
   * Remove blocos vazios de uma nota
   */
  cleanEmptyBlocks: async (noteId: string) => {
    return del<{ deletedCount: number }>(`/blocks/note/${noteId}/clean-empty`);
  },

  /**
   * Converte um bloco de um tipo para outro
   */
  convert: async (id: string, targetType: BlockType) => {
    return patch<Block>(`/blocks/${id}/convert`, { targetType });
  },

  /**
   * Mescla blocos consecutivos do mesmo tipo
   */
  merge: async (ids: string[]) => {
    return post<Block>('/blocks/merge', { ids });
  },

  /**
   * Divide um bloco em múltiplos blocos
   */
  split: async (id: string, splitPoints: number[]) => {
    return post<Block[]>(`/blocks/${id}/split`, { splitPoints });
  },

  /**
   * Busca estatísticas dos blocos de uma nota
   */
  getStats: async (noteId: string) => {
    return get<{
      total: number;
      byType: Record<BlockType, number>;
      withLinks: number;
      empty: number;
      wordCount: number;
    }>(`/blocks/note/${noteId}/stats`);
  },

  /**
   * Exporta blocos de uma nota (formato JSON)
   */
  export: async (noteId: string) => {
    return get<Block[]>(`/blocks/note/${noteId}/export`);
  },

  /**
   * Importa blocos para uma nota
   */
  import: async (noteId: string, blocks: Block[]) => {
    return post<Block[]>(`/blocks/note/${noteId}/import`, { blocks });
  },
};

export default blocksApi;
