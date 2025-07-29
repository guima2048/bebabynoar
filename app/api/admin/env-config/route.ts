import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface EnvVariable {
  key: string
  value: string
  description: string
  category: string
  required: boolean
  sensitive: boolean
}

interface EnvConfig {
  variables: EnvVariable[]
  lastUpdated: string
}

// Categorias padrão com variáveis conhecidas
const defaultVariables: EnvVariable[] = [
  // Banco de Dados
  {
    key: 'DATABASE_URL',
    value: '',
    description: 'URL de conexão com o banco de dados PostgreSQL',
    category: 'database',
    required: true,
    sensitive: true
  },
  
  // Autenticação
  {
    key: 'NEXTAUTH_SECRET',
    value: '',
    description: 'Chave secreta para o NextAuth.js',
    category: 'auth',
    required: true,
    sensitive: true
  },
  {
    key: 'NEXTAUTH_URL',
    value: '',
    description: 'URL base da aplicação para o NextAuth.js',
    category: 'auth',
    required: true,
    sensitive: false
  },
  
  // Aplicação
  {
    key: 'NEXT_PUBLIC_APP_URL',
    value: '',
    description: 'URL pública da aplicação',
    category: 'app',
    required: true,
    sensitive: false
  },
  {
    key: 'NEXT_PUBLIC_APP_NAME',
    value: 'Bebaby App',
    description: 'Nome da aplicação',
    category: 'app',
    required: false,
    sensitive: false
  },
  {
    key: 'NEXT_PUBLIC_APP_DESCRIPTION',
    value: 'Conectando Sugar Babies e Sugar Daddies',
    description: 'Descrição da aplicação',
    category: 'app',
    required: false,
    sensitive: false
  },
  
  // E-mail
  {
    key: 'SENDGRID_API_KEY',
    value: '',
    description: 'Chave de API do SendGrid para envio de e-mails',
    category: 'email',
    required: false,
    sensitive: true
  },
  {
    key: 'EMAIL_FROM',
    value: 'no-reply@seudominio.com',
    description: 'E-mail remetente padrão',
    category: 'email',
    required: false,
    sensitive: false
  },

  
  // Pagamentos
  {
    key: 'STRIPE_SECRET_KEY',
    value: '',
    description: 'Chave secreta do Stripe para pagamentos',
    category: 'payment',
    required: false,
    sensitive: true
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    value: '',
    description: 'Chave pública do Stripe para o frontend',
    category: 'payment',
    required: false,
    sensitive: false
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    value: '',
    description: 'Segredo do webhook do Stripe',
    category: 'payment',
    required: false,
    sensitive: true
  },
  
  // Ambiente
  {
    key: 'NODE_ENV',
    value: 'development',
    description: 'Ambiente de execução (development, production, test)',
    category: 'environment',
    required: true,
    sensitive: false
  }
]

function getEnvFilePath(): string {
  // Tenta diferentes locais para o arquivo .env
  const possiblePaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env.development'),
    path.join(process.cwd(), '.env.production')
  ]
  
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      return envPath
    }
  }
  
  // Se não encontrar, usa .env como padrão
  return path.join(process.cwd(), '.env')
}

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {}
  }
  
  const content = fs.readFileSync(filePath, 'utf-8')
  const variables: Record<string, string> = {}
  
  content.split('\n').forEach(line => {
    line = line.trim()
    
    // Ignora comentários e linhas vazias
    if (line.startsWith('#') || !line || !line.includes('=')) {
      return
    }
    
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=')
      
      // Remove aspas se existirem
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      variables[key.trim()] = value.trim()
    }
  })
  
  return variables
}

function generateEnvContent(variables: EnvVariable[]): string {
  const categories = {
    database: 'BANCO DE DADOS',
    auth: 'AUTENTICAÇÃO',
    app: 'APLICAÇÃO',
    email: 'E-MAIL',
    payment: 'PAGAMENTOS',
    environment: 'AMBIENTE'
  }
  
  let content = '# 🍯 Bebaby App - Configurações de Ambiente\n\n'
  
  Object.entries(categories).forEach(([categoryKey, categoryName]) => {
    const categoryVars = variables.filter(v => v.category === categoryKey)
    
    if (categoryVars.length > 0) {
      content += `# =============================================================================\n`
      content += `# ${categoryName}\n`
      content += `# =============================================================================\n`
      
      categoryVars.forEach(variable => {
        if (variable.description) {
          content += `# ${variable.description}\n`
        }
        content += `${variable.key}=${variable.value}\n\n`
      })
    }
  })
  
  return content
}

export async function GET() {
  try {
    const envPath = getEnvFilePath()
    const envVars = parseEnvFile(envPath)
    
    // Combina variáveis padrão com as existentes no arquivo
    const variables: EnvVariable[] = defaultVariables.map(defaultVar => ({
      ...defaultVar,
      value: envVars[defaultVar.key] || defaultVar.value
    }))
    
    // Adiciona variáveis customizadas que não estão na lista padrão
    Object.entries(envVars).forEach(([key, value]) => {
      if (!variables.find(v => v.key === key)) {
        variables.push({
          key,
          value,
          description: 'Variável customizada',
          category: 'environment',
          required: false,
          sensitive: key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')
        })
      }
    })
    
    const config: EnvConfig = {
      variables,
      lastUpdated: fs.existsSync(envPath) 
        ? fs.statSync(envPath).mtime.toISOString()
        : new Date().toISOString()
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao ler configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EnvConfig = await request.json()
    
    if (!body.variables || !Array.isArray(body.variables)) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }
    
    // Valida variáveis obrigatórias
    const requiredVars = body.variables.filter(v => v.required)
    const missingVars = requiredVars.filter(v => !v.value.trim())
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        { 
          error: 'Variáveis obrigatórias não preenchidas',
          missing: missingVars.map(v => v.key)
        },
        { status: 400 }
      )
    }
    
    // Gera conteúdo do arquivo .env
    const envContent = generateEnvContent(body.variables)
    
    // Salva no arquivo .env
    const envPath = getEnvFilePath()
    fs.writeFileSync(envPath, envContent, 'utf-8')
    
    // Retorna configuração atualizada
    const updatedConfig: EnvConfig = {
      variables: body.variables,
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 