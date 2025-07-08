#!/bin/bash

# Script de Deploy Completo para VPS
# VPS: 177.153.20.125
# Usuário: root

echo "🚀 Iniciando deploy completo do Bebaby App..."

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# 2. Fazer build local para garantir que está tudo ok
echo "🔨 Fazendo build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build local. Corrija os problemas antes de continuar."
    exit 1
fi

echo "✅ Build local concluído com sucesso!"

# 3. Conectar ao VPS e preparar ambiente
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

# 4. Parar aplicação atual
echo "⏹️ Parando aplicação atual..."
pm2 delete bebaby-app 2>/dev/null || true

# 5. Criar diretório do projeto
echo "📁 Criando diretório do projeto..."
mkdir -p /var/www/bebaby-app
cd /var/www/bebaby-app

# 6. Limpar diretório
echo "🧹 Limpando diretório..."
rm -rf *

EOF

# 7. Enviar TODOS os arquivos do projeto
echo "📤 Enviando TODOS os arquivos do projeto..."
scp -r . root@177.153.20.125:/var/www/bebaby-app/

# 8. Configurar ambiente no VPS
ssh root@177.153.20.125 << 'EOF'

cd /var/www/bebaby-app

# Criar arquivo .env com todas as variáveis
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

# Variáveis do Firebase Admin (backend)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=bebaby-56627
FIREBASE_PRIVATE_KEY_ID=c0912c0a85a2003137b38d6a6577000733de8896
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIX1GVrbQcz2aC\n1vwkdzje4lAOWitv4Wbm6ewap1lEsQGm+8M4fh4AdWx0CJUWdLySqRw73VBDvR6s\neIGzsIek1/b/t2NdInrck+s/u2mvdxMExxUFC80VaG/mXVrer7Lv+9MWX+r7Gmvj\nP3WjiQKWOscO/1bH1in0/idCeQcl08AZyjm/lUUYNuwKEkwEZFPN71KEHI4mKzIT\n1jGQC1BAuf9K/NjmX2iRIPgAVo9VRH0+TDlKwNZCTtgyftNoK5+CA6LN8ZCasa6G\nkXqOT/rhDvUBg1Oyacz/pTTLphXpRJTZhsIBS/7g6k/6POsYTlkLv2pHdTIWV0vD\nmlYaPgGhAgMBAAECggEABqaNR23MyuECasjWdSJk55b058kL5IqDdxogDVFtJ9fF\nMYTtOaCL/+Fl4GMRib2FrcuBpaYGnjz2eeyFB5EOK4VEjD/Kw0Jb+BrLxeGDVEDc\nR34RH0oBPFrrTebe14HW61q9KqKz4rJBjvkh/zPSu2hHh6Knf3oHCfvukyj/uPxj\ne6CL+Y1oi5rBitXd79/MEg3l6ptO7pajNvcPmiUXVJBqQYLIvPF+YUsCxDuoxexH\nL17CLzZh4niHTyHn6e15xYUqU+tySoSm0bQZiEr8vpH6Zah/DhUUPN9xufLtGylI\nK3SwHfHv2WfYt30mwfwGnOe1vU5B8HLQDV/5e7TgHQKBgQDoAI33xUhBnKl2hGwZ\nsNMWTtm/D5u7voCIXFnTuUaDYqyBb8X8tFQtcOrQcNpBNXGHqSnIcyEkuWy12y5b\nJTgT+k5LXQUlnFtjcjmSwqL4oYHphBngJrp/g7lNZFkE8aMZ/je/QHtXGoKEmnhj\n/vepkBugnhxfRqL3u97bKqRInQKBgQDdGTPUwIAjKyLvOs+AlvmMIRXBh3u6M+9M\nSkTH2exvOoa7Jp4wo5XMq/LyqR7rWGV3ukWI4iYj4rBv4NYgx8Zb5YNIiyo87Edd\nuHfjgzyc2oT1LAshCZC5nX/5AqkA1XSpKw8J+a5nLtwOLmJCS2kmploRoCrtCAwQ\ndJcaHdbD1QKBgAxvoyyJ5bKmrCrPNGA4K0iB14g3VPi+YHNux93ii5YVXvvdOvat\nz+lTqTKdKgXe0IQeHEBDc55dVid1ZUm7eAMSIspFZTY76GYvREjKqCO9vJIA48Yx\nLUQSkodEfsUWEtEc4G4fDb2AjUiAYz2w+COdtu1oLEsrJSc0aeDDq2S9AoGBANt5\nyRnIfWprx6Hyn0jmlZGkxhP2ibutEj6I+v3oNeu0DUp6a02dFXa2udRoTWkRtqfD\nIINg+rtkrABjECw6I43Vpxy8CJGxeqZuF5ShEeoigRlfPyzscd3Pmtl06o8JVWUY\neTVNxPJocckiAigM87SKLZ6RgAsLke5Dzjr+o9KBAoGAekQdwZtcpC/imQo/3wyf\nO+2frmfV5jwmVbNdOIy1/ZPvYhxisHi/hD6WBy8h1vUPP2yYTeLL35riTs7X3ORu\nlWXkg+FKyPy9yRGIxIdaffQCL/3Ldt+vwNI7G420vJJnS25gAesi2HuaIVvwFHCd\n4zIfGxN/qF+EQNG76LeZ2qw=\\n-----END PRIVATE KEY-----\\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@bebaby-56627.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=104432634494085133044
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40bebaby-56627.iam.gserviceaccount.com

# Variáveis públicas do Firebase Client (frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAx4P7F54DQ6Q6goN0glnTkwiem20tXFgs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bebaby-56627.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bebaby-56627
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bebaby-56627.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=551312783441
NEXT_PUBLIC_FIREBASE_APP_ID=1:551312783441:web:d2db514ee6331a1767e070
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-283X7Q6YYR
ENV_EOF

echo "✅ Arquivo .env criado"

# 9. Configurar PostgreSQL
echo "🗄️ Configurando PostgreSQL..."
sudo -u postgres psql << 'PSQL_EOF'
CREATE DATABASE bebaby_db;
CREATE USER bebaby_user WITH PASSWORD 'Maria#01';
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
\q
PSQL_EOF

echo "✅ Banco de dados configurado"

# 10. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 11. Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# 12. Executar migrações do banco
echo "🗄️ Executando migrações..."
npx prisma migrate deploy

# 13. Build do projeto (opcional, já fizemos local)
echo "🔨 Verificando build..."
npm run build

# 14. Configurar PM2
echo "⚙️ Configurando PM2..."
pm2 start npm --name "bebaby-app" -- start
pm2 save
pm2 startup

echo "✅ Deploy completo concluído!"
echo "🌐 Aplicação rodando em: http://177.153.20.125:3000"
echo "📊 Status PM2: pm2 status"
echo "📋 Logs: pm2 logs bebaby-app"

EOF

echo "🎉 Deploy completo finalizado!"
echo "🔗 Acesse: http://177.153.20.125:3000"
echo "📊 Para verificar status: ssh root@177.153.20.125 'pm2 status'"
echo "📋 Para ver logs: ssh root@177.153.20.125 'pm2 logs bebaby-app'" 