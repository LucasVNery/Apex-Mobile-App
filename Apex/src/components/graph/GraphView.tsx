import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg from 'react-native-svg';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { buildGraphFromNotes } from '@/src/utils/graphBuilder';
import { applyHierarchicalLayout } from '@/src/utils/graphLayout';
import { graphLayoutCache } from '@/src/utils/graphCache';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import GraphControls from './GraphControls';
import GraphLevelLabel from './GraphLevelLabel';
import GraphLevelDivider from './GraphLevelDivider';
import { Graph } from '@/src/types/graph.types';
import { router } from 'expo-router';
import { haptic } from '@/src/utils/haptics';
import { logger } from '@/src/utils/logger';
import { ANIMATION_CONFIG, ZOOM_CONFIG } from '@/src/constants/animations';
import { theme } from '@/src/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Componente principal do Graph View
 * Renderiza grafo interativo com zoom, pan e navegação
 */
export default function GraphView() {
  const { notes } = useNotesStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Valores compartilhados para pan e zoom
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  // Refs para capturar valores atuais (para cálculo de clique)
  const currentTranslateX = useRef(0);
  const currentTranslateY = useRef(0);
  const currentScale = useRef(1);

  // Gerar grafo com cache
  const graph = useMemo(() => {
    const cached = graphLayoutCache.get(notes);
    if (cached) {
      logger.debug('📦 Graph carregado do cache');
      return cached;
    }

    logger.debug('🔨 Construindo novo graph...');
    const built = buildGraphFromNotes(notes);
    const layouted = applyHierarchicalLayout(built);
    graphLayoutCache.set(notes, layouted);
    logger.debug(`✅ Graph criado: ${layouted.nodes.length} nós, ${layouted.edges.length} arestas`);
    return layouted;
  }, [notes]);

  // Usar grafo completo
  const displayGraph = graph;

  // 🆕 ETAPA 7: Calcular níveis e suas posições
  const levels = useMemo(() => {
    const nodesByDepth = new Map<number, typeof displayGraph.nodes>();

    // Agrupar nós por profundidade
    displayGraph.nodes.forEach((node) => {
      const depth = node.depth ?? 0;
      if (!nodesByDepth.has(depth)) {
        nodesByDepth.set(depth, []);
      }
      nodesByDepth.get(depth)!.push(node);
    });

    // Criar array de níveis com posições Y
    const levelsArray: Array<{ level: number; y: number; nodeCount: number }> = [];
    const sortedDepths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b);

    sortedDepths.forEach((depth) => {
      const nodesInLevel = nodesByDepth.get(depth)!;
      const firstNode = nodesInLevel[0];

      levelsArray.push({
        level: depth + 1, // 1-indexed (Nível 1, Nível 2, etc)
        y: firstNode.y ?? 0,
        nodeCount: nodesInLevel.length,
      });
    });

    return levelsArray;
  }, [displayGraph.nodes]);

  // Centralizar grafo na tela
  const initialTranslateX = useMemo(() => {
    return (SCREEN_WIDTH - (graph.width ?? 0)) / 2;
  }, [graph.width]);

  const initialTranslateY = useMemo(() => {
    return (SCREEN_HEIGHT - (graph.height ?? 0)) / 2;
  }, [graph.height]);

  // Definir posições iniciais
  useEffect(() => {
    translateX.value = initialTranslateX;
    translateY.value = initialTranslateY;
    savedTranslateX.value = initialTranslateX;
    savedTranslateY.value = initialTranslateY;
    currentTranslateX.current = initialTranslateX;
    currentTranslateY.current = initialTranslateY;
    currentScale.current = 1;
  }, [initialTranslateX, initialTranslateY]);

  // Gesture de pan (arrastar) - com minDistance para não bloquear taps
  const panGesture = Gesture.Pan()
    .minDistance(10) // Só ativa após arrastar 10px
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
      currentTranslateX.current = translateX.value;
      currentTranslateY.current = translateY.value;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      currentTranslateX.current = translateX.value;
      currentTranslateY.current = translateY.value;
    });

  // Gesture de pinch (zoom)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(
        ZOOM_CONFIG.min,
        Math.min(ZOOM_CONFIG.max, savedScale.value * event.scale)
      );
      currentScale.current = scale.value;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      currentScale.current = scale.value;
    });

  // Combinar gestures
  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  // Estilo animado
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Handler de toque em nó
  const handleNodePress = useCallback((nodeId: string) => {
    haptic.medium();
    setSelectedNodeId(nodeId);
    router.push(`/note/${nodeId}`);
  }, []);

  // Detectar qual nó foi clicado baseado na posição do toque
  const handleSvgPress = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;

    // Pegar valores atuais das transformações
    const tx = currentTranslateX.current;
    const ty = currentTranslateY.current;
    const s = currentScale.current;

    // Inverter as transformações para obter coordenadas reais do SVG
    const svgX = (locationX - tx) / s;
    const svgY = (locationY - ty) / s;

    // Encontrar nó mais próximo do clique
    for (const node of displayGraph.nodes) {
      const nodeX = node.x ?? 0;
      const nodeY = node.y ?? 0;
      const dx = nodeX - svgX;
      const dy = nodeY - svgY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const hitRadius = (node.size ?? 20) + 30;

      if (distance <= hitRadius) {
        handleNodePress(node.id);
        return;
      }
    }
  }, [displayGraph.nodes, handleNodePress]);

  // Encontrar nó por ID
  const findNode = useCallback((nodeId: string) => {
    return graph.nodes.find(n => n.id === nodeId);
  }, [graph.nodes]);

  // Controles de zoom
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(ZOOM_CONFIG.max, currentScale.current + ZOOM_CONFIG.step);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
    currentScale.current = newScale;
  }, []);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(ZOOM_CONFIG.min, currentScale.current - ZOOM_CONFIG.step);
    scale.value = withSpring(newScale);
    savedScale.value = newScale;
    currentScale.current = newScale;
  }, []);

  const handleReset = useCallback(() => {
    scale.value = withSpring(ZOOM_CONFIG.default);
    savedScale.value = ZOOM_CONFIG.default;
    currentScale.current = ZOOM_CONFIG.default;
    translateX.value = withSpring(initialTranslateX);
    translateY.value = withSpring(initialTranslateY);
    savedTranslateX.value = initialTranslateX;
    savedTranslateY.value = initialTranslateY;
    currentTranslateX.current = initialTranslateX;
    currentTranslateY.current = initialTranslateY;
    setSelectedNodeId(null);
  }, [initialTranslateX, initialTranslateY]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.svgContainer, animatedStyle]}>
          <Svg
            width={Math.max(displayGraph.width ?? 0, SCREEN_WIDTH * 3)}
            height={Math.max(displayGraph.height ?? 0, SCREEN_HEIGHT)}
            onPress={handleSvgPress}
          >
            {/* 1. Divisórias de níveis (background) */}
            {levels.map((level, index) => (
              index < levels.length - 1 && (
                <GraphLevelDivider
                  key={`divider-${level.level}`}
                  y={level.y + 75} // Meio caminho até o próximo nível (150/2 = 75)
                  width={displayGraph.width ?? SCREEN_WIDTH}
                />
              )
            ))}

            {/* 2. Renderizar arestas */}
            {displayGraph.edges.map((edge) => {
              const sourceNode = displayGraph.nodes.find(n => n.id === edge.source);
              const targetNode = displayGraph.nodes.find(n => n.id === edge.target);

              if (!sourceNode || !targetNode) return null;

              return (
                <GraphEdge
                  key={edge.id}
                  edge={edge}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                />
              );
            })}

            {/* 3. Renderizar nós */}
            {displayGraph.nodes.map((node, index) => (
              <GraphNode
                key={node.id}
                node={node}
                isSelected={node.id === selectedNodeId}
                onPress={handleNodePress}
                scale={scale.value}
                index={index}
              />
            ))}

            {/* 4. Labels de níveis (foreground - por cima de tudo) */}
            {levels.map((level) => (
              <GraphLevelLabel
                key={`label-${level.level}`}
                level={level.level}
                y={level.y}
              />
            ))}
          </Svg>
        </Animated.View>
      </GestureDetector>

      {/* Controles de zoom */}
      <GraphControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  svgContainer: {
    flex: 1,
  },
});
