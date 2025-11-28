# 📋 Funcionalidades e Roadmap - Apex Mobile App

**Última atualização:** 2024
**Status do Projeto:** Em Desenvolvimento

---

## 🎯 Visão Geral do Projeto

**Apex** é um aplicativo mobile de **second brain** e **knowledge management** com:
- ✅ Sistema de notas em blocos modulares (Notion-like)
- ✅ Links bidirecionais entre notas
- ✅ Progressão gamificada
- ✅ Graph view de conexões
- 🔄 Sincronização com Supabase (planejado)

---

## ✅ FUNCIONALIDADES IMPLEMENTADAS

### 1. **Sistema de Notas (Basic Notes)**
**Status:** ✅ Implementado

#### Features:
- ✅ Criar ambientes/notas com título
- ✅ Editor de blocos modulares
- ✅ Persistência local (AsyncStorage)
- ✅ Lista de notas recentes na Home
- ✅ Navegação entre notas

#### Tipos de Blocos Implementados:
```typescript
✅ Text Block       - Texto simples
✅ Heading Block    - Títulos (H1, H2, H3)
✅ List Block       - Listas (ordenadas/não-ordenadas)
✅ Checklist Block  - Lista de tarefas com checkboxes
✅ Callout Block    - Blocos de destaque com ícone e cor
✅ Divider Block    - Separador visual
```

#### Comandos do Editor:
- ✅ Digite `/` para abrir menu de blocos
- ✅ Arraste blocos para reorganizar
- ✅ Adicionar novo bloco com botão

---

### 2. **Links Bidirecionais**
**Status:** ✅ Implementado Parcialmente

#### Features:
- ✅ Sintaxe `[[Nome da Nota]]` para criar links
- ✅ Sugestões de notas ao digitar `[[`
- ✅ Armazenamento de links nos blocos
- 🔄 Backlinks calculados dinamicamente
- ❌ Popup de preview ao hover (não implementado)
- ❌ Links para blocos específicos `[[Nota#Bloco]]` (não implementado)

---

### 3. **Sistema de Progressão**
**Status:** ✅ Implementado

#### Níveis e Desbloqueio:
```
Nível 1 (0-5 notas)
  ✅ basic-notes - Notas básicas
  ✅ search - Busca (2+ notas)

Nível 2 (5-15 notas)
  🔒 auto-links - Sugestões automáticas de links
  🔒 mini-graph - Graph view compacto
  🔒 tags - Sistema de tags

Nível 3 (15+ notas)
  🔒 full-graph - Graph view tela cheia
  🔒 advanced-blocks - Blocos avançados (tabelas, embed)
  🔒 templates - Templates prontos
  🔒 kanban - Visualização Kanban
```

#### Conquistas (Achievements):
- ✅ Sistema de conquistas desbloqueadas
- ✅ Notificações ao desbloquear features
- ✅ Histórico de progresso

---

### 4. **Interface e UX**
**Status:** ✅ Implementado

#### Componentes:
- ✅ Navegação por tabs (Home, Criar, Explorar, Graph, Settings)
- ✅ Tema dark mode (padrão)
- ✅ Animações (FadeIn, SlideIn)
- ✅ Cards, Botões, Inputs customizados
- ✅ Estado vazio com onboarding
- ✅ Help buttons com dicas contextuais

#### Telas:
- ✅ Home - Dashboard com resumo
- ✅ Criar - Criação de novos ambientes
- ✅ Explorar - Lista de todas as notas
- ✅ Graph - Visualização de conexões (básico)
- ✅ Settings - Configurações do app
- ✅ Editor - Edição de notas

---

### 5. **Dados e Arquitetura**
**Status:** ✅ Refatorado Recentemente

#### Melhorias Implementadas:
- ✅ **UUIDs** em vez de IDs baseados em Date
- ✅ **Timestamps** em vez de objetos Date
- ✅ **Dados calculados** (backlinks, connections) não salvos
- ✅ **Sincronização automática** entre stores
- ✅ **Single source of truth** (notes[] é a fonte real)
- ✅ **Helpers utilitários** para cálculos

#### Stores (Zustand + AsyncStorage):
```typescript
✅ NotesStore - Gerencia notas e dados
✅ ProgressionStore - Progressão e features
✅ ThemeStore - Tema (agora persiste)
```

---

## 🚀 FUNCIONALIDADES PLANEJADAS

### **Prioridade ALTA - Próximas Implementações**

#### 1. **Blocos Avançados no Editor**
```typescript
// Blocos a implementar:
🔲 Code Block      - Blocos de código com syntax highlight
🔲 Quote Block     - Citações
🔲 Toggle Block    - Bloco expansível/colapsável
🔲 Image Block     - Upload e exibição de imagens
🔲 File Block      - Anexar arquivos
🔲 Math Block      - Fórmulas matemáticas (LaTeX)
```

**Estimativa:** 2-3 semanas
**Complexidade:** Média-Alta

