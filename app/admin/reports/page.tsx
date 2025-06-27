'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Report {
  id: string
  denunciadorNome: string
  denunciadoNome: string
  motivo: string
  descricao: string
  status: string
  dataDenuncia: string
  revisado: boolean
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      // Simular dados de denúncias
      const mockReports: Report[] = [
        {
          id: '1',
          denunciadorNome: 'Maria123',
          denunciadoNome: 'João456',
          motivo: 'Conteúdo Inapropriado',
          descricao: 'Usuário enviou fotos inadequadas',
          status: 'Pendente',
          dataDenuncia: '2024-01-15T10:30:00Z',
          revisado: false
        },
        {
          id: '2',
          denunciadorNome: 'Ana789',
          denunciadoNome: 'Pedro321',
          motivo: 'Perfil Falso',
          descricao: 'Usuário usando fotos de outra pessoa',
          status: 'Em Revisão',
          dataDenuncia: '2024-01-14T15:45:00Z',
          revisado: true
        },
        {
          id: '3',
          denunciadorNome: 'Carlos654',
          denunciadoNome: 'Julia987',
          motivo: 'Assédio',
          descricao: 'Mensagens inadequadas e persistentes',
          status: 'Resolvida',
          dataDenuncia: '2024-01-13T09:20:00Z',
          revisado: true
        }
      ]
      setReports(mockReports)
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error)
      toast.error('Erro ao carregar denúncias')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/manage-report', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          action: newStatus === 'Em Revisão' ? 'review' : 'resolved',
          adminNotes: `Status alterado para ${newStatus}`
        })
      })

      if (response.ok) {
        setReports(prev => prev.map(report => 
          report.id === reportId ? { ...report, status: newStatus, revisado: true } : report
        ))
        toast.success(`Denúncia marcada como ${newStatus}`)
      } else {
        toast.error('Erro ao atualizar status da denúncia')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao atualizar status da denúncia')
    }
  }

  const handleBlockUser = async (reportId: string, denunciadoNome: string) => {
    if (!confirm(`Tem certeza que deseja bloquear o usuário ${denunciadoNome}?`)) { return }

    try {
      const response = await fetch('/api/admin/manage-report', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          action: 'block_user',
          adminNotes: 'Usuário bloqueado devido à denúncia'
        })
      })

      if (response.ok) {
        setReports(prev => prev.map(report => 
          report.id === reportId ? { ...report, status: 'Resolvida', revisado: true } : report
        ))
        toast.success('Usuário bloqueado com sucesso')
      } else {
        toast.error('Erro ao bloquear usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao bloquear usuário')
    }
  }

  const handleDeleteUser = async (reportId: string, denunciadoNome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${denunciadoNome}?`)) { return }

    try {
      const response = await fetch('/api/admin/manage-report', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          action: 'delete_user',
          adminNotes: 'Usuário excluído devido à denúncia'
        })
      })

      if (response.ok) {
        setReports(prev => prev.map(report => 
          report.id === reportId ? { ...report, status: 'Resolvida', revisado: true } : report
        ))
        toast.success('Usuário excluído com sucesso')
      } else {
        toast.error('Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao excluir usuário')
    }
  }

  const filteredReports = reports.filter(report => {
    return filterStatus === 'all' || report.status === filterStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Em Revisão':
        return 'bg-blue-100 text-blue-800'
      case 'Resolvida':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Denúncias</h1>
        <p className="text-gray-600 mt-2">Revisar e resolver denúncias de usuários</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">Todas as Denúncias</option>
            <option value="Pendente">Pendentes</option>
            <option value="Em Revisão">Em Revisão</option>
            <option value="Resolvida">Resolvidas</option>
          </select>
        </div>
      </div>

      {/* Lista de Denúncias */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Denúncia #{report.id}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(report.dataDenuncia).toLocaleString('pt-BR')}
                </p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Denunciador:</p>
                <p className="text-sm text-gray-900">{report.denunciadorNome}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Denunciado:</p>
                <p className="text-sm text-gray-900">{report.denunciadoNome}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Motivo:</p>
              <p className="text-sm text-gray-900">{report.motivo}</p>
            </div>

            {report.descricao && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Descrição:</p>
                <p className="text-sm text-gray-900">{report.descricao}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {report.status === 'Pendente' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'Em Revisão')}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    Marcar como Em Revisão
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'Resolvida')}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    Marcar como Resolvida
                  </button>
                </>
              )}

              {report.status === 'Em Revisão' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'Resolvida')}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    Marcar como Resolvida
                  </button>
                  <button
                    onClick={() => handleBlockUser(report.id, report.denunciadoNome)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Bloquear Denunciado
                  </button>
                  <button
                    onClick={() => handleDeleteUser(report.id, report.denunciadoNome)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Excluir Denunciado
                  </button>
                </>
              )}

              {report.status === 'Resolvida' && (
                <span className="text-xs text-gray-500">
                  Denúncia resolvida em {new Date(report.dataDenuncia).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm border">
          <p className="text-gray-500">Nenhuma denúncia encontrada.</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Total: {filteredReports.length} denúncia(s)
      </div>
    </div>
  )
} 