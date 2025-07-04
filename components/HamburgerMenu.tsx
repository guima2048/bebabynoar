'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, Edit, Search, BookOpen, MessageCircle, Bell, Eye, Users, Star, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const menuItems = [
  { href: '/profile', label: 'Meu Perfil', icon: <User size={20} /> },
  { href: '/profile/edit', label: 'Editar Perfil', icon: <Edit size={20} /> },
  { href: '/search', label: 'Buscar', icon: <Search size={20} /> },
  { href: '/blog', label: 'Blog', icon: <BookOpen size={20} /> },
  { href: '/messages', label: 'Mensagens', icon: <MessageCircle size={20} /> },
  { href: '/notifications', label: 'Notificações', icon: <Bell size={20} /> },
  { href: '/profile/who-viewed-me', label: 'Quem viu meu perfil', icon: <Eye size={20} /> },
  { href: '/profile/requests', label: 'Solicitações', icon: <Users size={20} /> },
  { href: '/premium', label: 'Upgrade', icon: <Star size={20} /> },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      router.push('/login');
    } catch (error) {
      alert('Erro ao sair. Tente novamente.');
    }
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-[#232326] text-white shadow-lg focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={28} />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/70 z-40 flex">
          <nav className="w-72 max-w-[90vw] bg-[#232326] h-full p-6 flex flex-col gap-4 shadow-2xl relative animate-slide-in-left">
            <button
              className="absolute top-4 right-4 text-white hover:text-pink-400"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X size={28} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Menu</h2>
            {menuItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-pink-500/20 transition font-medium text-base"
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {/* Opção de sair */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-red-500/80 transition font-medium text-base mt-4"
            >
              <LogOut size={20} />
              Sair
            </button>
          </nav>
        </div>
      )}
      <style jsx global>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.2s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </>
  );
} 