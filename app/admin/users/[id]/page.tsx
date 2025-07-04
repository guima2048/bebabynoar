"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";



interface UserData {
  id: string;
  name: string;
  email: string;
  userType: string;
  city: string;
  state: string;
  ativo: boolean;
  premium: boolean;
  createdAt: string;
  photos?: any[];
  about?: string;
  lookingFor?: string;
  premiumExpiry?: string;
  premiumDaysLeft?: number;
  username?: string;
  signupIp?: string;
  lastLoginIp?: string;
  lastLoginIpLocation?: string;
  lastLoginAt?: string;
  // Campos de estilo de vida
  height?: string;
  weight?: string;
  education?: string;
  hasChildren?: string;
  smokes?: string;
  drinks?: string;
  // Campos de relacionamento sugar
  relationshipType?: string;
  availableForTravel?: string;
  receiveTravelers?: string;
  // Outros campos
  birthdate?: string;
  verified?: boolean;
  social?: Record<string, string>;
  // Foto de perfil
  photoURL?: string;
  photoIsPrivate?: boolean;
  // Campos adicionais que podem vir do perfil público
  displayName?: string;
  location?: string;
  gender?: string;
  status?: string;
}

interface LoginInfo {
  timestamp: string;
  ip?: string;
  device?: string;
}

interface Conversation {
  id: string;
  withUser: string;
  lastMessage: string;
  lastMessageAt: string;
}

interface SocialMediaHistory {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  adminId?: string;
}

interface Trip {
  id: string;
  userId: string;
  username: string;
  state: string;
  city: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  isPublic: boolean;
  description?: string;
  lookingFor?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUserDetailPage() {
  console.log('Renderizou AdminUserDetailPage');
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [logins, setLogins] = useState<LoginInfo[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "fotos" | "conversations" | "logins" | "social" | "trips">("info");
  const [uploading, setUploading] = useState(false);
  
  // Estados para Redes Sociais
  const [socialMedia, setSocialMedia] = useState<Record<string, string>>({});
  const [socialHistory, setSocialHistory] = useState<any[]>([]);
  const [savingSocial, setSavingSocial] = useState(false);
  
  // Estados para Viagens
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [showTripModal, setShowTripModal] = useState(false);




  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (user) setEditUser(user);
  }, [user]);

  useEffect(() => {
    if (userId && activeTab === 'social') {
      fetchSocialMediaData();
    }
  }, [userId, activeTab]);

  useEffect(() => {
    if (userId && activeTab === 'trips') {
      fetchTripsData();
    }
  }, [userId, activeTab]);

