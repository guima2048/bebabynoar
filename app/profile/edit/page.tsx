"use client"

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthUser { id: string; username?: string; userType?: string; [key: string]: any }

const campos = [
  { name: 'about', label: 'Sobre mim', type: 'textarea', max: 250 },
  { name: 'lookingFor', label: 'O que procuro', type: 'textarea', max: 250 },
  { name: 'city', label: 'Cidade', type: 'text', max: 40 },
  { name: 'state', label: 'Estado', type: 'text', max: 40 },
  { name: 'profession', label: 'Profissão', type: 'text', max: 40 },
  { name: 'education', label: 'Educação', type: 'text', max: 40 },
  { name: 'acceptsTravel', label: 'Aceita viajar junto?', type: 'select', options: ['Sim', 'Não', 'Depende'] },
  { name: 'meetingFrequency', label: 'Frequência de encontros', type: 'select', options: ['1x por semana', '2x por semana', 'Diário', 'Quando der'] },
  { name: 'relationshipType', label: 'Tipo de relacionamento', type: 'select', options: ['Encontros', 'Relacionamento sério', 'Acordo Sugar'] },
  { name: 'sponsorshipStyle', label: 'Estilo de patrocínio', type: 'select', options: ['Mensal', 'Por encontro', 'Presentes', 'A combinar'] },
  { name: 'availableTime', label: 'Tempo disponível p/ sugar dating', type: 'select', options: ['Manhã', 'Tarde', 'Noite', 'Fins de semana', 'Livre'] },
  { name: 'acceptsExclusivity', label: 'Aceita exclusividade?', type: 'select', options: ['Sim', 'Não', 'Depende da proposta'] },
  { name: 'relationshipFormat', label: 'Formato do relacionamento', type: 'select', options: ['Presencial', 'Online', 'Viagens'] },
  { name: 'relationshipGoal', label: 'Você busca algo casual ou fixo?', type: 'select', options: ['Apenas casual', 'Algo fixo', 'Aberto a ambos'] },
];

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/user/profile/${session.user.id}`, {
            headers: {
              'x-user-id': session.user.id
            }
          });
          if (response.ok) {
            const data = await response.json();
            setProfile(data.user);
          }
        } catch (e) {
          toast.error('Erro ao carregar perfil');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!session?.user) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/user/profile/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id
        },
        body: JSON.stringify({
          about: profile.about || '',
          lookingFor: profile.lookingFor || '',
          city: profile.city || '',
          state: profile.state || '',
          profession: profile.profession || '',
          education: profile.education || '',
          acceptsTravel: profile.acceptsTravel || '',
          meetingFrequency: profile.meetingFrequency || '',
          relationshipType: profile.relationshipType || '',
          sponsorshipStyle: profile.sponsorshipStyle || '',
          availableTime: profile.availableTime || '',
          acceptsExclusivity: profile.acceptsExclusivity || '',
          relationshipFormat: profile.relationshipFormat || '',
          relationshipGoal: profile.relationshipGoal || ''
        })
      });
      if (response.ok) {
        toast.success('Perfil atualizado!');
        router.push('/profile');
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao salvar perfil');
      }
    } catch (e) {
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return <div className="w-full min-h-screen flex items-center justify-center bg-[#18181b] text-white">Carregando...</div>;
  }
  if (status === 'unauthenticated' || !session?.user) {
    return <div className="w-full min-h-screen flex items-center justify-center bg-[#18181b] text-white">Acesso negado</div>;
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#18181b] px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-[#232326] rounded-2xl p-6 shadow-lg">
        <button
          className="mb-6 text-pink-400 font-bold text-base hover:underline"
          onClick={() => router.push("/profile")}
          aria-label="Voltar para perfil"
        >
          ← Voltar
        </button>
        <h2 className="text-2xl font-extrabold text-white mb-6">Editar perfil</h2>
        <div className="flex flex-col gap-4">
          {campos.map((campo) => (
            campo.type === 'textarea' ? (
              <textarea
                key={campo.name}
                name={campo.name}
                value={profile[campo.name] || ''}
                onChange={handleChange}
                placeholder={campo.label}
                maxLength={campo.max}
                className="rounded-lg px-4 py-2 bg-neutral-900 text-white placeholder:text-neutral-500 resize-none"
                rows={3}
                aria-label={campo.label}
              />
            ) : campo.type === 'select' ? (
              <select
                key={campo.name}
                name={campo.name}
                value={profile[campo.name] || ''}
                onChange={handleChange}
                className="rounded-lg px-4 py-2 bg-neutral-900 text-white"
                aria-label={campo.label}
              >
                <option value="">{campo.label}</option>
                {Array.isArray(campo.options) && campo.options.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                key={campo.name}
                type="text"
                name={campo.name}
                value={profile[campo.name] || ''}
                onChange={handleChange}
                placeholder={campo.label}
                maxLength={campo.max}
                className="rounded-lg px-4 py-2 bg-neutral-900 text-white placeholder:text-neutral-500"
                aria-label={campo.label}
              />
            )
          ))}
        </div>
        <button
          className="mt-8 w-full py-3 rounded-lg bg-pink-500 text-white font-bold text-lg hover:bg-pink-600 transition"
          onClick={handleSave}
          disabled={saving}
          aria-label="Salvar perfil"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
} 