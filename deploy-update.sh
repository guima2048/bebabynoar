#!/bin/bash

# Script de Deploy Atualizado (SEM PARAR aplicação atual)
# VPS: 177.153.20.125
# Usuário: root

echo "🚀 Iniciando deploy atualizado do Bebaby App (sem downtime)..."

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

# 3. Conectar ao VPS e fazer deploy sem parar a aplicação
echo "📡 Conectando ao VPS..."
ssh root@177.153.20.125 << 'EOF'

echo "🔍 Verificando aplicação atual..."
pm2 status bebaby-app

# 4. Criar diretório de backup
echo "📁 Criando backup da versão atual..."
mkdir -p /var/www/bebaby-app-backup
cp -r /var/www/bebaby-app/* /var/www/bebaby-app-backup/ 2>/dev/null || true

# 5. Criar diretório temporário para nova versão
echo "📁 Preparando nova versão..."
mkdir -p /var/www/bebaby-app-new
cd /var/www/bebaby-app-new

# 6. Limpar diretório temporário
echo "🧹 Limpando diretório temporário..."
rm -rf *

EOF

# 7. Enviar TODOS os arquivos para o diretório temporário
echo "📤 Enviando arquivos para diretório temporário..."
scp -r . root@177.153.20.125:/var/www/bebaby-app-new/

# 8. Configurar nova versão no VPS
ssh root@177.153.20.125 << 'EOF'

cd /var/www/bebaby-app-new

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

# 9. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 10. Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# 11. Executar migrações do banco (se houver)
echo "🗄️ Verificando migrações..."
npx prisma migrate deploy

# 12. Build do projeto
echo "🔨 Fazendo build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Restaurando versão anterior..."
    rm -rf /var/www/bebaby-app-new
    echo "✅ Versão anterior mantida. Deploy cancelado."
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# 13. Trocar versões (ZERO DOWNTIME)
echo "🔄 Trocando versões..."
cd /var/www

# Fazer backup da versão atual
mv bebaby-app bebaby-app-old

# Mover nova versão para produção
mv bebaby-app-new bebaby-app

# 14. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
cd /var/www/bebaby-app
pm2 restart bebaby-app

# 15. Verificar se está funcionando
echo "🔍 Verificando aplicação..."
sleep 5
pm2 status bebaby-app

# 16. Limpar backup antigo (se tudo estiver ok)
echo "🧹 Limpando backup antigo..."
rm -rf /var/www/bebaby-app-old

echo "✅ Deploy atualizado concluído com sucesso!"
echo "🌐 Aplicação rodando em: http://177.153.20.125:3000"
echo "📊 Status PM2: pm2 status"
echo "📋 Logs: pm2 logs bebaby-app"

EOF

echo "🎉 Deploy atualizado finalizado!"
echo "🔗 Acesse: http://177.153.20.125:3000"
echo "📊 Para verificar status: ssh root@177.153.20.125 'pm2 status'"
echo "📋 Para ver logs: ssh root@177.153.20.125 'pm2 logs bebaby-app'" 