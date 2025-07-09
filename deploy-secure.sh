#!/bin/bash

# Script de Deploy Seguro para VPS
# VPS: 177.153.20.125
# Usuário: root

set -e  # Exit on any error

echo "🚀 Iniciando deploy seguro do Bebaby App..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    log_error "Arquivo .env não encontrado!"
    log_info "Copiando .env.example para .env..."
    cp env.example .env
    log_warn "Por favor, configure as variáveis de ambiente no arquivo .env antes de continuar"
    exit 1
fi

# 1. Conectar ao VPS e verificar ambiente
log_info "📡 Conectando ao VPS..."
ssh root@177.153.20.125 << 'EOF'

echo "🔍 Verificando ambiente..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js encontrado: $(node --version)"
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
else
    echo "✅ npm encontrado: $(npm --version)"
fi

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Instalando..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
else
    echo "✅ PostgreSQL encontrado"
fi

# Verificar PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
else
    echo "✅ PM2 encontrado"
fi

# Verificar nginx (opcional)
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando nginx..."
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
else
    echo "✅ nginx encontrado"
fi

# 2. Criar diretório do projeto
echo "📁 Criando diretório do projeto..."
mkdir -p /var/www/bebaby-app
cd /var/www/bebaby-app

# 3. Configurar PostgreSQL com senha segura
echo "🗄️ Configurando PostgreSQL..."
# Gerar senha aleatória
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

sudo -u postgres psql << EOF
CREATE DATABASE bebaby_db;
CREATE USER bebaby_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
\q
EOF

echo "✅ Banco de dados configurado com senha segura"

EOF

# 4. Enviar arquivos do projeto
log_info "📤 Enviando arquivos do projeto..."
scp -r . root@177.153.20.125:/var/www/bebaby-app/

# 5. Configurar ambiente no VPS
ssh root@177.153.20.125 << 'EOF'

cd /var/www/bebaby-app

# Criar arquivo .env seguro
echo "🔧 Criando arquivo .env seguro..."
cat > .env << 'ENV_EOF'
# Database
DATABASE_URL="postgresql://bebaby_user:${DB_PASSWORD}@localhost:5432/bebaby_db"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://bebaby.app"

# Stripe (configurar depois)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (configurar depois)
BREVO_API_KEY="your-brevo-api-key"

# App
NEXT_PUBLIC_APP_URL="https://bebaby.app"

# Security
NODE_ENV="production"
ENV_EOF

echo "✅ Arquivo .env criado com configurações seguras"

# 6. Instalar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# 7. Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# 8. Executar migrações do banco
echo "🗄️ Executando migrações..."
npx prisma migrate deploy

# 9. Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

# 10. Configurar PM2 com restart automático
echo "⚙️ Configurando PM2..."
pm2 delete bebaby-app 2>/dev/null || true

# Criar arquivo de configuração PM2
cat > ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [{
    name: 'bebaby-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/bebaby-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/bebaby-app/err.log',
    out_file: '/var/log/bebaby-app/out.log',
    log_file: '/var/log/bebaby-app/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
PM2_EOF

# Criar diretório de logs
mkdir -p /var/log/bebaby-app

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 11. Configurar nginx (opcional)
echo "🌐 Configurando nginx..."
cat > /etc/nginx/sites-available/bebaby-app << 'NGINX_EOF'
server {
    listen 80;
    server_name bebaby.app www.bebaby.app;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Cache para assets estáticos
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        proxy_pass http://localhost:3000;
        expires 1d;
        add_header Cache-Control "public";
    }
}
NGINX_EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/bebaby-app /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 12. Configurar firewall
echo "🔥 Configurando firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 13. Configurar SSL (opcional)
echo "🔒 Configurando SSL..."
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d bebaby.app -d www.bebaby.app --non-interactive --agree-tos --email admin@bebaby.app

# 14. Health check
echo "🏥 Verificando saúde da aplicação..."
sleep 10

# Testar se a aplicação está respondendo
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Aplicação está saudável!"
else
    echo "❌ Aplicação não está respondendo"
    pm2 logs bebaby-app --lines 20
    exit 1
fi

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Aplicação rodando em: https://bebaby.app"
echo "📊 Status PM2: pm2 status"
echo "📋 Logs: pm2 logs bebaby-app"
echo "🏥 Health check: curl https://bebaby.app/api/health"

EOF

log_info "🎉 Deploy seguro finalizado!"
log_info "🔗 Acesse: https://bebaby.app"
log_info "🏥 Health check: https://bebaby.app/api/health"
log_warn "⚠️  Lembre-se de configurar as variáveis de ambiente (Stripe, Email, etc.)" 