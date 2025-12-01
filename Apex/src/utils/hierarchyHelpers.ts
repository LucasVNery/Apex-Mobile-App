import { Note, HierarchyMetadata } from '@/src/types/note.types';

// ==========================================
// VALIDAÇÕES
// ==========================================

/**
 * Verifica se nota é raiz (não tem pai)
 */
export function isRoot(note: Note): boolean {
  return !note.parentId;
}

/**
 * Verifica se nota é folha (não tem filhos)
 */
export function isLeaf(note: Note): boolean {
  return !note.childrenIds || note.childrenIds.length === 0;
}

/**
 * Verifica se nota tem pai
 */
export function hasParent(note: Note): boolean {
  return !!note.parentId;
}

// ==========================================
// CÁLCULOS DE HIERARQUIA
// ==========================================

/**
 * Calcula profundidade da nota na árvore
 * Raiz = 0, Filhos = 1, Netos = 2, etc.
 */
export function calculateDepth(note: Note, allNotes: Note[]): number {
  if (!note.parentId) return 0;

  let depth = 0;
  let currentId = note.parentId;

  // Percorre até encontrar raiz (max 10 níveis para evitar loop infinito)
  while (currentId && depth < 10) {
    const parent = allNotes.find(n => n.id === currentId);
    if (!parent || !parent.parentId) break;
    currentId = parent.parentId;
    depth++;
  }

  return depth + 1; // +1 porque temos um pai
}

/**
 * Calcula caminho completo até a raiz
 * Retorna: [rootId, ...ancestorIds, parentId]
 */
export function calculatePath(note: Note, allNotes: Note[]): string[] {
  if (!note.parentId) return []; // Raiz não tem caminho

  const path: string[] = [];
  let currentId = note.parentId;

  // Percorre ancestrais até raiz
  while (currentId) {
    path.unshift(currentId); // Adiciona no início
    const parent = allNotes.find(n => n.id === currentId);
    if (!parent || !parent.parentId) break;
    currentId = parent.parentId;
  }

  return path;
}

/**
 * Conta filhos diretos
 */
export function countChildren(note: Note): number {
  return note.childrenIds?.length ?? 0;
}

/**
 * Conta todos os descendentes (recursivo)
 */
export function countDescendants(note: Note, allNotes: Note[]): number {
  if (!note.childrenIds || note.childrenIds.length === 0) return 0;

  let count = note.childrenIds.length; // Filhos diretos

  // Adiciona descendentes de cada filho
  note.childrenIds.forEach(childId => {
    const child = allNotes.find(n => n.id === childId);
    if (child) {
      count += countDescendants(child, allNotes);
    }
  });

  return count;
}

// ==========================================
// NAVEGAÇÃO NA HIERARQUIA
// ==========================================

/**
 * Retorna nota pai (se existir)
 */
export function getParent(note: Note, allNotes: Note[]): Note | undefined {
  if (!note.parentId) return undefined;
  return allNotes.find(n => n.id === note.parentId);
}

/**
 * Retorna filhos diretos
 */
export function getChildren(note: Note, allNotes: Note[]): Note[] {
  if (!note.childrenIds || note.childrenIds.length === 0) return [];

  return note.childrenIds
    .map(id => allNotes.find(n => n.id === id))
    .filter((n): n is Note => n !== undefined)
    .sort((a, b) => (a.hierarchyOrder ?? 0) - (b.hierarchyOrder ?? 0));
}

/**
 * Retorna irmãos (notas com mesmo pai)
 */
export function getSiblings(note: Note, allNotes: Note[]): Note[] {
  if (!note.parentId) {
    // Se é raiz, retorna outras raízes
    return allNotes.filter(n => !n.parentId && n.id !== note.id);
  }

  return allNotes.filter(n =>
    n.parentId === note.parentId && n.id !== note.id
  );
}

/**
 * Retorna todos os ancestrais até a raiz
 */
export function getAncestors(note: Note, allNotes: Note[]): Note[] {
  const ancestors: Note[] = [];
  let currentId = note.parentId;

  while (currentId) {
    const ancestor = allNotes.find(n => n.id === currentId);
    if (!ancestor) break;
    ancestors.push(ancestor);
    currentId = ancestor.parentId;
  }

  return ancestors.reverse(); // Raiz primeiro
}

/**
 * Retorna todos os descendentes (recursivo)
 */
export function getDescendants(note: Note, allNotes: Note[]): Note[] {
  const descendants: Note[] = [];

  const collectDescendants = (parentNote: Note) => {
    const children = getChildren(parentNote, allNotes);
    descendants.push(...children);
    children.forEach(child => collectDescendants(child));
  };

  collectDescendants(note);
  return descendants;
}

// ==========================================
// METADADOS
// ==========================================

/**
 * Calcula todos os metadados de hierarquia
 */
export function calculateHierarchyMetadata(
  note: Note,
  allNotes: Note[]
): HierarchyMetadata {
  return {
    depth: calculateDepth(note, allNotes),
    path: calculatePath(note, allNotes),
    childrenCount: countChildren(note),
    descendantsCount: countDescendants(note, allNotes),
    isRoot: isRoot(note),
    isLeaf: isLeaf(note),
    hasParent: hasParent(note),
  };
}

// ==========================================
// VALIDAÇÃO DE INTEGRIDADE
// ==========================================

/**
 * Valida se hierarquia de uma nota está íntegra
 */
export function validateHierarchy(note: Note, allNotes: Note[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validação 1: Parent existe?
  if (note.parentId) {
    const parent = allNotes.find(n => n.id === note.parentId);
    if (!parent) {
      errors.push(`Parent ${note.parentId} não encontrado`);
    } else {
      // Validação 2: Parent tem este filho na lista?
      if (!parent.childrenIds?.includes(note.id)) {
        errors.push(`Parent não lista esta nota como filho`);
      }
    }
  }

  // Validação 3: Filhos existem?
  if (note.childrenIds) {
    note.childrenIds.forEach(childId => {
      const child = allNotes.find(n => n.id === childId);
      if (!child) {
        errors.push(`Filho ${childId} não encontrado`);
      } else {
        // Validação 4: Filho aponta de volta?
        if (child.parentId !== note.id) {
          errors.push(`Filho ${childId} não aponta de volta para esta nota`);
        }
      }
    });
  }

  // Validação 5: Não há loop circular
  const ancestors = getAncestors(note, allNotes);
  if (ancestors.some(a => a.id === note.id)) {
    errors.push(`Loop circular detectado na hierarquia`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida todas as notas
 */
export function validateAllHierarchies(allNotes: Note[]): {
  valid: boolean;
  noteErrors: Record<string, string[]>;
} {
  const noteErrors: Record<string, string[]> = {};

  allNotes.forEach(note => {
    const validation = validateHierarchy(note, allNotes);
    if (!validation.valid) {
      noteErrors[note.id] = validation.errors;
    }
  });

  return {
    valid: Object.keys(noteErrors).length === 0,
    noteErrors,
  };
}
