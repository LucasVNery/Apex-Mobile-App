import { get, post, patch, del } from './axiosConfig';
import type { HierarchyRelation, HierarchySuggestion, HierarchyMetadata, Note } from '../types/note.types';

/**
 * Interface para criação de relação hierárquica
 */
export interface CreateHierarchyDto {
  parentId: string;
  childId: string;
  order?: number;
  type?: 'explicit' | 'implicit';
}

/**
 * Interface para atualização de relação hierárquica
 */
export interface UpdateHierarchyDto {
  order?: number;
  type?: 'explicit' | 'implicit';
}

/**
 * Interface para resposta de árvore hierárquica
 */
export interface HierarchyTree {
  note: Note;
  children: HierarchyTree[];
  metadata: HierarchyMetadata;
}

/**
 * API de Hierarquia
 */
export const hierarchyApi = {
  /**
   * Busca todas as relações hierárquicas
   */
  getAll: async () => {
    return get<HierarchyRelation[]>('/hierarchy');
  },

  /**
   * Busca uma relação hierárquica específica
   */
  getById: async (id: string) => {
    return get<HierarchyRelation>(`/hierarchy/${id}`);
  },

  /**
   * Cria uma nova relação hierárquica (parent-child)
   */
  create: async (data: CreateHierarchyDto) => {
    return post<HierarchyRelation>('/hierarchy', data);
  },

  /**
   * Atualiza uma relação hierárquica
   */
  update: async (id: string, data: UpdateHierarchyDto) => {
    return patch<HierarchyRelation>(`/hierarchy/${id}`, data);
  },

  /**
   * Remove uma relação hierárquica
   */
  delete: async (id: string) => {
    return del<void>(`/hierarchy/${id}`);
  },

  /**
   * Busca as relações onde a nota é parent
   */
  getAsParent: async (noteId: string) => {
    return get<HierarchyRelation[]>(`/hierarchy/parent/${noteId}`);
  },

  /**
   * Busca as relações onde a nota é child
   */
  getAsChild: async (noteId: string) => {
    return get<HierarchyRelation[]>(`/hierarchy/child/${noteId}`);
  },

  /**
   * Busca a árvore hierárquica completa a partir de uma raiz
   */
  getTree: async (rootId: string, maxDepth?: number) => {
    const params = maxDepth ? `?maxDepth=${maxDepth}` : '';
    return get<HierarchyTree>(`/hierarchy/tree/${rootId}${params}`);
  },

  /**
   * Busca todas as árvores hierárquicas (todas as raízes)
   */
  getAllTrees: async (maxDepth?: number) => {
    const params = maxDepth ? `?maxDepth=${maxDepth}` : '';
    return get<HierarchyTree[]>(`/hierarchy/trees${params}`);
  },

  /**
   * Busca o caminho de uma nota até a raiz
   */
  getPath: async (noteId: string) => {
    return get<Note[]>(`/hierarchy/${noteId}/path`);
  },

  /**
   * Busca os metadados de hierarquia de uma nota
   */
  getMetadata: async (noteId: string) => {
    return get<HierarchyMetadata>(`/hierarchy/${noteId}/metadata`);
  },

  /**
   * Move uma nota na hierarquia (muda o parent)
   */
  moveNote: async (noteId: string, newParentId: string | null, order?: number) => {
    return patch<Note>(`/hierarchy/${noteId}/move`, {
      parentId: newParentId,
      order,
    });
  },

  /**
   * Reordena uma nota entre seus irmãos
   */
  reorderNote: async (noteId: string, newOrder: number) => {
    return patch<HierarchyRelation>(`/hierarchy/${noteId}/reorder`, { order: newOrder });
  },

  /**
   * Valida se uma operação de mover nota é permitida
   */
  validateMove: async (noteId: string, targetParentId: string) => {
    return get<{
      valid: boolean;
      errors?: string[];
      warnings?: string[];
    }>(`/hierarchy/${noteId}/validate-move/${targetParentId}`);
  },

  /**
   * Busca sugestões de hierarquia para uma nota
   */
  getSuggestions: async (noteId: string) => {
    return get<HierarchySuggestion[]>(`/hierarchy/${noteId}/suggestions`);
  },

  /**
   * Aplica uma sugestão de hierarquia
   */
  applySuggestion: async (parentId: string, childId: string) => {
    return post<HierarchyRelation>('/hierarchy/apply-suggestion', {
      parentId,
      childId,
    });
  },

  /**
   * Converte relação implícita em explícita
   */
  makeExplicit: async (id: string) => {
    return patch<HierarchyRelation>(`/hierarchy/${id}/make-explicit`);
  },

  /**
   * Recalcula hierarquia de uma nota (depth, path, etc.)
   */
  recalculate: async (noteId: string) => {
    return post<Note>(`/hierarchy/${noteId}/recalculate`);
  },

  /**
   * Recalcula todas as hierarquias
   */
  recalculateAll: async () => {
    return post<{ updatedCount: number }>('/hierarchy/recalculate-all');
  },

  /**
   * Busca notas órfãs (sem parent e não são raízes)
   */
  getOrphans: async () => {
    return get<Note[]>('/hierarchy/orphans');
  },

  /**
   * Busca raízes da hierarquia
   */
  getRoots: async () => {
    return get<Note[]>('/hierarchy/roots');
  },

  /**
   * Busca folhas da hierarquia (notas sem filhos)
   */
  getLeaves: async () => {
    return get<Note[]>('/hierarchy/leaves');
  },

  /**
   * Busca estatísticas da hierarquia
   */
  getStats: async () => {
    return get<{
      totalRelations: number;
      totalRoots: number;
      totalOrphans: number;
      totalLeaves: number;
      averageDepth: number;
      maxDepth: number;
      byDepth: Record<number, number>;
    }>('/hierarchy/stats');
  },

  /**
   * Exporta a hierarquia completa
   */
  export: async () => {
    return get<HierarchyRelation[]>('/hierarchy/export');
  },

  /**
   * Importa hierarquia
   */
  import: async (relations: HierarchyRelation[]) => {
    return post<{ importedCount: number }>('/hierarchy/import', { relations });
  },
};

export default hierarchyApi;
