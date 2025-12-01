import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { haptic } from '@/src/utils/haptics';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { Note } from '@/src/types/note.types';

interface SelectLinkTargetModalProps {
  visible: boolean;
  currentNoteId: string; // Excluir nota atual da lista
  currentTargetId?: string; // ID do alvo atual (para edição)
  onClose: () => void;
  onSelectNote: (noteId: string, noteTitle: string) => void;
}

/**
 * Modal para selecionar o ambiente de destino de um LinkBlock
 */
export default function SelectLinkTargetModal({
  visible,
  currentNoteId,
  currentTargetId,
  onClose,
  onSelectNote,
}: SelectLinkTargetModalProps) {
  const { notes } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Debug
  console.log('SelectLinkTargetModal - Total notes:', notes.length);
  console.log('SelectLinkTargetModal - currentNoteId:', currentNoteId);
  console.log('SelectLinkTargetModal - searchQuery:', searchQuery);

  // Filtrar e ordenar notas disponíveis
  const availableNotes = useMemo(() => {
    console.log('useMemo recalculating - searchQuery:', searchQuery);

    const filtered = notes.filter((note) => {
      // Excluir nota atual
      if (note.id === currentNoteId) {
        console.log('Excluding current note:', note.title);
        return false;
      }

      // Filtrar por busca (título ou tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleLower = note.title.toLowerCase();
        const matchTitle = titleLower.includes(query);
        const matchTags = note.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        console.log(`Note "${note.title}": matchTitle=${matchTitle}, matchTags=${matchTags}`);
        return matchTitle || matchTags;
      }

      return true;
    });

    // Ordenar: primeiro os que começam com a busca, depois os que contêm
    let sorted;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sorted = filtered.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        const aStarts = aTitle.startsWith(query);
        const bStarts = bTitle.startsWith(query);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Se ambos começam ou ambos não começam, ordenar alfabeticamente
        return aTitle.localeCompare(bTitle);
      });
    } else {
      // Sem busca, ordenar alfabeticamente
      sorted = filtered.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );
    }

    console.log('SelectLinkTargetModal - availableNotes count:', sorted.length);
    console.log('SelectLinkTargetModal - availableNotes titles:', sorted.map(n => n.title));

    return sorted;
  }, [notes, currentNoteId, searchQuery]);

  const handleSelectNote = (note: Note) => {
    haptic.light();
    onSelectNote(note.id, note.title);
    setSearchQuery(''); // Limpar busca
    onClose();
  };

  const handleCancel = () => {
    haptic.light();
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleCancel} />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons
                name="link"
                size={24}
                color={theme.colors.accent.primary}
              />
              <Text style={styles.headerTitle}>
                {currentTargetId ? 'Editar Link' : 'Adicionar Link'}
              </Text>
            </View>
            <Pressable onPress={handleCancel} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text.secondary}
              />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.text.tertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar ambiente..."
              placeholderTextColor={theme.colors.text.tertiary}
              autoFocus
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.text.tertiary}
                />
              </Pressable>
            )}
          </View>

          {/* Debug Info */}
          <View style={{ padding: 16, backgroundColor: '#f0f0f0' }}>
            <Text style={{ fontSize: 12, color: '#000' }}>
              Debug: Total notes: {notes.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#000' }}>
              Available: {availableNotes.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#000' }}>
              Search: "{searchQuery}"
            </Text>
          </View>

          {/* Notes List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {availableNotes.length > 0 ? (
              availableNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isSelected={note.id === currentTargetId}
                  onPress={() => handleSelectNote(note)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="folder-open-outline"
                  size={48}
                  color={theme.colors.text.tertiary}
                />
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? 'Nenhum ambiente encontrado'
                    : 'Nenhum ambiente disponível'}
                </Text>
                {searchQuery.trim() && (
                  <Text style={styles.emptyHint}>
                    Tente buscar por outro termo
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Ionicons
              name="information-circle"
              size={16}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.footerText}>
              {availableNotes.length} ambiente(s) disponível(is)
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onPress: () => void;
}

function NoteItem({ note, isSelected, onPress }: NoteItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.noteItem,
        pressed && styles.noteItemPressed,
        isSelected && styles.noteItemSelected,
      ]}
    >
      <View style={styles.noteIcon}>
        <Ionicons
          name="document-text"
          size={20}
          color={theme.colors.accent.primary}
        />
      </View>

      <View style={styles.noteContent}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {note.title}
        </Text>

        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {note.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{note.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>

      {isSelected ? (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={theme.colors.accent.primary}
        />
      ) : (
        <Ionicons
          name="arrow-forward-circle-outline"
          size={24}
          color={theme.colors.text.tertiary}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    backgroundColor: theme.colors.background.elevated,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  noteItemPressed: {
    backgroundColor: theme.colors.background.primary,
    opacity: 0.8,
  },
  noteItemSelected: {
    backgroundColor: theme.colors.accent.primary + '20',
    borderWidth: 1,
    borderColor: theme.colors.accent.primary,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.accent.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  noteTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.accent.secondary + '30',
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.accent.secondary,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    gap: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  footerText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
  },
});
