# 🚀 Início Rápido - Bebaby App Simplificado

## ⚡ Setup em5Minutos

###1 **Clone e Instale**
```bash
git clone https://github.com/seu-usuario/bebaby-app.git
cd bebaby-app
npm install
```

### 2. **Configure o Banco**
```bash
# Instalar PostgreSQL (se não tiver)
# Ubuntu: sudo apt install postgresql
# macOS: brew install postgresql

# Criar banco
sudo -u postgres psql
CREATE DATABASE bebaby_db;
CREATE USER bebaby_user WITH PASSWORD '123456
GRANT ALL PRIVILEGES ON DATABASE bebaby_db TO bebaby_user;
\q
```

### 3. **Configure o Ambiente**
```bash
cp env.example .env.local
```

Edite `.env.local`:
```env
DATABASE_URL="postgresql://bebaby_user:123456localhost:5432ebaby_db"
NEXTAUTH_SECRET=minha-chave-secreta-123NEXTAUTH_URL=http://localhost:3000EXT_PUBLIC_APP_URL=http://localhost:300``

### 4. **Setup Automático**
```bash
npx prisma generate
npx prisma db push
node scripts/setup-simple.js
```

###5**Inicie o Projeto**
```bash
npm run dev
```

Acesse: http://localhost:300# 🎯 Dados de Teste

Após o setup, você terá acesso a:

- **👤 Admin:** `admin@bebaby.app` / `admin123`
- **👧 Sugar Baby:** `sugar_baby1xample.com` / `123456- **👨 Sugar Daddy:** `sugar_daddy1xample.com` / `123456`

## 🎉 Funcionalidades Disponíveis

### ✅ **Funcionalidades Principais**
- ✅ Login/Registro direto
- ✅ Perfis de usuário
- ✅ Upload de fotos
- ✅ Sistema de mensagens
- ✅ Busca de usuários
- ✅ Painel admin

### 🚀 **Próximas Funcionalidades**
- Sistema de likes
- Notificações
- Pagamentos premium
- Blog integrado

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Servidor de produção

# Banco de dados
npx prisma studio        # Interface visual do banco
npx prisma db push       # Sincronizar schema
node scripts/setup-simple.js  # Recriar dados de teste
```

## 🆘 Problemas Comuns

### Erro de conexão com banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Reiniciar se necessário
sudo systemctl restart postgresql
```

### Erro de setup
```bash
# Executar setup novamente
node scripts/setup-simple.js
```

### Erro de autenticação
```bash
# Verificar variáveis de ambiente
cat .env.local

# Testar com usuários de teste
# admin@bebaby.app / admin123
```

## 📁 Estrutura Simplificada

```
bebaby-app/
├── app/                    # Next.js App Router
│   ├── api/               # APIs simplificadas
│   ├── admin/             # Painel admin
│   ├── profile/           # Perfis
│   ├── messages/          # Mensagens
│   └── explore/           # Busca
├── components/            # Componentes React
├── lib/                   # Utilitários
│   ├── auth-simple.ts     # Auth simplificada
│   └── prisma.ts          # Cliente Prisma
├── prisma/                # Schema do banco
├── scripts/               # Scripts de setup
└── public/                # Arquivos estáticos
```

## 🎯 Próximos Passos

1Teste as funcionalidades básicas**
2rsonalize o design**
3. **Adicione novas funcionalidades**
4. **Configure para produção**

## 🚀 Deploy Rápido

```bash
# VPS básico
curl -fsSL https://deb.nodesource.com/setup_18 | sudo -E bash -
sudo apt-get install -y nodejs postgresql
npm install -g pm2

# Deploy
npm run build
pm2start npm --name "bebaby-app" -- start
```

---

**Pronto para desenvolvimento!** 🚀 