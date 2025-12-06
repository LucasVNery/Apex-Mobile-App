import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

export interface GraphFilters {
  maxDepth: number;
  selectedTags: string[];
  nodeTypes: Array<'root' | 'parent' | 'child' | 'orphan'>;
}

interface GraphFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: GraphFilters) => void;
  currentFilters: GraphFilters;
  availableTags: string[];
}

/**
 * Modal de filtros avançados para o Graph View
 * Permite filtrar por profundidade, tipo de nó e tags
 */
export default function GraphFiltersModal({
  visible,
  onClose,
  onApply,
  currentFilters,
  availableTags,
}: GraphFiltersModalProps) {
  const [filters, setFilters] = useState<GraphFilters>(currentFilters);

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({
      maxDepth: 9,
      selectedTags: [],
      nodeTypes: ['root', 'parent', 'child', 'orphan'],
    });
  };

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const toggleNodeType = (type: 'root' | 'parent' | 'child' | 'orphan') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters((prev) => ({
      ...prev,
      nodeTypes: prev.nodeTypes.includes(type)
        ? prev.nodeTypes.filter((t) => t !== type)
        : [...prev.nodeTypes, type],
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="title" weight="bold">
              Filtros do Grafo
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Profundidade */}
            <View style={styles.section}>
              <Text variant="body" weight="semibold">
                Profundidade Máxima: {filters.maxDepth}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={9}
                step={1}
                value={filters.maxDepth}
                onValueChange={(value) => setFilters({ ...filters, maxDepth: value })}
                minimumTrackTintColor={theme.colors.accent.primary}
                maximumTrackTintColor="#BDC3C7"
              />
            </View>

            {/* Tipos de Nó */}
            <View style={styles.section}>
              <Text variant="body" weight="semibold">
                Tipos de Nó
              </Text>
              <View style={styles.chipGroup}>
                {(['root', 'parent', 'child', 'orphan'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      filters.nodeTypes.includes(type) && styles.chipActive,
                    ]}
                    onPress={() => toggleNodeType(type)}
                  >
                    <Text
                      variant="caption"
                      weight="semibold"
                      color={filters.nodeTypes.includes(type) ? 'inverse' : 'primary'}
                    >
                      {type === 'root' && '🏠 Raiz'}
                      {type === 'parent' && '📁 Pai'}
                      {type === 'child' && '📄 Filho'}
                      {type === 'orphan' && '📭 Órfão'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags */}
            {availableTags.length > 0 && (
              <View style={styles.section}>
                <Text variant="body" weight="semibold">
                  Tags ({filters.selectedTags.length} selecionadas)
                </Text>
                <View style={styles.chipGroup}>
                  {availableTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.chip,
                        filters.selectedTags.includes(tag) && styles.chipActive,
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text
                        variant="caption"
                        weight="semibold"
                        color={filters.selectedTags.includes(tag) ? 'inverse' : 'primary'}
                      >
                        #{tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text variant="body" weight="semibold" color="primary">
                Resetar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text variant="body" weight="semibold" color="inverse">
                Aplicar Filtros
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  slider: {
    marginTop: theme.spacing.sm,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  chipActive: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  resetButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.accent.primary,
  },
});
