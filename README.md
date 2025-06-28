# Bebaby App - Plataforma de Relacionamento Sugar Baby/Sugar Daddy

Uma plataforma moderna e segura para conectar Sugar Babies e Sugar Daddies, desenvolvida com Next.js, React, TypeScript e Firebase.

## 🚀 Características

### ✨ Funcionalidades Principais
- **Sistema de Perfis Avançado**: Perfis detalhados com fotos, informações pessoais e preferências
- **Sistema de Mensagens**: Chat em tempo real com notificações push
- **Sistema Premium**: Planos pagos com recursos exclusivos
- **Sistema de Busca**: Filtros avançados por localização, idade, interesses
- **Sistema de Moderação**: Moderação ativa de conteúdo e usuários
- **Sistema de Denúncias**: Relatórios de usuários inadequados
- **Blog Integrado**: Conteúdo educativo e dicas de relacionamento
- **Sistema de Eventos**: Organização de encontros e eventos
- **Sistema de Avaliações**: Feedback entre usuários
- **Sistema de Favoritos**: Lista de usuários favoritos
- **Sistema de Bloqueio**: Controle de interações indesejadas

### 🔒 Segurança
- Autenticação segura com Firebase Auth
- Verificação de email
- Moderação ativa de conteúdo
- Sistema de denúncias
- Proteção contra spam e bots
- Criptografia de dados sensíveis

### 💎 Recursos Premium
- Mensagens ilimitadas
- Ver quem visitou seu perfil
- Perfil em destaque
- Filtros avançados de busca
- Suporte prioritário
- Recursos exclusivos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React com App Router
- **React 18**: Biblioteca de interface
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework CSS utilitário
- **Lucide React**: Ícones modernos
- **React Hook Form**: Gerenciamento de formulários
- **React Hot Toast**: Notificações toast

### Backend
- **Firebase**: Autenticação, banco de dados e storage
- **Firestore**: Banco de dados NoSQL
- **Firebase Auth**: Autenticação de usuários
- **Firebase Storage**: Armazenamento de arquivos
- **Stripe**: Processamento de pagamentos
- **Brevo**: Serviço de email

### DevOps & Qualidade
- **ESLint**: Linting de código
- **Prettier**: Formatação de código
- **Jest**: Testes unitários
- **Playwright**: Testes E2E
- **Husky**: Git hooks
- **Vercel**: Deploy e hosting

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Firebase
- Conta Stripe (para pagamentos)
- Conta Brevo (para emails)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/bebaby-app.git
cd bebaby-app
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Brevo (Email Service)
BREVO_API_KEY=your_brevo_api_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Admin Credentials
ADMIN_EMAIL=admin@bebaby.app
ADMIN_PASSWORD=admin123

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Bebaby App
NEXT_PUBLIC_APP_DESCRIPTION=Conectando Sugar Babies e Sugar Daddies

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### 4. Configure o Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication, Firestore e Storage
3. Configure as regras de segurança do Firestore
4. Adicione as credenciais ao arquivo `.env.local`

### 5. Execute o projeto
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

## 🧪 Testes

### Testes Unitários
```bash
# Executar todos os testes
npm test

# Executar em modo watch
npm run test:watch

# Executar com cobertura
npm run test:coverage
```

### Testes E2E
```bash
# Instalar Playwright
npx playwright install

# Executar testes E2E
npm run test:e2e
```

## 📁 Estrutura do Projeto

```
bebaby-app/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # APIs do backend
│   ├── admin/             # Dashboard administrativo
│   ├── blog/              # Sistema de blog
│   ├── contact/           # Página de contato
│   ├── events/            # Sistema de eventos
│   ├── explore/           # Exploração de perfis
│   ├── help/              # Central de ajuda
│   ├── login/             # Página de login
│   ├── messages/          # Sistema de mensagens
│   ├── notifications/     # Sistema de notificações
│   ├── payment/           # Sistema de pagamento
│   ├── premium/           # Páginas premium
│   ├── profile/           # Sistema de perfis
│   ├── register/          # Página de registro
│   ├── reset-password/    # Recuperação de senha
│   ├── search/            # Sistema de busca
│   ├── verify-email/      # Verificação de email
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
├── contexts/              # Contextos React
├── hooks/                 # Custom hooks
├── lib/                   # Bibliotecas e configurações
├── __tests__/             # Testes automatizados
├── public/                # Arquivos estáticos
└── docs/                  # Documentação
```

## 🔧 Configuração do Firebase

### Regras do Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Outros usuários podem ver perfis
    }
    
    // Mensagens apenas entre usuários autenticados
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || 
         resource.data.receiverId == request.auth.uid);
    }
    
    // Outras regras específicas...
  }
}
```

### Regras do Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- **Netlify**: Similar ao Vercel
- **Railway**: Para aplicações full-stack
- **DigitalOcean**: Para mais controle

## 📊 Monitoramento

### Analytics
- Google Analytics 4
- Firebase Analytics
- Vercel Analytics

### Logs
- Vercel Function Logs
- Firebase Functions Logs
- Sentry (opcional)

## 🔒 Segurança

### Implementado
- ✅ Autenticação segura
- ✅ Verificação de email
- ✅ Rate limiting
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ HTTPS obrigatório
- ✅ Headers de segurança
- ✅ CORS configurado

### Recomendações
- Implementar 2FA
- Adicionar captcha
- Monitoramento de fraudes
- Backup automático
- Auditoria de segurança

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@bebaby.app
- **Documentação**: [docs.bebaby.app](https://docs.bebaby.app)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/bebaby-app/issues)

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Firebase](https://firebase.google.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Vercel](https://vercel.com/) - Deploy e hosting
- [Stripe](https://stripe.com/) - Processamento de pagamentos

---

**Bebaby App** - Conectando pessoas, criando relacionamentos especiais 💕 #   U p d a t e d   a t   S a t ,   J u n   2 8 ,   2 0 2 5   1 1 : 1 1 : 2 6   A M  
 