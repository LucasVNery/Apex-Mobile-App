import React from 'react';
import { Line, Path } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { GraphEdge as GraphEdgeType, GraphNode } from '@/src/types/graph.types';

interface GraphEdgeProps {
  edge: GraphEdgeType;
  sourceNode: GraphNode;
  targetNode: GraphNode;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Componente que renderiza uma aresta (linha) entre dois nós
 * Suporta linhas sólidas (hierarquia) e tracejadas (links)
 */
const GraphEdge = React.memo(function GraphEdge({ edge, sourceNode, targetNode }: GraphEdgeProps) {
  // Calcular pontos de início e fim (borda dos círculos, não centro)
  // Isso evita que a linha fique embaixo do círculo
  const angle = Math.atan2(
    (targetNode.y ?? 0) - (sourceNode.y ?? 0),
    (targetNode.x ?? 0) - (sourceNode.x ?? 0)
  );

  const x1 = (sourceNode.x ?? 0) + (sourceNode.size ?? 20) * Math.cos(angle);
  const y1 = (sourceNode.y ?? 0) + (sourceNode.size ?? 20) * Math.sin(angle);

  const x2 = (targetNode.x ?? 0) - (targetNode.size ?? 20) * Math.cos(angle);
  const y2 = (targetNode.y ?? 0) - (targetNode.size ?? 20) * Math.sin(angle);

  // Linha sólida para hierarquia
  if (edge.style === 'solid') {
    return (
      <AnimatedLine
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={edge.color}
        strokeWidth={edge.width}
        opacity={0.6}
      />
    );
  }

  // Linha tracejada para links
  return (
    <AnimatedPath
      d={`M ${x1} ${y1} L ${x2} ${y2}`}
      stroke={edge.color}
      strokeWidth={edge.width}
      strokeDasharray="5,5"
      opacity={0.4}
    />
  );
});

export default GraphEdge;
