import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { LinksBlock as LinksBlockType } from '@/src/types/note.types';
import { theme } from '@/src/theme';
import { router } from 'expo-router';
import { haptic } from '@/src/utils/haptics';
import AddLinkModal from '@/src/components/modals/AddLinkModal';

interface LinksBlockProps {
  block: LinksBlockType;
  noteId: string; // ID da nota atual (para excluir da lista de seleção)
  onUpdate: (block: LinksBlockType) => void;
  onDelete: () => void;
  isEditing?: boolean;
}

/**
 * 🆕 ETAPA 7: Bloco de Links/Referências
 * Substitui o sistema antigo de links bidirecionais
 */
export default function LinksBlock({
  block,
  noteId,
  onUpdate,
  onDelete,
  isEditing = false,
}: LinksBlockProps) {
  const { notes } = useNotesStore();
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Obter notas referenciadas
  const referencedNotes = useMemo(() => {
    return block.noteRefs
      .map((id) => notes.find((n) => n.id === id))
      .filter((note) => note !== undefined);
  }, [block.noteRefs, notes]);

  // Navegar para nota
  const handleNavigate = (noteId: string) => {
    haptic.medium();
    router.push(`/note/${noteId}`);
  };

  // Remover link
  const handleRemoveLink = (noteId: string) => {
    haptic.light();
    onUpdate({
      ...block,
      noteRefs: block.noteRefs.filter((id) => id !== noteId),
    });
  };

  // Abrir modal de adicionar
  const handleOpenAddModal = () => {
    haptic.light();
    setIsAddingLink(true);
  };

  // Adicionar link
  const handleAddLink = (noteId: string) => {
    onUpdate({
      ...block,
      noteRefs: [...block.noteRefs, noteId],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="link" size={20} color={theme.colors.accent.primary} />
          <Text style={styles.headerTitle}>LINKS</Text>
        </View>

        {isEditing && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.accent.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de links */}
      {referencedNotes.length > 0 ? (
        <View style={styles.linksList}>
          {referencedNotes.map((note) => (
            <Pressable
              key={note.id}
              onPress={() => handleNavigate(note.id)}
              style={({ pressed }) => [
                styles.linkItem,
                pressed && styles.linkItemPressed,
              ]}
            >
              <View style={styles.linkContent}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={theme.colors.accent.primary}
                />
                <Text style={styles.linkText} numberOfLines={1}>
                  {note.title}
                </Text>
              </View>

              {isEditing && (
                <TouchableOpacity
                  onPress={() => handleRemoveLink(note.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={18} color={theme.colors.accent.error} />
                </TouchableOpacity>
              )}
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma referência adicionada</Text>
        </View>
      )}

      {/* Botão adicionar */}
      {isEditing && (
        <TouchableOpacity
          onPress={handleOpenAddModal}
          style={styles.addButton}
        >
          <Ionicons name="add-circle-outline" size={18} color={theme.colors.accent.primary} />
          <Text style={styles.addButtonText}>Adicionar Referência</Text>
        </TouchableOpacity>
      )}

      {/* Modal de adicionar link */}
      <AddLinkModal
        visible={isAddingLink}
        currentNoteId={noteId}
        excludeNoteIds={block.noteRefs}
        onClose={() => setIsAddingLink(false)}
        onAddLink={handleAddLink}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginVertical: theme.spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  linksList: {
    paddingVertical: theme.spacing.xs,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  linkItemPressed: {
    backgroundColor: theme.colors.background.secondary,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  linkText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.accent.primary,
    textDecorationLine: 'underline',
    flex: 1,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  emptyState: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  addButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.accent.primary,
    fontWeight: '500',
  },
});
