# Análise de Arquitetura de Dados - Projeto Apex

## 📊 Estado Atual da Arquitetura

### Stores Atuais
1. **NotesStore** (`notes-storage`)
   - Gerencia: notas, busca
   - Persistência: AsyncStorage

2. **ProgressionStore** (`progression-storage`)
   - Gerencia: progressão, features desbloqueadas, achievements
   - Persistência: AsyncStorage

3. **ThemeStore** (não persistido)
   - Gerencia: tema claro/escuro
   - **❌ PROBLEMA**: Não persiste entre sessões

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **Duplicação e Inconsistência de Dados**

**Problema:**
```typescript
// ProgressionStore
notesCreated: 0  // Contador incrementado

// NotesStore
notes: []  // Array real de notas

// INCONSISTÊNCIA: Se você apaga notas com clearAll()
// notesCreated continua com valor antigo!
```

**Exemplo de Bug:**
```
1. Usuário cria 10 notas → notesCreated = 10
2. Usuário apaga tudo → notes = [], mas notesCreated = 10 ❌
3. Sistema mostra "10 notas criadas" mas não há notas
```

**Impacto:**
- Progressão incorreta
- Features desbloqueadas indevidamente
- UX confusa para o usuário

---

### 2. **Dados Calculados sendo Armazenados**

**Problema:**
```typescript
interface Note {
  // ... outros campos
  backlinks: string[];      // ❌ Deveria ser calculado
  connections: number;      // ❌ Deveria ser calculado
}
```

**Por que é ruim:**
- Dados duplicados que podem ficar desatualizados
- Quando você atualiza uma nota A que linka para B, precisa atualizar B também
- Complexidade desnecessária
- Bugs difíceis de rastrear

**Solução correta:**
```typescript
// Calcular em tempo real quando necessário
const getBacklinks = (noteId: string) => {
  return notes.filter(note =>
    note.blocks.some(block =>
      block.type === 'text' &&
      block.links?.some(link => link.targetNoteId === noteId)
    )
  );
};
```

---

### 3. **Falta de Sincronização entre Stores**

**Problema:**
```typescript
// NotesStore
deleteNote: (id: string) => {
  set((state) => ({
    notes: state.notes.filter((note) => note.id !== id),
  }));
  // ❌ Não atualiza ProgressionStore!
}

clearAll: () => {
  set({ notes: [], searchQuery: '' });
  // ❌ Não reseta notesCreated no ProgressionStore!
}
```

**Impacto:**
- Dessincronia total entre dados reais e métricas
- Gamificação quebrada
- Contadores incorretos

---

### 4. **IDs Inadequados para Backend**

**Problema atual:**
```typescript
id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
// Exemplo: "note_1701234567890_k2j3h4k5"
```

**Problemas:**
- ❌ Pode ter colisões (improvável mas possível)
- ❌ Não é globalmente único
- ❌ Não funciona bem com sincronização offline
- ❌ Não segue padrões (UUID, ULID)

**Solução:**
```typescript
// Usar UUID v4 ou ULID
import { v4 as uuidv4 } from 'uuid';
id: uuidv4()  // "550e8400-e29b-41d4-a716-446655440000"

// Ou ULID (melhor para ordenação)
import { ulid } from 'ulid';
id: ulid()  // "01ARZ3NDEKTSV4RRFFQ69G5FAV"
```

---

### 5. **Problemas com Tipos Date**

**Problema:**
```typescript
createdAt: new Date()
// AsyncStorage serializa para string
// Ao ler de volta, vem como string, não Date!
```

**Bugs resultantes:**
```typescript
// Isso quebra:
note.createdAt.getTime()  // ❌ TypeError: getTime is not a function

// Porque veio do AsyncStorage como string:
typeof note.createdAt  // "string" 😱
```

**Solução:**
```typescript
// Usar timestamps (number) ou ISO strings
createdAt: Date.now()  // 1701234567890
// ou
createdAt: new Date().toISOString()  // "2023-11-29T10:30:00.000Z"

// Com parser no middleware do Zustand
```

---

### 6. **Persistência Inadequada**

**Problemas:**
- Cada store salva independentemente
- searchQuery sendo persistido (desnecessário)
- ThemeStore não persiste
- Sem versionamento de schema
- Sem migração de dados

**Exemplo de problema:**
```typescript
// Usuário fecha o app com busca "projeto"
// Abre o app → ainda está buscando "projeto" ❌
searchQuery: '',  // Não deveria persistir!
```

---

### 7. **Não Preparado para Backend**

