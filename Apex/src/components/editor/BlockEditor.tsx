import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import { theme } from '@/src/theme';
import { Block, BlockType, NoteLink } from '@/src/types/note.types';
import { EditableTextBlock, EditableTextBlockRef } from '../blocks/EditableTextBlock';
import { HeadingBlock, HeadingBlockRef } from '../blocks/HeadingBlock';
import { ListBlockComponent } from '../blocks/ListBlockComponent';
import { CalloutBlockComponent, CalloutBlockRef } from '../blocks/CalloutBlockComponent';
import { DividerBlockComponent } from '../blocks/DividerBlockComponent';
import { EditableChecklistBlock } from '../blocks/EditableChecklistBlock';
import { ChecklistBlock as ChecklistBlockType } from '@/src/types/note.types';
import LinksBlock from '../blocks/LinksBlock';
import LinkBlock from '../blocks/LinkBlock';
import { BlockMenu } from './BlockMenu';
import { LinkSuggestionPopup } from './LinkSuggestionPopup';
import SelectLinkTargetModal from '../modals/SelectLinkTargetModal';
import { useProgressionStore } from '@/src/stores/useProgressionStore';
import { useNotesStore, selectAddNote } from '@/src/stores/useNotesStore';
import { useBlockSelection } from '@/src/hooks/useBlockSelection';
import * as Haptics from 'expo-haptics';
import { getTimestamp } from '@/src/utils/noteHelpers';

interface BlockEditorProps {
  blocks: Block[];
  noteId: string; // ID da nota atual (necessário para LinksBlock)
  onBlocksChange: (blocks: Block[]) => void;
  noteTitle: string;
  onTitleChange: (title: string) => void;
  existingNotes?: { id: string; title: string; blocks?: any[] }[];
  onSelectionChange?: (selectedCount: number, deleteCallback?: () => void) => void;
}