---

#### 2. **Sistema de Tags**
```typescript
Features:
🔲 Adicionar tags com #hashtag
🔲 Autocomplete de tags existentes
🔲 Filtrar notas por tag
🔲 Tag picker visual
🔲 Cores customizadas para tags
🔲 Múltiplas tags por nota
```

**Desbloqueio:** 5+ notas criadas
**Estimativa:** 1 semana
**Complexidade:** Média

---

#### 3. **Busca Avançada**
```typescript
Features:
🔲 Busca full-text em títulos e conteúdo
🔲 Filtros (por tag, data, tipo)
🔲 Busca por links
🔲 Histórico de buscas
🔲 Resultados com highlight
🔲 Atalho de teclado para busca
```

**Desbloqueio:** 2+ notas criadas
**Estimativa:** 1 semana
**Complexidade:** Média

---

#### 4. **Auto-Links (Sugestões Inteligentes)**
```typescript
Features:
🔲 Detectar palavras que coincidem com títulos de notas
🔲 Sugerir links automaticamente
🔲 Preview inline ao digitar [[
🔲 Criar nota nova se não existir
🔲 Resolver conflitos de nomes duplicados
```

**Desbloqueio:** 5+ notas criadas
**Estimativa:** 1 semana
**Complexidade:** Alta

---

#### 5. **Graph View Completo**
```typescript
Features:
🔲 Visualização interativa de conexões
🔲 Zoom e pan
🔲 Cores por categoria/tag
🔲 Filtros (mostrar apenas X níveis)
🔲 Busca no graph
🔲 Click em nó para abrir nota
🔲 Animações de entrada
🔲 Layout force-directed
```

**Desbloqueio:** 15+ notas, 5+ links
**Estimativa:** 2 semanas
**Complexidade:** Alta
**Bibliotecas:** `react-native-svg`, `d3-force`

---

### **Prioridade MÉDIA - Melhorias Futuras**

#### 6. **Templates de Notas**
```typescript
Templates:
🔲 Daily Note - Nota diária automática
🔲 Meeting Note - Reuniões (data, participantes, tópicos)
🔲 Project - Projetos (status, deadlines, tasks)
🔲 Book Notes - Anotações de livros
🔲 Recipe - Receitas
🔲 Custom - Criar templates personalizados
```

**Desbloqueio:** 20+ notas criadas
**Estimativa:** 1-2 semanas
**Complexidade:** Média

---

#### 7. **Tabelas**
```typescript
Features:
🔲 Criar tabelas inline
🔲 Adicionar/remover linhas e colunas
🔲 Editar células
🔲 Ordenar por coluna
🔲 Exportar como CSV
🔲 Importar CSV
```

**Desbloqueio:** 10+ notas criadas
**Estimativa:** 2 semanas
**Complexidade:** Alta

---

#### 8. **Visualização Kanban**
```typescript
Features:
🔲 Quadros (Todo, Doing, Done)
🔲 Cards arrastavéis
🔲 Filtrar por tag
🔲 Múltiplos boards
🔲 Board view para checklists
```

**Desbloqueio:** 15+ notas criadas
**Estimativa:** 2 semanas
**Complexidade:** Alta
**Bibliotecas:** `react-native-draggable-flatlist`

---

#### 9. **Menções e Colaboração**
```typescript
Features:
🔲 @mencionar outros usuários (preparação)
🔲 Comentários em blocos
🔲 Versionamento de notas
🔲 Histórico de edições
🔲 Comparar versões (diff)
```

**Requer:** Backend (Supabase)
**Estimativa:** 3-4 semanas
**Complexidade:** Muito Alta

---

#### 10. **Export e Import**
```typescript
Features:
🔲 Export para Markdown
🔲 Export para PDF
🔲 Export para JSON (backup completo)
🔲 Import de Markdown
🔲 Import de Notion (via API)
🔲 Import de Obsidian vault
```

**Estimativa:** 2 semanas
**Complexidade:** Média-Alta

---

### **Prioridade BAIXA - Long Term**

#### 11. **Widgets e Shortcuts**
```typescript
Features:
🔲 Widget de notas recentes (iOS/Android)
🔲 Quick actions (criar nota rápida)
🔲 Compartilhar para Apex
🔲 Atalhos de teclado
🔲 Siri shortcuts (iOS)
```

---

#### 12. **Customização Avançada**
```typescript
Features:
🔲 Temas personalizados
🔲 Fonte customizável
🔲 Tamanho de fonte
🔲 Espaçamento entre linhas
🔲 Modo de foco (zen mode)
🔲 Atalhos customizáveis
```

---

#### 13. **Analytics e Insights**
```typescript
Features:
🔲 Quantidade de palavras escritas
🔲 Streak de dias consecutivos
🔲 Notas mais linkadas
🔲 Gráficos de atividade
🔲 Tempo gasto no app
🔲 Metas e objetivos
```

---

## 🔄 INTEGRAÇÃO SUPABASE (Em Planejamento)

