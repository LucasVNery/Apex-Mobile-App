import { useState, useCallback } from 'react';
import { Block } from '@/src/types/note.types';

export interface BlockSelectionHook {
  selectedBlockIds: Set<string>;
  isSelectionMode: boolean;
  toggleBlockSelection: (blockId: string) => void;
  selectBlock: (blockId: string) => void;
  deselectBlock: (blockId: string) => void;
  selectAllBlocks: (blockIds: string[]) => void;
  clearSelection: () => void;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  isBlockSelected: (blockId: string) => boolean;
  getSelectedCount: () => number;
}

/**
 * Hook personalizado para gerenciar seleção de blocos
 * Permite seleção múltipla e é escalável para futuros recursos
 */
export function useBlockSelection(): BlockSelectionHook {
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleBlockSelection = useCallback((blockId: string) => {
    setSelectedBlockIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      // Se não há mais blocos selecionados, sai do modo de seleção
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      return newSet;
    });
  }, []);

  const selectBlock = useCallback((blockId: string) => {
    setSelectedBlockIds((prev) => new Set(prev).add(blockId));
    setIsSelectionMode(true);
  }, []);

  const deselectBlock = useCallback((blockId: string) => {
    setSelectedBlockIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(blockId);
      // Se não há mais blocos selecionados, sai do modo de seleção
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      return newSet;
    });
  }, []);

  const selectAllBlocks = useCallback((blockIds: string[]) => {
    setSelectedBlockIds(new Set(blockIds));
    setIsSelectionMode(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBlockIds(new Set());
    setIsSelectionMode(false);
  }, []);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedBlockIds(new Set());
  }, []);

  const isBlockSelected = useCallback(
    (blockId: string) => {
      return selectedBlockIds.has(blockId);
    },
    [selectedBlockIds]
  );

  const getSelectedCount = useCallback(() => {
    return selectedBlockIds.size;
  }, [selectedBlockIds]);

  return {
    selectedBlockIds,
    isSelectionMode,
    toggleBlockSelection,
    selectBlock,
    deselectBlock,
    selectAllBlocks,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    isBlockSelected,
    getSelectedCount,
  };
}
