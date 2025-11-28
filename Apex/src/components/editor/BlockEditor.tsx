import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import { theme } from '@/src/theme';
import { Block, BlockType, NoteLink } from '@/src/types/note.types';
import { EditableTextBlock, EditableTextBlockRef } from '../blocks/EditableTextBlock';
import { HeadingBlock } from '../blocks/HeadingBlock';
import { ListBlockComponent } from '../blocks/ListBlockComponent';
import { CalloutBlockComponent } from '../blocks/CalloutBlockComponent';
import { DividerBlockComponent } from '../blocks/DividerBlockComponent';
import { EditableChecklistBlock } from '../blocks/EditableChecklistBlock';
import { ChecklistBlock as ChecklistBlockType } from '@/src/types/note.types';
import { BlockMenu } from './BlockMenu';
import { LinkSuggestionPopup } from './LinkSuggestionPopup';
import { useProgressionStore } from '@/src/stores/useProgressionStore';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { useBlockSelection } from '@/src/hooks/useBlockSelection';
import * as Haptics from 'expo-haptics';

interface BlockEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  noteTitle: string;
  onTitleChange: (title: string) => void;
  existingNotes?: { id: string; title: string; blocks?: any[] }[];
  onSelectionChange?: (selectedCount: number, deleteCallback?: () => void) => void;
}

