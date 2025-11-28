import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteViewModel } from '../types/note.types';
import { mockNotes } from '../utils/mockData';
import {
  toNoteViewModel,
  toNoteViewModels,
  countTotalLinks,
  countTotalBlocks,
  extractUniqueTags,
} from '../utils/noteHelpers';
import { useProgressionStore } from './useProgressionStore';

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
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: mockNotes,

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
        const now = Date.now();
        const newNote: Note = {
          ...note,
          id: uuidv4(), // Usar UUID em vez de Date.now()
          createdAt: now,  // Timestamp
          updatedAt: now,  // Timestamp
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return newNote;
      },

      updateNote: (id: string, updatedNote: Partial<Note>) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updatedNote, updatedAt: Date.now() } : note
          ),
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
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Não persistir campos temporários/calculados
      partialize: (state) => ({
        notes: state.notes,
        // searchQuery removido - não deve persistir
      }),
    }
  )
);
