# 🚀 Instruções de Deploy - Bebaby App

## 📋 Pré-requisitos

### No VPS (177.153.20.125):
- ✅ Node.js 18+ (já instalado)
- ✅ npm (já instalado)
- ✅ PostgreSQL (já instalado)
- ✅ PM2 (será instalado automaticamente)

### Localmente:
- ✅ SSH configurado para acessar o VPS
- ✅ Projeto funcionando localmente

## 🔧 Deploy Automático

### Opção 1: Script PowerShell (Windows)
```powershell
.\deploy.ps1
```

### Opção 2: Script Bash (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 Deploy Manual (se preferir)

### 1. Conectar ao VPS
```bash
ssh root@177.153.20.125
```

### 2. Criar diretório e enviar arquivos
```bash
# No VPS
mkdir -p /var/www/bebaby-app
cd /var/www/bebaby-app

# No seu computador
scp -r . root@177.153.20.125:/var/www/bebaby-app/
```

### 3. Configurar banco de dados
```bash
# No VPS
sudo -u postgres psql
CREATE DATABASE bebaby_db;
CREATE USER bebaby_user WITH PASSWORD 'Maria#01';
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
\q
```

### 4. Criar arquivo .env
```bash
# No VPS, em /var/www/bebaby-app
cat > .env << 'EOF'
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
EOF
```

### 5. Instalar e configurar
```bash
# No VPS, em /var/www/bebaby-app
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

### 6. Configurar PM2
```bash
# Instalar PM2 (se não estiver instalado)
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "bebaby-app" -- start
pm2 save
pm2 startup
```

## 🔍 Verificações

### Status da aplicação
```bash
pm2 status
pm2 logs bebaby-app
```

### Testar acesso
```bash
curl http://177.153.20.125:3000
```

## 🌐 URLs

- **Aplicação**: http://177.153.20.125:3000
- **API**: http://177.153.20.125:3000/api

## 🔧 Comandos Úteis

### Reiniciar aplicação
```bash
pm2 restart bebaby-app
```

### Ver logs em tempo real
```bash
pm2 logs bebaby-app --lines 100
```

### Parar aplicação
```bash
pm2 stop bebaby-app
```

### Atualizar código (novo deploy)
```bash
# 1. Enviar novos arquivos
scp -r . root@177.153.20.125:/var/www/bebaby-app/

# 2. No VPS
cd /var/www/bebaby-app
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart bebaby-app
```

## ⚠️ Configurações Pendentes

Após o deploy inicial, configure:

1. **Stripe**: Adicione suas chaves reais no `.env`
2. **Email (Brevo)**: Configure para envio de emails
3. **Domínio**: Configure DNS para apontar para o IP
4. **SSL**: Configure certificado HTTPS
5. **Firewall**: Abra apenas as portas necessárias

## 🆘 Troubleshooting

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -h localhost -U bebaby_user -d bebaby_db
```

### Erro de porta em uso
```bash
# Verificar o que está usando a porta 3000
netstat -tulpn | grep :3000

# Matar processo se necessário
kill -9 <PID>
```

### Erro de permissões
```bash
# Dar permissões ao diretório
chown -R root:root /var/www/bebaby-app
chmod -R 755 /var/www/bebaby-app
``` 