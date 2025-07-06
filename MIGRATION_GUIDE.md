# 🚀 Guia de Migração: Firebase → PostgreSQL

Este guia documenta a migração completa do Bebaby App do Firebase para PostgreSQL com NextAuth.js.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e configurado
- Acesso root ao servidor/VPS
- Domínio configurado (opcional)

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
CREATE USER bebaby_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
\q
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `env.example` para `.env.local` e configure:

```bash
# Database
DATABASE_URL="postgresql://bebaby_user:sua_senha_segura@localhost:5432/bebaby_db"

# NextAuth
NEXTAUTH_SECRET="gere-uma-chave-secreta-aleatoria"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (se usar)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Brevo)
BREVO_API_KEY="sua-chave-brevo"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🔧 Setup do Projeto

### 1. Instalar Dependências

```bash
npm install
```

### 2. Gerar Cliente Prisma

```bash
npx prisma generate
```

### 3. Executar Migrações

```bash
npx prisma db push
```

### 4. Popular Banco com Dados Iniciais

```bash
npm run db:seed
```

### 5. Iniciar Desenvolvimento

```bash
npm run dev
```

## 🔄 Principais Mudanças

### Autenticação
- **Antes**: Firebase Auth
- **Agora**: NextAuth.js com JWT
- **Benefícios**: Mais controle, melhor performance

### Banco de Dados
- **Antes**: Firestore (NoSQL)
- **Agora**: PostgreSQL (SQL)
- **Benefícios**: Relacionamentos, consultas complexas, ACID

### Storage
- **Antes**: Firebase Storage
- **Agora**: Sistema de arquivos local + S3/Cloudinary
- **Benefícios**: Menor custo, mais controle

### Tempo Real
- **Antes**: Firestore listeners
- **Agora**: WebSockets (Socket.io)
- **Benefícios**: Melhor performance, menos latência

## 📁 Estrutura de Arquivos

```
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   └── seed.ts               # Dados iniciais
├── lib/
│   ├── prisma.ts             # Cliente Prisma
│   └── auth.ts               # Config NextAuth
├── app/api/
│   ├── auth/                 # APIs de autenticação
│   ├── messages/             # APIs de mensagens
│   ├── explore/              # APIs de busca
│   └── upload-photo/         # APIs de upload
├── contexts/
│   └── AuthContext.tsx       # Contexto de auth
└── types/
    └── next-auth.d.ts        # Tipos NextAuth
```

## 🔐 APIs Criadas

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

## 🚀 Deploy em Produção

### 1. Configurar VPS

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Instalar PM2
npm install -g pm2
```

### 2. Configurar Nginx

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Deploy com PM2

```bash
# Build da aplicação
npm run build

# Iniciar com PM2
pm2 start npm --name "bebaby-app" -- start
pm2 save
pm2 startup
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar dev server
npm run build            # Build para produção
npm run start            # Iniciar produção

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
```

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -h localhost -U bebaby_user -d bebaby_db
```

### Erro de Permissões
```bash
# Verificar permissões do diretório uploads
sudo chown -R www-data:www-data public/uploads
sudo chmod -R 755 public/uploads
```

### Erro de NextAuth
```bash
# Verificar variáveis de ambiente
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL

# Gerar nova chave secreta
openssl rand -base64 32
```

## 📊 Monitoramento

### Logs da Aplicação
```bash
# Ver logs do PM2
pm2 logs bebaby-app

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitoramento do Banco
```bash
# Ver conexões ativas
SELECT * FROM pg_stat_activity;

# Ver tamanho do banco
SELECT pg_size_pretty(pg_database_size('bebaby_db'));
```

## 🔒 Segurança

### Configurações Recomendadas

1. **Firewall**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. **SSL/HTTPS**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com
```

3. **Backup Automático**
```bash
# Criar script de backup
#!/bin/bash
pg_dump bebaby_db > /backup/bebaby_$(date +%Y%m%d_%H%M%S).sql

# Adicionar ao crontab
0 2 * * * /path/to/backup-script.sh
```

## 📈 Performance

### Otimizações Recomendadas

1. **PostgreSQL**
```sql
-- Configurar shared_buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Configurar effective_cache_size
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

2. **Nginx**
```nginx
# Habilitar gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

3. **Node.js**
```bash
# Configurar PM2 com múltiplas instâncias
pm2 start npm --name "bebaby-app" -i max -- start
```

## 🎉 Conclusão

A migração está completa! O Bebaby App agora roda com:

- ✅ PostgreSQL para dados
- ✅ NextAuth.js para autenticação
- ✅ Sistema de arquivos local para uploads
- ✅ APIs RESTful otimizadas
- ✅ Melhor performance e controle

Para dúvidas ou problemas, consulte a documentação ou entre em contato com o suporte. 