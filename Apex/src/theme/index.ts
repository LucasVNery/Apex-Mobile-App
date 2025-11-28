export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius } from './spacing';

export const theme = {
  colors: {
    background: {
      primary: '#121212',      // Fundo Principal Escuro
      secondary: '#1A1A1A',    // Variação para elementos secundários
      elevated: '#1C1C1C',     // Fundo de Cartão/Elemento
    },
    text: {
      primary: '#E0E0E0',      // Texto Principal Claro
      secondary: '#A0A0A0',    // Texto Secundário/Fosco
      tertiary: '#6B6B6B',     // Texto terciário (ainda mais fosco)
    },
    accent: {
      primary: '#4CAF50',      // Destaque/Acento Principal (Verde)
      secondary: '#66BB6A',    // Verde mais claro para variações
      success: '#4CAF50',      // Verde para sucesso
      warning: '#FF9800',      // Destaque Secundário (Laranja/Amarelo)
      error: '#F44336',        // Vermelho para erro/ações destrutivas
    },
    border: {
      light: '#2A2A2A',        // Bordas sutis no tema escuro
      medium: '#3A3A3A',       // Bordas mais visíveis
    },
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export type Theme = typeof theme;
