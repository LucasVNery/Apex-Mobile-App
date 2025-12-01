import { Note, HierarchySuggestion } from '@/src/types/note.types';
import { calculateDepth, calculatePath } from './hierarchyHelpers';

/**
 * Migra notas antigas para novo formato com hierarquia
 * Adiciona campos padrão se não existirem
 */
export function migrateNotesToHierarchy(notes: Note[]): Note[] {
  return notes.map(note => ({
    ...note,
    parentId: note.parentId ?? undefined,
    childrenIds: note.childrenIds ?? [],
    depth: note.depth ?? calculateDepth(note, notes),
    path: note.path ?? calculatePath(note, notes),
    isRoot: note.isRoot ?? !note.parentId,
    hierarchyOrder: note.hierarchyOrder ?? 0,
  }));
}

/**
 * Detecta possíveis hierarquias baseado em links
 * Retorna sugestões de relações parent-child
 */
export function inferHierarchyFromLinks(notes: Note[]): HierarchySuggestion[] {
  const suggestions: HierarchySuggestion[] = [];

  notes.forEach(note => {
    // Extrai todos os links da nota
    const allLinks: string[] = [];
    note.blocks.forEach(block => {
      if (block.type === 'text' && block.links) {
        block.links.forEach(link => {
          if (link.targetNoteId) {
            allLinks.push(link.targetNoteId);
          }
        });
      }
    });

    // Se tem 3+ links e não tem pai, pode ser hub
    if (allLinks.length >= 3 && !note.parentId) {
      allLinks.forEach(targetId => {
        const target = notes.find(n => n.id === targetId);

        // Se target não tem pai, sugere como filho
        if (target && !target.parentId) {
          const confidence = allLinks.length >= 5 ? 'high' : 'medium';
          const reason = `Nota "${note.title}" tem ${allLinks.length} links, incluindo "${target.title}"`;

          suggestions.push({
            childId: targetId,
            childTitle: target.title,
            confidence,
            reason,
          });
        }
      });
    }
  });

  return suggestions;
}

/**
 * Aplica sugestão de hierarquia automaticamente
 * Atualiza parentId e childrenIds
 */
export function applySuggestion(
  parentId: string,
  childId: string,
  notes: Note[]
): Note[] {
  return notes.map(note => {
    if (note.id === parentId) {
      // Adiciona filho à lista de children
      const childrenIds = note.childrenIds ?? [];
      if (!childrenIds.includes(childId)) {
        return {
          ...note,
          childrenIds: [...childrenIds, childId],
        };
      }
    }

    if (note.id === childId) {
      // Define parentId do filho
      return {
        ...note,
        parentId: parentId,
        depth: calculateDepth({ ...note, parentId }, notes),
        path: calculatePath({ ...note, parentId }, notes),
        isRoot: false,
      };
    }

    return note;
  });
}