**Campos ausentes para sincronização:**
```typescript
interface Note {
  // ✅ Campos atuais
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;

  // ❌ FALTANDO para backend:
  syncedAt?: Date;        // Última sincronização
  version?: number;       // Controle de versão
  deletedAt?: Date;       // Soft delete
  userId?: string;        // Dono da nota
  isLocal?: boolean;      // Criado offline?
  conflictWith?: string;  // Conflito de merge
}
```

**Sem suporte a:**
- ✗ Offline-first (criar/editar sem internet)
- ✗ Sincronização bidirecional
- ✗ Resolução de conflitos
- ✗ Soft deletes
- ✗ Multi-device
- ✗ Versionamento

---

## ✅ ARQUITETURA PROPOSTA

### 1. **Estrutura de Dados Normalizada**

```typescript
// ========================================
// ENTITIES (Banco de dados / Backend)
// ========================================

interface NoteEntity {
  // Identificação
  id: string;                    // UUID v4 ou ULID
  userId: string;                // Dono da nota

  // Conteúdo
  title: string;
  blocks: Block[];
  tags: string[];
  color?: string;

  // Metadata temporal
  createdAt: number;             // Timestamp
  updatedAt: number;             // Timestamp
  deletedAt?: number;            // Soft delete

  // Sincronização
  version: number;               // Controle de versão
  syncedAt?: number;             // Última sync com servidor
  isLocal: boolean;              // Criado offline?
  conflictWith?: string;         // ID da versão em conflito
}

interface BlockEntity {
  id: string;
  noteId: string;                // Foreign key
  type: BlockType;
  content?: string;
  order: number;

  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

// ========================================
// VIEW MODELS (UI / Componentes)
// ========================================

interface NoteViewModel extends NoteEntity {
  // Campos calculados (não salvos)
  backlinks: NoteLink[];         // Calculado
  connections: number;           // Calculado
  lastEditedText: string;        // Calculado
}

interface ProgressionViewModel {
  level: number;

  // Calculados do NotesStore
  notesCount: number;            // notes.length
  linksCount: number;            // soma de todos os links
  blocksCount: number;           // soma de todos os blocos
  tagsCount: number;             // unique tags

  // Persistidos
  unlockedFeatures: Feature[];
  achievements: Achievement[];
}
```

---

### 2. **Stores Refatorados**

```typescript
// ========================================
// STORE PRINCIPAL - Dados
// ========================================

interface DataStore {
  // State
  notes: NoteEntity[];
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncAt?: number;

  // Selectors (computed values)
  getNoteById: (id: string) => NoteViewModel | undefined;
  getNotesWithBacklinks: () => NoteViewModel[];
  getFilteredNotes: (query: string) => NoteViewModel[];

  // Mutations
  createNote: (data: CreateNoteInput) => Promise<NoteEntity>;
  updateNote: (id: string, data: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;  // Soft delete
  permanentlyDeleteNote: (id: string) => Promise<void>;

  // Sync
  syncWithServer: () => Promise<void>;
  resolveConflict: (noteId: string, resolution: 'local' | 'remote') => Promise<void>;
}

// ========================================
// STORE DE UI - Estado efêmero
// ========================================

interface UIStore {
  // Não persistir esses valores!
  searchQuery: string;
  selectedNoteId?: string;
  sidebarOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  selectNote: (id: string) => void;
  toggleSidebar: () => void;
}

// ========================================
// STORE DE SETTINGS - Configurações
// ========================================

interface SettingsStore {
  // Persistir esses valores
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  syncEnabled: boolean;

  // Progression (calculado + alguns persistidos)
  unlockedFeatures: Feature[];
  achievements: Achievement[];
  shownFeatures: Feature[];

  // Computed
  level: number;                 // Calculado de notes
  notesCount: number;            // Calculado
  linksCount: number;            // Calculado
}
```

---

### 3. **Sistema de Sincronização**

```typescript
// ========================================
// SYNC SERVICE
// ========================================

class SyncService {
  // Pull: Server → Local
  async pullFromServer(): Promise<void> {
    const serverNotes = await api.getNotes({ since: lastSyncAt });

    for (const serverNote of serverNotes) {
      const localNote = getLocalNote(serverNote.id);

      if (!localNote) {
        // Nota nova do servidor
        await saveLocal(serverNote);
      } else if (localNote.version < serverNote.version) {
        // Servidor mais recente
        await saveLocal(serverNote);
      } else if (localNote.version > serverNote.version) {
        // Local mais recente (conflito)
        await markConflict(localNote, serverNote);
      }
    }
  }

  // Push: Local → Server
  async pushToServer(): Promise<void> {
    const unsyncedNotes = notes.filter(n => !n.syncedAt || n.updatedAt > n.syncedAt);

    for (const note of unsyncedNotes) {
      try {
        const response = await api.updateNote(note);
        await markAsSynced(note.id, response.version);
      } catch (error) {
        if (error.code === 'CONFLICT') {
          await handleConflict(note, error.serverVersion);
        }
      }
    }
  }

  // Conflict Resolution
  async resolveConflict(
    noteId: string,
    strategy: 'keep-local' | 'keep-remote' | 'merge'
  ): Promise<void> {
    // Implementar estratégias de resolução
  }
}
```