export function BlockEditor({
  blocks,
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

  const { unlockedFeatures, incrementBlocks } = useProgressionStore();
  const { addNote } = useNotesStore();
  const blockSelection = useBlockSelection();
  const scrollViewRef = useRef<ScrollView>(null);
  const blockRefsMap = useRef<Map<string, EditableTextBlockRef>>(new Map());

  const addBlock = (type: BlockType, insertAfter?: string) => {
    const now = Date.now();
    const newBlock: Block = {
      id: uuidv4(),  // Usar UUID em vez de Date.now()
      type,
      createdAt: now,  // Timestamp
      updatedAt: now,  // Timestamp
      order: insertAfter
        ? blocks.findIndex((b) => b.id === insertAfter) + 1
        : blocks.length,
      content: type === 'text' || type === 'heading' || type === 'callout' ? '' : undefined,
      items: type === 'checklist' || type === 'list' ? [] : undefined,
      ordered: type === 'list' ? false : undefined,
      level: type === 'heading' ? 1 : undefined,
    } as Block;

    const newBlocks = insertAfter
      ? [
          ...blocks.slice(0, newBlock.order),
          newBlock,
          ...blocks.slice(newBlock.order),
        ]
      : [...blocks, newBlock];

    // Atualiza ordem
    newBlocks.forEach((block, index) => {
      block.order = index;
    });

    onBlocksChange(newBlocks);
    incrementBlocks();
    setActiveBlockId(newBlock.id);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId
        ? { ...block, ...updates, updatedAt: Date.now() }  // Usar timestamp
        : block
    );
    onBlocksChange(newBlocks);
  };

  const removeBlock = (blockId: string) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    // Atualiza ordem
    newBlocks.forEach((block, index) => {
      block.order = index;
    });
    onBlocksChange(newBlocks);
  };

  const removeSelectedBlocks = () => {
    // Captura o estado atual dos IDs selecionados
    const currentSelectedIds = new Set(blockSelection.selectedBlockIds);

    if (currentSelectedIds.size === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newBlocks = blocks.filter(
      (block) => !currentSelectedIds.has(block.id)
    );

    // Atualiza ordem
    newBlocks.forEach((block, index) => {
      block.order = index;
    });

    onBlocksChange(newBlocks);
    blockSelection.clearSelection();

    // Notifica o pai sobre a mudança
    onSelectionChange?.(0);
  };

  const handleBlockPress = (blockId: string) => {
    if (blockSelection.isSelectionMode) {
      // Modo de seleção ativo: toggle seleção
      Haptics.selectionAsync();

      const isCurrentlySelected = blockSelection.isBlockSelected(blockId);
      blockSelection.toggleBlockSelection(blockId);

      // Calcula o novo count baseado no estado atual
      const newCount = isCurrentlySelected
        ? blockSelection.getSelectedCount() - 1
        : blockSelection.getSelectedCount() + 1;

      onSelectionChange?.(newCount, removeSelectedBlocks);
    }
  };

  const handleBlockLongPress = (blockId: string) => {
    // Long press inicia modo de seleção
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!blockSelection.isSelectionMode) {
      // Primeiro long press - inicia modo de seleção
      blockSelection.selectBlock(blockId);
      onSelectionChange?.(1, removeSelectedBlocks);
    }
  };

  const handleTextChange = (blockId: string, content: string, links?: NoteLink[]) => {
    // Detecta comando "/"
    if (content.endsWith('/')) {
      setShowBlockMenu(true);
      setActiveBlockId(blockId);
      return;
    }

    // Detecta início de link "[["
    if (content.includes('[[') && !content.includes(']]')) {
      const linkStart = content.lastIndexOf('[[');
      const query = content.substring(linkStart + 2);
      setLinkQuery(query);
      setShowLinkSuggestion(true);
      setActiveBlockId(blockId);
    } else {
      setShowLinkSuggestion(false);
    }

    updateBlock(blockId, { content, links } as any);
  };

  const handleSelectBlockType = (type: BlockType) => {
    if (activeBlockId && activeBlockId !== 'title') {
      // Remove o "/" do texto se veio de um bloco existente
      const activeBlock = blocks.find((b) => b.id === activeBlockId);
      if (activeBlock && activeBlock.type === 'text') {
        const content = (activeBlock as any).content;
        updateBlock(activeBlockId, {
          content: content.slice(0, -1),
        } as any);
      }

      // Adiciona novo bloco do tipo selecionado após o bloco ativo
      addBlock(type, activeBlockId);
    } else {
      // Se não há activeBlockId ou é o título, adiciona ao final
      addBlock(type);
    }
    setShowBlockMenu(false);
  };

  const handleSelectLink = (noteId: string, noteTitle: string) => {
    if (activeBlockId) {
      const activeBlock = blocks.find((b) => b.id === activeBlockId);
      if (activeBlock && activeBlock.type === 'text') {
        const content = (activeBlock as any).content;
        const linkStart = content.lastIndexOf('[[');
        const newContent =
          content.substring(0, linkStart) + `[[${noteTitle}]] ` + content.substring(content.length);

        handleTextChange(activeBlockId, newContent);

        // Mantém o foco no bloco para continuar editando
        // Adiciona um espaço após o link para facilitar continuar digitando
      }
    }
    setShowLinkSuggestion(false);
  };

  const handleCreateNewNote = (title: string) => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Cria novo ambiente
    const newNote = addNote({
      title: title.trim(),
      blocks: [], // Começa vazio, usuário escolhe primeiro bloco
      tags: [],
      color: theme.colors.accent.primary,
    });

    // Insere link para o novo ambiente
    handleSelectLink(newNote.id, newNote.title);
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
        {/* Title Editor */}
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

        {/* Blocks */}
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

        {/* Add Block Button */}
        <Pressable style={styles.addButton} onPress={() => setShowBlockMenu(true)}>
          <Ionicons name="add-circle-outline" size={20} color={theme.colors.accent.primary} />
          <Text variant="body" style={styles.addButtonText}>
            Adicionar bloco
          </Text>
        </Pressable>
      </ScrollView>

      {/* Block Menu */}
      {showBlockMenu && (
        <BlockMenu
          onSelectBlock={handleSelectBlockType}
          onClose={() => setShowBlockMenu(false)}
          unlockedFeatures={unlockedFeatures}
          position={menuPosition}
        />
      )}

      {/* Link Suggestion Popup */}
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
    </KeyboardAvoidingView>
  );
}

// Componente auxiliar para Checklist (reutiliza ChecklistBlock existente)
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
  // Importa o componente existente
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
