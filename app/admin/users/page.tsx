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
      // Simular dados de usuários
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'Maria123',
          email: 'maria@email.com',
          userType: 'sugar_baby',
          birthdate: '1995-03-15',
          city: 'São Paulo',
          state: 'SP',
          ativo: true,
          premium: false,
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          username: 'João456',
          email: 'joao@email.com',
          userType: 'sugar_daddy',
          birthdate: '1980-07-22',
          city: 'Rio de Janeiro',
          state: 'RJ',
          ativo: true,
          premium: true,
          createdAt: '2024-01-10'
        },
        {
          id: '3',
          username: 'Ana789',
          email: 'ana@email.com',
          userType: 'sugar_baby',
          birthdate: '1998-11-08',
          city: 'Belo Horizonte',
          state: 'MG',
          ativo: false,
          premium: false,
          createdAt: '2024-01-05'
        }
      ]
      setUsers(mockUsers)
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
    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: currentPremium ? 'deactivate_premium' : 'activate_premium',
          adminNotes: currentPremium ? 'Premium desativado por admin' : 'Premium ativado por admin'
        })
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, premium: !currentPremium } : user
        ))
        toast.success(`Status premium ${currentPremium ? 'desativado' : 'ativado'} com sucesso`)
      } else {
        toast.error('Erro ao alterar status premium')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao alterar status premium')
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p className="text-gray-600 mt-2">Gerencie todos os usuários da plataforma</p>
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
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