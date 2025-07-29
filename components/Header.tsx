'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Bell, User, LogOut, Menu, X } from 'lucide-react'

interface AuthUser { id: string; username?: string; email?: string; [key: string]: any }

const Header: React.FC = () => {
  const { user, logout } = useAuth() as { user: AuthUser | null, logout: () => void }
  const { unreadCount } = useNotifications()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    if (!user) { return }
    try {
      await logout()
      toast.success('Logout realizado com sucesso!')
      router.push('/')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  const handleProfileClick = () => {
    if (!user) {
      router.push('/login')
      return
    }
    router.push('/profile')
  }

  const handleMessagesClick = () => {
    if (!user) {
      router.push('/login')
      return
    }
    router.push('/messages')
  }

  const handleNotificationsClick = () => {
    if (!user) {
      router.push('/login')
      return
    }
    router.push('/notifications')
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-secondary-900">Bebaby</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-secondary-600 hover:text-secondary-900 transition-colors">
              Início
            </Link>
            <Link href="/explore" className="text-secondary-600 hover:text-secondary-900 transition-colors">
              Explorar
            </Link>
            <Link href="/blog" className="text-secondary-600 hover:text-secondary-900 transition-colors">
              Blog
            </Link>
            {user ? (
              <>
                <Link href="/messages" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Mensagens
                </Link>
                <Link href="/notifications" className="relative text-secondary-600 hover:text-secondary-900 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Perfil
                </Link>
                <Link href="/profile/requests" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Solicitações
                </Link>
                <Link href="/profile/who-viewed-me" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Quem Viu Meu Perfil
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                  Entrar
                </Link>
                <Link href="/register" className="btn-primary">
                  Cadastrar
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <button className="relative p-2 text-secondary-600 hover:text-secondary-900 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full"></span>
              </button>
              <div className="relative">
                <button className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors">
                  <User className="w-5 h-5" />
                  <span>{user.email}</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-secondary-600 hover:text-secondary-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                Início
              </Link>
              <Link href="/explore" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                Explorar
              </Link>
              <Link href="/blog" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                Blog
              </Link>
              {user ? (
                <>
                  <Link href="/messages" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    Mensagens
                  </Link>
                  <Link href="/notifications" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    Notificações {unreadCount > 0 && `(${unreadCount})`}
                  </Link>
                  <Link href="/profile" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    Perfil
                  </Link>
                  <Link href="/profile/requests" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    Solicitações
                  </Link>
                  <Link href="/profile/who-viewed-me" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    Quem Viu Meu Perfil
                  </Link>
                  <button className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-secondary-600 hover:text-secondary-900 transition-colors">
                    Entrar
                  </Link>
                  <Link href="/register" className="btn-primary text-center">
                    Cadastrar
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 