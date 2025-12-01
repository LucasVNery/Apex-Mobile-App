import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HierarchyIndicatorProps {
  depth: number;
  childrenCount: number;
  isRoot: boolean;
}

/**
 * Indicador visual de posição na hierarquia
 */
export default function HierarchyIndicator({
  depth,
  childrenCount,
  isRoot,
}: HierarchyIndicatorProps) {
  // Cores por profundidade
  const depthColors = [
    '#4A90E2', // Depth 0 - Azul (raiz)
    '#50C878', // Depth 1 - Verde
    '#F39C12', // Depth 2 - Laranja
    '#9B59B6', // Depth 3 - Roxo
    '#E74C3C', // Depth 4+ - Vermelho
  ];

  const color = depthColors[Math.min(depth, depthColors.length - 1)];

  return (
    <View style={styles.container}>
      {/* Indicador de profundidade */}
      <View style={styles.depthIndicator}>
        {isRoot ? (
          // Badge de raiz
          <View style={[styles.rootBadge, { backgroundColor: color }]}>
            <Ionicons name="home" size={14} color="#FFFFFF" />
            <Text style={styles.rootText}>RAIZ</Text>
          </View>
        ) : (
          // Indicador de nível
          <View style={styles.levelIndicator}>
            {/* Barras de indent */}
            {Array.from({ length: depth }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indentBar,
                  {
                    backgroundColor:
                      depthColors[Math.min(index, depthColors.length - 1)] +
                      '40', // 40 = 25% opacity
                  },
                ]}
              />
            ))}

            {/* Ícone de nível */}
            <View style={[styles.levelBadge, { backgroundColor: color + '20' }]}>
              <Ionicons name="chevron-forward" size={12} color={color} />
              <Text style={[styles.levelText, { color }]}>Nível {depth}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Contador de filhos */}
      <View style={styles.childrenInfo}>
        <Ionicons name="folder-outline" size={14} color="#7F8C8D" />
        <Text style={styles.childrenText}>
          {childrenCount === 0
            ? 'Sem sub-ambientes'
            : childrenCount === 1
            ? '1 sub-ambiente'
            : `${childrenCount} sub-ambientes`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  depthIndicator: {
    flex: 1,
  },
  rootBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  rootText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  levelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indentBar: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  childrenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  childrenText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7F8C8D',
  },
});
