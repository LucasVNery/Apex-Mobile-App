import React from 'react';
import { Line } from 'react-native-svg';

interface GraphLevelDividerProps {
  /**
   * Posição Y da divisória
   */
  y: number;

  /**
   * Largura da linha
   */
  width: number;

  /**
   * Posição X inicial (opcional, default: 0)
   */
  x?: number;
}

/**
 * 🆕 ETAPA 7: Divisória horizontal entre níveis
 * Renderiza linha tracejada separando níveis
 */
export default function GraphLevelDivider({ y, width, x = 0 }: GraphLevelDividerProps) {
  return (
    <Line
      x1={x}
      y1={y}
      x2={x + width}
      y2={y}
      stroke="#E1E8ED"
      strokeWidth={1}
      strokeDasharray="5,5"
      opacity={0.6}
    />
  );
}
