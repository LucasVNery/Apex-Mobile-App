import { Note } from '@/src/types/note.types';
import {
  calculateDepth,
  calculatePath,
  getAncestors,
  getDescendants,
  getChildren,
} from './hierarchyHelpers';
import { v4 as uuidv4 } from 'uuid';
import { getTimestamp } from './noteHelpers';

// ==========================================
// CONSTANTES
// ==========================================

const MAX_HIERARCHY_DEPTH = 10;

// ==========================================
// VALIDAÇÕES
// ==========================================

/**
 * Verifica se adicionar child ao parent criaria um loop circular
 */
function wouldCreateCircularReference(
  parentId: string,
  childId: string,
  allNotes: Note[]
): boolean {
  if (parentId === childId) return true;

  const child = allNotes.find(n => n.id === childId);
  if (!child) return false;

  // Verifica se parent é descendente de child
  const childDescendants = getDescendants(child, allNotes);
  return childDescendants.some(d => d.id === parentId);
}

/**
 * Verifica se nota excederia profundidade máxima
 */
function wouldExceedMaxDepth(
  parentId: string,
  allNotes: Note[]
): boolean {
  const parent = allNotes.find(n => n.id === parentId);
  if (!parent) return false;

  const parentDepth = calculateDepth(parent, allNotes);
  return parentDepth >= MAX_HIERARCHY_DEPTH - 1;
}

// ==========================================
// CRUD - CRIAR
// ==========================================

/**
 * Cria uma nova nota como filha de um pai específico
 * Atualiza automaticamente childrenIds do pai e parentId do filho
 *
 * @param parentId - ID da nota pai
 * @param childData - Dados da nota filha (sem id, parentId)
 * @param allNotes - Array de todas as notas
 * @returns Array atualizado de notas + nota filha criada
 */
export function createChildNote(
  parentId: string,
  childData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'parentId'>,
  allNotes: Note[]
): { notes: Note[]; newChild: Note } {
  // Validação 1: Parent existe?
  const parent = allNotes.find(n => n.id === parentId);
  if (!parent) {
    throw new Error(`Parent com ID ${parentId} não encontrado`);
  }

  // Validação 2: Profundidade máxima
  if (wouldExceedMaxDepth(parentId, allNotes)) {
    throw new Error(`Profundidade máxima de ${MAX_HIERARCHY_DEPTH} níveis atingida`);
  }

  const timestamp = getTimestamp();

  // Criar nova nota
  const newChild: Note = {
    ...childData,
    id: uuidv4(),
    createdAt: timestamp,
    updatedAt: timestamp,
    parentId: parentId,
  };

  // Calcular metadados hierárquicos
  const tempNotes = [...allNotes, newChild];
  newChild.depth = calculateDepth(newChild, tempNotes);
  newChild.path = calculatePath(newChild, tempNotes);
  newChild.isRoot = false;

  // Definir ordem como último filho
  const currentChildren = parent.childrenIds || [];
  newChild.hierarchyOrder = currentChildren.length;

  // Atualizar pai: adicionar filho à lista
  const updatedNotes = allNotes.map(note => {
    if (note.id === parentId) {
      return {
        ...note,
        childrenIds: [...currentChildren, newChild.id],
        updatedAt: timestamp,
      };
    }
    return note;
  });

  return {
    notes: [...updatedNotes, newChild],
    newChild,
  };
}

// ==========================================
// CRUD - ADICIONAR FILHO EXISTENTE
// ==========================================

/**
 * Converte uma nota existente em filha de outra
 * Remove da posição anterior (se tinha pai) e adiciona ao novo pai
 *
 * @param parentId - ID do novo pai
 * @param childId - ID da nota que será filha
 * @param allNotes - Array de todas as notas
 * @returns Array atualizado de notas
 */
export function addChildToParent(
  parentId: string,
  childId: string,
  allNotes: Note[]
): Note[] {
  // Validação 1: Ambos existem?
  const parent = allNotes.find(n => n.id === parentId);
  const child = allNotes.find(n => n.id === childId);

  if (!parent) {
    throw new Error(`Parent com ID ${parentId} não encontrado`);
  }
  if (!child) {
    throw new Error(`Child com ID ${childId} não encontrado`);
  }

  // Validação 2: Não é o mesmo
  if (parentId === childId) {
    throw new Error('Uma nota não pode ser filha de si mesma');
  }

  // Validação 3: Loop circular
  if (wouldCreateCircularReference(parentId, childId, allNotes)) {
    throw new Error('Operação criaria referência circular na hierarquia');
  }

  // Validação 4: Profundidade
  if (wouldExceedMaxDepth(parentId, allNotes)) {
    throw new Error(`Profundidade máxima de ${MAX_HIERARCHY_DEPTH} níveis atingida`);
  }

  const timestamp = getTimestamp();
  const oldParentId = child.parentId;

  // Atualizar notas
  let updatedNotes = allNotes.map(note => {
    // Remover child do pai antigo (se houver)
    if (oldParentId && note.id === oldParentId) {
      return {
        ...note,
        childrenIds: (note.childrenIds || []).filter(id => id !== childId),
        updatedAt: timestamp,
      };
    }

    // Adicionar child ao novo pai
    if (note.id === parentId) {
      const currentChildren = note.childrenIds || [];
      return {
        ...note,
        childrenIds: [...currentChildren, childId],
        updatedAt: timestamp,
      };
    }

    // Atualizar o child
    if (note.id === childId) {
      return {
        ...note,
        parentId: parentId,
        updatedAt: timestamp,
      };
    }

    return note;
  });

  // Recalcular metadados do child e descendentes
  updatedNotes = updateNoteHierarchyMetadata(childId, updatedNotes);

  return updatedNotes;
}

