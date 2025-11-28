import { Note, NoteViewModel, NoteLink } from '@/src/types/note.types';

/**
 * Calcula os backlinks de uma nota (quais notas linkam para ela)
 */
export function calculateBacklinks(noteId: string, allNotes: Note[]): string[] {
  const backlinks: string[] = [];

  for (const note of allNotes) {
    if (note.id === noteId) continue; // Ignorar a própria nota

    // Verificar se algum bloco desta nota contém links para a nota alvo
    const hasLinkToTarget = note.blocks.some((block) => {
      if (block.type === 'text' && block.links) {
        return block.links.some((link: NoteLink) => link.targetNoteId === noteId);
      }
      return false;
    });

    if (hasLinkToTarget) {
      backlinks.push(note.id);
    }
  }

  return backlinks;
}

/**
 * Calcula o número total de conexões de uma nota
 * (links que ela faz + links que recebe)
 */
export function calculateConnections(noteId: string, allNotes: Note[]): number {
  let connections = 0;

  // Contar links que esta nota faz
  const targetNote = allNotes.find((n) => n.id === noteId);
  if (targetNote) {
    for (const block of targetNote.blocks) {
      if (block.type === 'text' && block.links) {
        connections += block.links.length;
      }
    }
  }

  // Contar links que outras notas fazem para esta
  const backlinks = calculateBacklinks(noteId, allNotes);
  connections += backlinks.length;

  return connections;
}

/**
 * Converte uma Note para NoteViewModel com campos calculados
 */
export function toNoteViewModel(note: Note, allNotes: Note[]): NoteViewModel {
  return {
    ...note,
    backlinks: calculateBacklinks(note.id, allNotes),
    connections: calculateConnections(note.id, allNotes),
  };
}

/**
 * Converte múltiplas Notes para NoteViewModels
 */
export function toNoteViewModels(notes: Note[]): NoteViewModel[] {
  return notes.map((note) => toNoteViewModel(note, notes));
}

/**
 * Extrai todos os links de uma nota
 */
export function extractAllLinks(note: Note): NoteLink[] {
  const links: NoteLink[] = [];

  for (const block of note.blocks) {
    if (block.type === 'text' && block.links) {
      links.push(...block.links);
    }
  }

  return links;
}

/**
 * Conta o total de links em todas as notas
 */
export function countTotalLinks(notes: Note[]): number {
  let count = 0;

  for (const note of notes) {
    count += extractAllLinks(note).length;
  }

  return count;
}

/**
 * Conta o total de blocos em todas as notas
 */
export function countTotalBlocks(notes: Note[]): number {
  return notes.reduce((total, note) => total + note.blocks.length, 0);
}

/**
 * Extrai todas as tags únicas de todas as notas
 */
export function extractUniqueTags(notes: Note[]): string[] {
  const tagsSet = new Set<string>();

  for (const note of notes) {
    for (const tag of note.tags) {
      tagsSet.add(tag);
    }
  }

  return Array.from(tagsSet);
}

/**
 * Encontra notas que contém uma tag específica
 */
export function findNotesByTag(tag: string, notes: Note[]): Note[] {
  return notes.filter((note) => note.tags.includes(tag));
}

/**
 * Encontra notas conectadas a uma nota específica
 */
export function findConnectedNotes(noteId: string, notes: Note[]): Note[] {
  const connectedIds = new Set<string>();

  // Notas para as quais esta nota linka
  const sourceNote = notes.find((n) => n.id === noteId);
  if (sourceNote) {
    const links = extractAllLinks(sourceNote);
    links.forEach((link) => {
      if (link.targetNoteId) {
        connectedIds.add(link.targetNoteId);
      }
    });
  }

  // Notas que linkam para esta nota
  const backlinks = calculateBacklinks(noteId, notes);
  backlinks.forEach((id) => connectedIds.add(id));

  // Retornar as notas conectadas
  return notes.filter((note) => connectedIds.has(note.id));
}
