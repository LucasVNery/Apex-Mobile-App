# API Client - Apex Mobile App

Este diretório contém toda a configuração e rotas de API para comunicação com o backend.

## Estrutura

```
src/api/
├── axiosConfig.ts         # Configuração base do Axios
├── notes.api.ts           # API de Notas
├── blocks.api.ts          # API de Blocos
├── hierarchy.api.ts       # API de Hierarquia
├── links.api.ts           # API de Links e Conexões
├── progression.api.ts     # API de Progressão e Achievements
├── graph.api.ts           # API de Grafos
└── index.ts               # Exportações centralizadas
```

## Configuração

### 1. Variável de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Para produção:

```env
EXPO_PUBLIC_API_URL=https://api.seu-dominio.com/api
```

### 2. Autenticação (Clerk)

O axios já está configurado para usar tokens do Clerk. Para integrar:

```typescript
// Em axiosConfig.ts:28-35
import { useAuth } from '@clerk/clerk-expo';

const { getToken } = useAuth();
const token = await getToken();
```

## Uso Básico

### Importação

```typescript
import { api } from '@/api';
// ou
import { notesApi, blocksApi, graphApi } from '@/api';
```

### Exemplos

#### 1. Notas

```typescript
// Criar nota
const response = await api.notes.create({
  title: 'Minha primeira nota',
  tags: ['trabalho', 'importante'],
  color: '#FF6B6B',
});

// Listar todas as notas
const notes = await api.notes.getAll();

// Buscar por ID
const note = await api.notes.getById('note-id');

// Atualizar
await api.notes.update('note-id', {
  title: 'Título atualizado',
});

// Buscar filhos
const children = await api.notes.getChildren('parent-id');

// Buscar por tag
const taggedNotes = await api.notes.getByTag('trabalho');

// Busca full-text
const results = await api.notes.search('reunião');

// Deletar
await api.notes.delete('note-id');
```

#### 2. Blocos

```typescript
// Criar bloco de texto
const block = await api.blocks.create({
  noteId: 'note-id',
  type: 'text',
  content: 'Conteúdo do bloco',
  order: 0,
});

// Criar checklist
const checklist = await api.blocks.create({
  noteId: 'note-id',
  type: 'checklist',
  content: {
    items: [
      { id: '1', text: 'Item 1', completed: false },
      { id: '2', text: 'Item 2', completed: true },
    ],
  },
  order: 1,
});

// Listar blocos de uma nota
const blocks = await api.blocks.getByNoteId('note-id');

// Reordenar
await api.blocks.reorder('block-id', { newOrder: 2 });

// Mover para outra nota
await api.blocks.move('block-id', {
  targetNoteId: 'other-note-id',
  order: 0,
});
```

#### 3. Hierarquia

```typescript
// Criar relação parent-child
await api.hierarchy.create({
  parentId: 'parent-id',
  childId: 'child-id',
  order: 0,
  type: 'explicit',
});

// Buscar árvore hierárquica
const tree = await api.hierarchy.getTree('root-id', 3); // max depth 3

// Buscar todas as árvores
const trees = await api.hierarchy.getAllTrees();

// Mover nota na hierarquia
await api.hierarchy.moveNote('note-id', 'new-parent-id', 0);

// Buscar sugestões
const suggestions = await api.hierarchy.getSuggestions('note-id');

// Buscar raízes
const roots = await api.hierarchy.getRoots();
```

#### 4. Links e Conexões

```typescript
// Criar link
const link = await api.links.create({
  blockId: 'block-id',
  sourceNoteId: 'source-id',
  targetNoteId: 'target-id',
  text: 'Texto do link',
  type: 'direct',
  position: { start: 0, end: 10 },
});

// Buscar links de uma nota
const links = await api.links.getByNoteId('note-id');

// Resolver links não resolvidos
await api.links.resolveAll();

// Buscar conexões de uma nota
const connections = await api.connections.getByNoteId('note-id');

// Recalcular conexões
await api.connections.recalculateAll();
```

#### 5. Progressão

