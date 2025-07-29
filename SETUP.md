# 🚀 Guia de Configuração Simplificada - Bebaby App

## 📋 Análise do Projeto Simplificado

O **Bebaby App** é uma plataforma de relacionamento sugar desenvolvida com **versão simplificada** para desenvolvimento rápido e fácil:

### 🛠️ Stack Tecnológica (Simplificada)
- **Frontend**: Next.js 14act 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL, Prisma ORM
- **Autenticação**: NextAuth.js (Simplificada)
- **Banco de Dados**: PostgreSQL
- **Storage**: Sistema de arquivos local
- **Deploy**: VPS com PM2+ Nginx

### 🏗️ Estrutura do Projeto (Simplificada)
- ✅ **App Router** configurado (Next.js 14)
- ✅ **Autenticação simplificada** (sem verificação de email)
- ✅ **Dashboard administrativo** básico
- ✅ **Sistema de mensagens** funcional
- ✅ **Upload de fotos** local
- ✅ **Busca de usuários** básica
- ✅ **Perfis de usuário** completos

## 🎉 Simplificações Implementadas

### ✅ **Autenticação Simplificada**
- Login direto com usuário e senha
- Sem verificação de email
- Usuários já verificados por padrão
- Sessões mais longas (30dias)

### ✅ **Banco de Dados Simplificado**
- Schema mais limpo
- Apenas campos essenciais
- Menos relacionamentos complexos

### ✅ **Middleware Simplificado**
- Sem rate limiting complexo
- Headers de segurança básicos
- Proteção simples para admin

### ✅ **APIs Simplificadas**
- Registro sem verificação
- Validações básicas
- Respostas diretas

## 🔧 Configuração Rápida

### 1. **Configurar Variáveis de Ambiente (Mínimas)**

Crie um arquivo `.env.local` na raiz do projeto com:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432bebaby_db"

# NextAuth (Simplificado)
NEXTAUTH_SECRET=sua-chave-secreta-simples"
NEXTAUTH_URL=http://localhost:3000"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000XT_PUBLIC_APP_NAME="Bebaby App"
NEXT_PUBLIC_APP_DESCRIPTION="Conectando Sugar Babies e Sugar Daddies# Development
NODE_ENV="development"
```

### 2. **Configurar Banco de Dados**

1. **Instalar PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   
   # Windows
   # Baixar do site oficial
   ```2. **Criar banco de dados**
   ```sql
   CREATE DATABASE bebaby_db;
   CREATE USER bebaby_user WITH PASSWORD sua_senha;
   GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
   ```

3. **Configurar schema**
   ```bash
   # Gerar cliente Prisma
   npx prisma generate
   
   # Sincronizar schema
   npx prisma db push
   
   # Setup simplificado com usuários de teste
   node scripts/setup-simple.js
   ```

### 3. **Instalar Dependências**

```bash
npm install
```

### 4. **Iniciar Desenvolvimento**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000# 🎯 Dados de Teste

Após executar `node scripts/setup-simple.js`, você terá acesso a:

- **👤 Admin:** `admin@bebaby.app` / `admin123`
- **👧 Sugar Baby:** `sugar_baby1xample.com` / `123456- **👨 Sugar Daddy:** `sugar_daddy1xample.com` / `123456`

## 🚀 Deploy em Produção

### Setup Automatizado do VPS

```bash
chmod +x scripts/setup-vps.sh
sudo ./scripts/setup-vps.sh
```

### Deploy Manual
1. **Configurar VPS**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18 | sudo -E bash -
   sudo apt-get install -y nodejs postgresql nginx
   npm install -g pm2
   ```

2. **Configurar banco**
   ```sql
   CREATE DATABASE bebaby_db;
   CREATE USER bebaby_user WITH PASSWORD sua_senha;
   GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
   ```

3. **Deploy da aplicação**
   ```bash
   git clone https://github.com/seu-usuario/bebaby-app.git
   cd bebaby-app
   npm install
   npx prisma generate
   npx prisma db push
   node scripts/setup-simple.js
   npm run build
   pm2start npm --name "bebaby-app" -- start
   ```

## 📁 Estrutura Simplificada

```
bebaby-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Simplificadas)
│   ├── admin/             # Área administrativa
│   ├── profile/           # Perfis de usuário
│   ├── messages/          # Sistema de mensagens
│   └── explore/           # Exploração de usuários
├── components/            # Componentes React
├── contexts/              # Contextos (Auth, Notifications)
├── lib/                   # Utilitários e configurações
│   ├── auth-simple.ts     # Autenticação simplificada
│   └── prisma.ts          # Cliente Prisma
├── prisma/                # Schema e migrations
│   └── schema-simple.prisma # Schema simplificado
├── scripts/               # Scripts de deploy e setup
│   └── setup-simple.js    # Setup simplificado
├── types/                 # Tipos TypeScript
└── public/                # Arquivos estáticos
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Servidor de produção

# Banco de dados
npm run db:generate      # Gerar cliente Prisma
npm run db:push          # Sincronizar schema
npm run db:studio        # Abrir Prisma Studio
node scripts/setup-simple.js  # Setup simplificado

# Deploy
./scripts/deploy.sh      # Deploy automatizado
./scripts/setup-vps.sh   # Setup do VPS
```

## 🔐 APIs Principais (Simplificadas)

### Autenticação
- `POST /api/auth/register-simple` - Registro simplificado
- `GET/POST /api/auth/[...nextauth]` - NextAuth routes

### Usuários
- `GET /api/user/profile` - Buscar perfil
- `PUT /api/user/profile` - Atualizar perfil

### Mensagens
- `GET /api/messages` - Buscar mensagens
- `POST /api/messages` - Enviar mensagem
- `GET /api/conversations` - Listar conversas

### Upload
- `POST /api/upload-photo` - Upload de foto
- `DELETE /api/upload-photo` - Deletar foto

## 🚀 Benefícios da Simplificação

- **Desenvolvimento Mais Rápido** - Menos complexidade
- **Menos Bugs** - Código mais simples
- **Performance Melhor** - Menos verificações
- **Experiência Fluida** - Login e registro diretos
- **Manutenção Fácil** - Estrutura clara

## 📝 Próximos Passos

1Teste as funcionalidades básicas**
2Adicione funcionalidades gradualmente**
3. **Melhore a segurança quando necessário**
4. **Expanda conforme a necessidade**

## 🔒 Segurança Básica

### Implementado
- ✅ Autenticação JWT básica
- ✅ Validação de dados com Zod
- ✅ Headers de segurança básicos
- ✅ Proteção de rotas admin

### Para Adicionar (Quando Necessário)
- Rate limiting básico
- Validações adicionais
- Logs de auditoria
- Backup automático

## 📊 Monitoramento Básico

### Logs
- PM2 process manager
- Nginx access logs
- Console logs da aplicação

### Performance
- Otimizações básicas PostgreSQL
- PM2 process manager para uptime

---

**Configuração simplificada para desenvolvimento rápido!** 🚀 