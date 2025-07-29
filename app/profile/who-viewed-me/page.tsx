"use client";
import React, { useEffect, useState } from 'react';
import SidebarMenuWrapper from '../../../components/SidebarMenuWrapper';
import Image from 'next/image';
import { Eye, MessageCircle, User, MapPin, Calendar } from 'lucide-react';

interface Viewer {
  id: string;
  username: string;
  name: string;
  photoURL?: string;
  city: string;
  state: string;
  viewedAt: string;
}

function sanitizeText(text: string) {
  if (!text) return '';
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function WhoViewedMePage() {
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/user/profile/views')
      .then(async (res) => {
        if (!res.ok) throw new Error('API não disponível');
        const data = await res.json();
        setViewers(data.viewers || []);
      })
      .catch(() => {
        setViewers([]);
        setError('Não foi possível carregar dados reais.');
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <SidebarMenuWrapper />
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#18181b]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid mb-4"></div>
          <span className="text-white text-lg">Carregando visualizações...</span>
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
            <Eye className="w-5 h-5 text-pink-300" />
            Quem viu meu perfil
          </h1>
          {error && (
            <div className="mb-4 text-yellow-400 text-center text-sm">{error}</div>
          )}
          {viewers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-pink-400 text-2xl mb-2">Ninguém visualizou seu perfil ainda</span>
              <span className="text-gray-400">Quando alguém visitar seu perfil, aparecerá aqui.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {viewers.map((viewer) => (
                <div key={viewer.id} className="bg-[#232326] rounded-2xl border border-pink-500/10 p-3 flex flex-col sm:flex-row items-center gap-2 w-full shadow-sm">
                  <div className="flex-shrink-0">
                    {viewer.photoURL ? (
                      <Image
                        src={viewer.photoURL}
                        alt={`Foto de ${viewer.name}`}
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
                    <h4 className="text-base font-semibold text-pink-600">{sanitizeText(viewer.name)}</h4>
                    <p className="text-pink-300 font-mono text-xs">@{viewer.username}</p>
                    <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{viewer.city}, {viewer.state}</span>
                      <Calendar className="w-4 h-4 ml-4" />
                      <span>{formatDate(viewer.viewedAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <a
                      href={`/profile/${viewer.id}`}
                      className="flex items-center justify-center gap-1 bg-pink-600 text-white px-3 py-1.5 rounded-2xl shadow-sm hover:bg-pink-500 transition-all duration-150 focus:ring-2 focus:ring-pink-400 focus:outline-none w-full text-sm font-semibold border border-pink-500/30"
                      aria-label="Ver perfil do usuário"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Perfil</span>
                    </a>
                    <a
                      href={`/messages?to=${viewer.id}`}
                      className="flex items-center justify-center gap-1 bg-pink-600 text-white px-3 py-1.5 rounded-2xl shadow-sm hover:bg-pink-500 transition-all duration-150 focus:ring-2 focus:ring-pink-400 focus:outline-none w-full text-sm font-semibold border border-pink-500/30"
                      aria-label="Enviar mensagem"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Mensagem</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 