// ==========================================
// CRUD - REMOVER FILHO
// ==========================================

/**
 * Remove relação de pai-filho
 * A nota filha se torna raiz (orphan)
 *
 * @param childId - ID da nota que deixará de ser filha
 * @param allNotes - Array de todas as notas
 * @returns Array atualizado de notas
 */
export function removeChildFromParent(
  childId: string,
  allNotes: Note[]
): Note[] {
  const child = allNotes.find(n => n.id === childId);

  if (!child) {
    throw new Error(`Nota com ID ${childId} não encontrada`);
  }

  if (!child.parentId) {
    // Já é raiz, nada a fazer
    return allNotes;
  }

  const timestamp = getTimestamp();
  const oldParentId = child.parentId;

  // Atualizar notas
  let updatedNotes = allNotes.map(note => {
    // Remover child da lista do pai
    if (note.id === oldParentId) {
      return {
        ...note,
        childrenIds: (note.childrenIds || []).filter(id => id !== childId),
        updatedAt: timestamp,
      };
    }

    // Tornar child uma raiz
    if (note.id === childId) {
      return {
        ...note,
        parentId: undefined,
        depth: 0,
        path: [],
        isRoot: true,
        updatedAt: timestamp,
      };
    }

    return note;
  });

  // Recalcular metadados dos descendentes
  updatedNotes = updateNoteHierarchyMetadata(childId, updatedNotes);

  return updatedNotes;
}

// ==========================================
// CRUD - REORDENAR FILHOS
// ==========================================

/**
 * Reordena filhos de um pai
 * Atualiza hierarchyOrder de todos os filhos
 *
 * @param parentId - ID do pai
 * @param newOrder - Array com IDs dos filhos na ordem desejada
 * @param allNotes - Array de todas as notas
 * @returns Array atualizado de notas
 */
export function reorderChildren(
  parentId: string,
  newOrder: string[],
  allNotes: Note[]
): Note[] {
  const parent = allNotes.find(n => n.id === parentId);

  if (!parent) {
    throw new Error(`Parent com ID ${parentId} não encontrado`);
  }

  // Validar que todos os IDs em newOrder são filhos válidos
  const currentChildren = parent.childrenIds || [];
  const validOrder = newOrder.every(id => currentChildren.includes(id));

  if (!validOrder || newOrder.length !== currentChildren.length) {
    throw new Error('newOrder contém IDs inválidos ou está incompleto');
  }

  const timestamp = getTimestamp();

  // Atualizar notas
  const updatedNotes = allNotes.map(note => {
    // Atualizar pai com nova ordem
    if (note.id === parentId) {
      return {
        ...note,
        childrenIds: newOrder,
        updatedAt: timestamp,
      };
    }

    // Atualizar hierarchyOrder de cada filho
    if (currentChildren.includes(note.id)) {
      const newIndex = newOrder.indexOf(note.id);
      return {
        ...note,
        hierarchyOrder: newIndex,
        updatedAt: timestamp,
      };
    }

    return note;
  });

  return updatedNotes;
}

// ==========================================
// CRUD - MOVER PARA POSIÇÃO
// ==========================================

/**
 * Move uma nota para uma posição específica entre seus irmãos
 *
 * @param noteId - ID da nota a mover
 * @param newPosition - Novo índice (0-based)
 * @param allNotes - Array de todas as notas
 * @returns Array atualizado de notas
 */
