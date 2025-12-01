/**
 * Wrapper para Haptic Feedback
 * Fornece API mais limpa e consistente para feedback tátil
 */

import * as Haptics from 'expo-haptics';

/**
 * Feedback tátil de impacto
 */
export const haptic = {
  /**
   * Impacto leve - Para interações sutis
   * Exemplo: Scroll, pequenos taps
   */
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /**
   * Impacto médio - Para interações padrão
   * Exemplo: Botões, seleção de items
   */
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  /**
   * Impacto pesado - Para interações importantes
   * Exemplo: Confirmações, ações destrutivas
   */
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  /**
   * Notificação de sucesso
   * Exemplo: Operação completada com sucesso
   */
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  /**
   * Notificação de aviso
   * Exemplo: Validação falhada, estado inesperado
   */
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  /**
   * Notificação de erro
   * Exemplo: Operação falhada, erro crítico
   */
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  /**
   * Feedback de seleção
   * Exemplo: Mudar entre opções, toggle switches
   */
  selection: () => Haptics.selectionAsync(),
} as const;

/**
 * Alias para compatibilidade
 */
export const feedback = haptic;
