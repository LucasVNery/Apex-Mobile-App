/**
 * Logger utility para controlar logs baseado no ambiente
 * Em produção (__DEV__ = false), apenas erros são logados
 */

const isDev = __DEV__;

export const logger = {
  /**
   * Log informacional (apenas em desenvolvimento)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log de informação (apenas em desenvolvimento)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Log de warning (apenas em desenvolvimento)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log de erro (sempre logado, mesmo em produção)
   */
  error: (...args: any[]) => {
    console.error(...args);
    // TODO: Enviar para serviço de tracking de erros
    // if (!isDev) {
    //   ErrorTrackingService.captureException(args[0]);
    // }
  },

  /**
   * Group de logs (apenas em desenvolvimento)
   */
  group: (label: string) => {
    if (isDev) {
      console.group(label);
    }
  },

  /**
   * Group collapsed (apenas em desenvolvimento)
   */
  groupCollapsed: (label: string) => {
    if (isDev) {
      console.groupCollapsed(label);
    }
  },

  /**
   * Fim do group (apenas em desenvolvimento)
   */
  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },

  /**
   * Timer (apenas em desenvolvimento)
   */
  time: (label: string) => {
    if (isDev) {
      console.time(label);
    }
  },

  /**
   * Fim do timer (apenas em desenvolvimento)
   */
  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },

  /**
   * Table (apenas em desenvolvimento)
   */
  table: (data: any) => {
    if (isDev) {
      console.table(data);
    }
  },
} as const;
