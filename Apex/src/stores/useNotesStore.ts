import { create } from 'zustand';
import { Note } from '../types/note.types';
import { mockNotes } from '../utils/mockData';

interface NotesState {
  notes: Note[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getFilteredNotes: () => Note[];
  getNoteById: (id: string) => Note | undefined;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: mockNotes,
  searchQuery: '',

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  getFilteredNotes: () => {
    const { notes, searchQuery } = get();
    if (!searchQuery) return notes;

    const lowerQuery = searchQuery.toLowerCase();
    return notes.filter(
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
  },

  getNoteById: (id: string) => {
    return get().notes.find((note) => note.id === id);
  },

  addNote: (note: Note) => {
    set((state) => ({ notes: [note, ...state.notes] }));
  },

  updateNote: (id: string, updatedNote: Partial<Note>) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updatedNote, updatedAt: new Date() } : note
      ),
    }));
  },

  deleteNote: (id: string) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));
  },
}));
