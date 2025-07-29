"use client";
import React, { useEffect, useState } from 'react';
import SidebarMenuWrapper from '../../../components/SidebarMenuWrapper';
import Image from 'next/image';
import { Heart, MessageCircle, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface FavoriteUser {
  id: string;
  username: string;
  photoURL?: string;
  userType: string;
}

function sanitizeText(text: string) {
  if (!text) return '';
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<FavoriteUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') return;
    if (status === 'authenticated' && session?.user) {
      setLoading(true);
      setError(null);
      fetch('/api/favorites?type=my-favorites', {
        headers: { 'x-user-id': session.user.id }
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('API não disponível');
          const data = await res.json();
          setUsers(data.users || []);
        })
        .catch(() => {
          setUsers([]);
          setError('Não foi possível carregar seus favoritos.');
        })
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  const handleUnfavorite = async (userId: string) => {
    setRemoving(userId);
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.user.id || '' },
        body: JSON.stringify({ targetId: userId })
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        toast.success('Removido dos favoritos!');
      } else {
        toast.error('Erro ao desfavoritar.');
      }
    } catch (e) {
      toast.error('Erro ao desfavoritar.');
    } finally {
      setRemoving(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <SidebarMenuWrapper />
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#18181b]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid mb-4"></div>
          <span className="text-white text-lg">Carregando favoritos...</span>
        </div>
      </>
    );
  }
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <>
        <SidebarMenuWrapper />
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#18181b]">
          <span className="text-white text-lg">Acesso negado</span>
        </div>
      </>
    );
  }

  return (
    <>
      <SidebarMenuWrapper />
      <div className="min-h-screen bg-[#18181b] flex flex-col items-center w-full max-w-full px-2 py-4">
        <div className="w-full max-w-2xl mx-auto bg-[#232326] rounded-lg p-6 shadow-lg mt-6">
          <h1 className="text-lg font-semibold text-pink-500 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-300" />
            Meus favoritos
          </h1>
          {error && (
            <div className="mb-4 text-yellow-400 text-center text-sm">{error}</div>
          )}
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-pink-400 text-2xl mb-2">Você ainda não favoritou ninguém</span>
              <span className="text-gray-400">Quando você favoritar alguém, aparecerá aqui.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="bg-[#232326] rounded-2xl border border-pink-500/10 p-3 flex flex-col sm:flex-row items-center gap-2 w-full shadow-sm">
                  <div className="flex-shrink-0">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={`Foto de ${user.username}`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover border-4 border-pink-400 shadow-md w-16 h-16"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#232326] rounded-full flex items-center justify-center border-4 border-pink-400">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-pink-600">{sanitizeText(user.username)}</h4>
                    <p className="text-pink-300 font-mono text-xs">{user.userType}</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <a
                      href={`/profile/${user.id}`}
                      className="flex items-center justify-center gap-1 bg-pink-600 text-white px-3 py-1.5 rounded-2xl shadow-sm hover:bg-pink-500 transition-all duration-150 focus:ring-2 focus:ring-pink-400 focus:outline-none w-full text-sm font-semibold border border-pink-500/30"
                      aria-label="Ver perfil do usuário"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Ver Perfil</span>
                    </a>
                    <a
                      href={`/messages?to=${user.id}`}
                      className="flex items-center justify-center gap-1 bg-pink-600 text-white px-3 py-1.5 rounded-2xl shadow-sm hover:bg-pink-500 transition-all duration-150 focus:ring-2 focus:ring-pink-400 focus:outline-none w-full text-sm font-semibold border border-pink-500/30"
                      aria-label="Enviar mensagem"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Mensagem</span>
                    </a>
                    <button
                      onClick={() => handleUnfavorite(user.id)}
                      disabled={removing === user.id}
                      className="flex items-center justify-center gap-1 bg-white text-pink-600 border border-pink-300 px-3 py-1.5 rounded-2xl shadow-sm hover:bg-pink-100 transition-all duration-150 focus:ring-2 focus:ring-pink-200 focus:outline-none w-full text-sm font-semibold disabled:opacity-50"
                      aria-label="Desfavoritar usuário"
                    >
                      {removing === user.id ? 'Removendo...' : 'Desfavoritar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-center" toastOptions={{ className: 'text-sm', duration: 4000, style: { background: '#18181b', color: '#fff' } }} containerStyle={{ zIndex: 9999 }} aria-live="polite" />
    </>
  );
} 