export function moveNoteToPosition(
  noteId: string,
  newPosition: number,
  allNotes: Note[]
): Note[] {
  const note = allNotes.find(n => n.id === noteId);

  if (!note) {
    throw new Error(`Nota com ID ${noteId} não encontrada`);
  }

  if (!note.parentId) {
    throw new Error('Nota raiz não pode ser reordenada (não tem irmãos)');
  }

  const parent = allNotes.find(n => n.id === note.parentId);
  if (!parent) {
    throw new Error('Parent não encontrado');
  }

  const siblings = parent.childrenIds || [];
  const currentIndex = siblings.indexOf(noteId);

  if (currentIndex === -1) {
    throw new Error('Nota não está na lista de filhos do pai');
  }

  if (newPosition < 0 || newPosition >= siblings.length) {
    throw new Error('Posição inválida');
  }

  // Criar nova ordem
  const newOrder = [...siblings];
  newOrder.splice(currentIndex, 1); // Remove da posição atual
  newOrder.splice(newPosition, 0, noteId); // Insere na nova posição

  return reorderChildren(note.parentId, newOrder, allNotes);
}

// ==========================================
// FUNÇÃO ESPECIAL - PROMOVER LINK
// ==========================================

/**
 * Converte um link em relação parent-child
 * Remove o link da nota e estabelece relação hierárquica
 *
 * @param parentId - ID da nota que contém o link
 * @param targetNoteId - ID da nota linkada que será promovida a filha
 * @param allNotes - Array de todas as notas
 * @returns Array atualizado de notas
 */
export function promoteToChild(
  parentId: string,
  targetNoteId: string,
  allNotes: Note[]
): Note[] {
  const parent = allNotes.find(n => n.id === parentId);
  const target = allNotes.find(n => n.id === targetNoteId);

  if (!parent) {
    throw new Error(`Parent com ID ${parentId} não encontrado`);
  }
  if (!target) {
    throw new Error(`Target com ID ${targetNoteId} não encontrado`);
  }

  const timestamp = getTimestamp();

  // Encontrar e remover link nos blocos
  let linkFound = false;
  const updatedNotes = allNotes.map(note => {
    if (note.id === parentId) {
      const updatedBlocks = note.blocks.map(block => {
        if (block.type === 'text' && block.links) {
          const hasLink = block.links.some(link => link.targetNoteId === targetNoteId);
          if (hasLink) {
            linkFound = true;
            return {
              ...block,
              links: block.links.filter(link => link.targetNoteId !== targetNoteId),
              updatedAt: timestamp,
            };
          }
        }
        return block;
      });

      return {
        ...note,
        blocks: updatedBlocks,
        updatedAt: timestamp,
      };
    }
    return note;
  });

  if (!linkFound) {
    throw new Error('Link para a nota target não encontrado no parent');
  }

  // Adicionar como filho
  return addChildToParent(parentId, targetNoteId, updatedNotes);
}

// ==========================================
// CRUD - DELETAR COM DESCENDENTES
// ==========================================

/**
 * Deleta nota e todos descendentes
 * Remove relação do pai (se houver)
 *
 * @param noteId - ID da nota a deletar
 * @param allNotes - Array de todas as notas
 * @returns Array atualizado de notas (sem a nota e descendentes)
 */
export function deleteNoteAndDescendants(
  noteId: string,
  allNotes: Note[]
): Note[] {
  const note = allNotes.find(n => n.id === noteId);

  if (!note) {
    throw new Error(`Nota com ID ${noteId} não encontrada`);
  }

  // Coletar IDs a deletar (nota + descendentes)
  const descendants = getDescendants(note, allNotes);
  const idsToDelete = new Set([noteId, ...descendants.map(d => d.id)]);

  const timestamp = getTimestamp();

  // Remover nota da lista de filhos do pai (se houver)
  let updatedNotes = allNotes;
  if (note.parentId) {
    updatedNotes = allNotes.map(n => {
      if (n.id === note.parentId) {
        return {
          ...n,
          childrenIds: (n.childrenIds || []).filter(id => id !== noteId),
          updatedAt: timestamp,
        };
      }
      return n;
    });
  }

  // Filtrar notas, removendo as que devem ser deletadas
  return updatedNotes.filter(n => !idsToDelete.has(n.id));
}

// ==========================================
// UTILITÁRIO - ATUALIZAR METADADOS
// ==========================================

/**
 * Recalcula depth, path, isRoot de uma nota e todos descendentes
 * Usado após mover nota ou alterar estrutura
 *
 * @param noteId - ID da nota raiz do recálculo
 * @param allNotes - Array de todas as notas
 * @returns Array atualizado de notas
 */
export function updateNoteHierarchyMetadata(
  noteId: string,
  allNotes: Note[]
): Note[] {
  const note = allNotes.find(n => n.id === noteId);

  if (!note) {
    return allNotes;
  }

  const timestamp = getTimestamp();

  // Atualizar a nota e todos descendentes
  const descendants = getDescendants(note, allNotes);
  const toUpdate = new Set([noteId, ...descendants.map(d => d.id)]);

  return allNotes.map(n => {
    if (toUpdate.has(n.id)) {
      return {
        ...n,
        depth: calculateDepth(n, allNotes),
        path: calculatePath(n, allNotes),
        isRoot: !n.parentId,
        updatedAt: timestamp,
      };
    }
    return n;
  });
}
