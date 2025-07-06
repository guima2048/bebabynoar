'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface ReportUserModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
}

const REPORT_REASONS = [
  'Conteúdo Inapropriado',
  'Perfil Falso',
  'Assédio',
  'Spam',
  'Solicitação Indevida',
  'Outro'
]

export default function ReportUserModal({ isOpen, onClose, reportedUserId, reportedUserName }: ReportUserModalProps) {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Você precisa estar logado para denunciar')
      return
    }

    if (!reason) {
      toast.error('Selecione um motivo para a denúncia')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/report-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporterId: user?.id,
          reportedId: reportedUserId,
          reason,
          description,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Denúncia registrada com sucesso')
        onClose()
        setReason('')
        setDescription('')
      } else {
        toast.error(data.error || 'Erro ao registrar denúncia')
      }
    } catch (error) {
      toast.error('Erro ao enviar denúncia')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) { return null }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Denunciar Usuário</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Você está denunciando o usuário <strong>{reportedUserName}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Denúncia *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            >
              <option value="">Selecione um motivo</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Forneça detalhes adicionais sobre a denúncia..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Denunciar'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Importante:</strong> Denúncias são revisadas pela nossa equipe. 
            Usuários que violam nossas diretrizes podem ser bloqueados ou removidos da plataforma.
          </p>
        </div>
      </div>
    </div>
  )
} 