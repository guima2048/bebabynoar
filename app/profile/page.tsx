'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  Edit, 
  Camera, 
  Settings, 
  Heart, 
  Eye, 
  MessageCircle, 
  Crown, 
  Star,
  MapPin,
  Calendar,
  User,
  Shield
} from 'lucide-react'
import { differenceInYears } from 'date-fns'
import Modal from 'react-modal';

interface ProfileData {
  id: string
  username: string
  email: string
  birthdate: string
  gender: string
  userType: string
  lookingFor?: string
  state: string
  city: string
  about?: string
  photoURL?: string
  profession?: string
  education?: string
  acceptsTravel?: string
  meetingFrequency?: string
  relationshipType?: string
  sponsorshipStyle?: string
  availableTime?: string
  acceptsExclusivity?: string
  relationshipFormat?: string
  relationshipGoal?: string
  verified?: boolean
  premium?: boolean
  photos?: { id: string; url: string; isPrivate: boolean; uploadedAt: string }[]
}

interface AuthUser { id: string; username?: string; userType?: string; email?: string; photoURL?: string; premium?: boolean; emailVerified?: boolean; [key: string]: any }

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showModal, setShowModal] = useState<null | { type: 'about' | 'lookingFor', text: string }>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  // Adicionar estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated' && session?.user) {
      fetchProfile(session.user)
    }
  }, [status, session, router])

  useEffect(() => {
    document.body.style.background = '#18181b';
    document.documentElement.style.background = '#18181b';
    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  const fetchProfile = async (user: any) => {
    if (!user) { 
      return 
    }
    
    try {
      setLoadingProfile(true)
      const response = await fetch(`/api/user/profile`, {
        headers: {
          'x-user-id': user.id
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.user) {
          setProfile(data.user as ProfileData)
        } else {
          // Se não há dados do usuário, criar um perfil básico com os dados da sessão
          const basicProfile: ProfileData = {
            id: '',
            username: '',
            email: '',
            birthdate: '',
            gender: '',
            userType: '',
            lookingFor: '',
            state: '',
            city: '',
            about: '',
            photoURL: '',
            profession: '',
            education: '',
            acceptsTravel: '',
            meetingFrequency: '',
            relationshipType: '',
            sponsorshipStyle: '',
            availableTime: '',
            acceptsExclusivity: '',
            relationshipFormat: '',
            relationshipGoal: '',
            verified: false,
            premium: false
          }
          setProfile(basicProfile)
        }
      } else {
        // Se há erro na API, criar um perfil básico com os dados da sessão
        const basicProfile: ProfileData = {
          id: '',
          username: '',
          email: '',
          birthdate: '',
          gender: '',
          userType: '',
          lookingFor: '',
          state: '',
          city: '',
          about: '',
          photoURL: '',
          profession: '',
          education: '',
          acceptsTravel: '',
          meetingFrequency: '',
          relationshipType: '',
          sponsorshipStyle: '',
          availableTime: '',
          acceptsExclusivity: '',
          relationshipFormat: '',
          relationshipGoal: '',
          verified: false,
          premium: false
        }
        setProfile(basicProfile)
      }
    } catch (error) {
      // Se há erro na requisição, criar um perfil básico com os dados da sessão
      const basicProfile: ProfileData = {
        id: '',
        username: '',
        email: '',
        birthdate: '',
        gender: '',
        userType: '',
        lookingFor: '',
        state: '',
        city: '',
        about: '',
        photoURL: '',
        profession: '',
        education: '',
        acceptsTravel: '',
        meetingFrequency: '',
        relationshipType: '',
        sponsorshipStyle: '',
        availableTime: '',
        acceptsExclusivity: '',
        relationshipFormat: '',
        relationshipGoal: '',
        verified: false,
        premium: false
      }
      setProfile(basicProfile)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user || !e.target.files || !e.target.files[0]) { return }

    const file = e.target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter menos de 5MB')
      return
    }

    try {
      setUploadingPhoto(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'profile')
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        // Atualiza no banco de dados
        await fetch(`/api/user/profile/${session.user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': session.user.id
          },
          body: JSON.stringify({ photoURL: data.photo.url })
        });
        // Atualiza o estado local
        setProfile(prev => prev ? { ...prev, photoURL: data.photo.url } : null)
        toast.success('Foto atualizada com sucesso!')
      } else {
        toast.error('Erro ao fazer upload da foto')
      }
    } catch (error) {
      toast.error('Erro ao fazer upload da foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const publicPhotos = profile && profile.photos ? profile.photos.filter((p: { id: string; url: string; isPrivate: boolean; uploadedAt: string }) => !p.isPrivate) : [];
  const privatePhotos = profile && profile.photos ? profile.photos.filter((p: { id: string; url: string; isPrivate: boolean; uploadedAt: string }) => p.isPrivate) : [];

  const handleAddPublicPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter menos de 5MB');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'public');
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (session?.user) {
          fetchProfile(session.user);
        }
        toast.success('Foto pública adicionada!');
      } else {
        toast.error('Erro ao adicionar foto');
      }
    } catch (error) {
      toast.error('Erro ao adicionar foto');
    }
  };

  const handleAddPrivatePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter menos de 5MB');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'private');
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (session?.user) {
          fetchProfile(session.user);
        }
        toast.success('Foto privada adicionada!');
      } else {
        toast.error('Erro ao adicionar foto');
      }
    } catch (error) {
      toast.error('Erro ao adicionar foto');
    }
  };

  function renderTruncated(text: string, type: 'about' | 'lookingFor') {
    if (!text) return <span className="text-neutral-400 italic">Não informado.</span>;
    if (text.length <= 120) return <span>{text}</span>;
    return <>
      <span>{text.slice(0, 120)}...</span>
      <button className="ml-2 text-pink-400 underline text-xs font-semibold" onClick={() => setShowModal({ type, text })}>
        ver mais
      </button>
    </>;
  }

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  // Função para ativar/desativar edição
  const handleEditClick = () => {
    if (!isEditing && profile) {
      setEditProfile({ ...profile });
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setEditProfile(null);
    }
  };

  // Função para atualizar campos editáveis
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editProfile) return;
    setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
  };

  // Função para validar campos editáveis
  function validateProfileFields(profile: ProfileData) {
    const errors: { [key: string]: string } = {};
    if (!profile.username || profile.username.length < 3) {
      errors.username = 'Nome de usuário deve ter pelo menos 3 caracteres.';
    }
    if (!profile.city || profile.city.length < 2) {
      errors.city = 'Cidade deve ter pelo menos 2 caracteres.';
    }
    if (!profile.state || profile.state.length < 2) {
      errors.state = 'Estado deve ter pelo menos 2 caracteres.';
    }
    if (profile.profession && profile.profession.length > 40) {
      errors.profession = 'Profissão deve ter no máximo 40 caracteres.';
    }
    if (profile.education && profile.education.length > 40) {
      errors.education = 'Educação deve ter no máximo 40 caracteres.';
    }
    if (profile.about && profile.about.length > 250) {
      errors.about = 'Sobre mim deve ter no máximo 250 caracteres.';
    }
    if (profile.lookingFor && profile.lookingFor.length > 250) {
      errors.lookingFor = 'O que busco deve ter no máximo 250 caracteres.';
    }
    return errors;
  }

  // Função para salvar alterações
  const handleSave = async () => {
    if (!session?.user || !editProfile) return;
    // Validação antes de salvar
    const errors = validateProfileFields(editProfile);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Corrija os erros antes de salvar.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/user/profile/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id
        },
        body: JSON.stringify({
          about: editProfile.about || '',
          lookingFor: editProfile.lookingFor || '',
          city: editProfile.city || '',
          state: editProfile.state || '',
          profession: editProfile.profession || '',
          education: editProfile.education || '',
          acceptsTravel: editProfile.acceptsTravel || '',
          meetingFrequency: editProfile.meetingFrequency || '',
          relationshipType: editProfile.relationshipType || '',
          sponsorshipStyle: editProfile.sponsorshipStyle || '',
          availableTime: editProfile.availableTime || '',
          acceptsExclusivity: editProfile.acceptsExclusivity || '',
          relationshipFormat: editProfile.relationshipFormat || '',
          relationshipGoal: editProfile.relationshipGoal || ''
        })
      });
      if (response.ok) {
        toast.success('Perfil atualizado!');
        setIsEditing(false);
        setEditProfile(null);
        fetchProfile(session.user);
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

  // Adicionar um spinner simples para carregamento geral
  if (status === 'loading' || loadingProfile) return (
    <div className="flex items-center justify-center min-h-screen bg-[#18181b]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid"></div>
      <span className="ml-4 text-white text-lg">Carregando perfil...</span>
    </div>
  );

  // Se não há perfil após o carregamento, mostrar perfil básico
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center bg-[#18181b] min-h-screen text-white">
        <h2 className="text-2xl font-bold mb-4">Carregando perfil...</h2>
        <p className="mb-6">Aguarde um momento enquanto carregamos suas informações.</p>
      </div>
    )
  }

  const age = profile?.birthdate ? differenceInYears(new Date(), new Date(profile.birthdate)) : null

  // Adicionar função de sanitização simples para exibir textos do usuário
  function sanitizeText(text: string) {
    if (!text) return '';
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 bg-[#18181b] min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Coluna da esquerda - Foto e informações básicas */}
        <div className="md:w-1/3">
          <div className="relative">
            <Image
              src={
                profile?.photos && profile.photos.length >= 2
                  ? profile.photos[0].url
                  : profile?.photoURL
                  ? profile.photoURL
                  : profile?.gender === 'FEMALE'
                  ? '/landing/padraomulher.webp'
                  : profile?.gender === 'MALE'
                  ? '/landing/padraohomem.webp'
                  : '/avatar.png'
              }
              alt="Foto do perfil do usuário"
              width={192}
              height={192}
              className="w-48 h-48 rounded-full mx-auto mb-4 object-cover border-4 border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400"
              priority={false}
              loading="lazy"
            />
            <label className="absolute bottom-4 right-4 bg-pink-600 text-white p-2 rounded-full cursor-pointer hover:bg-pink-700 transition-colors focus:ring-4 focus:ring-pink-400 focus:outline-none">
              {uploadingPhoto ? (
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-solid"></span>
              ) : (
                <Camera size={20} aria-label="Ícone de câmera para upload de foto" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                aria-label="Upload de foto do perfil"
              />
            </label>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">{profile.username}</h1>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              {age && <span>{age} anos</span>}
              {profile.city && <span>• {profile.city}</span>}
              {profile.state && <span>• {profile.state}</span>}
            </div>
            {profile.premium && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Crown className="text-yellow-500" size={16} />
                <span className="text-yellow-500 text-sm">Premium</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {session?.user?.id === profile.id && !isEditing && (
              <button
                className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors focus:ring-4 focus:ring-pink-400 focus:outline-none"
                aria-label="Editar Perfil"
                onClick={handleEditClick}
              >
                <Edit size={16} />
                Editar Perfil
              </button>
            )}
            {session?.user?.id === profile.id && isEditing && (
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center justify-center"
                  onClick={handleSave}
                  disabled={saving}
                  aria-label="Salvar alterações"
                >
                  {saving ? (
                    <span className="flex items-center"><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid mr-2"></span>Salvando...</span>
                  ) : 'Salvar'}
                </button>
                <button
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-bold"
                  onClick={handleEditClick}
                  aria-label="Cancelar edição"
                >
                  Cancelar
                </button>
              </div>
            )}
            {/* Botões de mensagens e notificações */}
            <Link
              href="/messages"
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors focus:ring-4 focus:ring-pink-400 focus:outline-none"
              aria-label="Ir para Mensagens"
            >
              <MessageCircle size={16} />
              Mensagens
            </Link>
            <Link
              href="/notifications"
              className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors focus:ring-4 focus:ring-pink-400 focus:outline-none"
              aria-label="Ir para Notificações"
            >
              <Eye size={16} />
              Notificações
            </Link>
          </div>
        </div>
        {/* Coluna da direita - Informações detalhadas */}
        <div className="md:w-2/3">
          <div className="bg-[#232326] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Sobre mim</h2>
            {isEditing && session?.user?.id === profile.id ? (
              <>
                <textarea
                  name="about"
                  value={editProfile?.about || ''}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg px-4 py-2 bg-neutral-900 text-white placeholder:text-neutral-500 resize-none mb-4"
                  rows={3}
                  maxLength={250}
                  aria-label="Sobre mim"
                />
                {validationErrors.about && <p className="text-red-500 text-xs mt-1">{validationErrors.about}</p>}
              </>
            ) : (
              <p className="text-gray-300 mb-4">{sanitizeText(profile.about || '') || 'Nenhuma informação fornecida.'}</p>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">O que busco</h3>
            {isEditing && session?.user?.id === profile.id ? (
              <>
                <textarea
                  name="lookingFor"
                  value={editProfile?.lookingFor || ''}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg px-4 py-2 bg-neutral-900 text-white placeholder:text-neutral-500 resize-none"
                  rows={3}
                  maxLength={250}
                  aria-label="O que busco"
                />
                {validationErrors.lookingFor && <p className="text-red-500 text-xs mt-1">{validationErrors.lookingFor}</p>}
              </>
            ) : (
              <p className="text-gray-300">{sanitizeText(profile.lookingFor || '') || 'Nenhuma informação fornecida.'}</p>
            )}
          </div>
          <div className="bg-[#232326] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Informações do perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-gray-400">Tipo de perfil sugar:</span><p className="text-white">{profile.userType}</p></div>
              <div><span className="text-gray-400">Gênero:</span><p className="text-white">{profile.gender}</p></div>
              <div><span className="text-gray-400">Profissão:</span>{isEditing && session?.user?.id === profile.id ? (
                <>
                  <input type="text" name="profession" value={editProfile?.profession || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" maxLength={40} aria-label="Profissão" />
                  {validationErrors.profession && <p className="text-red-500 text-xs mt-1">{validationErrors.profession}</p>}
                </>
              ) : (<p className="text-white">{sanitizeText(profile.profession || '') || 'Não informado'}</p>)}
              </div>
              <div><span className="text-gray-400">Educação:</span>{isEditing && session?.user?.id === profile.id ? (
                <>
                  <input type="text" name="education" value={editProfile?.education || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" maxLength={40} aria-label="Educação" />
                  {validationErrors.education && <p className="text-red-500 text-xs mt-1">{validationErrors.education}</p>}
                </>
              ) : (<p className="text-white">{sanitizeText(profile.education || '') || 'Não informado'}</p>)}
              </div>
              <div><span className="text-gray-400">Verificado:</span><p className="text-white">{profile.verified ? 'Sim' : 'Não'}</p></div>
            </div>
          </div>
          <div className="bg-[#232326] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Preferências de relacionamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-gray-400">Aceita viajar junto:</span>{isEditing && session?.user?.id === profile.id ? (
                <select name="acceptsTravel" value={editProfile?.acceptsTravel || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" aria-label="Aceita viajar junto?">
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                  <option value="Depende">Depende</option>
                </select>
              ) : (<p className="text-white">{sanitizeText(profile.acceptsTravel || '') || 'Não informado'}</p>)}
              </div>
              <div><span className="text-gray-400">Frequência de encontros:</span>{isEditing && session?.user?.id === profile.id ? (
                <select name="meetingFrequency" value={editProfile?.meetingFrequency || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" aria-label="Frequência de encontros">
                  <option value="">Selecione</option>
                  <option value="1x por semana">1x por semana</option>
                  <option value="2x por semana">2x por semana</option>
                  <option value="Diário">Diário</option>
                  <option value="Quando der">Quando der</option>
                </select>
              ) : (<p className="text-white">{sanitizeText(profile.meetingFrequency || '') || 'Não informado'}</p>)}
              </div>
              <div><span className="text-gray-400">Tipo de relacionamento:</span>{isEditing && session?.user?.id === profile.id ? (
                <select name="relationshipType" value={editProfile?.relationshipType || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" aria-label="Tipo de relacionamento">
                  <option value="">Selecione</option>
                  <option value="Encontros">Encontros</option>
                  <option value="Relacionamento sério">Relacionamento sério</option>
                  <option value="Acordo Sugar">Acordo Sugar</option>
                </select>
              ) : (<p className="text-white">{sanitizeText(profile.relationshipType || '') || 'Não informado'}</p>)}
              </div>
              <div><span className="text-gray-400">Tempo disponível:</span>{isEditing && session?.user?.id === profile.id ? (
                <select name="availableTime" value={editProfile?.availableTime || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" aria-label="Tempo disponível">
                  <option value="">Selecione</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="Fins de semana">Fins de semana</option>
                  <option value="Livre">Livre</option>
                </select>
              ) : (<p className="text-white">{sanitizeText(profile.availableTime || '') || 'Não informado'}</p>)}
              </div>
              <div><span className="text-gray-400">Aceita exclusividade:</span>{isEditing && session?.user?.id === profile.id ? (
                <select name="acceptsExclusivity" value={editProfile?.acceptsExclusivity || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" aria-label="Aceita exclusividade?">
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                  <option value="Depende da proposta">Depende da proposta</option>
                </select>
              ) : (<p className="text-white">{sanitizeText(profile.acceptsExclusivity || '') || 'Não informado'}</p>)}
              </div>
              <div><span className="text-gray-400">Formato do relacionamento:</span>{isEditing && session?.user?.id === profile.id ? (
                <select name="relationshipFormat" value={editProfile?.relationshipFormat || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" aria-label="Formato do relacionamento">
                  <option value="">Selecione</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Online">Online</option>
                  <option value="Viagens">Viagens</option>
                </select>
              ) : (<p className="text-white">{sanitizeText(profile.relationshipFormat || '') || 'Não informado'}</p>)}
              </div>
              <div><span className="text-gray-400">Busca casual ou fixo:</span>{isEditing && session?.user?.id === profile.id ? (
                <select name="relationshipGoal" value={editProfile?.relationshipGoal || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" aria-label="Busca casual ou fixo">
                  <option value="">Selecione</option>
                  <option value="Apenas casual">Apenas casual</option>
                  <option value="Algo fixo">Algo fixo</option>
                  <option value="Aberto a ambos">Aberto a ambos</option>
                </select>
              ) : (<p className="text-white">{sanitizeText(profile.relationshipGoal || '') || 'Não informado'}</p>)}
              </div>
            </div>
          </div>
          {profile.premium && (
            <div className="bg-[#232326] rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Informações VIP</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="text-gray-400">Estilo de patrocínio:</span>{isEditing && session?.user?.id === profile.id ? (
                  <select name="sponsorshipStyle" value={editProfile?.sponsorshipStyle || ''} onChange={handleFieldChange} className="w-full rounded-lg px-2 py-1 bg-neutral-900 text-white" aria-label="Estilo de patrocínio">
                    <option value="">Selecione</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Por encontro">Por encontro</option>
                    <option value="Presentes">Presentes</option>
                    <option value="A combinar">A combinar</option>
                  </select>
                ) : (<p className="text-white">{sanitizeText(profile.sponsorshipStyle || '') || 'Não informado'}</p>)}
                </div>
              </div>
            </div>
          )}
          {/* Galeria de fotos */}
          <div className="bg-[#232326] rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Galeria de fotos</h2>
            
            {/* Fotos públicas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Fotos públicas</h3>
              <div className="grid grid-cols-3 gap-4">
                {publicPhotos.slice(0, 6).map((photo, i) => (
                  <div key={photo.id || i} className="aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden">
                    <Image src={photo.url} alt="Foto pública do usuário" width={300} height={400} className="w-full h-full object-cover border-2 border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400" loading="lazy" />
                  </div>
                ))}
                {Array.from({ length: 6 - publicPhotos.length }).map((_, i) => (
                  <label key={i} className="aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-pink-500 transition-colors cursor-pointer focus:ring-4 focus:ring-pink-400 focus:outline-none">
                    <span className="text-3xl text-gray-500">+</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAddPublicPhoto} aria-label="Adicionar foto pública" />
                  </label>
                ))}
              </div>
            </div>

            {/* Fotos privadas */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Fotos privadas</h3>
              <div className="grid grid-cols-3 gap-4">
                {privatePhotos.slice(0, 6).map((photo, i) => (
                  <div key={photo.id || i} className="aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden">
                    <Image src={photo.url} alt="Foto privada do usuário" width={300} height={400} className="w-full h-full object-cover border-2 border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-400" loading="lazy" />
                  </div>
                ))}
                {Array.from({ length: 6 - privatePhotos.length }).map((_, i) => (
                  <label key={i} className="aspect-[3/4] bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-pink-500 transition-colors cursor-pointer focus:ring-4 focus:ring-pink-400 focus:outline-none">
                    <span className="text-3xl text-gray-500">+</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAddPrivatePhoto} aria-label="Adicionar foto privada" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para texto completo */}
      <Modal
        isOpen={!!showModal}
        onRequestClose={() => setShowModal(null)}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black/70 z-40"
        ariaHideApp={false}
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-[#232326] rounded-2xl p-6 max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-xl text-white">
          <h2 className="text-lg font-bold mb-4">
            {showModal?.type === 'about' ? 'Sobre mim' : 'O que busco'}
          </h2>
          <p className="whitespace-pre-line text-base mb-6">
            {showModal?.text}
          </p>
          <button className="mt-2 px-4 py-2 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600 transition focus:ring-4 focus:ring-pink-400 focus:outline-none" onClick={() => setShowModal(null)} aria-label="Fechar modal de texto completo">
            Fechar
          </button>
        </div>
      </Modal>
    </div>
  )
} 
