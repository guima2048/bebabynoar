'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import toast from 'react-hot-toast'

export default function NotificationToast() {
  let notifications = []
  try {
    notifications = useNotifications().notifications
  } catch (e) {
    // Não faz nada se não houver provider
    return null
  }

  useEffect(() => {
    // Pega a notificação mais recente
    const latestNotification = notifications[0]
    
    if (latestNotification && !latestNotification.read) {
      // Verifica se é uma notificação nova (últimos 5 segundos)
      const now = new Date()
      const notificationTime =
        latestNotification.createdAt instanceof Date
          ? latestNotification.createdAt
          : (typeof latestNotification.createdAt === 'object' && latestNotification.createdAt !== null && 'toDate' in latestNotification.createdAt)
            ? (latestNotification.createdAt as { toDate: () => Date }).toDate()
            : new Date()
      const timeDiff = now.getTime() - notificationTime.getTime()
      
      if (timeDiff < 5000) { // 5 segundos
        // Mostra toast baseado no tipo de notificação
        switch (latestNotification.type) {
          case 'message':
            toast.success(
              <div>
                <div className="font-semibold">{latestNotification.title}</div>
                <div className="text-sm">{latestNotification.message}</div>
              </div>,
              {
                duration: 5000,
                icon: '💬',
                style: {
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                },
              }
            )
            break
            
          case 'interest':
            toast.success(
              <div>
                <div className="font-semibold">{latestNotification.title}</div>
                <div className="text-sm">{latestNotification.message}</div>
              </div>,
              {
                duration: 5000,
                icon: '❤️',
                style: {
                  background: '#fdf2f8',
                  border: '1px solid #ec4899',
                },
              }
            )
            break
            
          case 'profile_view':
            toast.success(
              <div>
                <div className="font-semibold">{latestNotification.title}</div>
                <div className="text-sm">{latestNotification.message}</div>
              </div>,
              {
                duration: 5000,
                icon: '👁️',
                style: {
                  background: '#f0fdf4',
                  border: '1px solid #22c55e',
                },
              }
            )
            break
            
          case 'private_photo_request':
            toast.success(
              <div>
                <div className="font-semibold">{latestNotification.title}</div>
                <div className="text-sm">{latestNotification.message}</div>
              </div>,
              {
                duration: 5000,
                icon: '📸',
                style: {
                  background: '#faf5ff',
                  border: '1px solid #a855f7',
                },
              }
            )
            break
            
          case 'payment_approved':
            toast.success(
              <div>
                <div className="font-semibold">{latestNotification.title}</div>
                <div className="text-sm">{latestNotification.message}</div>
              </div>,
              {
                duration: 5000,
                icon: '✅',
                style: {
                  background: '#f0fdf4',
                  border: '1px solid #22c55e',
                },
              }
            )
            break
            
          case 'payment_rejected':
            toast.error(
              <div>
                <div className="font-semibold">{latestNotification.title}</div>
                <div className="text-sm">{latestNotification.message}</div>
              </div>,
              {
                duration: 5000,
                icon: '❌',
                style: {
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                },
              }
            )
            break
            
          default:
            toast.success(
              <div>
                <div className="font-semibold">{latestNotification.title}</div>
                <div className="text-sm">{latestNotification.message}</div>
              </div>,
              {
                duration: 5000,
                icon: '🔔',
              }
            )
        }
      }
    }
  }, [notifications])

  return null // Este componente não renderiza nada visualmente
} 