import { Note, NoteViewModel, NoteLink, Block } from '@/src/types/note.types';
import {
  getParent,
  getChildren,
  getSiblings,
  getAncestors,
  getDescendants,
  calculateHierarchyMetadata,
} from './hierarchyHelpers';

/**
 * Obtém timestamp atual (otimizado para chamadas em lote)
 * Usa o mesmo timestamp se chamado múltiplas vezes no mesmo tick
 */
let lastTimestamp = 0;
let lastTimestampTime = 0;

export function getTimestamp(): number {
  const now = Date.now();
  // Se foi chamado no mesmo milissegundo, retorna o mesmo timestamp
  if (now === lastTimestampTime) {
    return lastTimestamp;
  }
  lastTimestampTime = now;
  lastTimestamp = now;
  return now;
}

/**
 * Deep clone de objetos para evitar mutações
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }

  if (obj instanceof Set) {
    return new Set(Array.from(obj).map(item => deepClone(item))) as T;
  }

  if (obj instanceof Map) {
    const clonedMap = new Map();
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key), deepClone(value));
    });
    return clonedMap as T;
  }

  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}

/**
 * Deep clone específico para blocos (mais performático)
 */
export function cloneBlock(block: Block): Block {
  return {
    ...block,
    items: block.items ? [...block.items] : undefined,
    links: block.links ? [...block.links] : undefined,
  } as Block;
}

/**
 * Deep clone específico para notas (mais performático)
 */
export function cloneNote(note: Note): Note {
  return {
    ...note,
    blocks: note.blocks.map(cloneBlock),
    tags: [...note.tags],
  };
}

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

// Cache para ViewModel calculations
const viewModelCache = new Map<string, { timestamp: number; viewModel: NoteViewModel }>();
const CACHE_TTL = 5000; // 5 segundos de cache

/**
 * Limpa cache de ViewModels antigos
 */
function cleanViewModelCache() {
  const now = Date.now();
  for (const [key, value] of viewModelCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      viewModelCache.delete(key);
    }
  }
}

/**
 * Converte uma Note para NoteViewModel com campos calculados (com cache)
 */
export function toNoteViewModel(note: Note, allNotes: Note[]): NoteViewModel {
  // Cria chave de cache baseada no ID da nota e timestamp de atualização
  const cacheKey = `${note.id}-${note.updatedAt}`;

  // Verifica cache
  const cached = viewModelCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.viewModel;
  }

  // Limpa cache periodicamente
  if (viewModelCache.size > 100) {
    cleanViewModelCache();
  }

  // Calcula ViewModel com dados hierárquicos
  const parent = getParent(note, allNotes);
  const children = getChildren(note, allNotes);
  const siblings = getSiblings(note, allNotes);
  const ancestors = getAncestors(note, allNotes);
  const descendants = getDescendants(note, allNotes);
  const metadata = calculateHierarchyMetadata(note, allNotes);

  const viewModel: NoteViewModel = {
    ...note,
    backlinks: calculateBacklinks(note.id, allNotes),
    connections: calculateConnections(note.id, allNotes),

    // 🆕 Dados hierárquicos
    parent,
    children,
    siblings,
    ancestors,
    descendants,
    metadata,
  };

  // Armazena no cache
  viewModelCache.set(cacheKey, {
    timestamp: Date.now(),
    viewModel,
  });

  return viewModel;
}

/**
 * Converte múltiplas Notes para NoteViewModels
 */
export function toNoteViewModels(notes: Note[]): NoteViewModel[] {
  return notes.map((note) => toNoteViewModel(note, notes));
}

/**
 * Limpa todo o cache de ViewModels (útil após updates massivos)
 */
export function clearViewModelCache() {
  viewModelCache.clear();
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
