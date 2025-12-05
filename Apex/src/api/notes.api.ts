import { get, post, put, patch, del } from './axiosConfig';
import type { Note, NoteConnection } from '../types/note.types';

/**
 * Interface para criação de nota
 */
export interface CreateNoteDto {
  title: string;
  tags?: string[];
  color?: string;
  parentId?: string;
  hierarchyOrder?: number;
}

/**
 * Interface para atualização de nota
 */
export interface UpdateNoteDto {
  title?: string;
  tags?: string[];
  color?: string;
  parentId?: string;
  hierarchyOrder?: number;
}

/**
 * Interface para filtros de busca
 */
export interface NoteFilters {
  search?: string;
  tags?: string[];
  parentId?: string;
  isRoot?: boolean;
  color?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface para resposta paginada
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * API de Notas
 */
export const notesApi = {
  /**
   * Lista todas as notas com filtros opcionais
   */
  getAll: async (filters?: NoteFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    if (filters?.parentId) params.append('parentId', filters.parentId);
    if (filters?.isRoot !== undefined) params.append('isRoot', String(filters.isRoot));
    if (filters?.color) params.append('color', filters.color);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return get<PaginatedResponse<Note>>(`/notes?${params.toString()}`);
  },

  /**
   * Busca uma nota específica por ID
   */
  getById: async (id: string) => {
    return get<Note>(`/notes/${id}`);
  },

  /**
   * Busca uma nota com todos os seus relacionamentos populados
   */
  getByIdWithRelations: async (id: string) => {
    return get<Note>(`/notes/${id}/full`);
  },

  /**
   * Cria uma nova nota
   */
  create: async (data: CreateNoteDto) => {
    return post<Note>('/notes', data);
  },

  /**
   * Atualiza uma nota existente
   */
  update: async (id: string, data: UpdateNoteDto) => {
    return put<Note>(`/notes/${id}`, data);
  },

  /**
   * Atualiza parcialmente uma nota
   */
  partialUpdate: async (id: string, data: Partial<UpdateNoteDto>) => {
    return patch<Note>(`/notes/${id}`, data);
  },

  /**
   * Deleta uma nota
   */
  delete: async (id: string) => {
    return del<void>(`/notes/${id}`);
  },

  /**
   * Busca notas raiz (sem parent)
   */
  getRoots: async () => {
    return get<Note[]>('/notes/roots');
  },

  /**
   * Busca os filhos de uma nota
   */
  getChildren: async (parentId: string) => {
    return get<Note[]>(`/notes/${parentId}/children`);
  },

  /**
   * Busca os ancestrais de uma nota (caminho até a raiz)
   */
  getAncestors: async (noteId: string) => {
    return get<Note[]>(`/notes/${noteId}/ancestors`);
  },

  /**
   * Busca os descendentes de uma nota (subárvore completa)
   */
  getDescendants: async (noteId: string) => {
    return get<Note[]>(`/notes/${noteId}/descendants`);
  },

  /**
   * Busca os irmãos de uma nota (mesma profundidade, mesmo parent)
   */
  getSiblings: async (noteId: string) => {
    return get<Note[]>(`/notes/${noteId}/siblings`);
  },

  /**
   * Busca as conexões de uma nota (links bidirecionais)
   */
  getConnections: async (noteId: string) => {
    return get<NoteConnection[]>(`/notes/${noteId}/connections`);
  },

  /**
   * Busca os backlinks de uma nota (notas que linkam para esta)
   */
  getBacklinks: async (noteId: string) => {
    return get<Note[]>(`/notes/${noteId}/backlinks`);
  },

  /**
   * Busca notas por tag
   */
  getByTag: async (tag: string) => {
    return get<Note[]>(`/notes/tag/${encodeURIComponent(tag)}`);
  },

  /**
   * Busca todas as tags únicas
   */
  getAllTags: async () => {
    return get<string[]>('/notes/tags');
  },

  /**
   * Busca sugestões de tags (autocomplete)
   */
  suggestTags: async (query: string) => {
    return get<string[]>(`/notes/tags/suggest?q=${encodeURIComponent(query)}`);
  },

  /**
   * Busca notas por texto (busca full-text)
   */
  search: async (query: string, limit?: number) => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', String(limit));
    return get<Note[]>(`/notes/search?${params.toString()}`);
  },

  /**
   * Move uma nota para outro parent (muda hierarquia)
   */
  move: async (noteId: string, newParentId: string | null, order?: number) => {
    return patch<Note>(`/notes/${noteId}/move`, {
      parentId: newParentId,
      hierarchyOrder: order,
    });
  },

  /**
   * Reordena uma nota entre seus irmãos
   */
  reorder: async (noteId: string, newOrder: number) => {
    return patch<Note>(`/notes/${noteId}/reorder`, { hierarchyOrder: newOrder });
  },

  /**
   * Duplica uma nota (com ou sem filhos)
   */
  duplicate: async (noteId: string, includeChildren: boolean = false) => {
    return post<Note>(`/notes/${noteId}/duplicate`, { includeChildren });
  },

  /**
   * Exporta uma nota (formato JSON)
   */
  export: async (noteId: string) => {
    return get<Note>(`/notes/${noteId}/export`);
  },

  /**
   * Importa uma nota (formato JSON)
   */
  import: async (data: Note, parentId?: string) => {
    return post<Note>('/notes/import', { note: data, parentId });
  },

  /**
   * Busca estatísticas de uma nota
   */
  getStats: async (noteId: string) => {
    return get<{
      blocksCount: number;
      linksCount: number;
      childrenCount: number;
      descendantsCount: number;
      backlinksCount: number;
      wordCount: number;
    }>(`/notes/${noteId}/stats`);
  },

  /**
   * Busca notas recentes
   */
  getRecent: async (limit: number = 10) => {
    return get<Note[]>(`/notes/recent?limit=${limit}`);
  },

  /**
   * Busca notas favoritas (por cor ou tag especial)
   */
  getFavorites: async () => {
    return get<Note[]>('/notes/favorites');
  },

  /**
   * Marca/desmarca nota como favorita
   */
  toggleFavorite: async (noteId: string) => {
    return patch<Note>(`/notes/${noteId}/favorite`);
  },
};

export default notesApi;
