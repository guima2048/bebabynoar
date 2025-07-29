# 🚀 Guia de Migração Simplificado: Firebase → PostgreSQL

Este guia documenta a migração **simplificada** do Bebaby App do Firebase para PostgreSQL com NextAuth.js.

## 📋 Pré-requisitos

- Node.js18+ instalado
- PostgreSQL14+ instalado e configurado
- Acesso root ao servidor/VPS
- Domínio configurado (opcional)

## 🎉 Simplificações Implementadas

### ✅ **Migração Simplificada**
- Autenticação direta sem verificação de email
- Schema de banco mais limpo
- APIs simplificadas
- Setup automático com usuários de teste

### ✅ **Benefícios da Simplificação**
- Migração mais rápida
- Menos complexidade
- Teste imediato
- Manutenção fácil

## 🗄️ Configuração do PostgreSQL

### 1. Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Configurar Banco de Dados

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE bebaby_db;
CREATE USER bebaby_user WITH PASSWORD sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
\q
```

### 3nfigurar Variáveis de Ambiente (Simplificado)

Copie o arquivo `env.example` para `.env.local` e configure:

```bash
# Database
DATABASE_URL="postgresql://bebaby_user:sua_senha_segura@localhost:5432bebaby_db"

# NextAuth (Simplificado)
NEXTAUTH_SECRET=gere-uma-chave-secreta-aleatoria"
NEXTAUTH_URL=http://localhost:300
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000XT_PUBLIC_APP_NAME="Bebaby App"
NEXT_PUBLIC_APP_DESCRIPTION="Conectando Sugar Babies e Sugar Daddies# Development
NODE_ENV="development
```
## 🔧 Setup Simplificado do Projeto

### 1talar Dependências

```bash
npm install
```

### 2. Gerar Cliente Prisma

```bash
npx prisma generate
```

###3ecutar Setup Simplificado

```bash
npx prisma db push
node scripts/setup-simple.js
```

### 4. Iniciar Desenvolvimento

```bash
npm run dev
```

## 🎯 Dados de Teste

Após executar `node scripts/setup-simple.js`, você terá acesso a:

- **👤 Admin:** `admin@bebaby.app` / `admin123`
- **👧 Sugar Baby:** `sugar_baby1xample.com` / `123456- **👨 Sugar Daddy:** `sugar_daddy1xample.com` / `123456 🔄 Principais Mudanças (Simplificadas)

### Autenticação
- **Antes**: Firebase Auth
- **Agora**: NextAuth.js com JWT (Simplificado)
- **Benefícios**: Login direto, sem verificação de email

### Banco de Dados
- **Antes**: Firestore (NoSQL)
- **Agora**: PostgreSQL (SQL) - Schema simplificado
- **Benefícios**: Estrutura mais limpa, campos essenciais

### Storage
- **Antes**: Firebase Storage
- **Agora**: Sistema de arquivos local
- **Benefícios**: Simplicidade, sem dependências externas

### APIs
- **Antes**: Firebase Functions
- **Agora**: Next.js API Routes (Simplificadas)
- **Benefícios**: Menos complexidade, respostas diretas

## 📁 Estrutura de Arquivos (Simplificada)

```
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   └── schema-simple.prisma   # Schema simplificado
├── lib/
│   ├── prisma.ts             # Cliente Prisma
│   ├── auth.ts               # Config NextAuth
│   └── auth-simple.ts        # Auth simplificada
├── app/api/
│   ├── auth/                 # APIs de autenticação
│   │   └── register-simple/  # Registro simplificado
│   ├── messages/             # APIs de mensagens
│   ├── explore/              # APIs de busca
│   └── upload-photo/         # APIs de upload
├── scripts/
│   └── setup-simple.js       # Setup simplificado
├── contexts/
│   └── AuthContext.tsx       # Contexto de auth
└── types/
    └── next-auth.d.ts        # Tipos NextAuth
```

## 🔐 APIs Criadas (Simplificadas)

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

## 🚀 Deploy Simplificado em Produção

###1. Configurar VPS

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18 | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar PM2
npm install -g pm2
```

### 2. Configurar Nginx (Básico)

```nginx
server[object Object]    listen 80   server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:300        proxy_http_version 1.1
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

###3. Deploy com PM2Simplificado)

```bash
# Clonar projeto
git clone https://github.com/seu-usuario/bebaby-app.git
cd bebaby-app

# Configurar ambiente
cp env.example .env
# Editar .env com suas configurações

# Instalar e configurar
npm install
npx prisma generate
npx prisma db push
node scripts/setup-simple.js
npm run build

# Iniciar com PM22start npm --name "bebaby-app" -- start
pm2 save
pm2 startup
```

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Servidor de produção
```

### Banco de Dados
```bash
npx prisma generate      # Gerar cliente Prisma
npx prisma db push       # Sincronizar schema
npx prisma studio        # Abrir Prisma Studio
node scripts/setup-simple.js  # Setup simplificado
```

### Deploy
```bash
pm2 status              # Status da aplicação
pm2 restart bebaby-app  # Reiniciar aplicação
pm2 logs bebaby-app     # Ver logs
```

## 🎉 Funcionalidades Mantidas

### ✅ **Funcionalidades Essenciais**
- Login/Registro de usuários
- Perfil de usuário
- Upload de fotos
- Sistema de mensagens
- Busca de usuários
- Painel admin básico

### ❌ **Funcionalidades Removidas (Temporariamente)**
- Verificação de email
- Rate limiting complexo
- Campos desnecessários no banco
- Validações excessivas
- Logs de debug

## 📝 Próximos Passos

1Teste as funcionalidades básicas**
2Adicione funcionalidades gradualmente**
3. **Melhore a segurança quando necessário**
4. **Expanda conforme a necessidade**

## 🆘 Troubleshooting

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -h localhost -U bebaby_user -d bebaby_db
```

### Erro de setup
```bash
# Executar setup novamente
node scripts/setup-simple.js

# Verificar logs
pm2s bebaby-app
```

### Erro de autenticação
```bash
# Verificar variáveis de ambiente
cat .env

# Testar login com usuários de teste
# admin@bebaby.app / admin123

## 🚀 Benefícios da Migração Simplificada

- **Migração Mais Rápida** - Menos complexidade
- **Menos Bugs** - Código mais simples
- **Teste Imediato** - Usuários prontos
- **Manutenção Fácil** - Estrutura clara
- **Performance Melhor** - Menos verificações

---

**Migração simplificada para desenvolvimento rápido!** 🚀 