import fs from 'fs';
import path from 'path';

interface EmailConfig {
  from: string;
  apiKey: string;
}

interface EmailTemplate {
  name: string;
  templateId: string;
  enabled: boolean;
  testEmail?: string;
  testData?: Record<string, any>;
}

interface EmailSettings {
  config: EmailConfig;
  templates: Record<string, EmailTemplate>;
}

class EmailConfigService {
  private static instance: EmailConfigService;
  private settings: EmailSettings | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'email.json');
  }

  static getInstance(): EmailConfigService {
    if (!EmailConfigService.instance) {
      EmailConfigService.instance = new EmailConfigService();
    }
    return EmailConfigService.instance;
  }

  private loadConfig(): EmailSettings {
    if (this.settings) {
      return this.settings;
    }

    // Primeiro, tenta carregar do .env (prioridade)
    const envConfig = this.loadFromEnv();
    
    // Depois, tenta carregar do JSON (fallback)
    const jsonConfig = this.loadFromJson();

    // Combina as configurações, dando prioridade ao .env
    this.settings = {
      config: {
        from: envConfig.from || jsonConfig.config.from || 'no-reply@bebaby.app',
        apiKey: envConfig.apiKey || jsonConfig.config.apiKey || ''
      },
      templates: {
        ...jsonConfig.templates,
        // Sobrescreve com templates do .env apenas se tiverem templateId válido
        ...Object.fromEntries(
          Object.entries(envConfig.templates).filter(([key, template]) => template.templateId)
        )
      }
    };

    return this.settings!;
  }

  private loadFromEnv(): { from: string; apiKey: string; templates: Record<string, EmailTemplate> } {
    const from = process.env.EMAIL_FROM || process.env.SENDGRID_FROM || '';
    const apiKey = process.env.SENDGRID_API_KEY || '';
    
    // Templates básicos do .env (se necessário)
    const templates: Record<string, EmailTemplate> = {
      'email-confirmation': {
        name: 'Confirmação de E-mail',
        templateId: process.env.SENDGRID_CONFIRMATION_TEMPLATE_ID || '',
        enabled: true,
        testEmail: process.env.EMAIL_TEST_ADDRESS || '',
        testData: {
          nome: 'Usuário Teste',
          link_confirmacao: process.env.NEXT_PUBLIC_APP_URL + '/confirm'
        }
      }
    };

    return { from, apiKey, templates };
  }

  private loadFromJson(): EmailSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const configFile = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(configFile);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configuração JSON:', error);
    }

    // Configuração padrão se não encontrar arquivo
    return {
      config: {
        from: 'no-reply@bebaby.app',
        apiKey: ''
      },
      templates: {
        'email-confirmation': {
          name: 'Confirmação de E-mail',
          templateId: '',
          enabled: true,
          testEmail: '',
          testData: {
            nome: 'Usuário Teste',
            link_confirmacao: 'https://bebaby.app/confirm'
          }
        }
      }
    };
  }

  getConfig(): EmailConfig {
    return this.loadConfig().config;
  }

  getTemplate(slug: string): EmailTemplate | null {
    const templates = this.loadConfig().templates;
    return templates[slug] || null;
  }

  isTemplateEnabled(slug: string): boolean {
    const template = this.getTemplate(slug);
    return template ? template.enabled : false;
  }

  getAllTemplates(): Record<string, EmailTemplate> {
    return this.loadConfig().templates;
  }

  // Método para recarregar configuração (útil se o arquivo for modificado)
  reload(): void {
    this.settings = null;
    this.loadConfig();
  }

  // Método para verificar se a configuração está válida
  isValid(): boolean {
    const config = this.getConfig();
    return !!(config.from && config.apiKey);
  }

  // Método para obter informações de debug
  getDebugInfo(): any {
    const config = this.getConfig();
    const templates = this.getAllTemplates();
    
    return {
      configExists: !!(config.from && config.apiKey),
      fromEmail: config.from,
      hasApiKey: !!config.apiKey,
      apiKeyLength: config.apiKey.length,
      templatesCount: Object.keys(templates).length,
      templates: Object.keys(templates).map(key => ({
        slug: key,
        enabled: templates[key].enabled,
        hasTemplateId: !!templates[key].templateId
      }))
    };
  }
}

export const emailConfig = EmailConfigService.getInstance(); 