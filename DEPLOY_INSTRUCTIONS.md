# 🚀 Instruções de Deploy Simplificado - Bebaby App

## 📋 Pré-requisitos

### No VPS:
- ✅ Node.js18+ (já instalado)
- ✅ npm (já instalado)
- ✅ PostgreSQL (já instalado)
- ✅ PM2 (será instalado automaticamente)

### Localmente:
- ✅ SSH configurado para acessar o VPS
- ✅ Projeto funcionando localmente

## 🔧 Deploy Automático (Simplificado)

### Opção 1: Script PowerShell (Windows)
```powershell
.\deploy.ps1
```

### Opção 2: Script Bash (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 Deploy Manual Simplificado

### 1. Conectar ao VPS
```bash
ssh root@177.153.20.125
```

### 2 Criar diretório e enviar arquivos
```bash
# No VPS
mkdir -p /var/www/bebaby-app
cd /var/www/bebaby-app

# No seu computador
scp -r . root@177.1530.20.125var/www/bebaby-app/
```

###3. Configurar banco de dados
```bash
# No VPS
sudo -u postgres psql
CREATE DATABASE bebaby_db;
CREATE USER bebaby_user WITH PASSWORDMaria#01
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
\q
```

### 4Criar arquivo .env (Simplificado)
```bash
# No VPS, em /var/www/bebaby-app
cat > .env <<EOF'
# Database
DATABASE_URL="postgresql://bebaby_user:Maria#01localhost:5432bebaby_db"

# NextAuth (Simplificado)
NEXTAUTH_SECRET=bebaby-secret-key-224-production-vps"
NEXTAUTH_URL=http://177153.20.125:300
# App
NEXT_PUBLIC_APP_URL=http://177.1530.20125:3000XT_PUBLIC_APP_NAME="Bebaby App"
NEXT_PUBLIC_APP_DESCRIPTION="Conectando Sugar Babies e Sugar Daddies# Development
NODE_ENV="production"
EOF
```

### 5. Instalar e configurar (Simplificado)
```bash
# No VPS, em /var/www/bebaby-app
npm install
npx prisma generate
npx prisma db push
node scripts/setup-simple.js
npm run build
```

### 6Configurar PM2
```bash
# Instalar PM2 (se não estiver instalado)
npm install -g pm2 Iniciar aplicação
pm2start npm --name "bebaby-app" -- start
pm2 save
pm2 startup
```

## 🎯 Dados de Teste em Produção

Após executar `node scripts/setup-simple.js`, você terá acesso a:

- **👤 Admin:** `admin@bebaby.app` / `admin123`
- **👧 Sugar Baby:** `sugar_baby1xample.com` / `123456- **👨 Sugar Daddy:** `sugar_daddy1xample.com` / `123456## 🔍 Verificações

### Status da aplicação
```bash
pm2 status
pm2s bebaby-app
```

### Testar acesso
```bash
curl http://177.1530.20.1250
```

## 🌐 URLs

- **Aplicação**: http://1770.153.20.1250- **API**: http://177.1530.20.1253000
- **Admin**: http://177.1530.20125:3000dmin

## 🔧 Comandos Úteis

### Reiniciar aplicação
```bash
pm2 restart bebaby-app
```

### Ver logs em tempo real
```bash
pm2 logs bebaby-app --lines 100`

### Parar aplicação
```bash
pm2p bebaby-app
```

### Atualizar código (novo deploy)
```bash
# 1. Enviar novos arquivos
scp -r . root@177.1530.20.125var/www/bebaby-app/

#2No VPS
cd /var/www/bebaby-app
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart bebaby-app
```

## 🎉 Simplificações Implementadas

### ✅ **Deploy Simplificado**
- Menos variáveis de ambiente
- Setup automático com usuários de teste
- Sem configurações complexas de email/pagamentos
- Foco nas funcionalidades principais

### ✅ **Configuração Rápida**
- Banco de dados simples
- Autenticação direta
- Sem verificação de email
- Usuários prontos para teste

## ⚠️ Configurações Opcionais (Para o Futuro)

Após o deploy inicial, você pode adicionar:

1. **Stripe**: Para pagamentos premium
2**Email (SendGrid)**: Para notificações
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
# Verificar o que está usando a porta300stat -tulpn | grep :3000

# Matar processo se necessário
kill-9 <PID>
```

### Erro de permissões
```bash
# Dar permissões ao diretório
chown -R root:root /var/www/bebaby-app
chmod -R 755var/www/bebaby-app
```

### Erro de setup
```bash
# Executar setup novamente
node scripts/setup-simple.js

# Verificar logs
pm2s bebaby-app
```

## 🚀 Benefícios do Deploy Simplificado

- **Deploy Mais Rápido** - Menos configurações
- **Menos Erros** - Processo mais simples
- **Teste Imediato** - Usuários prontos
- **Manutenção Fácil** - Estrutura clara

---

**Deploy simplificado para desenvolvimento rápido!** 🚀 