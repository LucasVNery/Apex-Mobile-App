import { useEffect } from 'react';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { useProgressionStore } from '@/src/stores/useProgressionStore';

/**
 * Componente que sincroniza o ProgressionStore com os dados reais do NotesStore
 *
 * Garante que os contadores (notesCreated, linksCreated, etc) estejam sempre
 * corretos baseados nos dados reais, evitando inconsistências.
 */
export function ProgressionSync() {
  const { notes, getTotalLinks, getTotalBlocks, getUniqueTags } = useNotesStore();
  const { syncWithRealData } = useProgressionStore();

  useEffect(() => {
    // Calcular métricas reais dos dados
    const notesCount = notes.length;
    const linksCount = getTotalLinks();
    const blocksCount = getTotalBlocks();
    const tagsCount = getUniqueTags().length;

    // Sincronizar com ProgressionStore
    syncWithRealData(notesCount, linksCount, blocksCount, tagsCount);
  }, [notes, getTotalLinks, getTotalBlocks, getUniqueTags, syncWithRealData]);

  // Componente não renderiza nada
  return null;
}
