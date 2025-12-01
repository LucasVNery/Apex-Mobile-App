/**
 * Constantes de animações do app
 */

export const ANIMATION_CONFIG = {
  /**
   * Animações do grafo
   */
  graph: {
    /**
     * Delay entre animação de cada nó (ms)
     */
    nodeStaggerDelay: 20,

    /**
     * Duração do fade in (ms)
     */
    fadeDuration: 400,

    /**
     * Damping da animação spring
     */
    springDamping: 15,

    /**
     * Stiffness da animação spring
     */
    springStiffness: 150,
  },

  /**
   * Animações de modais
   */
  modal: {
    /**
     * Duração do slide (ms)
     */
    slideDuration: 300,

    /**
     * Duração do fade (ms)
     */
    fadeDuration: 200,
  },

  /**
   * Animações de transição de telas
   */
  screen: {
    /**
     * Duração da transição (ms)
     */
    transitionDuration: 250,
  },

  /**
   * Delays comuns
   */
  delays: {
    /**
     * Delay antes de navegar após seleção (ms)
     */
    navigationDelay: 300,

    /**
     * Delay para debounce de busca (ms)
     */
    searchDebounce: 300,
  },
} as const;

/**
 * Configurações de zoom do grafo
 */
export const ZOOM_CONFIG = {
  /**
   * Zoom mínimo permitido
   */
  min: 0.5,

  /**
   * Zoom máximo permitido
   */
  max: 3,

  /**
   * Incremento/decremento do zoom
   */
  step: 0.3,

  /**
   * Zoom padrão
   */
  default: 1,
} as const;
