import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteViewModel } from '../types/note.types';
// Removido import de mockNotes - não é mais necessário
import {
  toNoteViewModel,
  toNoteViewModels,
  countTotalLinks,
  countTotalBlocks,
  extractUniqueTags,
  cloneNote,
  getTimestamp,
} from '../utils/noteHelpers';
import {
  createChildNote as createChild,
  addChildToParent as addChild,
  removeChildFromParent as removeChild,
  reorderChildren as reorder,
  promoteToChild as promote,
  deleteNoteAndDescendants as deleteWithDescendants,
} from '../utils/hierarchyCRUD';
import {
  isRoot,
  getChildren,
  getAncestors,
} from '../utils/hierarchyHelpers';
import { useProgressionStore } from './useProgressionStore';
import { useCallback } from 'react';

interface NotesState {
  notes: Note[];

  // Getters com dados calculados
  getFilteredNotes: (query: string) => NoteViewModel[];
  getNoteById: (id: string) => Note | undefined;
  getNoteViewModelById: (id: string) => NoteViewModel | undefined;
  getAllNotesWithViewModels: () => NoteViewModel[];

  // Mutations
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  clearAll: () => void;

  // Métricas calculadas
  getTotalLinks: () => number;
  getTotalBlocks: () => number;
  getUniqueTags: () => string[];

  // 🆕 OPERAÇÕES DE HIERARQUIA
  createChildNote: (
    parentId: string,
    childData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'parentId'>
  ) => Note;
  addChildToParent: (parentId: string, childId: string) => void;
  removeChildFromParent: (childId: string) => void;
  reorderChildren: (parentId: string, newOrder: string[]) => void;
  promoteToChild: (parentId: string, targetNoteId: string) => void;
  deleteNoteAndDescendants: (noteId: string) => void;

  // 🆕 GETTERS HIERÁRQUICOS
  getRootNotes: () => NoteViewModel[];
  getChildrenOfNote: (parentId: string) => NoteViewModel[];
  getAncestorsOfNote: (noteId: string) => NoteViewModel[];
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [], // Iniciar vazio - dados serão carregados do AsyncStorage

      // Busca com ViewModels (inclui campos calculados)
      getFilteredNotes: (query: string) => {
        const { notes } = get();

        if (!query) {
          return toNoteViewModels(notes);
        }

        const lowerQuery = query.toLowerCase();
        const filtered = notes.filter(
          (note) =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
            note.blocks.some((block) => {
              if (block.type === 'text' || block.type === 'heading') {
                return block.content.toLowerCase().includes(lowerQuery);
              }
              if (block.type === 'checklist') {
                return block.items.some((item) => item.text.toLowerCase().includes(lowerQuery));
              }
              return false;
            })
        );

        return toNoteViewModels(filtered);
      },

      getNoteById: (id: string) => {
        return get().notes.find((note) => note.id === id);
      },

      getNoteViewModelById: (id: string) => {
        const { notes } = get();
        const note = notes.find((n) => n.id === id);
        return note ? toNoteViewModel(note, notes) : undefined;
      },

      getAllNotesWithViewModels: () => {
        return toNoteViewModels(get().notes);
      },

      addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = getTimestamp();
        const newNote: Note = {
          ...note,
          id: uuidv4(), // Usar UUID em vez de Date.now()
          createdAt: now,  // Timestamp otimizado
          updatedAt: now,  // Timestamp otimizado
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return newNote;
      },

      updateNote: (id: string, updatedNote: Partial<Note>) => {
        const timestamp = getTimestamp();
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id === id) {
              // Deep clone para evitar mutações
              const updated = { ...note, ...updatedNote, updatedAt: timestamp };
              if (updatedNote.blocks) {
                updated.blocks = updatedNote.blocks.map(block => ({ ...block }));
              }
              if (updatedNote.tags) {
                updated.tags = [...updatedNote.tags];
              }
              return updated;
            }
            return note;
          }),
        }));
      },

      deleteNote: (id: string) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      clearAll: () => {
        set({ notes: [] });
        // Sincronizar com ProgressionStore - resetar progressão também
        useProgressionStore.getState().resetProgression();
      },

      // Métricas calculadas
      getTotalLinks: () => {
        return countTotalLinks(get().notes);
      },

      getTotalBlocks: () => {
        return countTotalBlocks(get().notes);
      },

      getUniqueTags: () => {
        return extractUniqueTags(get().notes);
      },

      // 🆕 OPERAÇÕES DE HIERARQUIA
      createChildNote: (parentId, childData) => {
        const { notes } = get();
        const result = createChild(parentId, childData, notes);
        set({ notes: result.notes });

        // Registrar ação de progressão
        useProgressionStore.getState().incrementNotes();

        return result.newChild;
      },

      addChildToParent: (parentId, childId) => {
        const { notes } = get();
        const updated = addChild(parentId, childId, notes);
        set({ notes: updated });
      },

      removeChildFromParent: (childId) => {
        const { notes } = get();
        const updated = removeChild(childId, notes);
        set({ notes: updated });
      },

      reorderChildren: (parentId, newOrder) => {
        const { notes } = get();
        const updated = reorder(parentId, newOrder, notes);
        set({ notes: updated });
      },

      promoteToChild: (parentId, targetNoteId) => {
        const { notes } = get();
        const updated = promote(parentId, targetNoteId, notes);
        set({ notes: updated });
      },

      deleteNoteAndDescendants: (noteId) => {
        const { notes } = get();
        const updated = deleteWithDescendants(noteId, notes);
        set({ notes: updated });
      },

      // 🆕 GETTERS HIERÁRQUICOS
      getRootNotes: () => {
        const { notes } = get();
        const roots = notes.filter(n => isRoot(n));
        return toNoteViewModels(roots);
      },

      getChildrenOfNote: (parentId) => {
        const { notes } = get();
        const parent = notes.find(n => n.id === parentId);
        if (!parent) return [];
        const children = getChildren(parent, notes);
        return children.map(c => toNoteViewModel(c, notes));
      },

      getAncestorsOfNote: (noteId) => {
        const { notes } = get();
        const note = notes.find(n => n.id === noteId);
        if (!note) return [];
        const ancestors = getAncestors(note, notes);
        return ancestors.map(a => toNoteViewModel(a, notes));
      },
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Não persistir campos temporários/calculados
      partialize: (state) => ({
        notes: state.notes,
        // searchQuery removido - não deve persistir
      }),
      // Garantir que os dados sejam carregados antes de usar
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('✅ Notas carregadas do AsyncStorage:', state.notes.length);
        } else {
          console.log('⚠️ Nenhuma nota encontrada no AsyncStorage');
        }
      },
    }
  )
);

// Seletores memoizados para evitar re-renders desnecessários
export const selectNotes = (state: NotesState) => state.notes;
export const selectAddNote = (state: NotesState) => state.addNote;
export const selectUpdateNote = (state: NotesState) => state.updateNote;
export const selectDeleteNote = (state: NotesState) => state.deleteNote;
export const selectGetNoteById = (state: NotesState) => state.getNoteById;
export const selectGetFilteredNotes = (state: NotesState) => state.getFilteredNotes;
export const selectGetAllNotesWithViewModels = (state: NotesState) => state.getAllNotesWithViewModels;
