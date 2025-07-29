'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface PremiumUser {
  id: string;
  email: string;
  username: string;
  isPremium: boolean;
  premiumExpiry?: string;
  createdAt: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  features: any;
  isActive: boolean;
  createdAt: string;
}

interface PaymentLink {
  id: string;
  name: string;
  description: string;
  link: string;
  planId: string;
  plan: { id: string; name: string };
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  expiresAt?: string;
  createdAt: string;
}

const PREMIUM_FEATURES = [
  { key: 'messagesPerDay', label: 'Mensagens por dia', hasLimit: true },
  { key: 'selfDestructMessages', label: 'Mensagens autodestrutivas' },
  { key: 'sendFiles', label: 'Enviar arquivos no chat' },
  { key: 'privateStories', label: 'Enviar stories privados' },
  { key: 'invisibleMode', label: 'Modo invisível' },
  { key: 'profileViews', label: 'Ver quem visitou seu perfil' },
  { key: 'profileLikes', label: 'Ver quem curtiu/favoritou seu perfil' },
  { key: 'onlineStatus', label: 'Ver status online/último acesso' },
  { key: 'hideOnlineStatus', label: 'Ocultar seu status online/último acesso' },
  { key: 'requestSocialAccess', label: 'Solicitar acesso a redes sociais privadas' },
  { key: 'grantSocialAccess', label: 'Liberar acesso às redes sociais privadas' },
  { key: 'secretCrush', label: 'Crush secreto (ver quem te deu crush)' },
  { key: 'advancedFilters', label: 'Filtros avançados de busca' },
  { key: 'profileHighlight', label: 'Destaque de perfil' },
  { key: 'exploreHighlight', label: 'Destaque na busca/explore' },
  { key: 'internationalProfiles', label: 'Ver perfis internacionais' },
  { key: 'privatePhotos', label: 'Solicitar/ver fotos privadas' },
  { key: 'premiumBlog', label: 'Acesso a blog premium/conteúdos exclusivos' },
  { key: 'exclusiveEvents', label: 'Acesso a eventos exclusivos' },
  { key: 'earlyAccess', label: 'Acesso antecipado a novidades' },
  { key: 'travelMode', label: 'Modo viagem' },
  { key: 'scheduleEvents', label: 'Agendar encontros/eventos' },
  { key: 'prioritySupport', label: 'Suporte prioritário' },
  { key: 'blockLimit', label: 'Limite maior de bloqueios' },
  { key: 'pauseProfile', label: 'Possibilidade de pausar o perfil' },
  { key: 'vipBadge', label: 'Badge de verificação VIP/Premium' },
  { key: 'profileStats', label: 'Ver estatísticas do perfil' },
];