---

### 4. **Camada de Persistência**

```typescript
// ========================================
// PERSISTENCE LAYER
// ========================================

interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Implementações
class AsyncStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;

    // Parse e desserialização
    const parsed = JSON.parse(data);
    return this.deserialize<T>(parsed);
  }

  private deserialize<T>(data: any): T {
    // Converter timestamps para Dates se necessário
    // Validar schema
    // Migrar versões antigas
    return data;
  }
}

// Futuramente: SQLite, WatermelonDB, etc.
class SQLiteAdapter implements StorageAdapter {
  // Para performance com muitos dados
}
```

---

### 5. **Validação e Error Handling**

```typescript
// ========================================
// VALIDATION
// ========================================

import { z } from 'zod';

const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  blocks: z.array(BlockSchema),
  tags: z.array(z.string()),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
  deletedAt: z.number().positive().optional(),
  version: z.number().int().nonnegative(),
});

// Usar no store
createNote: async (data) => {
  try {
    // Validar
    const validated = NoteSchema.parse(data);

    // Salvar
    const note = await saveNote(validated);

    return note;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors);
    }
    throw error;
  }
}
```

---

## 🔄 PLANO DE MIGRAÇÃO

### Fase 1: Refatorar Stores (Sem quebrar)
1. Criar novos tipos com campos de sync
2. Adicionar migrations para AsyncStorage
3. Separar dados persistidos de computed
4. Usar UUIDs para novos registros

### Fase 2: Sincronizar Stores
1. Fazer NotesStore notificar ProgressionStore
2. Calcular métricas a partir de dados reais
3. Remover duplicações

### Fase 3: Preparar para Backend
1. Adicionar campos de sincronização
2. Implementar soft deletes
3. Adicionar versionamento
4. Criar camada de API

### Fase 4: Implementar Sync
1. Criar serviço de sincronização
2. Implementar offline-first
3. Resolver conflitos
4. Multi-device support

---

## 📋 CHECKLIST DE MELHORIAS IMEDIATAS

### Críticas (Fazer agora)
- [ ] Sincronizar clearAll() com ProgressionStore
- [ ] Remover backlinks/connections da Note (calcular)
- [ ] Usar UUIDs em vez de Date.now()
- [ ] Converter Dates para timestamps
- [ ] Não persistir searchQuery
- [ ] Persistir ThemeStore

### Importantes (Próximas semanas)
- [ ] Adicionar validação com Zod
- [ ] Implementar soft deletes
- [ ] Adicionar error handling
- [ ] Criar migrations de schema
- [ ] Separar UI state de Data state

### Futuras (Antes do backend)
- [ ] Adicionar campos de sincronização
- [ ] Implementar versionamento
- [ ] Criar camada de persistência abstrata
- [ ] Preparar para SQLite/WatermelonDB
- [ ] Implementar offline-first

---

## 🎯 BENEFÍCIOS DA NOVA ARQUITETURA

### Imediatos
✅ Dados consistentes entre stores
✅ Sem duplicações
✅ Bugs de sincronização resolvidos
✅ Performance melhorada (menos dados salvos)

### Médio Prazo
✅ Preparado para backend
✅ Fácil adicionar novas features
✅ Código mais testável
✅ Melhor developer experience

### Longo Prazo
✅ Suporte a múltiplos dispositivos
✅ Sincronização offline-first
✅ Escalabilidade
✅ Fácil migrar para SQL se necessário

---

## 📚 REFERÊNCIAS E BIBLIOTECAS RECOMENDADAS

### Para Migração Imediata
- **UUID**: `uuid` ou `ulid` para IDs únicos
- **Validação**: `zod` para validação de schemas
- **Datas**: `date-fns` para manipulação de datas

### Para Sincronização Futura
- **Offline-first**: `@tanstack/react-query` + optimistic updates
- **Sync**: `y-js` ou `automerge` para CRDTs
- **Database**: `@nozbe/watermelondb` para performance com muitos dados

### Para Backend
- **API Client**: `axios` ou `ky`
- **Auth**: `@supabase/supabase-js` ou `@clerk/clerk-expo`
- **Real-time**: `socket.io-client` ou Supabase Realtime
