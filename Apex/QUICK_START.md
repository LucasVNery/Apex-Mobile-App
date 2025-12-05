# ⚡ Quick Start - Apex Backend + Frontend

## 🎯 Em 3 Comandos

### 1️⃣ Setup do Servidor (Terminal 1)

```bash
cd server
npm install
npm run prisma:generate
npm run dev
```

✅ Servidor rodando em http://localhost:3000

### 2️⃣ Configure seu IP no App

Descubra seu IP:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig | grep inet
```

Edite `.env` na raiz:
```env
EXPO_PUBLIC_API_URL=http://SEU-IP-AQUI:3000/api
```

### 3️⃣ Rode o App (Terminal 2)

```bash
npm start
```

✅ Pronto! App conectado ao backend.

---

## 🧪 Teste Rápido

Adicione em qualquer tela:

```typescript
import { api } from '@/src/api';
import { Button } from 'react-native';

<Button
  title="Testar API"
  onPress={async () => {
    try {
      const res = await api.notes.getAll({ limit: 5 });
      alert('✅ Conectado! Notas: ' + res.data?.items.length);
    } catch (e) {
      alert('❌ Erro: ' + e.message);
    }
  }}
/>
```

---

## 📝 Criar Primeira Nota

```typescript
import { useNotes } from '@/src/hooks/useApi';

function MyComponent() {
  const { create } = useNotes();

  return (
    <Button
      title="Criar Nota"
      onPress={() => create.execute({
        title: 'Minha Primeira Nota',
        tags: ['teste'],
      })}
    />
  );
}
```

---

## ⚠️ Problemas?

### Erro: "Network request failed"
→ Use IP da máquina, não localhost
→ Verifique se servidor está rodando

### Erro: "Cannot connect to database"
→ Configure DATABASE_URL em `server/.env`
→ Rode `npm run prisma:migrate`

### Erro: "401 Unauthorized"
→ Configure CLERK_SECRET_KEY (opcional)
→ Ou desabilite auth temporariamente

---

## 📚 Documentação Completa

- **Setup Detalhado**: `INTEGRATION_COMPLETE_GUIDE.md`
- **API Reference**: `src/api/README.md`
- **Servidor**: `server/README.md`
- **Exemplos**: `src/api/EXAMPLES.tsx`

---

## ✅ Checklist

- [ ] Servidor rodando (`npm run dev`)
- [ ] .env configurado com seu IP
- [ ] Teste de conexão funcionando
- [ ] Primeira nota criada

**Tudo ok?** Você está pronto! 🚀