### **Backend e Sincronização**

#### Fase 1: Setup Inicial
```typescript
🔲 Criar projeto no Supabase
🔲 Configurar autenticação (email/password)
🔲 Criar schema do banco de dados
🔲 Row Level Security (RLS)
🔲 Configurar Storage para arquivos
```

#### Fase 2: Sync Básico
```typescript
🔲 Pull inicial (baixar notas do servidor)
🔲 Push (enviar notas criadas localmente)
🔲 Merge de dados (local + servidor)
🔲 Conflict resolution
🔲 Indicador de sync status
```

#### Fase 3: Realtime
```typescript
🔲 Subscriptions para mudanças em tempo real
🔲 Notificações de conflitos
🔲 Auto-sync em background
🔲 Offline-first (trabalhar sem internet)
🔲 Queue de operações pendentes
```

#### Fase 4: Multi-device
```typescript
🔲 Sincronizar entre dispositivos
🔲 Resolver conflitos de edição simultânea
🔲 Versionamento de notas
🔲 Histórico completo de mudanças
```

---

## 📊 ROADMAP VISUAL

### Q1 2024 - MVP
```
✅ Sistema de notas básico
✅ Blocos modulares (text, heading, list, checklist)
✅ Links bidirecionais
✅ Progressão gamificada
✅ Arquitetura de dados robusta
```

### Q2 2024 - Melhorias
```
🔄 Blocos avançados (code, image, table)
🔄 Sistema de tags
🔄 Busca avançada
🔄 Auto-links
🔄 Graph view completo
```

### Q3 2024 - Backend
```
🔜 Integração Supabase
🔜 Autenticação
🔜 Sincronização multi-device
🔜 Storage de arquivos
```

### Q4 2024 - Avançado
```
🔜 Templates
🔜 Kanban view
🔜 Export/Import
🔜 Colaboração básica
```

---

## 🎨 SUGESTÕES DE IMPLEMENTAÇÃO IMEDIATA

### **Para Melhorar a Criação de Ambientes:**

#### 1. **Adicionar Mais Opções ao Criar** (Prioridade Alta)
```typescript
Modal de Criação:
✅ Título (atual)
🔲 Escolher cor do ambiente
🔲 Adicionar tags iniciais
🔲 Escolher template (Daily, Project, etc)
🔲 Definir visibilidade (Private/Shared - futuro)
🔲 Adicionar descrição/subtítulo
```

#### 2. **Blocos Iniciais Personalizáveis**
```typescript
Ao criar ambiente, permitir:
🔲 Começar com template pré-definido
🔲 Adicionar múltiplos blocos iniciais
🔲 Estrutura padrão (ex: título + seções)
```

#### 3. **Quick Actions**
```typescript
🔲 Botão "Criar Rápido" (sem modal, título default)
🔲 Duplicar ambiente existente
🔲 Criar a partir de template
🔲 Importar de clipboard
```

---

## 🛠️ TECNOLOGIAS E BIBLIOTECAS

### **Já Utilizadas:**
```typescript
✅ React Native + Expo
✅ TypeScript
✅ Zustand (state management)
✅ AsyncStorage (persistência local)
✅ Expo Router (navegação)
✅ React Native Reanimated (animações)
✅ UUID (IDs únicos)
```

### **Planejadas:**
```typescript
🔜 @supabase/supabase-js - Backend
🔜 react-native-svg - Gráficos e Graph view
🔜 d3-force - Layout do graph
🔜 react-native-syntax-highlighter - Code blocks
🔜 react-native-markdown-display - Preview Markdown
🔜 react-native-draggable-flatlist - Kanban
🔜 react-native-fs - Manipulação de arquivos
```

---

## 📈 MÉTRICAS DE SUCESSO

### **Engajamento:**
- Usuários ativos diários (DAU)
- Notas criadas por usuário
- Taxa de retenção (D1, D7, D30)
- Tempo médio no app

### **Features:**
- % de usuários usando links
- % de usuários atingindo Nível 2+
- Features mais utilizadas
- Templates mais populares

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

Com base na conversa, sugiro implementar **nesta ordem**:

### **Curto Prazo (1-2 semanas):**
1. ✅ Melhorar modal de criação de ambiente
   - Adicionar seletor de cor
   - Adicionar campo de descrição/subtítulo
   - Preview antes de criar

2. ✅ Implementar sistema de tags básico
   - Input de tags no editor
   - Tag picker
   - Filtro por tags

3. ✅ Adicionar blocos de código
   - Syntax highlighting
   - Seletor de linguagem

### **Médio Prazo (2-4 semanas):**
4. ✅ Graph view interativo
5. ✅ Templates de notas
6. ✅ Busca avançada

### **Longo Prazo (1-2 meses):**
7. ✅ Integração Supabase
8. ✅ Sincronização multi-device

---

**Qual dessas funcionalidades você gostaria de implementar primeiro?** 🚀
