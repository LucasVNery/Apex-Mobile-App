import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/Text';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFilterToggle: () => void;
  isFilterActive: boolean;
}

/**
 * Controles flutuantes para o Graph View
 * Inclui zoom, reset e filtro
 */
export default function GraphControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFilterToggle,
  isFilterActive,
}: GraphControlsProps) {
  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <View style={styles.container}>
      {/* Controles de zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(onZoomIn)}
        >
          <Ionicons name="add" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(onZoomOut)}
        >
          <Ionicons name="remove" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(onReset)}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Filtro */}
      <TouchableOpacity
        style={[styles.filterButton, isFilterActive && styles.filterButtonActive]}
        onPress={() => handlePress(onFilterToggle)}
      >
        <Ionicons
          name="filter"
          size={20}
          color={isFilterActive ? '#FFF' : theme.colors.text.primary}
        />
        <Text
          variant="caption"
          color={isFilterActive ? 'inverse' : 'primary'}
          weight="semibold"
        >
          Filtrar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80, // Abaixo da barra de busca (altura ~56px + spacing)
    right: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  zoomControls: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm, // Reduzido de md para sm
    paddingVertical: theme.spacing.xs,   // Reduzido de sm para xs
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 80, // Largura mínima para não ficar muito apertado
  },
  filterButtonActive: {
    backgroundColor: theme.colors.accent.primary,
  },
});
