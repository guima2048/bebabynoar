# 🍯 Bebaby App - Versão Simplificada

Plataforma de relacionamento Sugar Baby e Sugar Daddy desenvolvida com Next.js 14, PostgreSQL e NextAuth.js. **Versão simplificada para desenvolvimento rápido e fácil.**

## 🚀 Tecnologias

- **Frontend**: Next.js 14act 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL, Prisma ORM
- **Autenticação**: NextAuth.js com JWT (Simplificada)
- **Banco de Dados**: PostgreSQL
- **Storage**: Sistema de arquivos local
- **Deploy**: VPS com PM2 + Nginx

## ✨ Funcionalidades Principais

### 👥 Usuários
- ✅ Registro e login direto (sem verificação de email)
- ✅ Perfis com fotos
- ✅ Sistema premium básico
- ✅ Bloqueio de usuários

### 💬 Comunicação
- ✅ Mensagens em tempo real
- ✅ Conversas organizadas
- ✅ Upload de fotos nas mensagens

### 🔍 Exploração
- ✅ Busca de usuários
- ✅ Filtros básicos
- ✅ Visualização de perfis

### 📱 Admin
- ✅ Dashboard administrativo
- ✅ Gestão de usuários
- ✅ Configurações básicas

## 🛠️ Instalação Rápida

### Pré-requisitos

- Node.js18
- PostgreSQL14- npm ou yarn

### 1lone o repositório

```bash
git clone https://github.com/seu-usuario/bebaby-app.git
cd bebaby-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `env.example` para `.env.local`:

```bash
cp env.example .env.local
```

Configure as variáveis mínimas:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432bebaby_db"

# NextAuth (Simplificado)
NEXTAUTH_SECRET=sua-chave-secreta-simples"
NEXTAUTH_URL=http://localhost:300
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000"
```

### 4 Configure o banco de dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Sincronizar schema
npx prisma db push

# Setup simplificado com usuários de teste
node scripts/setup-simple.js
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 🎯 Dados de Teste

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

1 **Configure o VPS**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18 | sudo -E bash -
   sudo apt-get install -y nodejs postgresql nginx
   npm install -g pm2
   ```2 **Configure o banco**:
   ```sql
   CREATE DATABASE bebaby_db;
   CREATE USER bebaby_user WITH PASSWORD sua_senha;
   GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
   ```

3. **Deploy da aplicação**:
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

## 📁 Estrutura do Projeto

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

## 🤝 Contribuição

1. Fork o projeto
2ie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3mmit suas mudanças (`git commit -mAdd some AmazingFeature`)
4.Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a documentação
2. Procure por issues similares
3. Abra uma nova issue

---

**Desenvolvido com ❤️ para facilitar relacionamentos sugar!** 🍯

## Configuração do SendGrid (Envio de Emails)

1. Crie uma conta no SendGrid e gere uma API Key.
2. Adicione a variável no seu arquivo `.env`:

SENDGRID_API_KEY=sua_chave_api_aqui

3. O remetente (from) deve ser um email verificado no painel do SendGrid.

