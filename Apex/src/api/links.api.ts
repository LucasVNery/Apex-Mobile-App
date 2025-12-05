import { get, post, del } from './axiosConfig';
import type { NoteLink, NoteConnection } from '../types/note.types';

/**
 * Interface para criação de link
 */
export interface CreateLinkDto {
  blockId: string;
  sourceNoteId: string;
  targetNoteId?: string;
  text: string;
  type: 'direct' | 'reference';
  position: {
    start: number;
    end: number;
  };
}

/**
 * Interface para criação de conexão
 */
export interface CreateConnectionDto {
  fromNoteId: string;
  toNoteId: string;
  linkType: 'direct' | 'reference' | 'tag';
}

/**
 * API de Links
 */
export const linksApi = {
  /**
   * Busca todos os links de um bloco
   */
  getByBlockId: async (blockId: string) => {
    return get<NoteLink[]>(`/links/block/${blockId}`);
  },

  /**
   * Busca todos os links de uma nota
   */
  getByNoteId: async (noteId: string) => {
    return get<NoteLink[]>(`/links/note/${noteId}`);
  },

  /**
   * Busca um link específico por ID
   */
  getById: async (id: string) => {
    return get<NoteLink>(`/links/${id}`);
  },

  /**
   * Cria um novo link
   */
  create: async (data: CreateLinkDto) => {
    return post<NoteLink>('/links', data);
  },

  /**
   * Cria múltiplos links de uma vez
   */
  createBatch: async (links: CreateLinkDto[]) => {
    return post<NoteLink[]>('/links/batch', { links });
  },

  /**
   * Remove um link
   */
  delete: async (id: string) => {
    return del<void>(`/links/${id}`);
  },

  /**
   * Remove todos os links de um bloco
   */
  deleteByBlockId: async (blockId: string) => {
    return del<{ deletedCount: number }>(`/links/block/${blockId}`);
  },

  /**
   * Remove todos os links de uma nota
   */
  deleteByNoteId: async (noteId: string) => {
    return del<{ deletedCount: number }>(`/links/note/${noteId}`);
  },

  /**
   * Busca links não resolvidos (sem targetNoteId)
   */
  getUnresolved: async () => {
    return get<NoteLink[]>('/links/unresolved');
  },

  /**
   * Busca links não resolvidos de uma nota
   */
  getUnresolvedByNote: async (noteId: string) => {
    return get<NoteLink[]>(`/links/note/${noteId}/unresolved`);
  },

  /**
   * Resolve um link (conecta ao target)
   */
  resolve: async (id: string, targetNoteId: string) => {
    return post<NoteLink>(`/links/${id}/resolve`, { targetNoteId });
  },

  /**
   * Resolve todos os links não resolvidos possíveis
   */
  resolveAll: async () => {
    return post<{ resolvedCount: number }>('/links/resolve-all');
  },

  /**
   * Busca sugestões de links para um texto
   */
  getSuggestions: async (text: string) => {
    return get<Array<{ noteId: string; noteTitle: string; confidence: number }>>(
      `/links/suggest?text=${encodeURIComponent(text)}`
    );
  },

  /**
   * Extrai links de um texto
   */
  extractFromText: async (text: string, blockId: string, sourceNoteId: string) => {
    return post<NoteLink[]>('/links/extract', { text, blockId, sourceNoteId });
  },

  /**
   * Atualiza links de um bloco baseado no novo conteúdo
   */
  updateFromBlockContent: async (blockId: string, content: string) => {
    return post<NoteLink[]>(`/links/block/${blockId}/update`, { content });
  },

  /**
   * Busca estatísticas de links
   */
  getStats: async () => {
    return get<{
      total: number;
      resolved: number;
      unresolved: number;
      byType: Record<'direct' | 'reference', number>;
    }>('/links/stats');
  },
};

/**
 * API de Conexões
 */
export const connectionsApi = {
  /**
   * Busca todas as conexões
   */
  getAll: async () => {
    return get<NoteConnection[]>('/connections');
  },

  /**
   * Busca conexões de uma nota
   */
  getByNoteId: async (noteId: string) => {
    return get<NoteConnection[]>(`/connections/note/${noteId}`);
  },

  /**
   * Busca conexões entre duas notas
   */
  getBetweenNotes: async (noteId1: string, noteId2: string) => {
    return get<NoteConnection[]>(`/connections/between/${noteId1}/${noteId2}`);
  },

  /**
   * Cria uma nova conexão
   */
  create: async (data: CreateConnectionDto) => {
    return post<NoteConnection>('/connections', data);
  },

  /**
   * Remove uma conexão
   */
  delete: async (fromNoteId: string, toNoteId: string) => {
    return del<void>(`/connections/${fromNoteId}/${toNoteId}`);
  },

  /**
   * Remove todas as conexões de uma nota
   */
  deleteByNoteId: async (noteId: string) => {
    return del<{ deletedCount: number }>(`/connections/note/${noteId}`);
  },

  /**
   * Recalcula conexões de uma nota
   */
  recalculate: async (noteId: string) => {
    return post<NoteConnection[]>(`/connections/${noteId}/recalculate`);
  },

  /**
   * Recalcula todas as conexões
   */
  recalculateAll: async () => {
    return post<{ createdCount: number }>('/connections/recalculate-all');
  },

  /**
   * Busca conexões por tipo de link
   */
  getByType: async (linkType: 'direct' | 'reference' | 'tag') => {
    return get<NoteConnection[]>(`/connections/type/${linkType}`);
  },

  /**
   * Busca conexões bidirecionais (A->B e B->A)
   */
  getBidirectional: async () => {
    return get<Array<{
      note1: string;
      note2: string;
      connections: NoteConnection[];
    }>>('/connections/bidirectional');
  },

  /**
   * Busca estatísticas de conexões
   */
  getStats: async () => {
    return get<{
      total: number;
      byType: Record<'direct' | 'reference' | 'tag', number>;
      bidirectional: number;
      averagePerNote: number;
    }>('/connections/stats');
  },

  /**
   * Exporta todas as conexões
   */
  export: async () => {
    return get<NoteConnection[]>('/connections/export');
  },

  /**
   * Importa conexões
   */
  import: async (connections: NoteConnection[]) => {
    return post<{ importedCount: number }>('/connections/import', { connections });
  },
};

export default { linksApi, connectionsApi };