  const fetchUserData = async () => {
    console.log('🔍 [Admin] Buscando dados do usuário:', userId);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/manage-user?userId=${userId}`);
      if (!res.ok) throw new Error("Erro ao buscar dados do usuário");
      const data = await res.json();
      console.log('🔍 [Admin] Dados recebidos:', data.user);
      console.log('🔍 [Admin] Fotos recebidas:', data.user.photos);
      setUser(data.user);
      setLogins(data.logins || []);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('🔍 [Admin] Erro ao buscar dados:', error);
      toast.error("Erro ao buscar dados do usuário");
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (field: string, value: any) => {
    setEditUser((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/manage-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          action: "update_fields",
          fields: {
            name: editUser.name,
            email: editUser.email,
            userType: editUser.userType,
            city: editUser.city,
            state: editUser.state,
            about: editUser.about,
            lookingFor: editUser.lookingFor,
            ativo: editUser.ativo,
            premium: editUser.premium,
            premiumExpiry: editUser.premiumExpiry,
            premiumDaysLeft: editUser.premiumDaysLeft,
            // Campos de estilo de vida
            height: editUser.height,
            weight: editUser.weight,
            education: editUser.education,
            hasChildren: editUser.hasChildren,
            smokes: editUser.smokes,
            drinks: editUser.drinks,
            // Campos de relacionamento sugar
            relationshipType: editUser.relationshipType,
            availableForTravel: editUser.availableForTravel,
            receiveTravelers: editUser.receiveTravelers,
            // Outros campos que podem estar no perfil público
            username: editUser.username,
            birthdate: editUser.birthdate,
            verified: editUser.verified,
            social: editUser.social,
            photoURL: editUser.photoURL,
            photoIsPrivate: editUser.photoIsPrivate,
          },
          premiumDaysLeft: editUser.premiumDaysLeft,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar alterações");
      toast.success("Alterações salvas com sucesso!");
      fetchUserData();
    } catch (e) {
      toast.error("Erro ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditUser(user);
  };

  // Fotos
  const handleRemovePhoto = async (photoId: string) => {
    if (!editUser) return;
    if (!confirm("Tem certeza que deseja remover esta foto?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/manage-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          action: "remove_photo",
          photoId,
        }),
      });
      if (!res.ok) throw new Error("Erro ao remover foto");
      toast.success("Foto removida!");
      fetchUserData();
    } catch (e) {
      toast.error("Erro ao remover foto");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePhotoStatus = async (photoId: string, isPrivate: boolean) => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/manage-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          action: "toggle_photo_status",
          photoId,
          isPrivate: !isPrivate,
        }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar status da foto");
      toast.success("Status da foto atualizado!");
      fetchUserData();
    } catch (e) {
      toast.error("Erro ao atualizar status da foto");
    } finally {
      setSaving(false);
    }
  };

  // Upload de foto sem crop - SIMPLES
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>, isPrivate: boolean) => {
    try {
      console.log('[Upload] Iniciando upload de foto...');
      
      if (!editUser || !e.target.files || e.target.files.length === 0) {
        console.log('[Upload] Nenhum arquivo selecionado ou usuário não encontrado');
        return;
      }
      
      const file = e.target.files[0];
      console.log('[Upload] Arquivo selecionado:', file.name, file.size, file.type);
      
      // Validação básica do arquivo
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione apenas arquivos de imagem");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Arquivo muito grande. Máximo 5MB");
        return;
      }

      console.log('[Upload] Iniciando upload para o backend...');
      setUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", editUser.id);
      formData.append("isPrivate", String(isPrivate));

      console.log('[Upload] FormData criado, enviando para /api/admin/manage-user...');
      
      const res = await fetch("/api/admin/manage-user", {
        method: "POST",
        body: formData,
      });
      
      console.log('[Upload] Resposta do backend:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Upload] Erro do backend:', errorText);
        throw new Error(`Erro ao fazer upload da foto: ${res.status} ${res.statusText}`);
      }
      
      const result = await res.json();
      console.log('[Upload] Sucesso:', result);
      
      toast.success("Foto adicionada!");
      fetchUserData();
      
    } catch (error) {
      console.error('[Upload] Erro no upload:', error);
      toast.error(`Erro ao fazer upload da foto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Funções para foto de perfil sem crop - SIMPLES
  const handleUploadProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log('[Upload Profile] Iniciando upload de foto de perfil...');
      
      if (!editUser || !e.target.files || e.target.files.length === 0) {
        console.log('[Upload Profile] Nenhum arquivo selecionado ou usuário não encontrado');
        return;
      }
      
      const file = e.target.files[0];
      console.log('[Upload Profile] Arquivo selecionado:', file.name, file.size, file.type);
      
      // Validação básica do arquivo
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione apenas arquivos de imagem");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Arquivo muito grande. Máximo 5MB");
        return;
      }

      console.log('[Upload Profile] Iniciando upload para o backend...');
      setUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", editUser.id);
      formData.append("type", "profile");
      formData.append("isPrivate", String(editUser.photoIsPrivate || false));

      console.log('[Upload Profile] FormData criado, enviando para /api/admin/manage-user...');
      
      const res = await fetch("/api/admin/manage-user", {
        method: "POST",
        body: formData,
      });
      
      console.log('[Upload Profile] Resposta do backend:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Upload Profile] Erro do backend:', errorText);
        throw new Error(`Erro ao fazer upload da foto de perfil: ${res.status} ${res.statusText}`);
      }
      
      const result = await res.json();
      console.log('[Upload Profile] Sucesso:', result);
      
      toast.success("Foto de perfil atualizada!");
      fetchUserData();
      
    } catch (error) {
      console.error('[Upload Profile] Erro no upload:', error);
      toast.error(`Erro ao fazer upload da foto de perfil: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Funções para Redes Sociais
  const fetchSocialMediaData = async () => {
    try {
      const response = await fetch(`/api/admin/social-media-history?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSocialMedia(data.socialMedia || {});
        setSocialHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erro ao carregar redes sociais:', error);
      toast.error('Erro ao carregar redes sociais');
    }
  };

  const handleSaveSocialMedia = async () => {
    if (!editUser) return;
    setSavingSocial(true);
    try {
      const response = await fetch('/api/admin/update-social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editUser.id,
          socialMedia,
        }),
      });
      
      if (response.ok) {
        toast.success('Redes sociais atualizadas com sucesso!');
        fetchSocialMediaData();
      } else {
        throw new Error('Erro ao salvar redes sociais');
      }
    } catch (error) {
      console.error('Erro ao salvar redes sociais:', error);
      toast.error('Erro ao salvar redes sociais');
    } finally {
      setSavingSocial(false);
    }
  };

  // Funções para Viagens
  const fetchTripsData = async () => {
    setLoadingTrips(true);
    try {
      const response = await fetch(`/api/trips?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
      }
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      toast.error('Erro ao carregar viagens');
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setShowTripModal(true);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta viagem?')) return;
    
    try {
      const response = await fetch(`/api/trips?tripId=${tripId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Viagem excluída com sucesso!');
        fetchTripsData();
      } else {
        throw new Error('Erro ao excluir viagem');
      }
    } catch (error) {
      console.error('Erro ao excluir viagem:', error);
      toast.error('Erro ao excluir viagem');
    }
  };

  const handleToggleTripVisibility = async (tripId: string, currentVisibility: boolean) => {
    try {
      const response = await fetch('/api/trips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          isPublic: !currentVisibility,
        }),
      });
      
      if (response.ok) {
        toast.success('Visibilidade da viagem alterada!');
        fetchTripsData();
      } else {
        throw new Error('Erro ao alterar visibilidade');
      }
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      toast.error('Erro ao alterar visibilidade');
    }
  };

  const handleSaveTrip = async (tripData: any) => {
    try {
      const response = await fetch('/api/trips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: editingTrip.id,
          ...tripData,
        }),
      });
      
      if (response.ok) {
        toast.success('Viagem atualizada com sucesso!');
        setShowTripModal(false);
        setEditingTrip(null);
        fetchTripsData();
      } else {
        throw new Error('Erro ao atualizar viagem');
      }
    } catch (error) {
      console.error('Erro ao atualizar viagem:', error);
      toast.error('Erro ao atualizar viagem');
    }
  };

  const handleToggleProfilePhotoVisibility = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/manage-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          action: "toggle_profile_photo_visibility",
          photoIsPrivate: !editUser.photoIsPrivate,
        }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar visibilidade da foto de perfil");
      toast.success("Visibilidade da foto de perfil atualizada!");
      fetchUserData();
    } catch (e) {
      toast.error("Erro ao atualizar visibilidade da foto de perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProfilePhoto = async () => {
    if (!editUser) return;
    if (!confirm("Tem certeza que deseja remover a foto de perfil?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/manage-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          action: "remove_profile_photo",
        }),
      });
      if (!res.ok) throw new Error("Erro ao remover foto de perfil");
      toast.success("Foto de perfil removida!");
      fetchUserData();
    } catch (e) {
      toast.error("Erro ao remover foto de perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header de navegação */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/users")}
          className="text-sm text-pink-600 hover:underline"
        >
          ← Voltar
        </button>
      </div>

      {/* Header com foto e username */}
      <div className="flex items-center gap-6 mb-8">
        {/* Foto de Perfil */}
        {editUser?.photoURL ? (
          <img
            src={editUser.photoURL}
            alt="Foto de perfil"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-gray-200 flex items-center justify-center shadow-lg">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        {/* Username ao lado */}
        <span className="text-2xl font-bold text-gray-900">@{editUser?.username || user?.username || 'username'}</span>
      </div>

      <div className="mb-6 flex gap-2 border-b overflow-x-auto">
        <button
          className={`px-4 py-2 whitespace-nowrap ${activeTab === "info" ? "border-b-2 border-pink-600 font-semibold" : "text-gray-600"}`}
          onClick={() => setActiveTab("info")}
        >
          Informações
        </button>
        <button
          className={`px-4 py-2 whitespace-nowrap ${activeTab === "fotos" ? "border-b-2 border-pink-600 font-semibold" : "text-gray-600"}`}
          onClick={() => setActiveTab("fotos")}
        >
          Fotos
        </button>
        <button
          className={`px-4 py-2 whitespace-nowrap ${activeTab === "conversations" ? "border-b-2 border-pink-600 font-semibold" : "text-gray-600"}`}
          onClick={() => setActiveTab("conversations")}
        >
          Conversas
        </button>
        <button
          className={`px-4 py-2 whitespace-nowrap ${activeTab === "logins" ? "border-b-2 border-pink-600 font-semibold" : "text-gray-600"}`}
          onClick={() => setActiveTab("logins")}
        >
          Logins
        </button>
        <button
          className={`px-4 py-2 whitespace-nowrap ${activeTab === "social" ? "border-b-2 border-pink-600 font-semibold" : "text-gray-600"}`}
          onClick={() => setActiveTab("social")}
        >
          Redes Sociais
        </button>
        <button
          className={`px-4 py-2 whitespace-nowrap ${activeTab === "trips" ? "border-b-2 border-pink-600 font-semibold" : "text-gray-600"}`}
          onClick={() => setActiveTab("trips")}
        >
          Viagens
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : !editUser ? (
        <div className="text-center py-12 text-red-500">Usuário não encontrado.</div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
          {activeTab === "info" && (
            <div className="space-y-8">
              {/* Barra de ações fixa */}
              <div className="sticky top-0 bg-white z-10 py-4 border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">Informações do Usuário</h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        editUser?.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {editUser?.ativo ? 'Ativo' : 'Bloqueado'}
                      </span>
                      {editUser?.premium && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors" 
                      onClick={handleCancel} 
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Salvar Alterações
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Informações Básicas */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID do Usuário</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {editUser.id}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome de Usuário Público</label>
                      <input 
                        type="text" 
                        value={editUser.username || ''} 
                        onChange={e => handleEditChange('username', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                        disabled={saving}
                        placeholder="Ex: tonyy"
                      />
                      <p className="text-xs text-gray-500 mt-1">Este é o identificador único e público do usuário</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        value={editUser.email || ""} 
                        onChange={e => handleEditChange("email", e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                        disabled={saving}
                        placeholder="usuario@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuário</label>
                      <select 
                        value={editUser.userType || ""} 
                        onChange={e => handleEditChange("userType", e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                        disabled={saving}
                      >
                        <option value="sugar_baby">Sugar Baby</option>
                        <option value="sugar_daddy">Sugar Daddy</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status da Conta</label>
                      <select 
                        value={editUser.ativo ? "ativo" : "bloqueado"} 
                        onChange={e => handleEditChange("ativo", e.target.value === "ativo")} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                        disabled={saving}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="bloqueado">Bloqueado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Premium</label>
                      <input
                        type="number"
                        min={0}
                        value={editUser.premiumDaysLeft ?? 0}
                        onChange={e => handleEditChange("premiumDaysLeft", parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                        disabled={saving}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                      <input 
                        type="text" 
                        value={editUser.city || ""} 
                        onChange={e => handleEditChange("city", e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                        disabled={saving}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <input 
                        type="text" 
                        value={editUser.state || ""} 
                        onChange={e => handleEditChange("state", e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                        disabled={saving}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações de Sistema */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Informações de Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data de Cadastro</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {new Date(editUser.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IP do Cadastro</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {editUser.signupIp || 'Não registrado'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Último IP de Login</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {editUser.lastLoginIp || 'Não registrado'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Localização do Último IP</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {editUser.lastLoginIpLocation || 'Não registrado'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Último Login</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                        {editUser.lastLoginAt ? new Date(editUser.lastLoginAt).toLocaleString('pt-BR') : 'Não registrado'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrições */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Descrições
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sobre</label>
                    <textarea 
                      value={editUser.about || ""} 
                      onChange={e => handleEditChange("about", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors resize-none" 
                      rows={4}
                      disabled={saving}
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">O que busca</label>
                    <textarea 
                      value={editUser.lookingFor || ""} 
                      onChange={e => handleEditChange("lookingFor", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors resize-none" 
                      rows={4}
                      disabled={saving}
                      placeholder="Descreva o que você está procurando..."
                    />
                  </div>
                </div>
              </div>

              {/* Estilo de Vida */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Estilo de Vida
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura</label>
                    <input 
                      type="text" 
                      value={editUser.height || ""} 
                      onChange={e => handleEditChange("height", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving} 
                      placeholder="Ex: 1.70m" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso</label>
                    <input 
                      type="text" 
                      value={editUser.weight || ""} 
                      onChange={e => handleEditChange("weight", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving} 
                      placeholder="Ex: 65kg" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Educação</label>
                    <select 
                      value={editUser.education || ""} 
                      onChange={e => handleEditChange("education", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving}
                    >
                      <option value="">Selecione</option>
                      <option value="Ensino Médio">Ensino Médio</option>
                      <option value="Ensino Superior">Ensino Superior</option>
                      <option value="Pós-graduação">Pós-graduação</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="Doutorado">Doutorado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tem filhos</label>
                    <select 
                      value={editUser.hasChildren || ""} 
                      onChange={e => handleEditChange("hasChildren", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving}
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuma</label>
                    <select 
                      value={editUser.smokes || ""} 
                      onChange={e => handleEditChange("smokes", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving}
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Socialmente">Socialmente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bebe</label>
                    <select 
                      value={editUser.drinks || ""} 
                      onChange={e => handleEditChange("drinks", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving}
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Socialmente">Socialmente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Relacionamento Sugar */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-pink-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Relacionamento Sugar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de relacionamento</label>
                    <select 
                      value={editUser.relationshipType || ""} 
                      onChange={e => handleEditChange("relationshipType", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving}
                    >
                      <option value="">Selecione</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Online">Online</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Disponível para viagens</label>
                    <select 
                      value={editUser.availableForTravel || ""} 
                      onChange={e => handleEditChange("availableForTravel", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving}
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="A combinar">A combinar</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mostrar perfil para viajantes</label>
                    <select 
                      value={editUser.receiveTravelers || ""} 
                      onChange={e => handleEditChange("receiveTravelers", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors" 
                      disabled={saving}
                    >
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Mostrar meu perfil para pessoas de outros lugares que vêm visitar minha cidade</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "fotos" && (
            <div className="space-y-6">
              {/* Foto de Perfil */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Foto de Perfil
                </h3>
                
                <div className="flex items-center gap-6">
                  {editUser?.photoURL ? (
                    <div className="relative">
                      <img 
                        src={editUser.photoURL} 
                        alt="Foto de perfil" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="absolute -top-2 -right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          editUser.photoIsPrivate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {editUser.photoIsPrivate ? 'Privada' : 'Pública'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="relative cursor-pointer bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProfilePhoto}
                          className="hidden"
                          disabled={uploading}
                        />
                        {uploading ? 'Enviando...' : 'Alterar Foto'}
                      </label>
                      
                      {editUser?.photoURL && (
                        <>
                          <button
                            onClick={handleToggleProfilePhotoVisibility}
                            disabled={saving}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            {editUser.photoIsPrivate ? 'Tornar Pública' : 'Tornar Privada'}
                          </button>
                          <button
                            onClick={handleRemoveProfilePhoto}
                            disabled={saving}
                            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Remover
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Esta é a foto principal que aparece no perfil do usuário
                    </p>
                  </div>
                </div>
              </div>

              {/* Galeria de Fotos */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Galeria de Fotos
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <label className="relative cursor-pointer bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadPhoto(e, false)}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? 'Enviando...' : 'Adicionar Pública'}
                    </label>
                    
                    <label className="relative cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadPhoto(e, true)}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? 'Enviando...' : 'Adicionar Privada'}
                    </label>
                  </div>
                </div>

                {editUser?.photos && editUser.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {editUser.photos.map((photo: any) => (
                      <div key={photo.id} className="relative group">
                        <img 
                          src={photo.url || photo.photoURL} 
                          alt="Foto da galeria" 
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        
                        {/* Overlay com ações */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleTogglePhotoStatus(photo.id, photo.isPrivate)}
                                disabled={saving}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  photo.isPrivate 
                                    ? 'bg-green-600 text-white hover:bg-green-700' 
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                } transition-colors disabled:opacity-50`}
                              >
                                {photo.isPrivate ? 'Tornar Pública' : 'Tornar Privada'}
                              </button>
                              <button
                                onClick={() => handleRemovePhoto(photo.id)}
                                disabled={saving}
                                className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Badge de status */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            photo.isPrivate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {photo.isPrivate ? 'Privada' : 'Pública'}
                          </span>
                        </div>
                        
                        {/* Data de upload */}
                        <div className="absolute bottom-2 left-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-black bg-opacity-50 text-white">
                            {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">Nenhuma foto na galeria</p>
                    <p className="text-gray-400 text-sm">Adicione fotos públicas ou privadas para começar</p>
                  </div>
                )}
              </div>

              {/* Estatísticas */}
              {editUser?.photos && editUser.photos.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{editUser.photos.length}</div>
                      <div className="text-sm text-blue-600">Total de Fotos</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {editUser.photos.filter((p: any) => !p.isPrivate).length}
                      </div>
                      <div className="text-sm text-green-600">Fotos Públicas</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {editUser.photos.filter((p: any) => p.isPrivate).length}
                      </div>
                      <div className="text-sm text-purple-600">Fotos Privadas</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "conversations" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Conversas</h2>
              {conversations.length === 0 ? (
                <div className="text-gray-500">Nenhuma conversa encontrada.</div>
              ) : (
                <ul className="space-y-2">
                  {conversations.map((conv) => (
                    <li key={conv.id} className="border rounded p-3">
                      <div><b>Com:</b> {conv.withUser}</div>
                      <div><b>Última mensagem:</b> {conv.lastMessage}</div>
                      <div><b>Data:</b> {new Date(conv.lastMessageAt).toLocaleString("pt-BR")}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "logins" && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Últimos Logins</h2>
              {logins.length === 0 ? (
                <div className="text-gray-500">Nenhum login registrado.</div>
              ) : (
                <ul className="space-y-2">
                  {logins.map((login, idx) => (
                    <li key={idx} className="border rounded p-3">
                      <div><b>Data/Hora:</b> {new Date(login.timestamp).toLocaleString("pt-BR")}</div>
                      {login.ip && <div><b>IP:</b> {login.ip}</div>}
                      {login.device && <div><b>Device:</b> {login.device}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Redes Sociais</h2>
                  <button
                    onClick={handleSaveSocialMedia}
                    disabled={savingSocial}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingSocial ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#25D366"/>
                        <path d="M23.6 19.7c-.3-.2-1.7-.8-2-1s-.5-.2-.7.1c-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.3-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.4.1-.6.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1.1-.2.2-.3.1-.2.1-.3 0-.5-.1-.2-.7-1.7-1-2.3-.2-.5-.4-.4-.6-.4-.2 0-.3 0-.5 0-.2 0-.4 0-.6.2-.2.2-.8.8-.8 2 0 1.2.8 2.4 1.1 2.7.3.3 2.1 3.2 5.1 4.1.7.2 1.2.3 1.6.2.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2z" fill="#fff"/>
                      </svg>
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={socialMedia.whatsapp || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, whatsapp: e.target.value }))}
                      placeholder="+55 11 99999-9999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Telegram */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#229ED9"/>
                        <path d="M23.2 10.6l-2.2 10.3c-.2.8-.6 1-1.3.6l-3.6-2.7-1.7 1.6c-.2.2-.3.3-.7.3l.2-2.2 7.9-7.1c.3-.3-.1-.5-.5-.3l-9.8 6.2-2.1-.7c-.7-.2-.7-.7.1-1l12.1-4.7c.6-.2 1.1.1.9 1z" fill="#fff"/>
                      </svg>
                      Telegram
                    </label>
                    <input
                      type="text"
                      value={socialMedia.telegram || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, telegram: e.target.value }))}
                      placeholder="@username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#E1306C"/>
                        <path d="M20.7 10.3c.4 0 .7.3.7.7v1.3c0 .4-.3.7-.7.7h-1.3c-.4 0-.7-.3-.7-.7v-1.3c0-.4.3-.7.7-.7h1.3zm-4.7 1.3c-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7-1.2-2.7-2.7-2.7zm0 4.4c-.9 0-1.7-.8-1.7-1.7s.8-1.7 1.7-1.7 1.7.8 1.7 1.7-.8 1.7-1.7 1.7zm4.4-6.4c.8 0 1.4.6 1.4 1.4v7.4c0 .8-.6 1.4-1.4 1.4h-7.4c-.8 0-1.4-.6-1.4-1.4v-7.4c0-.8.6-1.4 1.4-1.4h7.4zm0-1.3h-7.4c-1.5 0-2.7 1.2-2.7 2.7v7.4c0 1.5 1.2 2.7 2.7 2.7h7.4c1.5 0 2.7-1.2 2.7-2.7v-7.4c0-1.5-1.2-2.7-2.7-2.7z" fill="#fff"/>
                      </svg>
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={socialMedia.instagram || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#1877F3"/>
                        <path d="M18.7 16h-1.2v6h-2.4v-6h-.8v-2h.8v-1.2c0-1.1.5-2.8 2.8-2.8l2 .01v2.2h-1.4c-.2 0-.4.1-.4.4V14h1.8l-.2 2z" fill="#fff"/>
                      </svg>
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={socialMedia.facebook || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="facebook.com/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* X (Twitter) */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#000"/>
                        <path d="M20.7 10.3l-2.7 3.7 3.2 4.7h-2.2l-2.1-3.1-2.1 3.1h-2.2l3.2-4.7-2.7-3.7h2.2l1.6 2.3 1.6-2.3h2.2z" fill="#fff"/>
                      </svg>
                      X (Twitter)
                    </label>
                    <input
                      type="text"
                      value={socialMedia.x || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, x: e.target.value }))}
                      placeholder="@username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#000"/>
                        <path d="M22.2 14.2c-.7 0-1.3-.1-1.9-.4v4.1c0 2.1-1.7 3.8-3.8 3.8s-3.8-1.7-3.8-3.8 1.7-3.8 3.8-3.8c.2 0 .4 0 .6.1v2.1c-.2-.1-.4-.1-.6-.1-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8v-7.2h2c.1.7.5 1.3 1.1 1.7.4.3.9.5 1.4.5v2z" fill="#fff"/>
                      </svg>
                      TikTok
                    </label>
                    <input
                      type="text"
                      value={socialMedia.tiktok || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, tiktok: e.target.value }))}
                      placeholder="@username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* OnlyFans */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="16" fill="#00AFF0"/>
                        <path d="M23.2 16.2c0-3.9-3.2-7.1-7.1-7.1s-7.1 3.2-7.1 7.1 3.2 7.1 7.1 7.1 7.1-3.2 7.1-7.1zm-7.1 5.6c-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6 5.6 2.5 5.6 5.6-2.5 5.6-5.6 5.6zm2.1-5.6c0-1.2-.9-2.1-2.1-2.1s-2.1.9-2.1 2.1.9 2.1 2.1 2.1 2.1-.9 2.1-2.1z" fill="#fff"/>
                      </svg>
                      OnlyFans
                    </label>
                    <input
                      type="text"
                      value={socialMedia.onlyfans || ''}
                      onChange={(e) => setSocialMedia(prev => ({ ...prev, onlyfans: e.target.value }))}
                      placeholder="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Histórico de Alterações */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Alterações</h3>
                {socialHistory.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">Nenhuma alteração registrada.</div>
                ) : (
                  <div className="space-y-3">
                    {socialHistory.map((entry, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 capitalize">{entry.field}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.changedAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Valor anterior:</span>
                            <div className="font-medium">{entry.oldValue || 'Não informado'}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Novo valor:</span>
                            <div className="font-medium">{entry.newValue || 'Não informado'}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Alterado por: {entry.changedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "trips" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Histórico de Viagens</h2>
                  {loadingTrips && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                      Carregando...
                    </div>
                  )}
                </div>

                {trips.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-2">Nenhuma viagem encontrada</div>
                    <div className="text-sm text-gray-400">Este usuário ainda não agendou nenhuma viagem</div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {trips.map((trip) => (
                      <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {trip.city}, {trip.state}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                trip.status === 'active' ? 'bg-green-100 text-green-800' :
                                trip.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {trip.status === 'active' ? 'Ativa' :
                                 trip.status === 'completed' ? 'Concluída' : 'Cancelada'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                trip.isPublic ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {trip.isPublic ? 'Pública' : 'Privada'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium">De:</span> {new Date(trip.startDate).toLocaleDateString('pt-BR')}
                              </div>
                              <div>
                                <span className="font-medium">Até:</span> {new Date(trip.endDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>

                            {trip.description && (
                              <div className="mb-2">
                                <span className="font-medium text-gray-700">Descrição:</span>
                                <p className="text-sm text-gray-600 mt-1">{trip.description}</p>
                              </div>
                            )}

                            {trip.lookingFor && (
                              <div className="mb-2">
                                <span className="font-medium text-gray-700">Procurando:</span>
                                <p className="text-sm text-gray-600 mt-1">{trip.lookingFor}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditTrip(trip)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar viagem"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleToggleTripVisibility(trip.id, trip.isPublic)}
                              className={`p-2 rounded-lg transition-colors ${
                                trip.isPublic 
                                  ? 'text-purple-600 hover:bg-purple-50' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              title={trip.isPublic ? 'Tornar privada' : 'Tornar pública'}
                            >
                              {trip.isPublic ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                              )}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir viagem"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      )}

      {/* Modal de Edição de Viagem */}
      {showTripModal && editingTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Editar Viagem</h3>
                <button
                  onClick={() => {
                    setShowTripModal(false)
                    setEditingTrip(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <TripEditForm
                trip={editingTrip}
                onSave={handleSaveTrip}
                onCancel={() => {
                  setShowTripModal(false)
                  setEditingTrip(null)
                }}
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );

  // Componente para editar viagem (dentro do componente principal)
  function TripEditForm({ trip, onSave, onCancel }: { trip: Trip, onSave: (data: any) => void, onCancel: () => void }) {
    const [formData, setFormData] = useState({
      state: trip.state,
      city: trip.city,
      startDate: trip.startDate,
      endDate: trip.endDate,
      description: trip.description || '',
      lookingFor: trip.lookingFor || '',
      status: trip.status,
      isPublic: trip.isPublic
    })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSaving(true)
      try {
        await onSave(formData)
      } finally {
        setSaving(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="active">Ativa</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Descreva sua viagem..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">O que está procurando</label>
          <textarea
            value={formData.lookingFor}
            onChange={(e) => setFormData(prev => ({ ...prev, lookingFor: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Descreva o que você está procurando..."
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Viagem pública (visível para outros usuários)
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    )
  }
} 