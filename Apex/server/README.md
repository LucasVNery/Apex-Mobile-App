# Apex Backend - REST API

Backend completo para o aplicativo Apex Mobile App.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **Clerk** - Autenticação
- **PostgreSQL** - Banco de dados

## 📦 Instalação

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Configurar Banco de Dados PostgreSQL

**Opção A: PostgreSQL Local**

1. Instale PostgreSQL: https://www.postgresql.org/download/
2. Crie um banco de dados:

```sql
CREATE DATABASE apex;
```

**Opção B: PostgreSQL na Nuvem (Supabase)**

1. Acesse https://supabase.com
2. Crie um projeto
3. Copie a Connection String (Settings > Database)

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/apex"
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ALLOWED_ORIGINS=http://localhost:8081,exp://SEU-IP:8081
```

**Como pegar ALLOWED_ORIGINS:**
- Rode `npm start` no app React Native
- Copie a URL que aparece (ex: exp://192.168.1.100:8081)
- Cole no ALLOWED_ORIGINS

### 4. Gerar Prisma Client e Rodar Migrations

```bash
# Gera o Prisma Client
npm run prisma:generate

# Cria as tabelas no banco
npm run prisma:migrate

# (Opcional) Abre Prisma Studio para ver o banco
npm run prisma:studio
```

### 5. Iniciar Servidor

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

Servidor estará rodando em: **http://localhost:3000**

## 🔧 Configuração do Clerk

1. Acesse https://dashboard.clerk.com
2. Selecione seu projeto
3. Vá em **API Keys**
4. Copie:
   - **Publishable Key** → `CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`
5. Cole no `.env`

## 📡 Endpoints Disponíveis

### Health Check
```
GET /health
```

### Notes
```
GET    /api/notes              # Lista todas as notas
GET    /api/notes/:id          # Busca nota por ID
POST   /api/notes              # Cria nova nota
PUT    /api/notes/:id          # Atualiza nota
DELETE /api/notes/:id          # Deleta nota
GET    /api/notes/search?q=    # Busca notas
GET    /api/notes/tags         # Lista todas as tags
GET    /api/notes/roots        # Notas raiz
GET    /api/notes/:id/children # Filhos de uma nota
```

### Blocks
```
GET    /api/blocks/note/:noteId  # Blocos de uma nota
POST   /api/blocks               # Cria bloco
PUT    /api/blocks/:id           # Atualiza bloco
DELETE /api/blocks/:id           # Deleta bloco
PATCH  /api/blocks/:id/reorder   # Reordena bloco
```

### Progression
```
GET    /api/progression              # Estado de progressão
GET    /api/progression/stats        # Estatísticas
PATCH  /api/progression              # Atualiza progressão
PATCH  /api/progression/increment/notes # Incrementa contador
```

### Graph
```
GET  /api/graph                # Grafo completo
GET  /api/graph/mini/:noteId  # Mini-grafo de uma nota
GET  /api/graph/stats         # Estatísticas do grafo
POST /api/graph/rebuild       # Reconstrói grafo
```

## 🧪 Testando as APIs

### Usando cURL

```bash
# Health check
curl http://localhost:3000/health

# Criar nota (com token)
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"title": "Minha Nota", "tags": ["teste"]}'
```

### Usando Postman/Insomnia

1. Importe a collection
2. Configure Authorization: Bearer Token
3. Teste os endpoints

### Usando o App Mobile

Certifique-se que o `.env` do app aponte para o servidor:

```env
# No arquivo .env do app React Native
EXPO_PUBLIC_API_URL=http://SEU-IP:3000/api
```

**Importante:** Use o IP da sua máquina, não localhost (pois o celular precisa acessar)

Para descobrir seu IP:
- **Windows**: `ipconfig` (procure IPv4)
- **Mac/Linux**: `ifconfig` ou `ip addr`

## 📁 Estrutura de Pastas

```
server/
├── prisma/
│   └── schema.prisma      # Schema do banco de dados
├── src/
│   ├── config/
│   │   └── database.js    # Configuração do Prisma
│   ├── controllers/
│   │   ├── notesController.js
│   │   ├── blocksController.js
│   │   ├── progressionController.js
│   │   └── graphController.js
│   ├── middleware/
│   │   └── auth.js        # Autenticação Clerk
│   ├── routes/
│   │   ├── notes.js
│   │   ├── blocks.js
│   │   ├── progression.js
│   │   └── graph.js
│   ├── utils/
│   │   └── helpers.js     # Funções auxiliares
│   └── index.js           # Servidor Express
├── .env                   # Variáveis de ambiente
├── .env.example           # Template
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no DATABASE_URL
- Teste a conexão: `psql -U postgres`

### Erro: "401 Unauthorized"
- Verifique se o token está sendo enviado
- Confirme CLERK_SECRET_KEY no .env
- Teste o token no Clerk Dashboard

### Erro: "CORS blocked"
- Adicione a URL do app no ALLOWED_ORIGINS
- Reinicie o servidor após mudar .env

### App não conecta ao servidor
- Use IP da máquina, não localhost
- Verifique firewall/antivírus
- Confirme que servidor está rodando na porta 3000

## 📝 Comandos Úteis

```bash
# Ver logs do Prisma
npm run prisma:studio

# Resetar banco de dados
npx prisma migrate reset

# Gerar nova migration
npx prisma migrate dev --name nome_da_migration

# Ver estrutura do banco
npm run prisma:studio
```

## 🚀 Deploy (Produção)

### Opção 1: Railway

1. Acesse https://railway.app
2. Conecte seu repositório
3. Adicione PostgreSQL
4. Configure variáveis de ambiente
5. Deploy automático!

### Opção 2: Render

1. Acesse https://render.com
2. Crie Web Service
3. Adicione PostgreSQL
4. Configure .env
5. Deploy!

### Opção 3: Heroku

```bash
heroku create apex-api
heroku addons:create heroku-postgresql
git push heroku main
```

## 📚 Próximos Passos

- [ ] Adicionar testes (Jest)
- [ ] Implementar rate limiting
- [ ] Adicionar logging (Winston)
- [ ] Implementar cache (Redis)
- [ ] Documentação Swagger/OpenAPI
- [ ] Monitoramento (Sentry)
- [ ] CI/CD (GitHub Actions)

## 🔒 Segurança

- ✅ Helmet para headers de segurança
- ✅ CORS configurado
- ✅ Autenticação via Clerk
- ✅ Validação de entrada
- ✅ SQL Injection protection (Prisma)

## 📞 Suporte

Para dúvidas:
1. Veja logs no console
2. Cheque Prisma Studio
3. Teste endpoints com Postman
4. Verifique configuração do Clerk

Boa sorte! 🚀
