# Apex - Sistema de Notas Inteligente

Sistema completo de notas com hierarquia, links bidirecionais, grafo de conhecimento e progressão gamificada.

## 🚀 Quick Start

### 1. Backend (Terminal 1)
```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```
Servidor: http://localhost:3000

### 2. Configure o App
Descubra seu IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)

Edite `.env`:
```env
EXPO_PUBLIC_API_URL=http://SEU-IP:3000/api
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3d1ZXQtc2hpbmVyLTAuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### 3. App Mobile (Terminal 2)
```bash
npm install
npm start
```

## 📱 Usando as APIs

### Criar Nota
```typescript
import { useNotes } from '@/src/hooks/useApi';

const { create } = useNotes();
await create.execute({ title: 'Minha Nota', tags: ['teste'] });
```

### Listar Notas
```typescript
const { getAll } = useNotes();
await getAll.execute({ limit: 20 });
```

### Modo Offline-First
```typescript
import { useNotesStore } from '@/src/stores/useNotesStore';
import { api } from '@/src/api';

const note = useNotesStore.getState().addNote(data);
api.notes.create(data).catch(console.error);
```

## 🏗️ Estrutura

```
Apex/
├── src/
│   ├── api/          # APIs REST (Notes, Blocks, Graph, etc)
│   ├── hooks/        # useApi hooks
│   ├── stores/       # Zustand stores
│   └── types/        # TypeScript types
│
└── server/
    ├── src/
    │   ├── controllers/  # Lógica de negócio
    │   ├── routes/       # Endpoints REST
    │   └── middleware/   # Auth
    └── prisma/
        └── schema.prisma # 10 tabelas
```

## 📚 Documentação

- **Quick Start**: `QUICK_START.md`
- **API Frontend**: `src/api/README.md`
- **Backend**: `server/README.md`

## 🎯 Features

✅ CRUD de Notas e Blocos
✅ Hierarquia (Parent-Child)
✅ Links Bidirecionais [[nota]]
✅ Grafo de Conhecimento
✅ Sistema de Progressão
✅ Busca Full-Text
✅ Offline-First
✅ Multi-Tenancy (Clerk)

## 🔧 Stack

**Frontend**: React Native + Expo + Zustand + Axios
**Backend**: Node.js + Express + Prisma + PostgreSQL
**Auth**: Clerk

## ⚡ Endpoints Principais

```
GET    /api/notes              # Lista notas
POST   /api/notes              # Cria nota
GET    /api/blocks/note/:id    # Lista blocos
GET    /api/progression        # Progressão do usuário
GET    /api/graph              # Grafo completo
```

## 🐛 Troubleshooting

**"Network request failed"**: Use IP da máquina, não localhost
**"Cannot connect to database"**: Configure DATABASE_URL em `server/.env`
**"401 Unauthorized"**: Configure CLERK_SECRET_KEY (opcional)

## 📝 License

MIT
