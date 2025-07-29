const fs = require('fs');
const crypto = require('crypto');

// Gerar chave secreta aleatória
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Conteúdo do arquivo .env.local
const envContent = `# 🍯 Bebaby App - Configuração de Produção

# =============================================================================
# BANCO DE DADOS
# =============================================================================
DATABASE_URL="postgresql://bebaby_user:Maria#01@localhost:5432/bebaby_db"

# =============================================================================
# AUTENTICAÇÃO (Segura)
# =============================================================================
NEXTAUTH_SECRET="${generateSecret()}"
NEXTAUTH_URL="http://177.153.20.125:3000"

# =============================================================================
# APLICAÇÃO
# =============================================================================
NEXT_PUBLIC_APP_URL="http://177.153.20.125:3000"
NEXT_PUBLIC_APP_NAME="Bebaby App"
NEXT_PUBLIC_APP_DESCRIPTION="Conectando Sugar Babies e Sugar Daddies"

# =============================================================================
# AMBIENTE
# =============================================================================
NODE_ENV="production"

# =============================================================================
# ADMIN (Configurações Seguras)
# =============================================================================
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# =============================================================================
# SEGURANÇA
# =============================================================================
# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"

# =============================================================================
# CONFIGURAÇÕES OPCIONAIS (Para o futuro)
# =============================================================================

# Stripe (Pagamentos) - Configurar quando necessário
# STRIPE_SECRET_KEY="sk_test_..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SendGrid) - Configurar quando necessário
# SENDGRID_API_KEY="SG..."
# EMAIL_FROM="no-reply@bebaby.app"

# =============================================================================
# LOGS
# =============================================================================
LOG_LEVEL="info"
ENABLE_SECURITY_LOGS=true
`;

// Criar arquivo .env.local
try {
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('🔐 Chave secreta gerada automaticamente');
  console.log('📋 Configure as credenciais do banco de dados se necessário');
} catch (error) {
  console.error('❌ Erro ao criar .env.local:', error);
} 