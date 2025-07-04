'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string
  username: string
  name?: string
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
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/premium-users')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Erro ao buscar usuários: ${errorData.error || response.statusText}`)
      }
      const data = await response.json()
      // Adaptar para o formato esperado pela interface User
      const realUsers: User[] = (data.users || []).map((u: any) => ({
        id: u.id,
        username: u.username || 'Usuário',
        name: u.name,
        email: u.email || '',
        userType: u.userType || 'sugar_baby',
        birthdate: u.birthdate || '',
        city: u.city || '',
        state: u.state || '',
        ativo: u.ativo !== undefined ? u.ativo : true,
        premium: u.isPremium || u.premium || false,
        createdAt: u.createdAt ? (typeof u.createdAt === 'string' ? u.createdAt : new Date(u.createdAt).toISOString()) : '',
        signupIp: u.signupIp,
        ipLocation: u.ipLocation
      }))
      setUsers(realUsers)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    }
  }

  const handleTogglePremium = async (userId: string, currentPremium: boolean) => {
    if (!currentPremium) {
      // Se for ativar premium, pedir quantidade de dias
      const diasStr = prompt('Quantos dias de premium? (ex: 30)');
      if (!diasStr) return;
      const dias = parseInt(diasStr, 10);
      if (isNaN(dias) || dias <= 0) {
        toast.error('Digite um número válido de dias.');
        return;
      }
    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
            action: 'activate_premium',
            adminNotes: 'Premium ativado por admin',
            days: dias,
          })
        });
        if (response.ok) {
          setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, premium: true } : user
          ));
          toast.success('Status premium ativado com sucesso');
        } else {
          toast.error('Erro ao alterar status premium');
        }
      } catch (error) {
        console.error('Erro:', error);
        toast.error('Erro ao alterar status premium');
      }
    } else {
      // Desativar premium normalmente
      try {
        const response = await fetch('/api/admin/manage-user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            action: 'deactivate_premium',
            adminNotes: 'Premium desativado por admin'
        })
        });
      if (response.ok) {
        setUsers(prev => prev.map(user => 
            user.id === userId ? { ...user, premium: false } : user
          ));
          toast.success('Status premium desativado com sucesso');
      } else {
          toast.error('Erro ao alterar status premium');
      }
    } catch (error) {
        console.error('Erro:', error);
        toast.error('Erro ao alterar status premium');
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) { return }

    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          adminNotes: 'Usuário excluído por admin'
        })
      })

      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        toast.success('Usuário excluído com sucesso')
        fetchUsers()
      } else {
        toast.error('Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao excluir usuário')
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
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
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
              placeholder="Buscar por nome, e-mail ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
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
          <table className="w-full">
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
                        className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        @{user.username}
                      </a>
                      {user.name && (
                        <span className="text-xs text-gray-500 mt-1">{user.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.signupIp || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.ipLocation || <IpLocationLoader ip={user.signupIp} userId={user.id} />}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.userType === 'sugar_baby' 
                        ? 'bg-pink-100 text-pink-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.userType === 'sugar_baby' ? 'Sugar Baby' : 'Sugar Daddy'}
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.ativo)}
                        className={`text-xs px-3 py-1 rounded-md ${
                          user.ativo 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.ativo ? 'Bloquear' : 'Desbloquear'}
                      </button>
                      <button
                        onClick={() => handleTogglePremium(user.id, user.premium)}
                        className={`text-xs px-3 py-1 rounded-md ${
                          user.premium 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {user.premium ? 'Remover Premium' : 'Tornar Premium'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => window.location.href = `/admin/users/${user.id}`}
                        className="text-xs px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
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
    </div>
  )
}

function IpLocationLoader({ ip, userId }: { ip?: string, userId: string }) {
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