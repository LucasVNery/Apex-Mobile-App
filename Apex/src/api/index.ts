/**
 * @fileoverview API Client - Exporta todas as APIs do Apex
 *
 * Este arquivo centraliza todas as APIs disponíveis na aplicação.
 * Use estas APIs para se comunicar com o backend.
 *
 * @example
 * ```typescript
 * import { api } from '@/api';
 *
 * // Criar uma nota
 * const response = await api.notes.create({
 *   title: 'Minha Nota',
 *   tags: ['importante']
 * });
 *
 * // Buscar grafo
 * const graph = await api.graph.getGraph();
 * ```
 */

// Configuração base
export {
  apiClient,
  get,
  post,
  put,
  patch,
  del,
  setAuthToken,
  clearAuthToken,
  type ApiResponse,
  type ApiError,
} from './axiosConfig';

// APIs
export { notesApi } from './notes.api';
export { blocksApi } from './blocks.api';
export { hierarchyApi } from './hierarchy.api';
export { linksApi, connectionsApi } from './links.api';
export { progressionApi, achievementsApi } from './progression.api';
export { graphApi } from './graph.api';

// Types exportados
export type {
  CreateNoteDto,
  UpdateNoteDto,
  NoteFilters,
  PaginatedResponse,
} from './notes.api';

export type {
  CreateBlockDto,
  UpdateBlockDto,
  MoveBlockDto,
  ReorderBlockDto,
} from './blocks.api';

export type {
  CreateHierarchyDto,
  UpdateHierarchyDto,
  HierarchyTree,
} from './hierarchy.api';

export type {
  CreateLinkDto,
  CreateConnectionDto,
} from './links.api';

export type {
  UpdateProgressionDto,
  IncrementProgressionDto,
  CreateAchievementDto,
} from './progression.api';

export type {
  UpdateNodeDto,
  ForceLayoutConfig,
} from './graph.api';

/**
 * API Client consolidado
 *
 * Objeto que agrupa todas as APIs em um único namespace
 */
export const api = {
  /** API de Notas - CRUD completo, busca, hierarquia */
  notes: notesApi,

  /** API de Blocos - Conteúdo das notas */
  blocks: blocksApi,

  /** API de Hierarquia - Relações parent-child */
  hierarchy: hierarchyApi,

  /** API de Links - Links [[]] entre notas */
  links: linksApi,

  /** API de Conexões - Conexões calculadas */
  connections: connectionsApi,

  /** API de Progressão - Sistema de níveis */
  progression: progressionApi,

  /** API de Achievements - Conquistas */
  achievements: achievementsApi,

  /** API de Grafo - Visualização e análise */
  graph: graphApi,
};

/**
 * Exportação padrão
 */
export default api;
