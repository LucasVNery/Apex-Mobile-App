import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { NoteViewModel } from '@/src/types/note.types';
import { theme } from '@/src/theme';

interface ChildrenListProps {
  parentId: string;
  onChildPress?: (childId: string) => void;
  onReorder?: (parentId: string, newOrder: string[]) => void;
}

/**
 * Lista de notas filhas (sub-ambientes)
 */
export default function ChildrenList({
  parentId,
  onChildPress,
  onReorder,
}: ChildrenListProps) {
  const { getChildrenOfNote } = useNotesStore();

  // Obter filhos ordenados
  const children = useMemo(
    () => getChildrenOfNote(parentId),
    [parentId, getChildrenOfNote]
  );

  const handleChildPress = (childId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChildPress?.(childId);
  };

  // Empty state
  if (children.length === 0) {
    return null; // Não exibir nada quando não há filhos
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChildItem note={item} onPress={handleChildPress} />
        )}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

/**
 * Item individual da lista de filhos
 */
function ChildItem({
  note,
  onPress,
}: {
  note: NoteViewModel;
  onPress: (id: string) => void;
}) {
  // Gerar preview do conteúdo (primeiros 60 caracteres do primeiro bloco de texto)
  const preview = useMemo(() => {
    const textBlock = note.blocks.find(
      (b) => b.type === 'text' || b.type === 'heading'
    );
    if (!textBlock || !textBlock.content) return 'Sem conteúdo';

    const content = textBlock.content.trim();
    return content.length > 60 ? content.substring(0, 60) + '...' : content;
  }, [note.blocks]);

  // Contador de sub-filhos
  const childrenCount = note.metadata?.childrenCount ?? 0;

  return (
    <Pressable
      onPress={() => onPress(note.id)}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <View style={styles.itemContent}>
        {/* Ícone */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={childrenCount > 0 ? 'folder' : 'document-text'}
            size={24}
            color={childrenCount > 0 ? theme.colors.accent.primary : theme.colors.text.secondary}
          />
        </View>

        {/* Texto */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>

          {/* Tags e contador */}
          <View style={styles.meta}>
            {note.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {note.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
                {note.tags.length > 2 && (
                  <Text style={styles.tagMore}>+{note.tags.length - 2}</Text>
                )}
              </View>
            )}

            {childrenCount > 0 && (
              <View style={styles.childrenBadge}>
                <Ionicons name="folder-outline" size={12} color={theme.colors.text.secondary} />
                <Text style={styles.childrenCount}>{childrenCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Seta de navegação */}
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'transparent', // Removido fundo branco
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginLeft: 60,
  },
  item: {
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.elevated,
  },
  itemPressed: {
    backgroundColor: theme.colors.background.secondary,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  preview: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: theme.colors.accent.primary + '20', // 20% opacity
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: theme.colors.accent.primary,
    fontWeight: '500',
  },
  tagMore: {
    fontSize: 11,
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  childrenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 4,
  },
  childrenCount: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
});
