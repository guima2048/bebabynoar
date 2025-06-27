import { useNotifications } from '@/contexts/NotificationContext'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export const useNotificationActions = () => {
  const { markAsRead, markAllAsRead } = useNotifications()
  const { user } = useAuth()

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) { return }

    try {
      await markAsRead(notificationId)
      toast.success('Notificação marcada como lida')
    } catch (error) {
      toast.error('Erro ao marcar notificação como lida')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      toast.error('Erro ao marcar notificações como lidas')
    }
  }

  const createNotification = async (notificationData: {
    userId: string
    type: 'message' | 'interest' | 'profile_view' | 'private_photo_request' | 'payment_approved' | 'payment_rejected'
    title: string
    message: string
    data?: any
  }) => {
    if (!user) { return }

    try {
      const response = await fetch('/api/create-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...notificationData,
          userId: user.id
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar notificação')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao criar notificação:', error)
      throw error
    }
  }

  const sendMessageNotification = async (messageData: {
    senderId: string
    receiverId: string
    message: string
    conversationId: string
  }) => {
    try {
      const response = await fetch('/api/send-message-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar notificação de mensagem')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao enviar notificação de mensagem:', error)
      throw error
    }
  }

  const recordProfileView = async (viewData: {
    viewerId: string
    profileId: string
    viewerUsername: string
  }) => {
    try {
      const response = await fetch('/api/record-profile-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(viewData),
      })

      if (!response.ok) {
        throw new Error('Erro ao registrar visualização')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
      throw error
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!user) { return }

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Falha ao deletar notificação')
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
      throw error
    }
  }

  return {
    handleMarkAsRead,
    handleMarkAllAsRead,
    createNotification,
    sendMessageNotification,
    recordProfileView,
    deleteNotification
  }
} 