'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { Toaster } from 'react-hot-toast'
import NotificationToast from '@/components/NotificationToast'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ErrorBoundary>
          <AuthProvider>
            <ErrorBoundary>
              <NotificationProvider>
                <div className="min-h-screen flex flex-col">
                  <main className="flex-1">
                    {children}
                  </main>
                </div>
                <NotificationToast />
                <Toaster position="top-right" />
              </NotificationProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </SessionProvider>
    </ErrorBoundary>
  )
} 