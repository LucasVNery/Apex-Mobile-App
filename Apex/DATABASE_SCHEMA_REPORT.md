# Relatório de Estrutura de Banco de Dados - Projeto Apex

## Sumário Executivo

Este documento descreve a estrutura completa de banco de dados para o projeto **Apex**, uma aplicação de notas inteligentes com sistema de hierarquia, grafos de relacionamento e progressão gamificada. O sistema atualmente utiliza persistência local (AsyncStorage), mas este relatório fornece as definições necessárias para implementação em banco de dados relacional ou NoSQL.

**Tecnologia Atual**: Zustand + AsyncStorage (persistência local JSON)
**Tecnologia Recomendada para Migration**: PostgreSQL ou MongoDB
**Data do Relatório**: 2025-12-03

---

## Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [Tabelas Principais](#tabelas-principais)
3. [Relacionamentos](#relacionamentos)
4. [Diagramas ER](#diagramas-er)
5. [Scripts SQL de Criação](#scripts-sql-de-criação)
6. [Schema NoSQL (MongoDB)](#schema-nosql-mongodb)
7. [Índices Recomendados](#índices-recomendados)
8. [Considerações de Performance](#considerações-de-performance)

---

## 1. Arquitetura Geral

### Entidades Principais

1. **Notes** - Notas principais do sistema
2. **Blocks** - Blocos de conteúdo dentro das notas
3. **NoteLinks** - Links entre notas (bidirecionais)
4. **HierarchyRelations** - Relações hierárquicas parent-child
5. **NoteConnections** - Conexões calculadas entre notas
6. **ProgressionState** - Estado de progressão do usuário
7. **Achievements** - Conquistas desbloqueadas
8. **GraphNodes** - Nós do grafo de visualização
9. **GraphEdges** - Arestas do grafo

### Fluxo de Dados

```
User Creates Note
    ↓
Note with Blocks
    ↓
System parses [[links]]
    ↓
Creates NoteLinks & NoteConnections
    ↓
Updates HierarchyRelations (if parent set)
    ↓
Rebuilds Graph (nodes & edges)
    ↓
Updates ProgressionState
    ↓
Checks & Unlocks Achievements
```

---

## 2. Tabelas Principais

### 2.1 Tabela: `notes`

Armazena todas as notas do sistema com metadados de hierarquia.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único da nota |
| `title` | VARCHAR(255) | NOT NULL | - | Título da nota |
| `tags` | JSON/TEXT[] | NOT NULL | [] | Array de tags |
| `created_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de criação (Unix) |
| `updated_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de atualização (Unix) |
| `color` | VARCHAR(20) | NULL | NULL | Cor da nota (hex ou nome) |
| `parent_id` | VARCHAR(36) | NULL | NULL | FK para nota pai (hierarquia) |
| `depth` | INTEGER | NOT NULL | 0 | Profundidade na árvore hierárquica |
| `path` | JSON/TEXT[] | NULL | NULL | Caminho de IDs até a raiz |
| `children_ids` | JSON/TEXT[] | NOT NULL | [] | Array de IDs dos filhos diretos |
| `is_root` | BOOLEAN | NOT NULL | false | Se é raiz da hierarquia |
| `hierarchy_order` | INTEGER | NOT NULL | 0 | Ordem entre irmãos |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `parent_id` REFERENCES `notes(id)` ON DELETE SET NULL
- INDEX: `idx_notes_parent_id` ON `parent_id`
- INDEX: `idx_notes_created_at` ON `created_at`
- INDEX: `idx_notes_title` ON `title` (para busca)
- CHECK: `depth >= 0 AND depth <= 5` (profundidade máxima)

---

### 2.2 Tabela: `blocks`

Armazena blocos de conteúdo (texto, checklist, tabelas, etc.) dentro das notas.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único do bloco |
| `note_id` | VARCHAR(36) | NOT NULL | - | FK para a nota pai |
| `type` | VARCHAR(20) | NOT NULL | 'text' | Tipo do bloco (enum) |
| `content` | TEXT | NULL | NULL | Conteúdo textual (JSON para tipos complexos) |
| `order` | INTEGER | NOT NULL | 0 | Ordem no documento |
| `parent_id` | VARCHAR(36) | NULL | NULL | FK para bloco pai (aninhamento) |
| `created_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de criação |
| `updated_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de atualização |
| `selected` | BOOLEAN | NOT NULL | false | Estado de seleção (UI) |
| `metadata` | JSON | NULL | NULL | Metadados específicos do tipo |

**Tipos de Bloco (Enum `block_type`):**
- `text` - Bloco de texto simples
- `checklist` - Lista de checkboxes
- `heading` - Cabeçalho (h1, h2, h3)
- `list` - Lista ordenada/não-ordenada
- `divider` - Divisor horizontal
- `callout` - Caixa de destaque
- `link` - Link para outra nota/bloco
- `embed` - Embed de nota/bloco
- `table` - Tabela
- `links` - Bloco de referências

**Estrutura de `metadata` por tipo:**

```json
// type: 'text'
{
  "links": [
    {
      "id": "link_uuid",
      "text": "titulo do link",
      "targetNoteId": "note_uuid",
      "type": "direct|reference",
      "position": { "start": 0, "end": 15 }
    }
  ]
}

// type: 'checklist'
{
  "items": [
    { "id": "item_uuid", "text": "Task 1", "completed": false },
    { "id": "item_uuid2", "text": "Task 2", "completed": true }
  ]
}

// type: 'heading'
{
  "level": 1  // 1, 2 ou 3
}

// type: 'list'
{
  "items": ["Item 1", "Item 2"],
  "ordered": true
}

// type: 'callout'
{
  "icon": "💡",
  "color": "#FFD700"
}

// type: 'link'
{
  "targetNoteId": "note_uuid",
  "targetBlockId": "block_uuid",  // opcional
  "displayText": "Ver nota relacionada"
}

// type: 'embed'
{
  "targetNoteId": "note_uuid",
  "targetBlockId": "block_uuid"  // opcional
}

// type: 'table'
{
  "headers": ["Coluna 1", "Coluna 2"],
  "rows": [
    ["Valor 1", "Valor 2"],
    ["Valor 3", "Valor 4"]
  ]
}

// type: 'links'
{
  "noteRefs": ["note_uuid1", "note_uuid2"]
}
```

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `note_id` REFERENCES `notes(id)` ON DELETE CASCADE
- FOREIGN KEY: `parent_id` REFERENCES `blocks(id)` ON DELETE CASCADE
- INDEX: `idx_blocks_note_id` ON `note_id`
- INDEX: `idx_blocks_order` ON `note_id, order`
- CHECK: `type IN ('text', 'checklist', 'heading', 'list', 'divider', 'callout', 'link', 'embed', 'table', 'links')`

---

### 2.3 Tabela: `note_links`

Armazena links extraídos de blocos de texto (sintaxe `[[link]]` ou `((ref))`).

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único do link |
| `block_id` | VARCHAR(36) | NOT NULL | - | FK para o bloco que contém o link |
| `source_note_id` | VARCHAR(36) | NOT NULL | - | FK para nota de origem |
| `text` | VARCHAR(255) | NOT NULL | - | Texto do link ([[texto]]) |
| `target_note_id` | VARCHAR(36) | NULL | NULL | FK para nota de destino (resolvido) |
| `type` | VARCHAR(20) | NOT NULL | 'direct' | Tipo do link: direct, reference |
| `position_start` | INTEGER | NOT NULL | - | Posição inicial no texto |
| `position_end` | INTEGER | NOT NULL | - | Posição final no texto |
| `created_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de criação |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `block_id` REFERENCES `blocks(id)` ON DELETE CASCADE
- FOREIGN KEY: `source_note_id` REFERENCES `notes(id)` ON DELETE CASCADE
- FOREIGN KEY: `target_note_id` REFERENCES `notes(id)` ON DELETE SET NULL
- INDEX: `idx_note_links_source` ON `source_note_id`
- INDEX: `idx_note_links_target` ON `target_note_id`
- CHECK: `type IN ('direct', 'reference')`

---

### 2.4 Tabela: `hierarchy_relations`

Armazena relações parent-child explícitas entre notas (hierarquia de ambientes).

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único da relação |
| `parent_id` | VARCHAR(36) | NOT NULL | - | FK para nota pai |
| `child_id` | VARCHAR(36) | NOT NULL | - | FK para nota filha |
| `order` | INTEGER | NOT NULL | 0 | Ordem entre irmãos |
| `type` | VARCHAR(20) | NOT NULL | 'explicit' | Tipo: explicit, implicit |
| `created_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de criação |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `parent_id` REFERENCES `notes(id)` ON DELETE CASCADE
- FOREIGN KEY: `child_id` REFERENCES `notes(id)` ON DELETE CASCADE
- UNIQUE: `(parent_id, child_id)` - Previne duplicatas
- INDEX: `idx_hierarchy_parent` ON `parent_id`
- INDEX: `idx_hierarchy_child` ON `child_id`
- CHECK: `type IN ('explicit', 'implicit')`
- CHECK: `parent_id != child_id` - Previne auto-referência

---

### 2.5 Tabela: `note_connections`

Armazena conexões calculadas entre notas (para otimização de queries).

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único da conexão |
| `from_note_id` | VARCHAR(36) | NOT NULL | - | FK para nota de origem |
| `to_note_id` | VARCHAR(36) | NOT NULL | - | FK para nota de destino |
| `link_type` | VARCHAR(20) | NOT NULL | - | Tipo: direct, reference, tag |
| `weight` | INTEGER | NOT NULL | 1 | Força da conexão (número de links) |
| `created_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de criação |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `from_note_id` REFERENCES `notes(id)` ON DELETE CASCADE
- FOREIGN KEY: `to_note_id` REFERENCES `notes(id)` ON DELETE CASCADE
- UNIQUE: `(from_note_id, to_note_id, link_type)`
- INDEX: `idx_connections_from` ON `from_note_id`
- INDEX: `idx_connections_to` ON `to_note_id`
- CHECK: `link_type IN ('direct', 'reference', 'tag')`

---

### 2.6 Tabela: `progression_state`

Armazena o estado de progressão do usuário (gamificação).

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único (single row) |
| `level` | INTEGER | NOT NULL | 1 | Nível atual (1, 2 ou 3) |
| `notes_created` | INTEGER | NOT NULL | 0 | Contador de notas criadas |
| `links_created` | INTEGER | NOT NULL | 0 | Contador de links criados |
| `blocks_used` | INTEGER | NOT NULL | 0 | Contador de blocos utilizados |
| `tags_used` | INTEGER | NOT NULL | 0 | Contador de tags únicas |
| `graph_interactions` | INTEGER | NOT NULL | 0 | Contador de interações no grafo |
| `unlocked_features` | JSON/TEXT[] | NOT NULL | [] | Array de features desbloqueadas |
| `updated_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de atualização |

**Features Possíveis:**
- `basic-notes` - Criar notas básicas
- `search` - Busca de notas
- `auto-links` - Links automáticos
- `mini-graph` - Mini grafo
- `tags` - Sistema de tags
- `full-graph` - Grafo completo
- `advanced-blocks` - Blocos avançados
- `templates` - Templates
- `tables` - Tabelas
- `kanban` - Quadro Kanban

**Constraints:**
- PRIMARY KEY: `id`
- CHECK: `level IN (1, 2, 3)`
- CHECK: `notes_created >= 0`
- CHECK: `links_created >= 0`
- CHECK: `blocks_used >= 0`
- CHECK: `tags_used >= 0`
- CHECK: `graph_interactions >= 0`

**Regras de Progressão:**

| Feature | Nível | Notas | Links | Interações |
|---------|-------|-------|-------|------------|
| basic-notes | 1 | 0 | - | - |
| search | 1 | 2 | - | - |
| auto-links | 2 | 5 | - | - |
| mini-graph | 2 | 5 | 2 | - |
| tags | 2 | 5 | - | - |
| full-graph | 3 | 15 | 5 | - |
| advanced-blocks | 3 | 15 | - | - |
| tables | 3 | 10 | - | - |
| kanban | 3 | 15 | - | - |
| templates | 3 | 20 | - | - |

---

### 2.7 Tabela: `achievements`

Armazena conquistas desbloqueadas pelo usuário.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único |
| `title` | VARCHAR(255) | NOT NULL | - | Título da conquista |
| `description` | TEXT | NOT NULL | - | Descrição detalhada |
| `icon` | VARCHAR(50) | NOT NULL | - | Emoji ou código do ícone |
| `unlocked_at` | BIGINT | NOT NULL | - | Timestamp de desbloqueio |
| `category` | VARCHAR(50) | NULL | NULL | Categoria (creator, linker, etc) |

**Constraints:**
- PRIMARY KEY: `id`
- INDEX: `idx_achievements_unlocked_at` ON `unlocked_at`

**Exemplos de Conquistas:**
- Primeira Nota
- 10 Notas Criadas
- 50 Notas Criadas
- Mestre dos Links (50+ links)
- Explorador (visitou grafo 10x)
- Organizador (criou hierarquia)

---

### 2.8 Tabela: `graph_nodes`

Armazena nós do grafo de visualização (cache).

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único |
| `note_id` | VARCHAR(36) | NOT NULL | - | FK para nota |
| `title` | VARCHAR(255) | NOT NULL | - | Título da nota (cache) |
| `connections` | INTEGER | NOT NULL | 0 | Número de conexões |
| `tags` | JSON/TEXT[] | NOT NULL | [] | Tags (cache) |
| `x` | FLOAT | NULL | NULL | Posição X no grafo |
| `y` | FLOAT | NULL | NULL | Posição Y no grafo |
| `type` | VARCHAR(20) | NOT NULL | 'orphan' | Tipo: root, parent, child, orphan |
| `depth` | INTEGER | NOT NULL | 0 | Profundidade na hierarquia |
| `is_root` | BOOLEAN | NOT NULL | false | Se é raiz |
| `children_count` | INTEGER | NOT NULL | 0 | Número de filhos |
| `color` | VARCHAR(20) | NULL | NULL | Cor do nó |
| `size` | FLOAT | NOT NULL | 20 | Raio do círculo |
| `updated_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `note_id` REFERENCES `notes(id)` ON DELETE CASCADE
- UNIQUE: `note_id`
- INDEX: `idx_graph_nodes_note_id` ON `note_id`
- CHECK: `type IN ('root', 'parent', 'child', 'orphan')`

---

### 2.9 Tabela: `graph_edges`

Armazena arestas do grafo de visualização (cache).

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único |
| `source` | VARCHAR(36) | NOT NULL | - | FK para nota de origem |
| `target` | VARCHAR(36) | NOT NULL | - | FK para nota de destino |
| `weight` | INTEGER | NOT NULL | 1 | Força da conexão |
| `type` | VARCHAR(20) | NOT NULL | 'link' | Tipo: direct, reference, tag, hierarchy, link |
| `color` | VARCHAR(20) | NULL | NULL | Cor da aresta |
| `width` | FLOAT | NOT NULL | 2 | Largura da linha |
| `style` | VARCHAR(20) | NOT NULL | 'solid' | Estilo: solid, dashed |
| `updated_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de atualização |

**Constraints:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `source` REFERENCES `notes(id)` ON DELETE CASCADE
- FOREIGN KEY: `target` REFERENCES `notes(id)` ON DELETE CASCADE
- UNIQUE: `(source, target, type)`
- INDEX: `idx_graph_edges_source` ON `source`
- INDEX: `idx_graph_edges_target` ON `target`
- CHECK: `type IN ('direct', 'reference', 'tag', 'hierarchy', 'link')`
- CHECK: `style IN ('solid', 'dashed')`

---

### 2.10 Tabela: `graph_cache`

Armazena cache do grafo completo para otimização.

| Coluna | Tipo | Nulo | Padrão | Descrição |
|--------|------|------|--------|-----------|
| `id` | VARCHAR(36) | NOT NULL | UUID | Identificador único (single row) |
| `notes_hash` | VARCHAR(64) | NOT NULL | - | Hash MD5 das notas (para invalidação) |
| `graph_data` | JSON | NOT NULL | - | Dados completos do grafo serializado |
| `stats` | JSON | NOT NULL | - | Estatísticas do grafo |
| `created_at` | BIGINT | NOT NULL | CURRENT_TIMESTAMP | Timestamp de criação |

**Estrutura de `stats`:**
```json
{
  "nodeCount": 50,
  "edgeCount": 75,
  "hierarchyEdges": 20,
  "linkEdges": 55,
  "rootCount": 5,
  "maxDepth": 3,
  "avgChildrenCount": 2.5
}
```

**Constraints:**
- PRIMARY KEY: `id`
- INDEX: `idx_graph_cache_hash` ON `notes_hash`

---

## 3. Relacionamentos

### Diagrama de Relacionamentos (Texto)

```
notes (1) ──────── (N) blocks
  │                     │
  │                     │
  │                     └─── (N) note_links ──── (1) notes [target]
  │
  ├── (N) hierarchy_relations [as parent]
  │         └─── (1) notes [as child]
  │
  ├── (N) hierarchy_relations [as child]
  │         └─── (1) notes [as parent]
  │
  ├── (N) note_connections [as from]
  │         └─── (1) notes [as to]
  │
  ├── (N) note_connections [as to]
  │         └─── (1) notes [as from]
  │
  ├── (1) graph_nodes
  │
  ├── (N) graph_edges [as source]
  │         └─── (1) notes [as target]
  │
  └── (N) graph_edges [as target]
            └─── (1) notes [as source]

progression_state (singleton)
achievements (N)
graph_cache (singleton)
```

### Tipos de Relacionamentos

| Relação | Tipo | Cardinalidade | Cascata Delete |
|---------|------|---------------|----------------|
| notes → blocks | 1:N | Uma nota tem muitos blocos | CASCADE |
| blocks → note_links | 1:N | Um bloco tem muitos links | CASCADE |
| note_links → notes (target) | N:1 | Muitos links para uma nota | SET NULL |
| notes → hierarchy_relations (parent) | 1:N | Uma nota pai tem muitos filhos | CASCADE |
| notes → hierarchy_relations (child) | 1:N | Uma nota filha tem um pai | CASCADE |
| notes → note_connections (from) | 1:N | Uma nota tem muitas conexões | CASCADE |
| notes → note_connections (to) | 1:N | Uma nota recebe muitas conexões | CASCADE |
| notes → graph_nodes | 1:1 | Uma nota tem um nó no grafo | CASCADE |
| notes → graph_edges (source) | 1:N | Uma nota tem muitas arestas de saída | CASCADE |
| notes → graph_edges (target) | 1:N | Uma nota tem muitas arestas de entrada | CASCADE |

---

## 4. Diagramas ER

### Diagrama ER Simplificado (Entidades Principais)

```
┌──────────────┐         ┌──────────────┐
│    NOTES     │─────────│   BLOCKS     │
│              │    1:N  │              │
│ - id (PK)    │         │ - id (PK)    │
│ - title      │         │ - note_id(FK)│
│ - tags[]     │         │ - type       │
│ - parent_id  │         │ - content    │
│ - depth      │         │ - order      │
│ - is_root    │         └──────┬───────┘
└──────┬───────┘                │
       │                        │
       │                        │
       │                 ┌──────▼───────┐
       │                 │  NOTE_LINKS  │
       │                 │              │
       │                 │ - id (PK)    │
       │                 │ - block_id   │
       │                 │ - target_id  │
       │                 │ - type       │
       │                 └──────────────┘
       │
       │
┌──────▼────────────────┐
│ HIERARCHY_RELATIONS   │
│                       │
│ - id (PK)             │
│ - parent_id (FK)      │
│ - child_id (FK)       │
│ - order               │
│ - type                │
└───────────────────────┘
```

### Diagrama ER Completo

```
                    ┌─────────────────┐
                    │ PROGRESSION_    │
                    │    STATE        │
                    │                 │
                    │ - id (PK)       │
                    │ - level         │
                    │ - notes_created │
                    │ - links_created │
                    └─────────────────┘
                            │
                            │ tracks
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼───────┐                     ┌─────────▼────────┐
│  ACHIEVEMENTS │                     │  GRAPH_CACHE     │
│               │                     │                  │
│ - id (PK)     │                     │ - id (PK)        │
│ - title       │                     │ - notes_hash     │
│ - unlocked_at │                     │ - graph_data     │
└───────────────┘                     └──────────────────┘


┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    NOTES     │─────────│   BLOCKS     │─────────│  NOTE_LINKS  │
│              │    1:N  │              │    1:N  │              │
│ - id (PK)    │◄────────│ - note_id(FK)│◄────────│ - block_id   │
│ - title      │         │ - type       │         │ - target_id  │
│ - parent_id  │         │ - content    │         │ - type       │
└──────┬───────┘         └──────────────┘         └──────────────┘
       │
       │ self-referencing
       │ (hierarchy)
       │
┌──────▼────────────────┐
│ HIERARCHY_RELATIONS   │
│                       │
│ - parent_id (FK)      │
│ - child_id (FK)       │
│ - order               │
└───────┬───────────────┘
        │
        │
┌───────▼───────────────┐
│  NOTE_CONNECTIONS     │
│                       │
│ - from_note_id (FK)   │
│ - to_note_id (FK)     │
│ - link_type           │
│ - weight              │
└───────┬───────────────┘
        │
        │ materialized in
        │
┌───────▼───────────────┐        ┌──────────────┐
│   GRAPH_NODES         │────────│ GRAPH_EDGES  │
│                       │   1:N  │              │
│ - note_id (FK)        │◄───────│ - source(FK) │
│ - x, y                │   1:N  │ - target(FK) │
│ - type                │◄───────│ - type       │
│ - depth               │        │ - weight     │
└───────────────────────┘        └──────────────┘
```

---

## 5. Scripts SQL de Criação

### 5.1 PostgreSQL Schema

```sql
-- ============================================
-- APEX NOTE SYSTEM - PostgreSQL Schema
-- Version: 1.0
-- Date: 2025-12-03
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE block_type_enum AS ENUM (
  'text', 'checklist', 'heading', 'list', 'divider',
  'callout', 'link', 'embed', 'table', 'links'
);

CREATE TYPE link_type_enum AS ENUM ('direct', 'reference');

CREATE TYPE hierarchy_type_enum AS ENUM ('explicit', 'implicit');

CREATE TYPE connection_type_enum AS ENUM ('direct', 'reference', 'tag');

CREATE TYPE node_type_enum AS ENUM ('root', 'parent', 'child', 'orphan');

CREATE TYPE edge_type_enum AS ENUM ('direct', 'reference', 'tag', 'hierarchy', 'link');

CREATE TYPE edge_style_enum AS ENUM ('solid', 'dashed');

CREATE TYPE feature_enum AS ENUM (
  'basic-notes', 'search', 'auto-links', 'mini-graph', 'tags',
  'full-graph', 'advanced-blocks', 'templates', 'tables', 'kanban'
);

-- ============================================
-- TABLE: notes
-- ============================================

CREATE TABLE notes (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title VARCHAR(255) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  color VARCHAR(20),
  parent_id VARCHAR(36),
  depth INTEGER NOT NULL DEFAULT 0 CHECK (depth >= 0 AND depth <= 5),
  path TEXT[],
  children_ids TEXT[] DEFAULT '{}',
  is_root BOOLEAN NOT NULL DEFAULT false,
  hierarchy_order INTEGER NOT NULL DEFAULT 0,

  FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE SET NULL
);

-- Indexes for notes
CREATE INDEX idx_notes_parent_id ON notes(parent_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);
CREATE INDEX idx_notes_title ON notes USING gin(to_tsvector('english', title));
CREATE INDEX idx_notes_tags ON notes USING gin(tags);
CREATE INDEX idx_notes_is_root ON notes(is_root) WHERE is_root = true;

-- ============================================
-- TABLE: blocks
-- ============================================

CREATE TABLE blocks (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  note_id VARCHAR(36) NOT NULL,
  type block_type_enum NOT NULL DEFAULT 'text',
  content TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  parent_id VARCHAR(36),
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  selected BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,

  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES blocks(id) ON DELETE CASCADE
);

-- Indexes for blocks
CREATE INDEX idx_blocks_note_id ON blocks(note_id);
CREATE INDEX idx_blocks_order ON blocks(note_id, "order");
CREATE INDEX idx_blocks_type ON blocks(type);
CREATE INDEX idx_blocks_metadata ON blocks USING gin(metadata);

-- ============================================
-- TABLE: note_links
-- ============================================

CREATE TABLE note_links (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  block_id VARCHAR(36) NOT NULL,
  source_note_id VARCHAR(36) NOT NULL,
  text VARCHAR(255) NOT NULL,
  target_note_id VARCHAR(36),
  type link_type_enum NOT NULL DEFAULT 'direct',
  position_start INTEGER NOT NULL,
  position_end INTEGER NOT NULL,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,

  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
  FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE SET NULL
);

-- Indexes for note_links
CREATE INDEX idx_note_links_block_id ON note_links(block_id);
CREATE INDEX idx_note_links_source ON note_links(source_note_id);
CREATE INDEX idx_note_links_target ON note_links(target_note_id);
CREATE INDEX idx_note_links_text ON note_links USING gin(to_tsvector('english', text));

-- ============================================
-- TABLE: hierarchy_relations
-- ============================================

CREATE TABLE hierarchy_relations (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  parent_id VARCHAR(36) NOT NULL,
  child_id VARCHAR(36) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  type hierarchy_type_enum NOT NULL DEFAULT 'explicit',
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,

  FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES notes(id) ON DELETE CASCADE,

  UNIQUE (parent_id, child_id),
  CHECK (parent_id != child_id)
);

-- Indexes for hierarchy_relations
CREATE INDEX idx_hierarchy_parent ON hierarchy_relations(parent_id);
CREATE INDEX idx_hierarchy_child ON hierarchy_relations(child_id);
CREATE INDEX idx_hierarchy_type ON hierarchy_relations(type);

-- ============================================
-- TABLE: note_connections
-- ============================================

CREATE TABLE note_connections (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  from_note_id VARCHAR(36) NOT NULL,
  to_note_id VARCHAR(36) NOT NULL,
  link_type connection_type_enum NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight > 0),
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,

  FOREIGN KEY (from_note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (to_note_id) REFERENCES notes(id) ON DELETE CASCADE,

  UNIQUE (from_note_id, to_note_id, link_type)
);

-- Indexes for note_connections
CREATE INDEX idx_connections_from ON note_connections(from_note_id);
CREATE INDEX idx_connections_to ON note_connections(to_note_id);
CREATE INDEX idx_connections_type ON note_connections(link_type);

-- ============================================
-- TABLE: progression_state
-- ============================================

CREATE TABLE progression_state (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level IN (1, 2, 3)),
  notes_created INTEGER NOT NULL DEFAULT 0 CHECK (notes_created >= 0),
  links_created INTEGER NOT NULL DEFAULT 0 CHECK (links_created >= 0),
  blocks_used INTEGER NOT NULL DEFAULT 0 CHECK (blocks_used >= 0),
  tags_used INTEGER NOT NULL DEFAULT 0 CHECK (tags_used >= 0),
  graph_interactions INTEGER NOT NULL DEFAULT 0 CHECK (graph_interactions >= 0),
  unlocked_features TEXT[] DEFAULT '{}',
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Insert default progression state
INSERT INTO progression_state (id, level, unlocked_features)
VALUES ('default', 1, ARRAY['basic-notes']::TEXT[]);

-- ============================================
-- TABLE: achievements
-- ============================================

CREATE TABLE achievements (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  unlocked_at BIGINT NOT NULL,
  category VARCHAR(50)
);

-- Indexes for achievements
CREATE INDEX idx_achievements_unlocked_at ON achievements(unlocked_at);
CREATE INDEX idx_achievements_category ON achievements(category);

-- ============================================
-- TABLE: graph_nodes
-- ============================================

CREATE TABLE graph_nodes (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  note_id VARCHAR(36) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  connections INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  x FLOAT,
  y FLOAT,
  type node_type_enum NOT NULL DEFAULT 'orphan',
  depth INTEGER NOT NULL DEFAULT 0,
  is_root BOOLEAN NOT NULL DEFAULT false,
  children_count INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(20),
  size FLOAT NOT NULL DEFAULT 20.0,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,

  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Indexes for graph_nodes
CREATE INDEX idx_graph_nodes_note_id ON graph_nodes(note_id);
CREATE INDEX idx_graph_nodes_type ON graph_nodes(type);
CREATE INDEX idx_graph_nodes_connections ON graph_nodes(connections);

-- ============================================
-- TABLE: graph_edges
-- ============================================

CREATE TABLE graph_edges (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  source VARCHAR(36) NOT NULL,
  target VARCHAR(36) NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight > 0),
  type edge_type_enum NOT NULL DEFAULT 'link',
  color VARCHAR(20),
  width FLOAT NOT NULL DEFAULT 2.0,
  style edge_style_enum NOT NULL DEFAULT 'solid',
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,

  FOREIGN KEY (source) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (target) REFERENCES notes(id) ON DELETE CASCADE,

  UNIQUE (source, target, type)
);

-- Indexes for graph_edges
CREATE INDEX idx_graph_edges_source ON graph_edges(source);
CREATE INDEX idx_graph_edges_target ON graph_edges(target);
CREATE INDEX idx_graph_edges_type ON graph_edges(type);

-- ============================================
-- TABLE: graph_cache
-- ============================================

CREATE TABLE graph_cache (
  id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  notes_hash VARCHAR(64) NOT NULL,
  graph_data JSONB NOT NULL,
  stats JSONB NOT NULL,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
);

-- Index for graph_cache
CREATE INDEX idx_graph_cache_hash ON graph_cache(notes_hash);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progression_state_updated_at BEFORE UPDATE ON progression_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graph_nodes_updated_at BEFORE UPDATE ON graph_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graph_edges_updated_at BEFORE UPDATE ON graph_edges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- View: Complete note with all relationships
CREATE VIEW notes_complete AS
SELECT
  n.*,
  (
    SELECT COUNT(*)
    FROM note_connections nc
    WHERE nc.to_note_id = n.id
  ) AS backlinks_count,
  (
    SELECT COUNT(*)
    FROM note_connections nc
    WHERE nc.from_note_id = n.id OR nc.to_note_id = n.id
  ) AS total_connections,
  (
    SELECT json_agg(b ORDER BY b."order")
    FROM blocks b
    WHERE b.note_id = n.id
  ) AS blocks_json
FROM notes n;

-- View: Hierarchy tree
CREATE VIEW hierarchy_tree AS
WITH RECURSIVE tree AS (
  -- Root nodes
  SELECT
    n.id,
    n.title,
    n.parent_id,
    n.depth,
    n.is_root,
    ARRAY[n.id] AS path_ids,
    ARRAY[n.title] AS path_titles
  FROM notes n
  WHERE n.is_root = true

  UNION ALL

  -- Child nodes
  SELECT
    n.id,
    n.title,
    n.parent_id,
    n.depth,
    n.is_root,
    t.path_ids || n.id,
    t.path_titles || n.title
  FROM notes n
  INNER JOIN tree t ON n.parent_id = t.id
)
SELECT * FROM tree;

-- View: Note statistics
CREATE VIEW note_statistics AS
SELECT
  n.id,
  n.title,
  COUNT(DISTINCT b.id) AS blocks_count,
  COUNT(DISTINCT nl.id) AS links_count,
  COUNT(DISTINCT hr.child_id) AS children_count,
  ARRAY_LENGTH(n.tags, 1) AS tags_count,
  (
    SELECT COUNT(*)
    FROM note_connections nc
    WHERE nc.to_note_id = n.id
  ) AS backlinks_count
FROM notes n
LEFT JOIN blocks b ON b.note_id = n.id
LEFT JOIN note_links nl ON nl.source_note_id = n.id
LEFT JOIN hierarchy_relations hr ON hr.parent_id = n.id
GROUP BY n.id, n.title, n.tags;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE notes IS 'Main notes table with hierarchy support';
COMMENT ON TABLE blocks IS 'Content blocks within notes (text, checklist, tables, etc)';
COMMENT ON TABLE note_links IS 'Links extracted from block content ([[links]])';
COMMENT ON TABLE hierarchy_relations IS 'Parent-child relationships between notes';
COMMENT ON TABLE note_connections IS 'Calculated connections between notes for graph';
COMMENT ON TABLE progression_state IS 'User progression and feature unlocking (singleton)';
COMMENT ON TABLE achievements IS 'Unlocked achievements';
COMMENT ON TABLE graph_nodes IS 'Graph visualization nodes (cached)';
COMMENT ON TABLE graph_edges IS 'Graph visualization edges (cached)';
COMMENT ON TABLE graph_cache IS 'Full graph cache for performance (singleton)';

-- ============================================
-- END OF SCHEMA
-- ============================================
```

### 5.2 MySQL Schema (Alternativa)

```sql
-- ============================================
-- APEX NOTE SYSTEM - MySQL Schema
-- Version: 1.0
-- Date: 2025-12-03
-- Requires: MySQL 8.0+
-- ============================================

-- ============================================
-- TABLE: notes
-- ============================================

CREATE TABLE notes (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  tags JSON NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  color VARCHAR(20),
  parent_id VARCHAR(36),
  depth INT NOT NULL DEFAULT 0,
  path JSON,
  children_ids JSON NOT NULL,
  is_root BOOLEAN NOT NULL DEFAULT false,
  hierarchy_order INT NOT NULL DEFAULT 0,

  FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE SET NULL,
  CHECK (depth >= 0 AND depth <= 5),
  INDEX idx_notes_parent_id (parent_id),
  INDEX idx_notes_created_at (created_at),
  FULLTEXT INDEX idx_notes_title (title)
);

-- ============================================
-- TABLE: blocks
-- ============================================

CREATE TABLE blocks (
  id VARCHAR(36) PRIMARY KEY,
  note_id VARCHAR(36) NOT NULL,
  type ENUM('text', 'checklist', 'heading', 'list', 'divider', 'callout', 'link', 'embed', 'table', 'links') NOT NULL DEFAULT 'text',
  content TEXT,
  `order` INT NOT NULL DEFAULT 0,
  parent_id VARCHAR(36),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  selected BOOLEAN NOT NULL DEFAULT false,
  metadata JSON,

  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES blocks(id) ON DELETE CASCADE,
  INDEX idx_blocks_note_id (note_id),
  INDEX idx_blocks_order (note_id, `order`)
);

-- ============================================
-- TABLE: note_links
-- ============================================

CREATE TABLE note_links (
  id VARCHAR(36) PRIMARY KEY,
  block_id VARCHAR(36) NOT NULL,
  source_note_id VARCHAR(36) NOT NULL,
  text VARCHAR(255) NOT NULL,
  target_note_id VARCHAR(36),
  type ENUM('direct', 'reference') NOT NULL DEFAULT 'direct',
  position_start INT NOT NULL,
  position_end INT NOT NULL,
  created_at BIGINT NOT NULL,

  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
  FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE SET NULL,
  INDEX idx_note_links_source (source_note_id),
  INDEX idx_note_links_target (target_note_id)
);

-- ============================================
-- TABLE: hierarchy_relations
-- ============================================

CREATE TABLE hierarchy_relations (
  id VARCHAR(36) PRIMARY KEY,
  parent_id VARCHAR(36) NOT NULL,
  child_id VARCHAR(36) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  type ENUM('explicit', 'implicit') NOT NULL DEFAULT 'explicit',
  created_at BIGINT NOT NULL,

  FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES notes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_parent_child (parent_id, child_id),
  CHECK (parent_id != child_id),
  INDEX idx_hierarchy_parent (parent_id),
  INDEX idx_hierarchy_child (child_id)
);

-- ============================================
-- TABLE: note_connections
-- ============================================

CREATE TABLE note_connections (
  id VARCHAR(36) PRIMARY KEY,
  from_note_id VARCHAR(36) NOT NULL,
  to_note_id VARCHAR(36) NOT NULL,
  link_type ENUM('direct', 'reference', 'tag') NOT NULL,
  weight INT NOT NULL DEFAULT 1,
  created_at BIGINT NOT NULL,

  FOREIGN KEY (from_note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (to_note_id) REFERENCES notes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_connection (from_note_id, to_note_id, link_type),
  CHECK (weight > 0),
  INDEX idx_connections_from (from_note_id),
  INDEX idx_connections_to (to_note_id)
);

-- ============================================
-- TABLE: progression_state
-- ============================================

CREATE TABLE progression_state (
  id VARCHAR(36) PRIMARY KEY,
  level INT NOT NULL DEFAULT 1,
  notes_created INT NOT NULL DEFAULT 0,
  links_created INT NOT NULL DEFAULT 0,
  blocks_used INT NOT NULL DEFAULT 0,
  tags_used INT NOT NULL DEFAULT 0,
  graph_interactions INT NOT NULL DEFAULT 0,
  unlocked_features JSON NOT NULL,
  updated_at BIGINT NOT NULL,

  CHECK (level IN (1, 2, 3)),
  CHECK (notes_created >= 0),
  CHECK (links_created >= 0)
);

-- ============================================
-- TABLE: achievements
-- ============================================

CREATE TABLE achievements (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  unlocked_at BIGINT NOT NULL,
  category VARCHAR(50),
  INDEX idx_achievements_unlocked_at (unlocked_at)
);

-- ============================================
-- TABLE: graph_nodes
-- ============================================

CREATE TABLE graph_nodes (
  id VARCHAR(36) PRIMARY KEY,
  note_id VARCHAR(36) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  connections INT NOT NULL DEFAULT 0,
  tags JSON NOT NULL,
  x FLOAT,
  y FLOAT,
  type ENUM('root', 'parent', 'child', 'orphan') NOT NULL DEFAULT 'orphan',
  depth INT NOT NULL DEFAULT 0,
  is_root BOOLEAN NOT NULL DEFAULT false,
  children_count INT NOT NULL DEFAULT 0,
  color VARCHAR(20),
  size FLOAT NOT NULL DEFAULT 20.0,
  updated_at BIGINT NOT NULL,

  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  INDEX idx_graph_nodes_note_id (note_id)
);

-- ============================================
-- TABLE: graph_edges
-- ============================================

CREATE TABLE graph_edges (
  id VARCHAR(36) PRIMARY KEY,
  source VARCHAR(36) NOT NULL,
  target VARCHAR(36) NOT NULL,
  weight INT NOT NULL DEFAULT 1,
  type ENUM('direct', 'reference', 'tag', 'hierarchy', 'link') NOT NULL DEFAULT 'link',
  color VARCHAR(20),
  width FLOAT NOT NULL DEFAULT 2.0,
  style ENUM('solid', 'dashed') NOT NULL DEFAULT 'solid',
  updated_at BIGINT NOT NULL,

  FOREIGN KEY (source) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (target) REFERENCES notes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_edge (source, target, type),
  CHECK (weight > 0),
  INDEX idx_graph_edges_source (source),
  INDEX idx_graph_edges_target (target)
);

-- ============================================
-- TABLE: graph_cache
-- ============================================

CREATE TABLE graph_cache (
  id VARCHAR(36) PRIMARY KEY,
  notes_hash VARCHAR(64) NOT NULL,
  graph_data JSON NOT NULL,
  stats JSON NOT NULL,
  created_at BIGINT NOT NULL,
  INDEX idx_graph_cache_hash (notes_hash)
);
```

---

## 6. Schema NoSQL (MongoDB)

### 6.1 Collections Overview

```javascript
// Collections:
// - notes
// - progression_state (singleton)
// - achievements
// - graph_cache (singleton)
```

### 6.2 MongoDB Schemas

```javascript
// ============================================
// COLLECTION: notes
// ============================================

{
  _id: ObjectId("..."),
  id: "uuid-v4",
  title: "Título da Nota",
  tags: ["tag1", "tag2"],
  createdAt: NumberLong(1701234567890), // Unix timestamp
  updatedAt: NumberLong(1701234567890),
  color: "#FF5733",

  // Hierarchy fields
  parentId: "parent-uuid" | null,
  depth: 0,
  path: ["root-id", "parent-id"],
  childrenIds: ["child-id-1", "child-id-2"],
  isRoot: false,
  hierarchyOrder: 0,

  // Embedded blocks
  blocks: [
    {
      id: "block-uuid",
      type: "text", // text | checklist | heading | list | divider | callout | link | embed | table | links
      content: "Conteúdo do bloco",
      order: 0,
      parentId: null,
      createdAt: NumberLong(1701234567890),
      updatedAt: NumberLong(1701234567890),
      selected: false,

      // Type-specific metadata
      metadata: {
        // For type: 'text'
        links: [
          {
            id: "link-uuid",
            text: "titulo do link",
            targetNoteId: "target-uuid",
            type: "direct", // direct | reference
            position: { start: 0, end: 15 }
          }
        ],

        // For type: 'checklist'
        items: [
          { id: "item-uuid", text: "Task 1", completed: false }
        ],

        // For type: 'heading'
        level: 1, // 1 | 2 | 3

        // For type: 'list'
        items: ["Item 1", "Item 2"],
        ordered: true,

        // For type: 'callout'
        icon: "💡",
        color: "#FFD700",

        // For type: 'link'
        targetNoteId: "note-uuid",
        targetBlockId: "block-uuid",
        displayText: "Ver nota",

        // For type: 'embed'
        targetNoteId: "note-uuid",
        targetBlockId: "block-uuid",

        // For type: 'table'
        headers: ["Col1", "Col2"],
        rows: [["Val1", "Val2"]],

        // For type: 'links'
        noteRefs: ["note-uuid-1", "note-uuid-2"]
      }
    }
  ],

  // Calculated connections (denormalized for performance)
  connections: {
    outgoing: [
      {
        toNoteId: "target-uuid",
        linkType: "direct", // direct | reference | tag
        weight: 2,
        createdAt: NumberLong(1701234567890)
      }
    ],
    incoming: [
      {
        fromNoteId: "source-uuid",
        linkType: "direct",
        weight: 1,
        createdAt: NumberLong(1701234567890)
      }
    ],
    backlinksCount: 5,
    totalConnections: 10
  },

  // Hierarchy relations (denormalized)
  hierarchy: {
    parent: {
      id: "parent-uuid",
      title: "Ambiente Pai"
    },
    children: [
      { id: "child-uuid-1", title: "Filho 1", order: 0 },
      { id: "child-uuid-2", title: "Filho 2", order: 1 }
    ],
    siblings: [
      { id: "sibling-uuid", title: "Irmão" }
    ],
    ancestors: [
      { id: "root-uuid", title: "Raiz", depth: 0 },
      { id: "parent-uuid", title: "Pai", depth: 1 }
    ],
    metadata: {
      depth: 2,
      childrenCount: 2,
      descendantsCount: 5,
      isRoot: false,
      isLeaf: false,
      hasParent: true
    }
  }
}

// Indexes for notes collection
db.notes.createIndex({ "id": 1 }, { unique: true })
db.notes.createIndex({ "title": "text" })
db.notes.createIndex({ "tags": 1 })
db.notes.createIndex({ "parentId": 1 })
db.notes.createIndex({ "createdAt": -1 })
db.notes.createIndex({ "isRoot": 1 })
db.notes.createIndex({ "blocks.metadata.links.targetNoteId": 1 })

// ============================================
// COLLECTION: progression_state
// ============================================

{
  _id: ObjectId("..."),
  id: "default",
  level: 1, // 1 | 2 | 3
  notesCreated: 0,
  linksCreated: 0,
  blocksUsed: 0,
  tagsUsed: 0,
  graphInteractions: 0,
  unlockedFeatures: [
    "basic-notes",
    "search"
  ],
  updatedAt: NumberLong(1701234567890)
}

// Indexes
db.progression_state.createIndex({ "id": 1 }, { unique: true })

// ============================================
// COLLECTION: achievements
// ============================================

{
  _id: ObjectId("..."),
  id: "achievement-uuid",
  title: "Primeira Nota",
  description: "Você criou sua primeira nota!",
  icon: "🎉",
  unlockedAt: NumberLong(1701234567890),
  category: "creator"
}

// Indexes
db.achievements.createIndex({ "id": 1 }, { unique: true })
db.achievements.createIndex({ "unlockedAt": -1 })
db.achievements.createIndex({ "category": 1 })

// ============================================
// COLLECTION: graph_cache
// ============================================

{
  _id: ObjectId("..."),
  id: "default",
  notesHash: "md5-hash-of-notes",
  graphData: {
    nodes: [
      {
        id: "node-uuid",
        noteId: "note-uuid",
        title: "Título",
        connections: 5,
        tags: ["tag1"],
        x: 100.5,
        y: 200.3,
        type: "root", // root | parent | child | orphan
        depth: 0,
        isRoot: true,
        childrenCount: 3,
        color: "#FF5733",
        size: 30.0
      }
    ],
    edges: [
      {
        id: "edge-uuid",
        source: "note-uuid-1",
        target: "note-uuid-2",
        weight: 2,
        type: "hierarchy", // direct | reference | tag | hierarchy | link
        color: "#999",
        width: 2.0,
        style: "solid" // solid | dashed
      }
    ],
    width: 1000,
    height: 800,
    rootNodes: ["root-uuid-1", "root-uuid-2"]
  },
  stats: {
    nodeCount: 50,
    edgeCount: 75,
    hierarchyEdges: 20,
    linkEdges: 55,
    rootCount: 5,
    maxDepth: 3,
    avgChildrenCount: 2.5
  },
  createdAt: NumberLong(1701234567890)
}

// Indexes
db.graph_cache.createIndex({ "id": 1 }, { unique: true })
db.graph_cache.createIndex({ "notesHash": 1 })
```

### 6.3 MongoDB Schema Validation

```javascript
// Schema validation for notes collection
db.createCollection("notes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "title", "tags", "createdAt", "updatedAt", "blocks"],
      properties: {
        id: {
          bsonType: "string",
          description: "Must be a UUID string"
        },
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 255
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        },
        createdAt: {
          bsonType: "long"
        },
        updatedAt: {
          bsonType: "long"
        },
        color: {
          bsonType: ["string", "null"]
        },
        parentId: {
          bsonType: ["string", "null"]
        },
        depth: {
          bsonType: "int",
          minimum: 0,
          maximum: 5
        },
        isRoot: {
          bsonType: "bool"
        },
        blocks: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["id", "type", "order", "createdAt", "updatedAt"],
            properties: {
              id: {
                bsonType: "string"
              },
              type: {
                enum: ["text", "checklist", "heading", "list", "divider", "callout", "link", "embed", "table", "links"]
              },
              content: {
                bsonType: ["string", "null"]
              },
              order: {
                bsonType: "int"
              },
              selected: {
                bsonType: "bool"
              }
            }
          }
        }
      }
    }
  }
})
```

---

## 7. Índices Recomendados

### 7.1 Índices para Performance (PostgreSQL)

```sql
-- Índices de busca textual
CREATE INDEX idx_notes_title_trgm ON notes USING gin(title gin_trgm_ops);
CREATE INDEX idx_blocks_content_trgm ON blocks USING gin(content gin_trgm_ops);

-- Índices compostos para queries frequentes
CREATE INDEX idx_notes_parent_depth ON notes(parent_id, depth) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_blocks_note_type_order ON blocks(note_id, type, "order");
CREATE INDEX idx_note_links_source_target ON note_links(source_note_id, target_note_id);
CREATE INDEX idx_connections_from_to ON note_connections(from_note_id, to_note_id);

-- Índices parciais
CREATE INDEX idx_notes_roots ON notes(id) WHERE is_root = true;
CREATE INDEX idx_blocks_selected ON blocks(id) WHERE selected = true;
CREATE INDEX idx_hierarchy_explicit ON hierarchy_relations(parent_id, child_id) WHERE type = 'explicit';

-- Índices para agregações
CREATE INDEX idx_graph_nodes_connections ON graph_nodes(connections DESC);
CREATE INDEX idx_graph_edges_weight ON graph_edges(weight DESC);
```

### 7.2 Índices MongoDB

```javascript
// Compound indexes for common queries
db.notes.createIndex({ "parentId": 1, "depth": 1 })
db.notes.createIndex({ "parentId": 1, "hierarchyOrder": 1 })
db.notes.createIndex({ "isRoot": 1, "createdAt": -1 })
db.notes.createIndex({ "tags": 1, "createdAt": -1 })

// Text search
db.notes.createIndex({
  "title": "text",
  "blocks.content": "text"
}, {
  weights: {
    title: 10,
    "blocks.content": 5
  }
})

// Sparse indexes
db.notes.createIndex({ "parentId": 1 }, { sparse: true })
db.notes.createIndex({ "color": 1 }, { sparse: true })

// TTL index for cache
db.graph_cache.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600 })
```

---

## 8. Considerações de Performance

### 8.1 Estratégias de Otimização

#### Desnormalização Controlada
- **Problema**: Cálculo de backlinks é custoso
- **Solução**: Armazenar `backlinksCount` em `notes` (atualizado via trigger)
- **Trade-off**: Consistência eventual vs performance de leitura

#### Materialização de Grafos
- **Problema**: Construir grafo dinamicamente é lento (>100 notas)
- **Solução**: Tabela `graph_cache` com hash de notas
- **Invalidação**: Recriar quando hash muda
- **TTL**: Cache expira após 1 hora

#### Indexação Estratégica
- **Full-text search**: GIN indexes (PostgreSQL) ou text indexes (MongoDB)
- **Range queries**: B-tree indexes em `created_at`, `depth`
- **Array queries**: GIN indexes em `tags`, `children_ids`

#### Paginação
```sql
-- Evitar OFFSET em grandes datasets
-- Use cursor-based pagination
SELECT * FROM notes
WHERE created_at < :last_seen_timestamp
ORDER BY created_at DESC
LIMIT 20;
```

#### Lazy Loading
- Não carregar `blocks` automaticamente
- Carregar hierarquia sob demanda (recursão máxima: 5 níveis)
- Carregar grafo apenas quando visualizado

### 8.2 Queries Otimizadas Comuns

```sql
-- Query 1: Buscar nota com blocos
SELECT n.*, json_agg(b ORDER BY b."order") AS blocks
FROM notes n
LEFT JOIN blocks b ON b.note_id = n.id
WHERE n.id = :note_id
GROUP BY n.id;

-- Query 2: Árvore de hierarquia (recursive CTE)
WITH RECURSIVE tree AS (
  SELECT id, title, parent_id, depth, ARRAY[id] AS path
  FROM notes
  WHERE id = :root_id
  UNION ALL
  SELECT n.id, n.title, n.parent_id, n.depth, t.path || n.id
  FROM notes n
  INNER JOIN tree t ON n.parent_id = t.id
  WHERE n.depth <= 5  -- Limite de profundidade
)
SELECT * FROM tree;

-- Query 3: Backlinks de uma nota
SELECT n.id, n.title, COUNT(nl.id) AS link_count
FROM notes n
INNER JOIN note_links nl ON nl.target_note_id = n.id
WHERE n.id = :note_id
GROUP BY n.id, n.title;

-- Query 4: Notas mais conectadas (para grafo)
SELECT n.id, n.title,
       gn.connections,
       gn.type,
       gn.depth
FROM notes n
INNER JOIN graph_nodes gn ON gn.note_id = n.id
WHERE gn.connections >= :min_connections
ORDER BY gn.connections DESC
LIMIT 50;

-- Query 5: Busca full-text
SELECT n.*, ts_rank(to_tsvector('english', n.title), query) AS rank
FROM notes n,
     to_tsquery('english', :search_query) query
WHERE to_tsvector('english', n.title) @@ query
ORDER BY rank DESC
LIMIT 20;
```

### 8.3 Monitoramento

#### Métricas Importantes
- **Query latency**: P50, P95, P99 para queries principais
- **Cache hit rate**: % de hits no `graph_cache`
- **Index usage**: Queries usando seq scan vs index scan
- **Write throughput**: Inserts/updates por segundo

#### Queries de Diagnóstico (PostgreSQL)

```sql
-- Tabelas maiores
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices não utilizados
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast_%';

-- Queries lentas
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

---

## 9. Migrations e Versionamento

### 9.1 Estratégia de Migrations

#### Controle de Versão
```sql
CREATE TABLE schema_migrations (
  version VARCHAR(14) PRIMARY KEY,  -- YYYYMMDDHHMMSS
  description VARCHAR(255),
  applied_at BIGINT NOT NULL
);

INSERT INTO schema_migrations (version, description, applied_at)
VALUES ('20251203000001', 'Initial schema', EXTRACT(EPOCH FROM NOW())::BIGINT);
```

#### Migration: Adicionar campo `icon` em notes
```sql
-- UP
ALTER TABLE notes ADD COLUMN icon VARCHAR(50);
CREATE INDEX idx_notes_icon ON notes(icon) WHERE icon IS NOT NULL;

INSERT INTO schema_migrations VALUES ('20251203000002', 'Add icon to notes', EXTRACT(EPOCH FROM NOW())::BIGINT);

-- DOWN
DROP INDEX idx_notes_icon;
ALTER TABLE notes DROP COLUMN icon;
DELETE FROM schema_migrations WHERE version = '20251203000002';
```

### 9.2 Data Migrations

#### Migração: Calcular `depth` para notas existentes
```sql
WITH RECURSIVE tree AS (
  SELECT id, parent_id, 0 AS depth
  FROM notes
  WHERE parent_id IS NULL
  UNION ALL
  SELECT n.id, n.parent_id, t.depth + 1
  FROM notes n
  INNER JOIN tree t ON n.parent_id = t.id
)
UPDATE notes n
SET depth = t.depth
FROM tree t
WHERE n.id = t.id;
```

---

## 10. Backup e Recovery

### 10.1 Estratégia de Backup (PostgreSQL)

```bash
# Backup completo
pg_dump -U postgres -d apex_db -F c -b -v -f backup_apex_$(date +%Y%m%d).dump

# Backup apenas schema
pg_dump -U postgres -d apex_db --schema-only > schema_apex.sql

# Backup apenas dados
pg_dump -U postgres -d apex_db --data-only -F c -f data_apex.dump

# Restore
pg_restore -U postgres -d apex_db -v backup_apex_20251203.dump
```

### 10.2 Estratégia de Backup (MongoDB)

```bash
# Backup completo
mongodump --db=apex_db --out=/backup/apex_$(date +%Y%m%d)

# Backup collection específica
mongodump --db=apex_db --collection=notes --out=/backup/notes_$(date +%Y%m%d)

# Restore
mongorestore --db=apex_db /backup/apex_20251203/apex_db
```

---

## 11. Segurança

### 11.1 Controle de Acesso

```sql
-- Criar role read-only
CREATE ROLE apex_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO apex_readonly;

-- Criar role app (read-write)
CREATE ROLE apex_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO apex_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO apex_app;

-- Criar usuário da aplicação
CREATE USER apex_user WITH PASSWORD 'secure_password';
GRANT apex_app TO apex_user;
```

### 11.2 SQL Injection Prevention

- **Usar prepared statements** (parametrized queries)
- **Validar inputs** antes de queries
- **Sanitizar** conteúdo de blocos HTML/Markdown
- **Limitar** tamanho de strings (title: 255 chars, content: 100KB)

### 11.3 Auditoria

```sql
-- Tabela de audit log
CREATE TABLE audit_log (
  id VARCHAR(36) PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id VARCHAR(36) NOT NULL,
  operation VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  user_id VARCHAR(36),
  timestamp BIGINT NOT NULL
);

-- Trigger de audit
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (id, table_name, record_id, operation, old_data, new_data, timestamp)
  VALUES (
    uuid_generate_v4()::text,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    EXTRACT(EPOCH FROM NOW())::BIGINT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas críticas
CREATE TRIGGER audit_notes AFTER INSERT OR UPDATE OR DELETE ON notes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 12. Glossário

| Termo | Definição |
|-------|-----------|
| **Ambiente** | Nota raiz que agrupa outras notas (parent) |
| **Backlink** | Link reverso - nota que aponta para outra |
| **Bloco** | Unidade de conteúdo dentro de uma nota (texto, checklist, etc) |
| **Depth** | Profundidade na árvore hierárquica (0 = raiz) |
| **Direct Link** | Link direto `[[nota]]` |
| **Edge** | Aresta no grafo conectando dois nós |
| **Feature** | Funcionalidade desbloqueável via progressão |
| **Hierarchy** | Estrutura de parent-child entre notas |
| **Node** | Nó no grafo representando uma nota |
| **Reference Link** | Link de referência `((referência))` |
| **Root** | Nota sem pai (top-level na hierarquia) |
| **Tag** | Marcador categórico (ex: #projeto) |
| **Weight** | Força de conexão (número de links entre notas) |

---

## 13. Referências e Próximos Passos

### Documentação Adicional
- Código-fonte atual: `src/types/*.types.ts`
- Stores Zustand: `src/stores/*.ts`
- Utilitários: `src/utils/*.ts`

### Próximos Passos
1. **Implementar migrations** para PostgreSQL ou MongoDB
2. **Criar camada de API REST** ou GraphQL
3. **Implementar auth/multi-user** (tabela `users`)
4. **Adicionar real-time sync** (WebSockets ou Supabase)
5. **Implementar search avançado** (Elasticsearch ou Algolia)
6. **Otimizar grafo** para +1000 notas (clustering, filtros)

---

## Anexo A: Exemplos de Dados

### Exemplo 1: Nota Simples

```json
{
  "id": "note-001",
  "title": "Introdução ao React",
  "tags": ["programação", "react", "javascript"],
  "createdAt": 1701234567890,
  "updatedAt": 1701234567890,
  "color": "#61DAFB",
  "parentId": null,
  "depth": 0,
  "isRoot": true,
  "blocks": [
    {
      "id": "block-001",
      "type": "heading",
      "content": "O que é React?",
      "order": 0,
      "metadata": { "level": 1 }
    },
    {
      "id": "block-002",
      "type": "text",
      "content": "React é uma biblioteca JavaScript para [[interfaces de usuário]].",
      "order": 1,
      "metadata": {
        "links": [
          {
            "id": "link-001",
            "text": "interfaces de usuário",
            "targetNoteId": "note-002",
            "type": "direct",
            "position": { "start": 38, "end": 62 }
          }
        ]
      }
    }
  ]
}
```

### Exemplo 2: Hierarquia de Notas

```
Ambiente: Projeto Web (note-100)
├── Frontend (note-101)
│   ├── React Components (note-102)
│   └── Styling (note-103)
└── Backend (note-104)
    ├── API Routes (note-105)
    └── Database (note-106)
```

```sql
-- Dados em hierarchy_relations
INSERT INTO hierarchy_relations (id, parent_id, child_id, "order", type) VALUES
('hr-1', 'note-100', 'note-101', 0, 'explicit'),
('hr-2', 'note-100', 'note-104', 1, 'explicit'),
('hr-3', 'note-101', 'note-102', 0, 'explicit'),
('hr-4', 'note-101', 'note-103', 1, 'explicit'),
('hr-5', 'note-104', 'note-105', 0, 'explicit'),
('hr-6', 'note-104', 'note-106', 1, 'explicit');
```

---

## Anexo B: Casos de Uso

### Caso 1: Criar Nova Nota com Hierarquia

```sql
BEGIN;

-- 1. Inserir nota
INSERT INTO notes (id, title, parent_id, depth, is_root)
VALUES ('new-note-001', 'Nova Nota', 'parent-note-001', 1, false);

-- 2. Inserir bloco inicial
INSERT INTO blocks (id, note_id, type, content, "order")
VALUES ('block-001', 'new-note-001', 'text', 'Conteúdo inicial', 0);

-- 3. Criar relação hierárquica
INSERT INTO hierarchy_relations (id, parent_id, child_id, "order", type)
VALUES ('hr-new-001', 'parent-note-001', 'new-note-001', 0, 'explicit');

-- 4. Atualizar contador de notas
UPDATE progression_state
SET notes_created = notes_created + 1,
    blocks_used = blocks_used + 1,
    updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT
WHERE id = 'default';

COMMIT;
```

### Caso 2: Buscar Notas Relacionadas (Grafo)

```sql
-- Encontrar todas as notas conectadas a uma nota específica
WITH connections AS (
  SELECT to_note_id AS related_note_id, 'outgoing' AS direction, link_type, weight
  FROM note_connections
  WHERE from_note_id = :note_id

  UNION ALL

  SELECT from_note_id AS related_note_id, 'incoming' AS direction, link_type, weight
  FROM note_connections
  WHERE to_note_id = :note_id
)
SELECT
  n.id,
  n.title,
  n.tags,
  c.direction,
  c.link_type,
  c.weight
FROM connections c
INNER JOIN notes n ON n.id = c.related_note_id
ORDER BY c.weight DESC, n.title ASC;
```

### Caso 3: Calcular Estatísticas de Progressão

```sql
-- Verificar se usuário pode desbloquear novo nível
SELECT
  ps.level AS current_level,
  ps.notes_created,
  ps.links_created,
  ps.graph_interactions,
  CASE
    WHEN ps.notes_created >= 15 AND ps.links_created >= 5 THEN 3
    WHEN ps.notes_created >= 5 AND ps.links_created >= 2 THEN 2
    ELSE 1
  END AS calculated_level,
  ARRAY_AGG(DISTINCT f.feature) AS unlockable_features
FROM progression_state ps
CROSS JOIN (
  SELECT unnest(ARRAY[
    'basic-notes', 'search', 'auto-links', 'mini-graph', 'tags',
    'full-graph', 'advanced-blocks', 'tables', 'kanban', 'templates'
  ]::text[]) AS feature
) f
WHERE ps.id = 'default'
  AND f.feature NOT IN (SELECT unnest(ps.unlocked_features))
  AND (
    (f.feature = 'search' AND ps.notes_created >= 2) OR
    (f.feature = 'auto-links' AND ps.notes_created >= 5) OR
    (f.feature = 'mini-graph' AND ps.notes_created >= 5 AND ps.links_created >= 2) OR
    (f.feature = 'full-graph' AND ps.notes_created >= 15 AND ps.links_created >= 5)
    -- ... outras regras
  )
GROUP BY ps.level, ps.notes_created, ps.links_created, ps.graph_interactions;
```

---

## Anexo C: Checklist de Implementação

### Fase 1: Setup Inicial
- [ ] Escolher tecnologia de BD (PostgreSQL vs MongoDB)
- [ ] Instalar e configurar BD
- [ ] Executar scripts de criação de schema
- [ ] Criar usuário e roles de acesso
- [ ] Configurar backups automáticos

### Fase 2: Migration de Dados
- [ ] Exportar dados do AsyncStorage
- [ ] Mapear estrutura atual para novo schema
- [ ] Executar migration scripts
- [ ] Validar integridade dos dados
- [ ] Testar queries principais

### Fase 3: Camada de API
- [ ] Criar endpoints CRUD para `notes`
- [ ] Criar endpoints CRUD para `blocks`
- [ ] Implementar endpoint de busca (full-text)
- [ ] Implementar endpoint de hierarquia (tree view)
- [ ] Implementar endpoint de grafo (graph data)
- [ ] Implementar endpoint de progressão

### Fase 4: Otimização
- [ ] Criar índices adicionais baseados em queries lentas
- [ ] Implementar cache de grafo
- [ ] Implementar paginação
- [ ] Configurar monitoramento de performance
- [ ] Executar testes de carga

### Fase 5: Segurança
- [ ] Implementar autenticação (JWT ou sessões)
- [ ] Implementar autorização (row-level security)
- [ ] Adicionar rate limiting
- [ ] Configurar audit logging
- [ ] Executar penetration tests

---

## Versão do Documento
**Versão**: 1.0
**Data**: 2025-12-03
**Autor**: Claude (Anthropic)
**Status**: Completo e pronto para uso
