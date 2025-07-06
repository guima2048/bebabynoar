'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import toast from 'react-hot-toast'

export default function NotificationToast() {
  const { notifications } = useNotifications()

  useEffect(() => {
    // Pega a notificação mais recente
    const latestNotification = notifications[0]
    
    if (latestNotification && !latestNotification.read) {
      // Verifica se é uma notificação nova (últimos 5 segundos)
      const now = new Date()
      let notificationTime: Date
      if (
        typeof latestNotification.createdAt === 'string' || typeof latestNotification.createdAt === 'number'
      ) {
        notificationTime = new Date(latestNotification.createdAt)
      } else if (
        typeof latestNotification.createdAt === 'object' && latestNotification.createdAt !== null && 'toDate' in latestNotification.createdAt
      ) {
        notificationTime = (latestNotification.createdAt as { toDate: () => Date }).toDate()
      } else {
        notificationTime = new Date()
      }
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