export function BlockEditor({
  blocks,
  noteId,
  onBlocksChange,
  noteTitle,
  onTitleChange,
  existingNotes = [],
  onSelectionChange,
}: BlockEditorProps) {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showLinkSuggestion, setShowLinkSuggestion] = useState(false);
  const [linkQuery, setLinkQuery] = useState('');
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>();
  const [showLinkTargetModal, setShowLinkTargetModal] = useState(false);
  const [editingLinkBlockId, setEditingLinkBlockId] = useState<string | null>(null);
  const [newLinkBlockId, setNewLinkBlockId] = useState<string | null>(null);

  const { unlockedFeatures, incrementBlocks } = useProgressionStore();
  const addNote = useNotesStore(selectAddNote);
  const blockSelection = useBlockSelection();
  const scrollViewRef = useRef<ScrollView>(null);
  const blockRefsMap = useRef<Map<string, EditableTextBlockRef | HeadingBlockRef | CalloutBlockRef>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const addBlock = useCallback((type: BlockType, insertAfter?: string) => {
    const now = getTimestamp();
    const newBlock: Block = {
      id: uuidv4(),
      type,
      createdAt: now,
      updatedAt: now,
      order: insertAfter
        ? blocks.findIndex((b) => b.id === insertAfter) + 1
        : blocks.length,
      content: type === 'text' || type === 'heading' || type === 'callout' ? '' : undefined,
      items: type === 'checklist' || type === 'list' ? [] : undefined,
      ordered: type === 'list' ? false : undefined,
      level: type === 'heading' ? 1 : undefined,
      noteRefs: type === 'links' ? [] : undefined,
      targetNoteId: type === 'link' ? '' : undefined,
    } as Block;

    const newBlocks = insertAfter
      ? [
          ...blocks.slice(0, newBlock.order),
          newBlock,
          ...blocks.slice(newBlock.order),
        ]
      : [...blocks, newBlock];

    const timestamp = getTimestamp();
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
      updatedAt: timestamp
    }));

    onBlocksChange(reorderedBlocks);
    incrementBlocks();
    setActiveBlockId(newBlock.id);

    // Se for tipo 'link', marcar para abrir modal
    if (type === 'link') {
      setNewLinkBlockId(newBlock.id);
    }

    return newBlock.id;
  }, [blocks, onBlocksChange, incrementBlocks]);

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    const timestamp = getTimestamp();
    const newBlocks = blocks.map((block) =>
      block.id === blockId
        ? { ...block, ...updates, updatedAt: timestamp }  // Usar timestamp otimizado
        : block
    );
    onBlocksChange(newBlocks);
  }, [blocks, onBlocksChange]);

  const removeBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    const timestamp = getTimestamp();
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
      updatedAt: timestamp
    }));
    onBlocksChange(reorderedBlocks);
  }, [blocks, onBlocksChange]);

  const removeSelectedBlocks = useCallback((idsToRemove: string[]) => {
    if (idsToRemove.length === 0) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const idsSet = new Set(idsToRemove);
    const newBlocks = blocks.filter(
      (block) => !idsSet.has(block.id)
    );

    const timestamp = getTimestamp();
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
      updatedAt: timestamp
    }));

    onBlocksChange(reorderedBlocks);
    blockSelection.clearSelection();

    onSelectionChange?.(0);
  }, [blocks, onBlocksChange, blockSelection, onSelectionChange]);

  const handleBlockPress = (blockId: string) => {
    if (blockSelection.isSelectionMode) {
      Haptics.selectionAsync();

      const isCurrentlySelected = blockSelection.isBlockSelected(blockId);
      const currentSelectedIds = new Set(blockSelection.selectedBlockIds);
      if (isCurrentlySelected) {
        currentSelectedIds.delete(blockId);
      } else {
        currentSelectedIds.add(blockId);
      }

      blockSelection.toggleBlockSelection(blockId);

      const newCount = currentSelectedIds.size;

      const idsArray = Array.from(currentSelectedIds);
      onSelectionChange?.(newCount, () => removeSelectedBlocks(idsArray));
    }
  };

  const handleBlockLongPress = (blockId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!blockSelection.isSelectionMode) {
      blockSelection.selectBlock(blockId);

      const idsArray = [blockId];
      onSelectionChange?.(1, () => removeSelectedBlocks(idsArray));
    }
  };

  const handleTextChange = useCallback((blockId: string, content: string, links?: NoteLink[]) => {
    if (content.endsWith('/')) {
      setShowBlockMenu(true);
      setActiveBlockId(blockId);
      return;
    }

    if (content.includes('[[') && !content.includes(']]')) {
      const linkStart = content.lastIndexOf('[[');
      const query = content.substring(linkStart + 2);
      setLinkQuery(query);
      setShowLinkSuggestion(true);
      setActiveBlockId(blockId);
    } else {
      setShowLinkSuggestion(false);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateBlock(blockId, { content, links } as any);
    }, 150);
  }, [updateBlock]);

  const handleSelectBlockType = (type: BlockType) => {
    if (activeBlockId && activeBlockId !== 'title') {
      const activeBlock = blocks.find((b) => b.id === activeBlockId);
      if (activeBlock && activeBlock.type === 'text') {
        const content = (activeBlock as any).content;
        updateBlock(activeBlockId, {
          content: content.slice(0, -1),
        } as any);
      }

      addBlock(type, activeBlockId);
    } else {
      addBlock(type);
    }
    setShowBlockMenu(false);
  };

  useEffect(() => {
    if (activeBlockId && activeBlockId !== 'title') {
      const blockRef = blockRefsMap.current.get(activeBlockId);
      if (blockRef) {
        setTimeout(() => {
          blockRef.focus();
        }, 100);
      }
    }
  }, [activeBlockId, blocks.length]);

  // Abrir modal automaticamente quando um novo link é criado
  useEffect(() => {
    if (newLinkBlockId) {
      const timer = setTimeout(() => {
        setShowLinkTargetModal(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [newLinkBlockId]);

  const handleSelectLink = (noteId: string, noteTitle: string) => {
    if (activeBlockId) {
      const activeBlock = blocks.find((b) => b.id === activeBlockId);
      if (activeBlock && activeBlock.type === 'text') {
        const content = (activeBlock as any).content;
        const linkStart = content.lastIndexOf('[[');
        const newContent =
          content.substring(0, linkStart) + `[[${noteTitle}]] ` + content.substring(content.length);

        handleTextChange(activeBlockId, newContent);
      }
    }
    setShowLinkSuggestion(false);
  };

  const handleCreateNewNote = (title: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newNote = addNote({
      title: title.trim(),
      blocks: [],
      tags: [],
      color: theme.colors.accent.primary,
    });
    handleSelectLink(newNote.id, newNote.title);
  };

  // Handler para LinkBlock
  const handleSelectLinkTarget = (noteId: string, noteTitle: string) => {
    // Se estamos editando um link existente
    if (editingLinkBlockId) {
      updateBlock(editingLinkBlockId, {
        targetNoteId: noteId,
        displayText: noteTitle,
      } as any);
      setEditingLinkBlockId(null);
    } else if (newLinkBlockId) {
      // Se estamos criando um novo link
      updateBlock(newLinkBlockId, {
        targetNoteId: noteId,
        displayText: noteTitle,
      } as any);
      setNewLinkBlockId(null);
    } else {
      // Fallback: pegar o último bloco adicionado
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock && lastBlock.type === 'link') {
        updateBlock(lastBlock.id, {
          targetNoteId: noteId,
          displayText: noteTitle,
        } as any);
      }
    }
    setShowLinkTargetModal(false);
  };

  const handleEditLinkBlock = (blockId: string) => {
    setEditingLinkBlockId(blockId);
    setShowLinkTargetModal(true);
  };

  const renderBlock = (block: Block) => {
    const isSelected = blockSelection.isBlockSelected(block.id);
    const isSelectionMode = blockSelection.isSelectionMode;

    switch (block.type) {
      case 'text':
        return (
          <EditableTextBlock
            key={block.id}
            ref={(ref) => {
              if (ref) {
                blockRefsMap.current.set(block.id, ref);
              } else {
                blockRefsMap.current.delete(block.id);
              }
            }}
            blockId={block.id}
            content={(block as any).content || ''}
            onContentChange={(content, links) => handleTextChange(block.id, content, links)}
            onDelete={() => removeBlock(block.id)}
            existingNotes={existingNotes}
            showDragHandle
            onFocus={() => setActiveBlockId(block.id)}
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            onPress={() => handleBlockPress(block.id)}
            onLongPress={() => handleBlockLongPress(block.id)}
          />
        );

      case 'heading':
        return (
          <HeadingBlock
            key={block.id}
            ref={(ref) => {
              if (ref) {
                blockRefsMap.current.set(block.id, ref);
              } else {
                blockRefsMap.current.delete(block.id);
              }
            }}
            blockId={block.id}
            content={(block as any).content || ''}
            level={(block as any).level || 1}
            onContentChange={(content) => updateBlock(block.id, { content } as any)}
            onDelete={() => removeBlock(block.id)}
            showDragHandle
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            onPress={() => handleBlockPress(block.id)}
            onLongPress={() => handleBlockLongPress(block.id)}
          />
        );

      case 'list':
        return (
          <ListBlockComponent
            key={block.id}
            blockId={block.id}
            items={(block as any).items || []}
            ordered={(block as any).ordered || false}
            onItemsChange={(items) => updateBlock(block.id, { items } as any)}
            onDelete={() => removeBlock(block.id)}
            showDragHandle
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            onPress={() => handleBlockPress(block.id)}
            onLongPress={() => handleBlockLongPress(block.id)}
          />
        );

      case 'checklist':
        return (
          <EditableChecklistBlock
            key={block.id}
            blockId={block.id}
            items={(block as any).items || []}
            onItemsChange={(items) => updateBlock(block.id, { items } as any)}
            onDelete={() => removeBlock(block.id)}
            showDragHandle
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            onPress={() => handleBlockPress(block.id)}
            onLongPress={() => handleBlockLongPress(block.id)}
          />
        );

      case 'callout':
        return (
          <CalloutBlockComponent
            key={block.id}
            ref={(ref) => {
              if (ref) {
                blockRefsMap.current.set(block.id, ref);
              } else {
                blockRefsMap.current.delete(block.id);
              }
            }}
            blockId={block.id}
            content={(block as any).content || ''}
            icon={(block as any).icon}
            color={(block as any).color}
            onContentChange={(content) => updateBlock(block.id, { content } as any)}
            onDelete={() => removeBlock(block.id)}
            showDragHandle
            isSelected={isSelected}
            isSelectionMode={isSelectionMode}
            onPress={() => handleBlockPress(block.id)}
            onLongPress={() => handleBlockLongPress(block.id)}
          />
        );

      case 'divider':
        return <DividerBlockComponent key={block.id} blockId={block.id} onDelete={() => removeBlock(block.id)} showDragHandle isSelected={isSelected} isSelectionMode={isSelectionMode} onPress={() => handleBlockPress(block.id)} onLongPress={() => handleBlockLongPress(block.id)} />;

      case 'link':
        return (
          <LinkBlock
            key={block.id}
            block={block as any}
            onUpdate={(updatedBlock) => updateBlock(block.id, updatedBlock as any)}
            onDelete={() => removeBlock(block.id)}
            isEditing={!isSelectionMode}
            onEditPress={() => handleEditLinkBlock(block.id)}
          />
        );

      case 'links':
        return (
          <LinksBlock
            key={block.id}
            block={block as any}
            noteId={noteId}
            onUpdate={(updatedBlock) => updateBlock(block.id, updatedBlock as any)}
            onDelete={() => removeBlock(block.id)}
            isEditing={!isSelectionMode}
          />
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <EditableTextBlock
          blockId="title"
          content={noteTitle}
          placeholder="Título da nota"
          onContentChange={(content) => onTitleChange(content)}
          multiline={false}
          autoFocus={!noteTitle}
          showDragHandle={false}
          isSelected={false}
          isSelectionMode={false}
        />

        <View style={styles.blocksContainer}>
          {blocks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="body" color="secondary" style={styles.emptyText}>
                Digite "/" para adicionar blocos
              </Text>
            </View>
          ) : (
            blocks.map((block) => renderBlock(block))
          )}
        </View>

        <Pressable style={styles.addButton} onPress={() => setShowBlockMenu(true)}>
          <Ionicons name="add-circle-outline" size={20} color={theme.colors.accent.primary} />
          <Text variant="body" style={styles.addButtonText}>
            Adicionar bloco
          </Text>
        </Pressable>
      </ScrollView>

      {showBlockMenu && (
        <BlockMenu
          onSelectBlock={handleSelectBlockType}
          onClose={() => setShowBlockMenu(false)}
          unlockedFeatures={unlockedFeatures}
          position={menuPosition}
        />
      )}

      {showLinkSuggestion && (
        <LinkSuggestionPopup
          query={linkQuery}
          notes={existingNotes}
          onSelectNote={handleSelectLink}
          onCreateNew={handleCreateNewNote}
          onClose={() => setShowLinkSuggestion(false)}
          position={menuPosition}
        />
      )}

      {showLinkTargetModal && (
        <SelectLinkTargetModal
          visible={showLinkTargetModal}
          currentNoteId={noteId}
          currentTargetId={
            editingLinkBlockId
              ? (blocks.find((b) => b.id === editingLinkBlockId) as any)?.targetNoteId
              : undefined
          }
          onClose={() => {
            setShowLinkTargetModal(false);
            setEditingLinkBlockId(null);
            setNewLinkBlockId(null);
          }}
          onSelectNote={handleSelectLinkTarget}
        />
      )}
    </KeyboardAvoidingView>
  );
}

function ChecklistBlockComponent({
  blockId,
  items,
  onItemsChange,
  showDragHandle,
}: {
  blockId: string;
  items: any[];
  onItemsChange: (items: any[]) => void;
  showDragHandle?: boolean;
}) {
  const ChecklistBlockOrig = require('../blocks/ChecklistBlock').ChecklistBlock;
  return <ChecklistBlockOrig items={items} onItemsChange={onItemsChange} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl * 2,
  },
  blocksContainer: {
    marginTop: theme.spacing.md,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: theme.colors.accent.primary,
  },
});
