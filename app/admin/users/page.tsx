'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  email: string
  userType: string
  birthdate: string
  city: string
  state: string
  ativo: boolean
  premium: boolean
  createdAt: string
  signupIp?: string
  ipLocation?: string
  lookingFor?: string
  verified?: boolean
  lastActive?: string
  isAdmin?: boolean
  emailVerified?: boolean
  premiumExpiry?: string
  photoCount?: number
  messageCount?: number
  interestCount?: number
  reportCount?: number
  profileViewCount?: number
  viewedByCount?: number
  mainPhoto?: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumDays, setPremiumDays] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      console.log('🔍 Buscando usuários...')
      const response = await fetch('/api/admin/premium-users')
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro na resposta:', errorData)
        throw new Error(`Erro ao buscar usuários: ${errorData.error || response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📊 Dados recebidos:', data)
      console.log('👥 Número de usuários:', data.users?.length || 0)
      
      // Adaptar para o formato esperado pela interface User
      const realUsers: User[] = (data.users || []).map((u: any) => ({
        id: u.id,
        username: u.username || 'Usuário',
        email: u.email || '',
        userType: u.userType || 'sugar_baby',
        birthdate: u.birthdate || '',
        city: u.city || '',
        state: u.state || '',
        ativo: u.ativo !== undefined ? u.ativo : true,
        premium: u.premium || false,
        createdAt: u.createdAt || '',
        signupIp: u.signupIp,
        ipLocation: u.ipLocation,
        lookingFor: u.lookingFor,
        verified: u.verified,
        lastActive: u.lastActive,
        isAdmin: u.isAdmin,
        emailVerified: u.emailVerified,
        premiumExpiry: u.premiumExpiry,
        photoCount: u.photoCount,
        messageCount: u.messageCount,
        interestCount: u.interestCount,
        reportCount: u.reportCount,
        profileViewCount: u.profileViewCount,
        viewedByCount: u.viewedByCount,
        mainPhoto: u.mainPhoto
      }))
      
      console.log('✅ Usuários formatados:', realUsers.length)
      setUsers(realUsers)
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const actionKey = `toggle-status-${userId}`
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }))
    
    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: currentStatus ? 'block' : 'unblock',
          adminNotes: currentStatus ? 'Usuário bloqueado por admin' : 'Usuário desbloqueado por admin'
        })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ativo: !currentStatus } : user
        ))
        toast.success(`Usuário ${currentStatus ? 'bloqueado' : 'desbloqueado'} com sucesso`)
      } else {
        toast.error('Erro ao alterar status do usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao alterar status do usuário')
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleTogglePremium = async (userId: string, currentPremium: boolean) => {
    if (!currentPremium) {
      // Se for ativar premium, abrir modal
      setSelectedUserId(userId)
      setShowPremiumModal(true)
      return
    }
    
    // Desativar premium normalmente
    const actionKey = `toggle-premium-${userId}`
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }))
    
    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'deactivate_premium',
          adminNotes: 'Premium desativado por admin'
        })
      })
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, premium: false } : user
        ))
        toast.success('Status premium desativado com sucesso')
      } else {
        toast.error('Erro ao alterar status premium')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao alterar status premium')
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleActivatePremium = async () => {
    // Validação robusta
    if (!selectedUserId) {
      toast.error('Usuário não selecionado')
      return
    }
    
    if (!premiumDays.trim()) {
      toast.error('Digite um número válido de dias')
      return
    }

    const dias = parseInt(premiumDays, 10)
    if (isNaN(dias)) {
      toast.error('Digite um número válido')
      return
    }
    
    if (dias <= 0) {
      toast.error('Dias deve ser maior que zero')
      return
    }
    
    if (dias > 365) {
      toast.error('Dias deve ser no máximo 365')
      return
    }

    const actionKey = `activate-premium-${selectedUserId}`
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }))

    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          action: 'activate_premium',
          adminNotes: 'Premium ativado por admin',
          days: dias,
        })
      })
      
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === selectedUserId ? { ...user, premium: true } : user
        ))
        toast.success('Status premium ativado com sucesso')
        setShowPremiumModal(false)
        setPremiumDays('')
        setSelectedUserId(null)
      } else {
        toast.error('Erro ao alterar status premium')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao alterar status premium')
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível!')) { return }

    const actionKey = `delete-user-${userId}`
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }))

    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          adminNotes: 'Usuário excluído por admin'
        })
      })

      if (response.ok) {
        // Remover usuário da lista local
        setUsers(prev => prev.filter(user => user.id !== userId))
        toast.success('Usuário excluído permanentemente com sucesso')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao excluir usuário')
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && user.ativo) ||
                         (filterType === 'blocked' && !user.ativo) ||
                         (filterType === 'premium' && user.premium) ||
                         (filterType === 'sugar_baby' && user.userType === 'sugar_baby') ||
                         (filterType === 'sugar_daddy' && user.userType === 'sugar_daddy')

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p className="text-gray-600 mt-2">Gerencie todos os usuários da plataforma</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/search-users'}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
          aria-label="Buscar TONYY"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscar TONYY
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-600 text-gray-900 placeholder:text-gray-700"
              aria-label="Buscar usuário"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-600 text-gray-900 placeholder:text-gray-700"
              aria-label="Filtrar usuários"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
              <option value="premium">Premium</option>
              <option value="sugar_baby">Sugar Baby</option>
              <option value="sugar_daddy">Sugar Daddy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-2 border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização do IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buscando
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <a 
                        href={`/profile/${user.id}`}
                        className="font-bold text-blue-600 hover:text-blue-800 hover:underline focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver perfil de ${user.username}`}
                      >
                        @{user.username}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.signupIp || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.ipLocation || <IpLocationLoader ip={user.signupIp || null} />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.userType === 'sugar_baby' 
                        ? 'bg-pink-100 text-pink-800' 
                        : user.userType === 'sugar_daddy'
                        ? 'bg-blue-100 text-blue-800'
                        : user.userType === 'sugar_mommy'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.userType === 'sugar_baby' ? 'Sugar Baby' : 
                       user.userType === 'sugar_daddy' ? 'Sugar Daddy' :
                       user.userType === 'sugar_mommy' ? 'Sugar Mommy' :
                       user.userType === 'sugar_babyboy' ? 'Sugar Babyboy' : user.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.lookingFor === 'male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : user.lookingFor === 'female'
                        ? 'bg-pink-100 text-pink-800'
                        : user.lookingFor === 'both'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.lookingFor === 'male' ? 'Homens' : 
                       user.lookingFor === 'female' ? 'Mulheres' :
                       user.lookingFor === 'both' ? 'Ambos' : 
                       user.lookingFor || 'Não informado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.city}, {user.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.ativo ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.premium 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.premium ? 'Premium' : 'Gratuito'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.ativo)}
                        disabled={loadingActions[`toggle-status-${user.id}`]}
                        className={`text-xs px-2 sm:px-3 py-1 rounded-md flex items-center gap-1 ${
                          user.ativo 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50'
                        } focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none`}
                        aria-label={user.ativo ? 'Bloquear usuário' : 'Desbloquear usuário'}
                      >
                        {loadingActions[`toggle-status-${user.id}`] ? (
                          <>
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            Processando...
                          </>
                        ) : (
                          user.ativo ? 'Bloquear' : 'Desbloquear'
                        )}
                      </button>
                      <button
                        onClick={() => handleTogglePremium(user.id, user.premium)}
                        disabled={loadingActions[`toggle-premium-${user.id}`]}
                        className={`text-xs px-2 sm:px-3 py-1 rounded-md flex items-center gap-1 ${
                          user.premium 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50'
                        } focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none`}
                        aria-label={user.premium ? 'Remover Premium' : 'Tornar Premium'}
                      >
                        {loadingActions[`toggle-premium-${user.id}`] ? (
                          <>
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            Processando...
                          </>
                        ) : (
                          user.premium ? 'Remover Premium' : 'Tornar Premium'
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={loadingActions[`delete-user-${user.id}`]}
                        className="text-xs px-2 sm:px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 flex items-center gap-1 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                        aria-label="Excluir usuário"
                      >
                        {loadingActions[`delete-user-${user.id}`] ? (
                          <>
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                            Excluindo...
                          </>
                        ) : (
                          'Excluir'
                        )}
                      </button>
                      <button
                        onClick={() => window.location.href = `/admin/users/${user.id}`}
                        className="text-xs px-2 sm:px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                        aria-label="Editar usuário"
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum usuário encontrado.</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total: {filteredUsers.length} usuário(s)
      </div>

      {/* Modal para Ativar Premium */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ativar Premium
              </h3>
              <button
                onClick={() => {
                  setShowPremiumModal(false)
                  setPremiumDays('')
                  setSelectedUserId(null)
                }}
                className="text-gray-400 hover:text-gray-600 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                aria-label="Fechar modal de ativar premium"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantos dias de premium?
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={premiumDays}
                onChange={(e) => setPremiumDays(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleActivatePremium()
                  }
                }}
                placeholder="Ex: 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-500 text-gray-900 placeholder:text-gray-700"
                autoFocus
                aria-label="Digite o número de dias de premium"
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite um número entre 1 e 365 dias
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleActivatePremium}
                disabled={!!selectedUserId && loadingActions[`activate-premium-${selectedUserId}`]}
                className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="Ativar premium"
              >
                {!!selectedUserId && loadingActions[`activate-premium-${selectedUserId}`] ? (
                  <>
                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Ativando...
                  </>
                ) : (
                  'Ativar Premium'
                )}
              </button>
              <button
                onClick={() => {
                  setShowPremiumModal(false)
                  setPremiumDays('')
                  setSelectedUserId(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Cancelar ativação de premium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function IpLocationLoader({ ip }: { ip: string | null }) {
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    if (!ip) return;
    fetch(`https://ipapi.co/${ip}/json/`)
      .then(res => res.json())
      .then(data => {
        if (data && data.city && data.region && data.country_name) {
          setLocation(`${data.city}, ${data.region}, ${data.country_name}`);
        } else if (data && data.country_name) {
          setLocation(data.country_name);
        } else {
          setLocation('Desconhecido');
        }
      })
      .catch(() => setLocation('Desconhecido'));
  }, [ip]);

  if (!ip) return <span>-</span>;
  if (!location) return <span className="text-gray-400">Carregando...</span>;
  return <span>{location}</span>;
} 