```typescript
// Buscar estado de progressão
const progression = await api.progression.get();

// Incrementar contadores
await api.progression.incrementNotes(1);
await api.progression.incrementLinks(1);
await api.progression.incrementBlocks(1);

// Calcular nível
const { level, changed } = await api.progression.calculateLevel();

// Buscar features desbloqueadas
const features = await api.progression.getUnlockedFeatures();

// Verificar se feature está desbloqueada
const { unlocked } = await api.progression.isFeatureUnlocked('full-graph');

// Buscar achievements
const achievements = await api.achievements.getAll();

// Desbloquear achievement
await api.achievements.unlock('achievement-id');
```

#### 6. Grafo

```typescript
// Buscar grafo completo
const graph = await api.graph.getGraph();

// Buscar com filtros
const filteredGraph = await api.graph.getGraph({
  tags: ['trabalho'],
  minConnections: 2,
});

// Buscar subgrafo de uma nota
const subgraph = await api.graph.getSubgraph('note-id', 2); // depth 2

// Buscar caminho mais curto
const path = await api.graph.getShortestPath('note-1', 'note-2');

// Calcular layout
const layoutGraph = await api.graph.calculateHierarchicalLayout();

// Buscar nós mais conectados (hubs)
const hubs = await api.graph.getHubs(10);

// Buscar estatísticas
const stats = await api.graph.getStats();

// Reconstruir grafo
await api.graph.rebuild();

// Mini-graph para uma nota
const miniGraph = await api.graph.getMiniGraph('note-id', 1);
```

## Tratamento de Erros

```typescript
import { ApiError } from '@/api';

try {
  const note = await api.notes.create({
    title: 'Nova nota',
  });
} catch (error) {
  const apiError = error as ApiError;
  console.error('Erro:', apiError.message);
  console.error('Status:', apiError.status);
  console.error('Código:', apiError.code);
  console.error('Detalhes:', apiError.details);
}
```

## Paginação

```typescript
// Listar com paginação
const response = await api.notes.getAll({
  limit: 20,
  offset: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

console.log(response.data?.items); // Array de notas
console.log(response.data?.total); // Total de notas
console.log(response.data?.hasMore); // Se tem mais páginas
```

## Filtros e Busca

```typescript
// Busca com múltiplos filtros
const notes = await api.notes.getAll({
  search: 'reunião',
  tags: ['trabalho', 'importante'],
  color: '#FF6B6B',
  isRoot: true,
  limit: 50,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
});
```

## Schema do Banco de Dados

Para ver o schema completo do banco de dados, consulte:
- `DATABASE_SCHEMA_REPORT.md` na raiz do projeto

## Tipos TypeScript

Todos os tipos estão disponíveis em:
- `src/types/note.types.ts` - Note, Block, NoteLink, HierarchyRelation
- `src/types/progression.types.ts` - ProgressionState, Achievement
- `src/types/graph.types.ts` - Graph, GraphNode, GraphEdge

## Autenticação

O axios interceptor adiciona automaticamente o token JWT em todas as requisições:

```typescript
import { setAuthToken, clearAuthToken } from '@/api';

// Definir token (após login)
setAuthToken('seu-token-jwt');

// Limpar token (após logout)
clearAuthToken();
```

## Desenvolvimento

### Mudar URL da API

```typescript
// Em desenvolvimento local
EXPO_PUBLIC_API_URL=http://localhost:3000/api

// Com ngrok
EXPO_PUBLIC_API_URL=https://seu-id.ngrok.io/api

// Produção
EXPO_PUBLIC_API_URL=https://api.seu-dominio.com/api
```

### Timeout

O timeout padrão é 30 segundos. Para mudar:

```typescript
// axiosConfig.ts
const API_TIMEOUT = 60000; // 60 segundos
```

## Roadmap

- [ ] Implementar retry automático em caso de falha
- [ ] Adicionar cache offline (React Query / TanStack Query)
- [ ] Implementar optimistic updates
- [ ] Adicionar interceptor para refresh token
- [ ] Adicionar métricas e logs
- [ ] Implementar upload de arquivos/imagens

## Suporte

Para dúvidas ou problemas, consulte:
- Schema: `DATABASE_SCHEMA_REPORT.md`
- Tipos: `src/types/`
- Stores Zustand: `src/stores/`
