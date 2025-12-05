# Guia de Produção e Publicação na Play Store

## 📋 Checklist Completo

### 1. Backend em Produção

#### 1.1 Escolher Hospedagem
Opções recomendadas (todas com tier gratuito):
- **Railway** - Recomendado (fácil, PostgreSQL incluído)
- **Render** - Boa alternativa
- **Fly.io** - Mais técnico
- **Vercel** - Para APIs simples (pode ter limitações com Prisma)

#### 1.2 Configurações Necessárias
- [ ] Deploy do backend em servidor com IP público
- [ ] Configurar HTTPS (obrigatório para produção)
- [ ] URL pública da API (ex: `https://apex-api.railway.app`)
- [ ] Variáveis de ambiente no servidor:
  ```env
  DATABASE_URL=postgresql://...  # Supabase ou banco de produção
  CLERK_PUBLISHABLE_KEY=pk_live_...
  CLERK_SECRET_KEY=sk_live_...
  NODE_ENV=production
  ALLOWED_ORIGINS=https://seu-dominio.com
  ```

#### 1.3 Banco de Dados
- [ ] Usar Supabase (já está configurado) ou PostgreSQL em produção
- [ ] Rodar migrations: `npm run prisma:migrate`
- [ ] Fazer backup antes de qualquer alteração

---

### 2. Clerk Authentication (Produção)

#### 2.1 Criar Ambiente de Produção
- [ ] Ir para [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] Criar novo projeto para produção OU mudar para production keys
- [ ] Obter as chaves de produção:
  - `CLERK_PUBLISHABLE_KEY` (começa com `pk_live_`)
  - `CLERK_SECRET_KEY` (começa com `sk_live_`)

#### 2.2 Configurar OAuth Redirects
- [ ] Adicionar redirect URLs no Clerk:
  - `exp://localhost:8081` (desenvolvimento)
  - URL do seu app publicado (quando tiver)

---

### 3. Configurações do App Mobile

#### 3.1 Arquivo `app.json` ou `app.config.js`

**Verificar/Atualizar:**

```json
{
  "expo": {
    "name": "Apex",
    "slug": "apex-mobile-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",  // 1024x1024 PNG
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",  // 1284x2778 PNG
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.seudominio.apex",
      "supportsTablet": true,
      "buildNumber": "1.0.0"
    },
    "android": {
      "package": "com.seudominio.apex",  // ÚNICO - importante!
      "versionCode": 1,  // Incrementar a cada build
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",  // 1024x1024
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "SEU_PROJECT_ID"  // Vem do EAS
      }
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
          }
        }
      ]
    ]
  }
}
```

#### 3.2 Variáveis de Ambiente (.env)

**Desenvolvimento:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.14:3000/api
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NODE_ENV=development
```

**Produção (.env.production):**
```env
EXPO_PUBLIC_API_URL=https://apex-api.railway.app/api
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NODE_ENV=production
```

#### 3.3 Assets Necessários
- [ ] **Icon** (1024x1024 PNG) - Ícone principal
- [ ] **Adaptive Icon** (1024x1024 PNG) - Android
- [ ] **Splash Screen** (1284x2778 PNG) - Tela de carregamento
- [ ] **Feature Graphic** (1024x500 PNG) - Para Play Store
- [ ] **Screenshots** (mínimo 2, máximo 8):
  - Celular: 1080x1920 ou maior
  - Tablet (opcional): 1200x1920

---

### 4. EAS Build (Expo Application Services)

#### 4.1 Instalar EAS CLI
```bash
npm install -g eas-cli
```

#### 4.2 Login no EAS
```bash
eas login
```

#### 4.3 Configurar Projeto
```bash
eas build:configure
```

Isso cria `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"  // AAB para Play Store
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path/to/api-key.json",
        "track": "internal"
      }
    }
  }
}
```

#### 4.4 Build para Produção
```bash
# Build AAB (Android App Bundle) para Play Store
eas build --platform android --profile production
```

Isso vai:
1. Fazer upload do código
2. Compilar no servidor da Expo
3. Gerar arquivo `.aab` assinado
4. Fornecer link para download

---

### 5. Google Play Console

#### 5.1 Criar Conta de Desenvolvedor
- [ ] Ir para [Google Play Console](https://play.google.com/console)
- [ ] Pagar taxa única de $25 USD
- [ ] Preencher dados da conta

#### 5.2 Criar Novo App
- [ ] Clicar em "Criar app"
- [ ] Preencher informações:
  - Nome do app: **Apex**
  - Idioma padrão: Português (Brasil)
  - Tipo: App ou jogo
  - Gratuito ou pago

#### 5.3 Informações Obrigatórias

**Descrição Curta** (80 caracteres):
```
Sistema inteligente de notas interconectadas com visualização em grafo
```

**Descrição Completa** (4000 caracteres):
```
Apex é um aplicativo de anotações revolucionário que transforma suas ideias em uma rede visual de conhecimento.

