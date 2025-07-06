#!/bin/bash

# Script de Deploy Automatizado - Bebaby App
# Uso: ./scripts/deploy.sh [production|staging]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar argumentos
ENVIRONMENT=${1:-production}
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
    error "Ambiente deve ser 'production' ou 'staging'"
fi

log "🚀 Iniciando deploy para $ENVIRONMENT..."

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    error "Execute este script na raiz do projeto"
fi

# Verificar se .env.local existe
if [[ ! -f ".env.local" ]]; then
    error "Arquivo .env.local não encontrado. Configure as variáveis de ambiente primeiro."
fi

# Backup do banco (se em produção)
if [[ "$ENVIRONMENT" == "production" ]]; then
    log "📦 Criando backup do banco de dados..."
    if command -v pg_dump &> /dev/null; then
        BACKUP_DIR="/backup"
        mkdir -p $BACKUP_DIR
        pg_dump $DATABASE_URL > "$BACKUP_DIR/bebaby_backup_$(date +%Y%m%d_%H%M%S).sql"
        success "Backup criado com sucesso"
    else
        warning "pg_dump não encontrado. Backup não realizado."
    fi
fi

# Instalar dependências
log "📦 Instalando dependências..."
npm ci --only=production

# Gerar cliente Prisma
log "🔧 Gerando cliente Prisma..."
npx prisma generate

# Executar migrações
log "🗄️ Executando migrações do banco..."
npx prisma db push

# Build da aplicação
log "🏗️ Fazendo build da aplicação..."
npm run build

# Parar aplicação atual (se estiver rodando)
if pm2 list | grep -q "bebaby-app"; then
    log "⏹️ Parando aplicação atual..."
    pm2 stop bebaby-app
fi

# Iniciar aplicação
log "▶️ Iniciando aplicação..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    pm2 start npm --name "bebaby-app" -i max -- start
else
    pm2 start npm --name "bebaby-app" -- start
fi

# Salvar configuração do PM2
pm2 save

# Verificar status
log "🔍 Verificando status da aplicação..."
sleep 5

if pm2 list | grep -q "bebaby-app.*online"; then
    success "✅ Aplicação iniciada com sucesso!"
    
    # Mostrar informações
    echo ""
    log "📊 Status da aplicação:"
    pm2 show bebaby-app
    
    echo ""
    log "📝 Logs recentes:"
    pm2 logs bebaby-app --lines 10
    
else
    error "❌ Falha ao iniciar aplicação"
fi

# Limpar cache do Nginx (se disponível)
if command -v nginx &> /dev/null; then
    log "🔄 Recarregando Nginx..."
    sudo nginx -s reload
fi

success "🎉 Deploy concluído com sucesso!"
log "🌐 Aplicação disponível em: $NEXT_PUBLIC_APP_URL"

# Comandos úteis
echo ""
log "🔧 Comandos úteis:"
echo "  pm2 logs bebaby-app          # Ver logs"
echo "  pm2 restart bebaby-app       # Reiniciar aplicação"
echo "  pm2 stop bebaby-app          # Parar aplicação"
echo "  pm2 delete bebaby-app        # Remover aplicação" 