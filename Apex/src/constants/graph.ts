/**
 * Constantes relacionadas à visualização em grafo
 */

import { DEPTH_COLORS, HIERARCHY_COLORS } from './hierarchy';

/**
 * Cores do grafo
 */
export const GRAPH_COLORS = {
  edges: {
    hierarchy: '#4A90E2',
    link: '#95A5A6',
    reference: '#9B59B6',
  },
  nodes: {
    byDepth: DEPTH_COLORS,
    orphan: HIERARCHY_COLORS.orphan,
    selected: '#FFD700',
  },
} as const;

/**
 * Tamanhos de nós por tipo
 */
export const NODE_SIZES = {
  root: 30,
  parent: 24,
  child: 18,
  orphan: 16,
} as const;

/**
 * Configuração de layout do grafo
 */
export const GRAPH_LAYOUT = {
  /**
   * Espaçamento vertical entre níveis (px)
   */
  levelSpacing: 150,

  /**
   * Espaçamento horizontal entre nós (px)
   */
  nodeSpacing: 100,

  /**
   * Margens do canvas
   */
  margin: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },

  /**
   * TTL do cache de layout (ms)
   */
  cacheTTL: 10000,
} as const;

/**
 * Configuração de zoom
 */
export const ZOOM_CONFIG = {
  min: 0.5,
  max: 3,
  step: 0.3,
  default: 1,
} as const;

/**
 * Estilos de arestas
 */
export const EDGE_STYLES = {
  hierarchy: {
    color: GRAPH_COLORS.edges.hierarchy,
    width: 2,
    opacity: 0.6,
    style: 'solid' as const,
  },
  link: {
    color: GRAPH_COLORS.edges.link,
    width: 1,
    opacity: 0.4,
    style: 'dashed' as const,
    dashArray: '5,5',
  },
} as const;
