import { Note } from '../types/note.types';

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Ideias para o Apex',
    blocks: [
      {
        id: 'b1',
        type: 'text',
        content:
          'O Apex deve ser um aplicativo de notas minimalista com foco em conexões entre ideias.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'b2',
        type: 'checklist',
        items: [
          { id: 'c1', text: 'Design system completo', completed: true },
          { id: 'c2', text: 'Animações fluidas', completed: true },
          { id: 'c3', text: 'Graph view', completed: false },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
    tags: ['projeto', 'desenvolvimento'],
    createdAt: now,
    updatedAt: now,
    color: '#5B7FFF',
  },
  {
    id: '2',
    title: 'Estudar React Native Reanimated',
    blocks: [
      {
        id: 'b3',
        type: 'heading',
        content: 'Conceitos Importantes',
        level: 2,
        createdAt: yesterday,
        updatedAt: yesterday,
      },
      {
        id: 'b4',
        type: 'text',
        content:
          'Shared Values permitem criar animações que rodam na UI thread, garantindo 60fps consistente.',
        createdAt: yesterday,
        updatedAt: yesterday,
      },
      {
        id: 'b5',
        type: 'text',
        content: 'useAnimatedStyle é o hook principal para aplicar animações em componentes.',
        createdAt: yesterday,
        updatedAt: yesterday,
      },
    ],
    tags: ['estudo', 'react-native'],
    createdAt: yesterday,
    updatedAt: yesterday,
    color: '#8B5FFF',
  },
  {
    id: '3',
    title: 'Design Minimalista',
    blocks: [
      {
        id: 'b6',
        type: 'text',
        content: 'Menos é mais. Cada elemento deve ter um propósito claro.',
        createdAt: lastWeek,
        updatedAt: lastWeek,
      },
      {
        id: 'b7',
        type: 'checklist',
        items: [
          { id: 'c4', text: 'Espaços em branco generosos', completed: true },
          { id: 'c5', text: 'Paleta de cores limitada', completed: true },
          { id: 'c6', text: 'Tipografia consistente', completed: false },
        ],
        createdAt: lastWeek,
        updatedAt: lastWeek,
      },
    ],
    tags: ['design', 'ui/ux'],
    createdAt: lastWeek,
    updatedAt: lastWeek,
  },
  {
    id: '4',
    title: 'Lista de Tarefas',
    blocks: [
      {
        id: 'b8',
        type: 'checklist',
        items: [
          { id: 'c7', text: 'Fazer compras', completed: false },
          { id: 'c8', text: 'Academia às 18h', completed: false },
          { id: 'c9', text: 'Revisar código do projeto', completed: true },
          { id: 'c10', text: 'Ligar para o cliente', completed: false },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
    tags: ['pessoal', 'tarefas'],
    createdAt: now,
    updatedAt: now,
    color: '#4CAF50',
  },
];
