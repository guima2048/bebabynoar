'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  BarChart3, 
  Settings, 
  Mail, 
  CreditCard, 
  Shield, 
  FileText, 
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== '/admin') {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/admin/check-auth', { credentials: 'include' })
          if (response.ok) {
            const data = await response.json()
            if (data.authenticated) {
              setIsAuthenticated(true)
            } else {
              setIsAuthenticated(false)
              router.push('/admin')
            }
          } else {
            setIsAuthenticated(false)
            router.push('/admin')
          }
        } catch (error) {
          setIsAuthenticated(false)
          router.push('/admin')
        } finally {
          setLoading(false)
        }
      }
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname, router])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (pathname !== '/admin' && !isAuthenticated) {
    return <div className="text-center py-8">Not authenticated.</div>
  }

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/users', label: 'Usuários', icon: '👥' },
    { href: '/admin/create-admin', label: 'Criar Admin', icon: '➕' },
    { href: '/admin/premium-management', label: 'Premium', icon: '💎' },
    { href: '/admin/notifications', label: 'Notificações', icon: '🔔' },
    { href: '/admin/reports', label: 'Denúncias', icon: '🚨' },
    { href: '/admin/pending-content', label: 'Conteúdo Pendente', icon: '⏳' },
    { href: '/admin/blog', label: 'Blog', icon: '📝' },
    { href: '/admin/blog-settings', label: 'Configurações do Blog', icon: '⚙️' },
    { href: '/admin/landing-settings', label: 'Landing Page', icon: '��' },
    { href: '/admin/emails', label: 'E-mails', icon: '📧' },
    { href: '/admin/emails/logs', label: 'Logs de E-mails', icon: '📋' },
    { href: '/admin/env-config', label: 'Configurações de Ambiente', icon: '🔧' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Botão de menu mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Bebaby Admin</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-pink-100 text-pink-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="mt-4">
                <div className="px-4 space-y-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        pathname === item.href
                          ? 'bg-pink-100 text-pink-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 