import React, { useEffect } from 'react';
import { Circle, Text as SvgText, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { GraphNode as GraphNodeType } from '@/src/types/graph.types';

interface GraphNodeProps {
  node: GraphNodeType;
  isSelected: boolean;
  onPress: (nodeId: string) => void;
  scale: number;
  index?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * Componente que renderiza um nó individual do grafo
 */
const GraphNode = React.memo(function GraphNode({ node, isSelected, onPress, scale, index = 0 }: GraphNodeProps) {
  const opacity = useSharedValue(0);
  const scaleAnim = useSharedValue(0.5);

  useEffect(() => {
    const delay = index * 20;

    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      scaleAnim.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }, delay);
  }, [index]);

  const handlePress = () => {
    onPress(node.id);
  };

  const fontSize = Math.max(10, Math.min(16, 14 / scale));
  const strokeWidth = isSelected ? 3 : 1;
  const strokeColor = isSelected ? '#FFD700' : node.color;

  const animatedCircleProps = useAnimatedProps(() => ({
    opacity: opacity.value * 0.9,
    r: (node.size ?? 20) * scaleAnim.value,
  }));

  // Círculo maior invisível para área de clique
  const hitboxRadius = (node.size ?? 20) + 30;

  return (
    <AnimatedG>
      {/* Círculo invisível grande para capturar cliques */}
      <Circle
        cx={node.x}
        cy={node.y}
        r={hitboxRadius}
        fill="#000000"
        opacity={0.001}
        onPress={handlePress}
      />

      {/* Círculo do nó visível com animação */}
      <AnimatedCircle
        cx={node.x}
        cy={node.y}
        fill={node.color}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        animatedProps={animatedCircleProps}
      />

      {/* Badge dourado para raiz */}
      {node.isRoot && (
        <Circle
          cx={(node.x ?? 0) + (node.size ?? 20) - 8}
          cy={(node.y ?? 0) - (node.size ?? 20) + 8}
          r={8}
          fill="#FFD700"
          opacity={opacity.value}
        />
      )}

      {/* Título do nó */}
      <SvgText
        x={node.x ?? 0}
        y={(node.y ?? 0) + (node.size ?? 20) + 16}
        fontSize={fontSize}
        fill="#2C3E50"
        textAnchor="middle"
        fontWeight="600"
        opacity={opacity.value}
        onPress={handlePress}
      >
        {node.title.length > 15 ? `${node.title.slice(0, 15)}...` : node.title}
      </SvgText>
    </AnimatedG>
  );
});

export default GraphNode;
