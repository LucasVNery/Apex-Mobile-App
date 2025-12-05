import { get, post, patch } from './axiosConfig';
import type { ProgressionState, Achievement, Feature, FeatureLevel } from '../types/progression.types';

/**
 * Interface para atualização de progressão
 */
export interface UpdateProgressionDto {
  notesCreated?: number;
  linksCreated?: number;
  blocksUsed?: number;
  tagsUsed?: number;
  graphInteractions?: number;
}

/**
 * Interface para incrementar contadores
 */
export interface IncrementProgressionDto {
  notesCreated?: number;
  linksCreated?: number;
  blocksUsed?: number;
  tagsUsed?: number;
  graphInteractions?: number;
}

/**
 * Interface para criar achievement
 */
export interface CreateAchievementDto {
  title: string;
  description: string;
  icon: string;
  category?: string;
}

/**
 * API de Progressão
 */
export const progressionApi = {
  /**
   * Busca o estado de progressão do usuário
   */
  get: async () => {
    return get<ProgressionState>('/progression');
  },

  /**
   * Atualiza o estado de progressão
   */
  update: async (data: UpdateProgressionDto) => {
    return patch<ProgressionState>('/progression', data);
  },

  /**
   * Incrementa contadores de progressão
   */
  increment: async (data: IncrementProgressionDto) => {
    return patch<ProgressionState>('/progression/increment', data);
  },

  /**
   * Incrementa contador de notas criadas
   */
  incrementNotes: async (count: number = 1) => {
    return patch<ProgressionState>('/progression/increment/notes', { count });
  },

  /**
   * Incrementa contador de links criados
   */
  incrementLinks: async (count: number = 1) => {
    return patch<ProgressionState>('/progression/increment/links', { count });
  },

  /**
   * Incrementa contador de blocos usados
   */
  incrementBlocks: async (count: number = 1) => {
    return patch<ProgressionState>('/progression/increment/blocks', { count });
  },

  /**
   * Incrementa contador de tags usadas
   */
  incrementTags: async (count: number = 1) => {
    return patch<ProgressionState>('/progression/increment/tags', { count });
  },

  /**
   * Incrementa contador de interações com o grafo
   */
  incrementGraphInteractions: async (count: number = 1) => {
    return patch<ProgressionState>('/progression/increment/graph', { count });
  },

  /**
   * Busca o nível atual do usuário
   */
  getLevel: async () => {
    return get<{ level: FeatureLevel }>('/progression/level');
  },

  /**
   * Calcula e atualiza o nível baseado nos contadores
   */
  calculateLevel: async () => {
    return post<{ level: FeatureLevel; changed: boolean }>('/progression/calculate-level');
  },

  /**
   * Busca as features desbloqueadas
   */
  getUnlockedFeatures: async () => {
    return get<Feature[]>('/progression/features');
  },

  /**
   * Verifica se uma feature está desbloqueada
   */
  isFeatureUnlocked: async (feature: Feature) => {
    return get<{ unlocked: boolean }>(`/progression/features/${feature}/unlocked`);
  },

  /**
   * Busca os requisitos para desbloquear uma feature
   */
  getFeatureRequirements: async (feature: Feature) => {
    return get<{
      feature: Feature;
      requiredLevel: FeatureLevel;
      requiredNotes?: number;
      requiredLinks?: number;
      currentNotes: number;
      currentLinks: number;
      unlocked: boolean;
      progress: number; // 0-100
    }>(`/progression/features/${feature}/requirements`);
  },

  /**
   * Busca todas as features disponíveis e seus requisitos
   */
  getAllFeatures: async () => {
    return get<Array<{
      feature: Feature;
      unlocked: boolean;
      progress: number;
      requirements: any;
    }>>('/progression/features/all');
  },

  /**
   * Desbloqueia uma feature manualmente (admin)
   */
  unlockFeature: async (feature: Feature) => {
    return post<ProgressionState>('/progression/features/unlock', { feature });
  },

  /**
   * Bloqueia uma feature (admin)
   */
  lockFeature: async (feature: Feature) => {
    return post<ProgressionState>('/progression/features/lock', { feature });
  },

  /**
   * Recalcula e atualiza features desbloqueadas
   */
  recalculateFeatures: async () => {
    return post<{
      unlocked: Feature[];
      newlyUnlocked: Feature[];
    }>('/progression/features/recalculate');
  },

  /**
   * Busca estatísticas de progressão
   */
  getStats: async () => {
    return get<{
      level: FeatureLevel;
      totalNotes: number;
      totalLinks: number;
      totalBlocks: number;
      totalTags: number;
      totalGraphInteractions: number;
      unlockedFeaturesCount: number;
      achievementsCount: number;
      progressToNextLevel: number; // 0-100
    }>('/progression/stats');
  },

  /**
   * Reseta a progressão (cuidado!)
   */
  reset: async () => {
    return post<ProgressionState>('/progression/reset');
  },
};

/**
 * API de Achievements (Conquistas)
 */
export const achievementsApi = {
  /**
   * Busca todas as conquistas
   */
  getAll: async () => {
    return get<Achievement[]>('/achievements');
  },

  /**
   * Busca uma conquista específica
   */
  getById: async (id: string) => {
    return get<Achievement>(`/achievements/${id}`);
  },

  /**
   * Cria uma nova conquista
   */
  create: async (data: CreateAchievementDto) => {
    return post<Achievement>('/achievements', data);
  },

  /**
   * Desbloqueia uma conquista
   */
  unlock: async (id: string) => {
    return post<Achievement>(`/achievements/${id}/unlock`);
  },

  /**
   * Remove uma conquista
   */
  delete: async (id: string) => {
    return post<void>(`/achievements/${id}`);
  },

  /**
   * Busca conquistas por categoria
   */
  getByCategory: async (category: string) => {
    return get<Achievement[]>(`/achievements/category/${category}`);
  },

  /**
   * Busca conquistas recentes
   */
  getRecent: async (limit: number = 5) => {
    return get<Achievement[]>(`/achievements/recent?limit=${limit}`);
  },

  /**
   * Verifica conquistas disponíveis para desbloquear
   */
  checkAvailable: async () => {
    return post<{
      available: Achievement[];
      unlocked: Achievement[];
    }>('/achievements/check');
  },

  /**
   * Busca estatísticas de conquistas
   */
  getStats: async () => {
    return get<{
      total: number;
      unlocked: number;
      locked: number;
      byCategory: Record<string, number>;
      recentlyUnlocked: Achievement[];
    }>('/achievements/stats');
  },

  /**
   * Lista todas as conquistas possíveis (incluindo bloqueadas)
   */
  getAvailable: async () => {
    return get<Array<{
      achievement: Achievement;
      unlocked: boolean;
      requirements?: string;
      progress?: number;
    }>>('/achievements/available');
  },
};

export default { progressionApi, achievementsApi };
