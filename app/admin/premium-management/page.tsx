'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface PremiumUser {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  premiumExpiry?: string;
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
  const [activeTab, setActiveTab] = useState<'users' | 'features'>('users');
  const [featureConfig, setFeatureConfig] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'features') {
      fetchFeatureConfig();
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div className="flex gap-4 mb-8 border-b">
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'users' ? 'border-b-2 border-pink-600 text-pink-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('users')}
          >
            Usuários Premium
          </button>
          <button
            className={`px-4 py-2 font-semibold ${activeTab === 'features' ? 'border-b-2 border-pink-600 text-pink-700' : 'text-gray-600'}`}
            onClick={() => setActiveTab('features')}
          >
            Funções
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
                              <span className="font-bold text-gray-900">{user.name}</span>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Gratuito</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Premium</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">VIP</th>
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
      </div>
    </div>
  );
} 