#!/bin/bash

# Script de Deploy para VPS
# VPS: 177.153.20.125
# Usuário: root

echo "🚀 Iniciando deploy do Bebaby App..."

# 1. Conectar ao VPS e verificar ambiente
echo "📡 Conectando ao VPS..."
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

# 2. Criar diretório do projeto
echo "📁 Criando diretório do projeto..."
mkdir -p /var/www/bebaby-app
cd /var/www/bebaby-app

# 3. Configurar PostgreSQL
echo "🗄️ Configurando PostgreSQL..."
sudo -u postgres psql << 'PSQL_EOF'
CREATE DATABASE bebaby_db;
CREATE USER bebaby_user WITH PASSWORD 'Maria#01';
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
\q
PSQL_EOF

echo "✅ Banco de dados configurado"

EOF

# 4. Enviar arquivos do projeto
echo "📤 Enviando arquivos do projeto..."
scp -r . root@177.153.20.125:/var/www/bebaby-app/

# 5. Configurar ambiente no VPS
ssh root@177.153.20.125 << 'EOF'

cd /var/www/bebaby-app

# Criar arquivo .env
echo "🔧 Criando arquivo .env..."
cat > .env << 'ENV_EOF'
# Database
DATABASE_URL="postgresql://bebaby_user:Maria#01@localhost:5432/bebaby_db"

# NextAuth
NEXTAUTH_SECRET="bebaby-secret-key-2024-production-vps"
NEXTAUTH_URL="http://177.153.20.125:3000"

# Stripe (configurar depois)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (configurar depois)
BREVO_API_KEY="your-brevo-api-key"

# App
NEXT_PUBLIC_APP_URL="http://177.153.20.125:3000"
ENV_EOF

echo "✅ Arquivo .env criado"

# 6. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 7. Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# 8. Executar migrações do banco
echo "🗄️ Executando migrações..."
npx prisma migrate deploy

# 9. Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

# 10. Configurar PM2
echo "⚙️ Configurando PM2..."
pm2 delete bebaby-app 2>/dev/null || true
pm2 start npm --name "bebaby-app" -- start
pm2 save
pm2 startup

echo "✅ Deploy concluído!"
echo "🌐 Aplicação rodando em: http://177.153.20.125:3000"
echo "📊 Status PM2: pm2 status"
echo "📋 Logs: pm2 logs bebaby-app"

EOF

echo "🎉 Deploy finalizado!"
echo "🔗 Acesse: http://177.153.20.125:3000" 