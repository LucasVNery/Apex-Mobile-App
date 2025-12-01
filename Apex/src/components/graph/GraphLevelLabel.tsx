import React from 'react';
import { Text as SvgText } from 'react-native-svg';
import { theme } from '@/src/theme';

interface GraphLevelLabelProps {
  /**
   * Número do nível (1-indexed: 1, 2, 3...)
   */
  level: number;

  /**
   * Posição Y do centro do nível
   */
  y: number;

  /**
   * Posição X (opcional, default: 10)
   */
  x?: number;
}

/**
 * 🆕 ETAPA 7: Label de nível no grafo
 * Renderiza "NÍVEL X" na esquerda de cada nível
 */
export default function GraphLevelLabel({ level, y, x = 10 }: GraphLevelLabelProps) {
  return (
    <SvgText
      x={x}
      y={y}
      fontSize={12}
      fill={theme.colors.text.tertiary}
      fontWeight="600"
      textAnchor="start"
      alignmentBaseline="middle"
    >
      NÍVEL {level}
    </SvgText>
  );
}
