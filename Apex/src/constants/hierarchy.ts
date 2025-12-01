/**
 * Constantes relacionadas ao sistema de hierarquia de notas
 */

export const HIERARCHY_CONFIG = {
  /**
   * 🆕 ETAPA 7: Profundidade máxima REMOVIDA (ilimitada)
   * Usuário pode criar quantos níveis quiser
   */
  MAX_DEPTH: Infinity,

  /**
   * Profundidade máxima para UI (removido - sem limite)
   */
  MAX_DEPTH_UI: Infinity,

  /**
   * Limite de iterações para prevenir loops infinitos
   */
  ITERATION_LIMIT: 1000, // Aumentado para suportar hierarquias profundas

  /**
   * Tempo de vida do cache de ViewModels (ms)
   */
  CACHE_TTL: 5000,

  /**
   * Tamanho máximo do cache de ViewModels
   */
  CACHE_MAX_SIZE: 100,

  /**
   * 🆕 ETAPA 7: Espaçamento entre níveis no grafo (px)
   * Igual ao tamanho do nó para manter proporção
   */
  LEVEL_SPACING: 150,
} as const;

/**
 * Cores por profundidade de hierarquia
 * 🆕 ETAPA 7: Expandido para suportar mais níveis
 */
export const HIERARCHY_COLORS = {
  depth0: '#4A90E2', // Azul - Raiz (Nível 1)
  depth1: '#50C878', // Verde (Nível 2)
  depth2: '#F39C12', // Laranja (Nível 3)
  depth3: '#9B59B6', // Roxo (Nível 4)
  depth4: '#E74C3C', // Vermelho (Nível 5)
  depth5: '#1ABC9C', // Turquesa (Nível 6)
  depth6: '#E67E22', // Laranja escuro (Nível 7)
  depth7: '#3498DB', // Azul claro (Nível 8)
  depth8: '#2ECC71', // Verde claro (Nível 9)
  depth9Plus: '#95A5A6', // Cinza (Nível 10+)
  orphan: '#BDC3C7', // Cinza claro - Órfãos
} as const;

/**
 * Array de cores por profundidade (para acesso por índice)
 * 🆕 ETAPA 7: Cores rotativas para níveis ilimitados
 */
export const DEPTH_COLORS = [
  HIERARCHY_COLORS.depth0,
  HIERARCHY_COLORS.depth1,
  HIERARCHY_COLORS.depth2,
  HIERARCHY_COLORS.depth3,
  HIERARCHY_COLORS.depth4,
  HIERARCHY_COLORS.depth5,
  HIERARCHY_COLORS.depth6,
  HIERARCHY_COLORS.depth7,
  HIERARCHY_COLORS.depth8,
  HIERARCHY_COLORS.depth9Plus,
] as const;

/**
 * Obtém a cor baseada na profundidade
 * 🆕 ETAPA 7: Rotação de cores para níveis > 9
 */
export const getColorByDepth = (depth: number): string => {
  // Para níveis além do array, rotaciona as cores (ex: nível 10 usa cor do nível 0)
  if (depth >= DEPTH_COLORS.length) {
    return DEPTH_COLORS[depth % DEPTH_COLORS.length];
  }
  return DEPTH_COLORS[depth];
};
