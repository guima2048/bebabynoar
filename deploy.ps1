# Script de Deploy para VPS - Windows PowerShell
# VPS: 177.153.20.125
# Usuário: root

Write-Host "🚀 Iniciando deploy do Bebaby App..." -ForegroundColor Green

# 1. Verificar se o projeto está pronto
Write-Host "🔍 Verificando projeto local..." -ForegroundColor Yellow

if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json não encontrado!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "prisma/schema.prisma")) {
    Write-Host "❌ schema.prisma não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Projeto verificado" -ForegroundColor Green

# 2. Enviar arquivos para o VPS
Write-Host "📤 Enviar arquivos para o VPS..." -ForegroundColor Yellow

# Excluir node_modules e .next para otimizar upload
$excludeFiles = @(
    "node_modules",
    ".next", 
    ".git",
    ".env",
    "*.log"
)

$excludeParams = $excludeFiles | ForEach-Object { "--exclude=$_" }
$excludeString = $excludeParams -join " "

# Usar rsync se disponível, senão scp
try {
    rsync -avz --delete $excludeString ./ root@177.153.20.125:/var/www/bebaby-app/
    Write-Host "✅ Arquivos enviados via rsync" -ForegroundColor Green
} catch {
    Write-Host "📤 Usando scp..." -ForegroundColor Yellow
    scp -r . root@177.153.20.125:/var/www/bebaby-app/
    Write-Host "✅ Arquivos enviados via scp" -ForegroundColor Green
}

# 3. Executar comandos no VPS
Write-Host "🔧 Configurando servidor..." -ForegroundColor Yellow

$sshCommands = @"
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

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Executar migrações
echo "🗄️ Executando migrações..."
npx prisma migrate deploy

# Build do projeto
echo "🔨 Fazendo build..."
npm run build

# Criar usuários admin
echo "🔐 Criando usuários admin..."
node scripts/create-admin-users.js

# Configurar PM2
echo "⚙️ Configurando PM2..."
pm2 delete bebaby-app 2>/dev/null || true
pm2 start npm --name "bebaby-app" -- start
pm2 save
pm2 startup

echo "✅ Deploy concluído!"
echo "🌐 Aplicação: http://177.153.20.125:3000"
"@

# Executar comandos via SSH
Write-Host "🔧 Executando comandos no servidor..." -ForegroundColor Yellow
ssh root@177.153.20.125 $sshCommands

Write-Host "🎉 Deploy finalizado!" -ForegroundColor Green
Write-Host "🔗 Acesse: http://177.153.20.125:3000" -ForegroundColor Cyan
Write-Host "📊 Para ver logs: ssh root@177.153.20.125 'pm2 logs bebaby-app'" -ForegroundColor Cyan 