import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNotesStore } from '@/src/stores/useNotesStore';

interface HierarchyBreadcrumbProps {
  noteId: string;
  onNavigate?: (noteId: string) => void;
}

/**
 * Breadcrumb mostrando caminho da nota até a raiz
 * Exemplo: 🏠 Matemática › Cálculo 1 › Limites
 */
export default function HierarchyBreadcrumb({
  noteId,
  onNavigate,
}: HierarchyBreadcrumbProps) {
  const { getAncestorsOfNote, getNoteById } = useNotesStore();

  // Obter nota atual e ancestrais
  const currentNote = getNoteById(noteId);
  const ancestors = useMemo(() => getAncestorsOfNote(noteId), [noteId, getAncestorsOfNote]);

  // Construir caminho: [root, ...ancestors, current]
  const breadcrumbItems = useMemo(() => {
    if (!currentNote) return [];

    const items = [
      ...ancestors.map(a => ({
        id: a.id,
        title: a.title,
        isRoot: a.isRoot ?? !a.parentId,
        isCurrent: false,
      })),
      {
        id: currentNote.id,
        title: currentNote.title,
        isRoot: currentNote.isRoot ?? !currentNote.parentId,
        isCurrent: true,
      },
    ];

    return items;
  }, [currentNote, ancestors]);

  const handlePress = (itemId: string, isCurrent: boolean) => {
    if (isCurrent) return; // Item atual não é clicável

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate?.(itemId);
  };

  if (breadcrumbItems.length === 0) {
    return null;
  }

  // Se for raiz sozinha, não mostrar breadcrumb
  if (breadcrumbItems.length === 1 && breadcrumbItems[0].isRoot) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {breadcrumbItems.map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            {/* Ícone de home para raiz */}
            {index === 0 && item.isRoot && (
              <Ionicons
                name="home"
                size={16}
                color={item.isCurrent ? styles.textCurrent.color : styles.textInactive.color}
                style={styles.homeIcon}
              />
            )}

            {/* Texto do item */}
            <Pressable
              onPress={() => handlePress(item.id, item.isCurrent)}
              disabled={item.isCurrent}
              style={({ pressed }) => [
                styles.itemButton,
                pressed && styles.itemPressed,
              ]}
            >
              <Text
                style={[
                  styles.text,
                  item.isCurrent ? styles.textCurrent : styles.textInactive,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
            </Pressable>

            {/* Separador */}
            {index < breadcrumbItems.length - 1 && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color={styles.separator.color}
                style={styles.separator}
              />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  scrollContent: {
    alignItems: 'center',
    paddingRight: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeIcon: {
    marginRight: 6,
  },
  itemButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  itemPressed: {
    backgroundColor: '#E9ECEF',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 150,
  },
  textCurrent: {
    color: '#2C3E50',
    fontWeight: '600',
  },
  textInactive: {
    color: '#7F8C8D',
  },
  separator: {
    marginHorizontal: 8,
    color: '#95A5A6',
  },
});
