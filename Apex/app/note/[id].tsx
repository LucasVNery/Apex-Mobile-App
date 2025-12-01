import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { Text } from '@/src/components/ui/Text';
import { BlockEditor } from '@/src/components/editor/BlockEditor';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { Block } from '@/src/types/note.types';
import * as Haptics from 'expo-haptics';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';
import HierarchyBreadcrumb from '@/src/components/hierarchy/HierarchyBreadcrumb';
import HierarchyIndicator from '@/src/components/hierarchy/HierarchyIndicator';
import ChildrenList from '@/src/components/hierarchy/ChildrenList';
import CreateChildModal from '@/src/components/modals/CreateChildModal';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { updateNote, createChildNote, getNoteViewModelById } = useNotesStore();
  // Use seletor para reagir a mudanças na nota
  const note = useNotesStore((state) => state.notes.find(n => n.id === id));
  const notes = useNotesStore((state) => state.notes);
  const [selectedCount, setSelectedCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [createChildModalVisible, setCreateChildModalVisible] = useState(false);
  const deleteCallbackRef = useRef<(() => void) | null>(null);

  // Obter ViewModel para dados hierárquicos
  const viewModel = getNoteViewModelById(id as string);

  // Cleanup: limpa referência do deleteCallback quando o componente desmonta
  useEffect(() => {
    return () => {
      deleteCallbackRef.current = null;
    };
  }, []);

  if (!note) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={theme.colors.text.tertiary} />
          <Text variant="title" weight="semibold" color="tertiary" style={styles.errorText}>
            Nota não encontrada
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text variant="body" style={styles.backButtonText}>
              Voltar
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBlocksChange = (blocks: Block[]) => {
    updateNote(note.id, { blocks });
  };

  const handleTitleChange = (title: string) => {
    updateNote(note.id, { title });
  };

  const handleSelectionChange = (count: number, deleteCallback?: () => void) => {
    setSelectedCount(count);
    if (deleteCallback) {
      deleteCallbackRef.current = deleteCallback;
    }
  };

  const handleDeleteButtonPress = () => {
    if (selectedCount === 0 || !deleteCallbackRef.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deleteCallbackRef.current?.();
    deleteCallbackRef.current = null;
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Handlers de hierarquia
  const handleNavigateToNote = (noteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/note/${noteId}`);
  };

  const handleCreateChild = (title: string, tags: string[]) => {
    const newChild = createChildNote(id as string, {
      title,
      tags,
      blocks: [],
    });
    setCreateChildModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/note/${newChild.id}`);
  };

  const handleOpenCreateModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreateChildModalVisible(true);
  };

  // Prepara lista de notas existentes para link suggestion
  const existingNotes = notes.map((n) => ({
    id: n.id,
    title: n.title,
    blocks: n.blocks,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButtonContainer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          <Text variant="body" weight="semibold" style={styles.backButtonText}>
            Voltar
          </Text>
        </Pressable>

        {selectedCount > 0 ? (
          <View style={styles.selectionHeader}>
            <Text variant="body" weight="semibold" color="primary">
              {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
            </Text>
            <Pressable
              onPress={handleDeleteButtonPress}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={24} color={theme.colors.accent.error} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.headerInfo}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent.success} />
            <Text variant="caption" color="secondary">
              Salvo
            </Text>
            {note.color && (
              <View style={[styles.colorIndicator, { backgroundColor: note.color }]} />
            )}
          </View>
        )}
      </View>

      {/* Breadcrumb de navegação */}
      {viewModel && (
        <HierarchyBreadcrumb
          noteId={id as string}
          onNavigate={handleNavigateToNote}
        />
      )}

      {/* Indicador de hierarquia */}
      {viewModel?.metadata && (
        <HierarchyIndicator
          depth={viewModel.metadata.depth}
          childrenCount={viewModel.metadata.childrenCount}
          isRoot={viewModel.metadata.isRoot}
        />
      )}

      {/* Editor */}
      <BlockEditor
        blocks={note.blocks}
        noteId={note.id}
        onBlocksChange={handleBlocksChange}
        noteTitle={note.title}
        onTitleChange={handleTitleChange}
        existingNotes={existingNotes}
        onSelectionChange={handleSelectionChange}
      />

      {/* Botão de adicionar sub-ambiente */}
      {viewModel && viewModel.metadata && viewModel.metadata.depth < 9 && (
        <View style={styles.addButtonContainer}>
          <Pressable
            onPress={handleOpenCreateModal}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Adicionar Sub-ambiente</Text>
          </Pressable>
        </View>
      )}

      {/* Lista de filhos (movido para baixo) */}
      {viewModel && (
        <ChildrenList
          parentId={id as string}
          onChildPress={handleNavigateToNote}
        />
      )}

      {/* Create Child Modal */}
      {viewModel && (
        <CreateChildModal
          visible={createChildModalVisible}
          parentId={id as string}
          parentTitle={note.title}
          onClose={() => setCreateChildModalVisible(false)}
          onCreateChild={handleCreateChild}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Deletar blocos"
        message={`Tem certeza que deseja deletar ${selectedCount} bloco${selectedCount > 1 ? 's' : ''}?`}
        confirmText="Deletar"
        cancelText="Cancelar"
        confirmVariant="primary"
        icon="trash-outline"
        iconColor={theme.colors.accent.error}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
  },
  backButtonText: {
    color: theme.colors.text.primary,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
  backButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.accent.primary,
    borderRadius: theme.borderRadius.md,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#27AE60',
    borderRadius: 10,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