export default function PremiumManagementPage() {
  const [users, setUsers] = useState<PremiumUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'premium' | 'non-premium'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'features' | 'planos' | 'pagamentos' | 'liberacao-manual'>('users');
  const [featureConfig, setFeatureConfig] = useState<any>({});
  
  // Estados para planos
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'BRL',
    duration: '30',
    features: [],
    isActive: true
  });
  
  // Estados para links de pagamento
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [newLink, setNewLink] = useState({
    name: '',
    description: '',
    link: '',
    planId: '',
    maxUses: '',
    expiresAt: ''
  });
  
  // Estados para liberação manual
  const [manualActivation, setManualActivation] = useState({
    userId: '',
    planId: '',
    reason: '',
    duration: '30',
    adminNotes: ''
  });
  
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'features') {
      fetchFeatureConfig();
    } else if (activeTab === 'planos') {
      fetchPlans();
    } else if (activeTab === 'pagamentos') {
      fetchPaymentLinks();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/premium-users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatureConfig = async () => {
    try {
      const res = await fetch('/api/admin/premium-settings');
      if (res.ok) {
        const data = await res.json();
        setFeatureConfig(data.features || {});
      }
    } catch (e) {
      toast.error('Erro ao carregar configurações premium');
    }
  };

  const saveFeatureConfig = async () => {
    try {
      const res = await fetch('/api/admin/premium-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(featureConfig),
      });
      if (res.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar configurações');
      }
    } catch (e) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const togglePremiumStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/toggle-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isPremium: !currentStatus,
        }),
      });

      if (response.ok) {
        await fetchUsers(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao alterar status premium:', error);
    }
  };

  // Funções para planos
  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/planos');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar planos');
    }
  };

  const createPlan = async () => {
    try {
      const response = await fetch('/api/admin/planos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan)
      });
      if (response.ok) {
        toast.success('Plano criado com sucesso!');
        setShowCreatePlan(false);
        setNewPlan({
          name: '',
          description: '',
          price: '',
          currency: 'BRL',
          duration: '30',
          features: [],
          isActive: true
        });
        fetchPlans();
      }
    } catch (error) {
      toast.error('Erro ao criar plano');
    }
  };

  // Funções para links de pagamento
  const fetchPaymentLinks = async () => {
    try {
      const response = await fetch('/api/admin/payments/links');
      if (response.ok) {
        const data = await response.json();
        setPaymentLinks(data);
      }
    } catch (error) {
      console.error('Erro ao buscar links de pagamento:', error);
      toast.error('Erro ao carregar links de pagamento');
    }
  };

  const createPaymentLink = async () => {
    try {
      const response = await fetch('/api/admin/payments/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink)
      });
      if (response.ok) {
        toast.success('Link de pagamento criado com sucesso!');
        setShowCreateLink(false);
        setNewLink({
          name: '',
          description: '',
          link: '',
          planId: '',
          maxUses: '',
          expiresAt: ''
        });
        fetchPaymentLinks();
      }
    } catch (error) {
      toast.error('Erro ao criar link de pagamento');
    }
  };

  const togglePaymentLink = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/payments/links/${linkId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });
      if (response.ok) {
        toast.success('Status do link atualizado!');
        fetchPaymentLinks();
      }
    } catch (error) {
      toast.error('Erro ao atualizar status do link');
    }
  };

  // Funções para liberação manual
  const activateManualAccess = async () => {
    try {
      const response = await fetch('/api/admin/manual-activations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualActivation)
      });
      if (response.ok) {
        toast.success('Acesso premium ativado com sucesso!');
        setManualActivation({
          userId: '',
          planId: '',
          reason: '',
          duration: '30',
          adminNotes: ''
        });
      }
    } catch (error) {
      toast.error('Erro ao ativar acesso premium');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'premium') { return matchesSearch && user.isPremium }
    if (filter === 'non-premium') { return matchesSearch && !user.isPremium }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciamento Premium</h1>
              <p className="mt-2 text-gray-600">Gerencie o status premium dos usuários</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b overflow-x-auto">
          <button
            className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-pink-600 text-pink-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('users')}
          >
            Usuários Premium
          </button>
          <button
            className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'features' ? 'border-b-2 border-pink-600 text-pink-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('features')}
          >
            Funções
          </button>
          <button
            className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'planos' ? 'border-b-2 border-pink-600 text-pink-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('planos')}
          >
            Gerenciar Planos
          </button>
          <button
            className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'pagamentos' ? 'border-b-2 border-pink-600 text-pink-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('pagamentos')}
          >
            Pagamentos
          </button>
          <button
            className={`px-4 py-2 font-semibold whitespace-nowrap ${activeTab === 'liberacao-manual' ? 'border-b-2 border-pink-600 text-pink-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('liberacao-manual')}
          >
            Liberação Manual
          </button>
        </div>

        {activeTab === 'users' && (
          <div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Usuários Premium</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.isPremium).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.length > 0 ? Math.round((users.filter(u => u.isPremium).length / users.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 px-4 py-6 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar usuário
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por status
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="premium">Premium</option>
                <option value="non-premium">Não Premium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expira em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                        <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">{user.username}</span>
                              <span className="text-xs text-gray-500 mt-1">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                            {user.isPremium ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Premium</span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Gratuito</span>
                            )}
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                        {user.premiumExpiry ? new Date(user.premiumExpiry).toLocaleDateString('pt-BR') : '-'}
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePremiumStatus(user.id, user.isPremium)}
                              className={`text-xs px-3 py-1 rounded-md ${user.isPremium ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                        >
                              {user.isPremium ? 'Remover Premium' : 'Tornar Premium'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filter !== 'all' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Não há usuários cadastrados ainda.'}
                </p>
              </div>
            )}
          </div>
        </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Configuração de Funções Premium/VIP</h2>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
              <strong>Como funciona:</strong> Cada função só pode ser marcada como Gratuito, Premium ou VIP.<br />
              <strong>VIP</strong> sempre herda todas as funções do Premium.<br />
              Use os botões abaixo para selecionar todas as funções para uma categoria de uma vez.
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Gratuito
                      <button
                        className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                        onClick={() => {
                          setFeatureConfig((prev: any) => {
                            const novo = { ...prev };
                            PREMIUM_FEATURES.forEach(f => { novo[f.key] = 'free'; });
                            return novo;
                          });
                        }}
                        type="button"
                      >Selecionar tudo</button>
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Premium
                      <button
                        className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs hover:bg-pink-200"
                        onClick={() => {
                          setFeatureConfig((prev: any) => {
                            const novo = { ...prev };
                            PREMIUM_FEATURES.forEach(f => { novo[f.key] = 'premium'; });
                            return novo;
                          });
                        }}
                        type="button"
                      >Selecionar tudo</button>
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      VIP
                      <button
                        className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                        onClick={() => {
                          setFeatureConfig((prev: any) => {
                            const novo = { ...prev };
                            PREMIUM_FEATURES.forEach(f => { novo[f.key] = 'vip'; });
                            return novo;
                          });
                        }}
                        type="button"
                      >Selecionar tudo</button>
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Limite</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {PREMIUM_FEATURES.map((feature) => (
                    <tr key={feature.key}>
                      <td className="px-4 py-2 font-medium text-gray-900">{feature.label}</td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="radio"
                          name={`${feature.key}-access`}
                          checked={featureConfig[feature.key] === 'free'}
                          onChange={() => setFeatureConfig((prev: any) => ({ ...prev, [feature.key]: 'free' }))}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="radio"
                          name={`${feature.key}-access`}
                          checked={featureConfig[feature.key] === 'premium'}
                          onChange={() => setFeatureConfig((prev: any) => ({ ...prev, [feature.key]: 'premium' }))}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="radio"
                          name={`${feature.key}-access`}
                          checked={featureConfig[feature.key] === 'vip'}
                          onChange={() => setFeatureConfig((prev: any) => ({ ...prev, [feature.key]: 'vip' }))}
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        {feature.hasLimit && (
                          <input
                            type="number"
                            min={0}
                            className="w-20 px-2 py-1 border rounded"
                            value={featureConfig[feature.key + '_limit'] || ''}
                            onChange={e => setFeatureConfig((prev: any) => ({ ...prev, [feature.key + '_limit']: e.target.value }))}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold shadow" onClick={saveFeatureConfig}>
                Salvar configurações
              </button>
            </div>
          </div>
        )}

        {/* Aba Gerenciar Planos */}
        {activeTab === 'planos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Planos Premium</h2>
              <button
                onClick={() => setShowCreatePlan(true)}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                + Criar Plano
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Preço:</span>
                      <span className="font-semibold">R$ {plan.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Duração:</span>
                      <span>{plan.duration} dias</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {/* TODO: Implementar delete */}}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {plans.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano criado</h3>
                <p className="text-gray-500 mb-4">Crie seu primeiro plano premium para começar</p>
                <button
                  onClick={() => setShowCreatePlan(true)}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
                >
                  Criar Primeiro Plano
                </button>
              </div>
            )}
          </div>
        )}

        {/* Aba Pagamentos */}
        {activeTab === 'pagamentos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Links de Pagamento</h2>
              <button
                onClick={() => setShowCreateLink(true)}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                + Criar Link
              </button>
            </div>

            <div className="space-y-4">
              {paymentLinks.map((link) => (
                <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{link.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          link.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {link.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{link.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Plano: {link.plan.name}</span>
                        <span>•</span>
                        <span>{link.currentUses} usos</span>
                        {link.maxUses && (
                          <>
                            <span>•</span>
                            <span>Limite: {link.maxUses}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(link.link)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Copiar Link
                      </button>
                      <button
                        onClick={() => togglePaymentLink(link.id, link.isActive)}
                        className={`px-3 py-1 text-xs font-medium rounded ${
                          link.isActive
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {link.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {paymentLinks.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum link de pagamento</h3>
                <p className="text-gray-500 mb-4">Crie links de pagamento para seus planos</p>
                <button
                  onClick={() => setShowCreateLink(true)}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
                >
                  Criar Primeiro Link
                </button>
              </div>
            )}
          </div>
        )}

        {/* Aba Liberação Manual */}
        {activeTab === 'liberacao-manual' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Liberação Manual de Acesso Premium</h2>
            
            <div className="max-w-2xl">
              <div className="space-y-6">
                {/* Buscar Usuário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar Usuário *
                  </label>
                  <input
                    type="text"
                    value={manualActivation.userId}
                    onChange={(e) => setManualActivation(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Email, username ou ID do usuário"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Selecionar Plano */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plano *
                  </label>
                  <select
                    value={manualActivation.planId}
                    onChange={(e) => setManualActivation(prev => ({ ...prev, planId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Selecione um plano</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.price.toFixed(2)} ({plan.duration} dias)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo da Ativação *
                  </label>
                  <select
                    value={manualActivation.reason}
                    onChange={(e) => setManualActivation(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Selecione o motivo</option>
                    <option value="email_payment">Pagamento via Email</option>
                    <option value="promotion">Promoção</option>
                    <option value="support">Suporte ao Cliente</option>
                    <option value="test">Teste</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                {/* Duração */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (dias) *
                  </label>
                  <input
                    type="number"
                    value={manualActivation.duration}
                    onChange={(e) => setManualActivation(prev => ({ ...prev, duration: e.target.value }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionais
                  </label>
                  <textarea
                    value={manualActivation.adminNotes}
                    onChange={(e) => setManualActivation(prev => ({ ...prev, adminNotes: e.target.value }))}
                    rows={3}
                    placeholder="Observações sobre a ativação..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-vertical"
                  />
                </div>

                {/* Botão Ativar */}
                <div>
                  <button
                    onClick={activateManualAccess}
                    disabled={!manualActivation.userId || !manualActivation.planId || !manualActivation.reason}
                    className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Ativar Acesso Premium
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Criação de Plano */}
        {showCreatePlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Criar Novo Plano</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Ex: Premium Mensal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={newPlan.description}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-vertical"
                    placeholder="Descreva os benefícios do plano"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="29.90"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (dias) *
                    </label>
                    <input
                      type="number"
                      value={newPlan.duration}
                      onChange={(e) => setNewPlan(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select
                    value={newPlan.currency}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="BRL">BRL (Real)</option>
                    <option value="USD">USD (Dólar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newPlan.isActive}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Plano ativo
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreatePlan(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createPlan}
                  disabled={!newPlan.name || !newPlan.description || !newPlan.price || !newPlan.duration}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Plano
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Criação de Link de Pagamento */}
        {showCreateLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Criar Link de Pagamento</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={newLink.name}
                    onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Ex: Plano Premium Mensal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={newLink.description}
                    onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-vertical"
                    placeholder="Descreva o que o cliente receberá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plano *
                  </label>
                  <select
                    value={newLink.planId}
                    onChange={(e) => setNewLink(prev => ({ ...prev, planId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Selecione um plano</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.price.toFixed(2)} ({plan.duration} dias)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link de Pagamento *
                  </label>
                  <input
                    type="url"
                    value={newLink.link}
                    onChange={(e) => setNewLink(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="https://checkout.stripe.com/pay/..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limite de Usos (opcional)
                    </label>
                    <input
                      type="number"
                      value={newLink.maxUses}
                      onChange={(e) => setNewLink(prev => ({ ...prev, maxUses: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Expiração (opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newLink.expiresAt}
                      onChange={(e) => setNewLink(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateLink(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createPaymentLink}
                  disabled={!newLink.name || !newLink.description || !newLink.link || !newLink.planId}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 