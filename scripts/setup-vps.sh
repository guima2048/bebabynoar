#!/bin/bash

# Script de Setup Automatizado do VPS - Bebaby App
# Uso: ./scripts/setup-vps.sh

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

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (sudo)"
fi

log "🚀 Iniciando setup do VPS para Bebaby App..."

# Atualizar sistema
log "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências básicas
log "📦 Instalando dependências básicas..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Instalar Node.js 18
log "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
success "Node.js instalado: $NODE_VERSION"

# Instalar PostgreSQL
log "🗄️ Instalando PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Iniciar e habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

success "PostgreSQL instalado e iniciado"

# Configurar PostgreSQL
log "⚙️ Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE bebaby_db;"
sudo -u postgres psql -c "CREATE USER bebaby_user WITH PASSWORD 'bebaby_password_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;"
sudo -u postgres psql -c "ALTER USER bebaby_user CREATEDB;"

success "PostgreSQL configurado"

# Instalar Nginx
log "🌐 Instalando Nginx..."
apt install -y nginx

# Configurar Nginx
log "⚙️ Configurando Nginx..."
cat > /etc/nginx/sites-available/bebaby-app << 'EOF'
server {
    listen 80;
    server_name _;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Upload size
    client_max_body_size 10M;

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
        proxy_read_timeout 86400;
    }

    # Static files
    location /uploads {
        alias /var/www/bebaby-app/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/bebaby-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

success "Nginx configurado"

# Instalar PM2
log "📦 Instalando PM2..."
npm install -g pm2

# Configurar PM2 para iniciar com o sistema
pm2 startup

success "PM2 instalado e configurado"

# Configurar firewall
log "🔥 Configurando firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

success "Firewall configurado"

# Criar diretório da aplicação
log "📁 Criando diretório da aplicação..."
mkdir -p /var/www/bebaby-app
chown -R $SUDO_USER:$SUDO_USER /var/www/bebaby-app

# Criar diretório de uploads
mkdir -p /var/www/bebaby-app/public/uploads
chmod -R 755 /var/www/bebaby-app/public/uploads

# Criar diretório de backup
mkdir -p /backup
chown -R $SUDO_USER:$SUDO_USER /backup

# Configurar backup automático
log "📦 Configurando backup automático..."
cat > /backup/backup-script.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/bebaby_backup_$DATE.sql"

# Backup do banco
pg_dump bebaby_db > "$BACKUP_FILE"

# Comprimir backup
gzip "$BACKUP_FILE"

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "bebaby_backup_*.sql.gz" -mtime +7 -delete

echo "Backup criado: $BACKUP_FILE.gz"
EOF

chmod +x /backup/backup-script.sh

# Adicionar backup ao crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /backup/backup-script.sh") | crontab -

success "Backup automático configurado"

# Configurar logrotate
log "📝 Configurando logrotate..."
cat > /etc/logrotate.d/bebaby-app << 'EOF'
/var/www/bebaby-app/.pm2/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

success "Logrotate configurado"

# Instalar Certbot (para SSL)
log "🔒 Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

success "Certbot instalado"

# Mostrar informações finais
echo ""
success "🎉 Setup do VPS concluído com sucesso!"
echo ""
log "📋 Informações importantes:"
echo "  📁 Diretório da aplicação: /var/www/bebaby-app"
echo "  🗄️ Banco de dados: bebaby_db"
echo "  👤 Usuário do banco: bebaby_user"
echo "  🔑 Senha do banco: bebaby_password_2024"
echo "  📦 Diretório de backup: /backup"
echo "  🌐 Nginx configurado em: /etc/nginx/sites-available/bebaby-app"
echo ""
log "🔧 Próximos passos:"
echo "  1. Clone o repositório em /var/www/bebaby-app"
echo "  2. Configure o arquivo .env.local"
echo "  3. Execute: npm install"
echo "  4. Execute: npx prisma generate"
echo "  5. Execute: npx prisma db push"
echo "  6. Execute: npm run build"
echo "  7. Execute: pm2 start npm --name bebaby-app -- start"
echo ""
log "🔒 Para configurar SSL:"
echo "  certbot --nginx -d seu-dominio.com"
echo ""
log "📊 Comandos úteis:"
echo "  pm2 logs bebaby-app          # Ver logs"
echo "  pm2 restart bebaby-app       # Reiniciar aplicação"
echo "  sudo nginx -t                # Testar configuração Nginx"
echo "  sudo systemctl status nginx  # Status do Nginx"
echo "  sudo systemctl status postgresql  # Status do PostgreSQL" 