PRINCIPAIS RECURSOS:
• Notas hierárquicas e interconectadas
• Visualização em grafo interativo
• Links bidirecionais entre notas
• Sistema de tags inteligente
• Blocos de conteúdo versáteis
• Sincronização em tempo real
• Progressão e conquistas

...adicione mais detalhes...
```

#### 5.4 Documentos Legais OBRIGATÓRIOS

**Privacy Policy (Política de Privacidade):**
- [ ] Criar documento explicando:
  - Quais dados você coleta
  - Como usa os dados
  - Integração com Clerk (autenticação)
  - Onde os dados são armazenados (Supabase)
- [ ] Hospedar em URL pública (pode usar GitHub Pages, Notion público, etc)
- [ ] Exemplo: `https://seusite.com/privacy-policy`

**Terms of Service (Termos de Uso):**
- [ ] Opcional mas recomendado
- [ ] Definir regras de uso do app

#### 5.5 Classificação de Conteúdo
- [ ] Responder questionário do Google
- [ ] Provável classificação: **Livre** (se não tem conteúdo sensível)

#### 5.6 Upload do AAB
- [ ] Ir para "Produção" > "Criar nova versão"
- [ ] Fazer upload do arquivo `.aab` do EAS Build
- [ ] Preencher "Notas da versão":
  ```
  Versão 1.0.0 - Lançamento inicial
  - Sistema de notas hierárquicas
  - Visualização em grafo
  - Autenticação segura
  ```

---

### 6. Testes Internos (Recomendado)

Antes de publicar para todos:

```bash
# Build para teste interno
eas build --platform android --profile preview
```

- [ ] Distribuir para testers (amigos, família)
- [ ] Testar por 1-2 semanas
- [ ] Corrigir bugs encontrados
- [ ] Depois fazer build de produção

---

### 7. Configurações de Segurança

#### 7.1 Signing Key (Chave de Assinatura)
- [ ] EAS gerencia automaticamente (recomendado)
- [ ] OU usar sua própria keystore (avançado)

#### 7.2 Obfuscation/Minification
Em `eas.json`, adicionar:
```json
"production": {
  "android": {
    "buildType": "app-bundle",
    "gradleCommand": ":app:bundleRelease",
    "env": {
      "ANDROID_ENABLE_PROGUARD": "true"
    }
  }
}
```

---

### 8. Checklist Final antes de Publicar

#### Backend
- [ ] Backend em produção com HTTPS
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente corretas
- [ ] Testado e funcionando

#### Clerk
- [ ] Chaves de produção configuradas
- [ ] OAuth redirects configurados

#### App
- [ ] `.env.production` configurado com URL de produção
- [ ] `app.json` com todos os campos preenchidos
- [ ] Ícones e splash screen criados
- [ ] Permissions corretas
- [ ] Bundle identifier único (ex: `com.seudominio.apex`)
- [ ] Versionamento correto

#### Play Store
- [ ] Conta de desenvolvedor criada ($25)
- [ ] Descrições preenchidas
- [ ] Screenshots adicionados
- [ ] Privacy Policy publicada
- [ ] Classificação de conteúdo feita
- [ ] AAB gerado e testado

---

### 9. Comandos Resumidos

```bash
# 1. Configurar EAS
eas login
eas build:configure

# 2. Build de Teste
eas build --platform android --profile preview

# 3. Build de Produção
eas build --platform android --profile production

# 4. Submit para Play Store (opcional - pode fazer manualmente)
eas submit --platform android --profile production
```

---

### 10. Custos Estimados

| Item | Custo |
|------|-------|
| Google Play Developer Account | $25 (único) |
| EAS Build (Free tier) | 30 builds/mês grátis |
| Hospedagem Backend (Railway free tier) | $0-5/mês |
| Supabase (Free tier) | $0 |
| **TOTAL inicial** | **$25** |

---

### 11. Timeline Estimado

| Etapa | Tempo Estimado |
|-------|----------------|
| Configurar backend em produção | 2-4 horas |
| Criar assets (ícones, screenshots) | 4-8 horas |
| Configurar EAS e fazer build | 1-2 horas |
| Criar conta Play Store e preencher informações | 2-3 horas |
| Criar Privacy Policy | 1-2 horas |
| Testes internos | 1-2 semanas |
| Review da Google (primeira vez) | 1-7 dias |
| **TOTAL** | **2-3 semanas** |

---

## 🚀 Próximos Passos Imediatos

1. **Hospedar Backend** - Railway ou Render
2. **Criar Assets** - Ícone, splash, screenshots
3. **Privacy Policy** - Documento legal obrigatório
4. **Criar conta Google Play** - $25
5. **Configurar EAS** - Build de produção

---

## 📚 Recursos Úteis

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [Clerk Production Setup](https://clerk.com/docs)
- [Privacy Policy Generator](https://www.freeprivacypolicy.com/)

---

**Tem alguma dúvida sobre alguma etapa? Posso te ajudar com qualquer uma delas!**
