# 🍯 Bebaby App

Plataforma de relacionamento Sugar Baby e Sugar Daddy desenvolvida com Next.js 14, PostgreSQL e NextAuth.js.

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL, Prisma ORM
- **Autenticação**: NextAuth.js com JWT
- **Banco de Dados**: PostgreSQL
- **Storage**: Sistema de arquivos local + S3/Cloudinary
- **Pagamentos**: Stripe
- **Email**: Brevo
- **Deploy**: VPS com PM2 + Nginx

## ✨ Funcionalidades

### 👥 Usuários
- ✅ Registro e login seguro
- ✅ Perfis detalhados com fotos
- ✅ Verificação de email
- ✅ Sistema premium
- ✅ Bloqueio de usuários
- ✅ Denúncias e moderação

### 💬 Comunicação
- ✅ Mensagens em tempo real
- ✅ Conversas organizadas
- ✅ Envio de interesses
- ✅ Notificações push
- ✅ Upload de fotos nas mensagens

### 🔍 Exploração
- ✅ Busca avançada de usuários
- ✅ Filtros por localização, idade, tipo
- ✅ Sistema de matching inteligente
- ✅ Visualização de perfis
- ✅ Histórico de visualizações

### 💳 Pagamentos
- ✅ Integração com Stripe
- ✅ Planos premium
- ✅ Histórico de pagamentos
- ✅ Webhooks seguros

### 📱 Admin
- ✅ Dashboard administrativo
- ✅ Moderação de conteúdo
- ✅ Gestão de usuários
- ✅ Relatórios e estatísticas
- ✅ Configurações do sistema

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Clone o repositório

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

Configure as variáveis:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bebaby_db"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
BREVO_API_KEY="sua-chave-brevo"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configure o banco de dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Sincronizar schema
npx prisma db push

# Popular dados iniciais
npm run db:seed
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 🚀 Deploy em Produção

### Setup Automatizado do VPS

Execute o script de setup:

```bash
chmod +x scripts/setup-vps.sh
sudo ./scripts/setup-vps.sh
```

### Deploy Manual

1. **Configure o VPS**:
   ```bash
   # Instalar Node.js, PostgreSQL, Nginx, PM2
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs postgresql nginx
   npm install -g pm2
   ```

2. **Configure o banco**:
   ```sql
   CREATE DATABASE bebaby_db;
   CREATE USER bebaby_user WITH PASSWORD 'sua_senha';
   GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
   ```

3. **Deploy da aplicação**:
   ```bash
   git clone https://github.com/seu-usuario/bebaby-app.git
   cd bebaby-app
   npm install
   npx prisma generate
   npx prisma db push
   npm run build
   pm2 start npm --name "bebaby-app" -- start
   ```

### Deploy Automatizado

Use o script de deploy:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

## 📁 Estrutura do Projeto

```
bebaby-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Área administrativa
│   ├── profile/           # Perfis de usuário
│   ├── messages/          # Sistema de mensagens
│   └── explore/           # Exploração de usuários
├── components/            # Componentes React
├── contexts/              # Contextos (Auth, Notifications)
├── lib/                   # Utilitários e configurações
├── prisma/                # Schema e migrations
├── scripts/               # Scripts de deploy e setup
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
npm run db:migrate       # Executar migrações
npm run db:studio        # Abrir Prisma Studio
npm run db:seed          # Popular dados iniciais

# Testes
npm test                 # Executar testes
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Cobertura de testes

# Deploy
./scripts/deploy.sh      # Deploy automatizado
./scripts/setup-vps.sh   # Setup do VPS
```

## 🔐 APIs Principais

### Autenticação
- `POST /api/auth/register` - Registro de usuários
- `POST /api/auth/reset-password` - Reset de senha
- `GET/POST /api/auth/[...nextauth]` - NextAuth routes

### Usuários
- `GET /api/user/profile` - Buscar perfil
- `PUT /api/user/profile` - Atualizar perfil

### Mensagens
- `GET /api/messages` - Buscar mensagens
- `POST /api/messages` - Enviar mensagem
- `GET /api/conversations` - Listar conversas

### Exploração
- `GET /api/explore` - Buscar usuários
- `POST /api/send-interest` - Enviar interesse
- `PUT /api/send-interest` - Responder interesse

### Upload
- `POST /api/upload-photo` - Upload de foto
- `DELETE /api/upload-photo` - Deletar foto

## 🗄️ Schema do Banco

O projeto usa PostgreSQL com as seguintes tabelas principais:

- **users** - Usuários e perfis
- **photos** - Fotos dos usuários
- **conversations** - Conversas
- **messages** - Mensagens
- **interests** - Interesses entre usuários
- **notifications** - Notificações
- **payments** - Pagamentos
- **reports** - Denúncias
- **blog_posts** - Posts do blog

## 🔒 Segurança

- ✅ Autenticação JWT segura
- ✅ Validação de dados com Zod
- ✅ Sanitização de inputs
- ✅ Rate limiting
- ✅ Headers de segurança
- ✅ Backup automático
- ✅ SSL/HTTPS

## 📊 Monitoramento

- **Logs**: PM2 + Nginx
- **Backup**: Automático diário
- **Performance**: Otimizações PostgreSQL
- **Uptime**: PM2 process manager

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- 📧 Email: suporte@bebaby.app
- 📖 Documentação: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/bebaby-app/issues)

## 🎉 Agradecimentos

- Next.js team pelo framework incrível
- Prisma team pelo ORM
- Vercel pela inspiração
- Comunidade open source

---

**Bebaby App** - Conectando pessoas, criando relacionamentos 💕

---

**Updated at Sat, Jun 28, 2025 11:11:26 AM**

# Forcing new deployment

