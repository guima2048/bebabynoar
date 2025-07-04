"use client"

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestoreDB } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const campos = [
  { name: 'username', label: 'Nome de usuário', type: 'text', max: 30 },
  { name: 'about', label: 'Sobre mim', type: 'textarea', max: 250 },
  { name: 'lookingFor', label: 'O que busco', type: 'textarea', max: 250 },
  { name: 'city', label: 'Cidade', type: 'text', max: 40 },
  { name: 'state', label: 'Estado', type: 'text', max: 40 },
  { name: 'relationshipType', label: 'Relacionamento', type: 'text', max: 40 },
  { name: 'height', label: 'Altura', type: 'text', max: 10 },
  { name: 'weight', label: 'Peso', type: 'text', max: 10 },
  { name: 'hasChildren', label: 'Filhos', type: 'select', options: ['Sim', 'Não'] },
  { name: 'smokes', label: 'Fuma', type: 'select', options: ['Sim', 'Não'] },
  { name: 'drinks', label: 'Bebe', type: 'select', options: ['Sim', 'Não'] },
  { name: 'education', label: 'Educação', type: 'text', max: 40 },
  { name: 'profession', label: 'Profissão', type: 'text', max: 40 },
  { name: 'gender', label: 'Gênero', type: 'select', options: ['homem', 'mulher'] },
];

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    // Aguardar o carregamento da autenticação
    if (authLoading) {
      return;
    }
    
    if (!user) {
      router.push("/login");
      return;
    }
    
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const db = getFirestoreDB();
        const userRef = doc(db, "users", user.id);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setProfile(snap.data());
        }
      } catch (e) {
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, router, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const db = getFirestoreDB();
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        name: profile.name || "",
        username: profile.username || "",
        city: profile.city || "",
        state: profile.state || "",
        about: profile.about || "",
        relationshipType: profile.relationshipType || "",
        height: profile.height || "",
        weight: profile.weight || "",
        hasChildren: profile.hasChildren === "Sim",
        smokes: profile.smokes === "Sim",
        drinks: profile.drinks === "Sim",
        education: profile.education || "",
        userType: profile.userType || "",
        gender: profile.gender || "",
        lookingFor: profile.lookingFor || "",
        profession: profile.profession || "",

        availableForTravel: profile.availableForTravel || "",
      });
      toast.success("Perfil atualizado!");
      router.push("/profile");
    } catch (e) {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="w-full min-h-screen flex items-center justify-center bg-[#18181b] text-white">Carregando...</div>;
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#18181b] px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-[#232326] rounded-2xl p-6 shadow-lg">
        <button
          className="mb-6 text-pink-400 font-bold text-base hover:underline"
          onClick={() => router.push("/profile")}
        >
          ← Voltar
        </button>
        <h2 className="text-2xl font-extrabold text-white mb-6">Editar perfil</h2>
        <div className="flex flex-col gap-4">
          {/* Sobre mim */}
          <textarea name="about" value={profile.about || ""} onChange={handleChange} placeholder="Sobre mim (até 250 caracteres)" maxLength={250} className="rounded-lg px-4 py-2 bg-neutral-900 text-white placeholder:text-neutral-500 resize-none" rows={3} />
          {/* O que busco */}
          <textarea name="lookingFor" value={profile.lookingFor || ""} onChange={handleChange} placeholder="O que busco (até 250 caracteres)" maxLength={250} className="rounded-lg px-4 py-2 bg-neutral-900 text-white placeholder:text-neutral-500 resize-none" rows={3} />
          {/* Relacionamento */}
          <select name="relationshipType" value={profile.relationshipType || ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Tipo de relacionamento</option>
            <option value="On line">On line</option>
            <option value="Presencial">Presencial</option>
            <option value="Ambos">Ambos</option>
          </select>
          {/* Altura */}
          <select name="height" value={profile.height || ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Altura</option>
            {Array.from({ length: 112 }, (_, i) => {
              const val = (1.39 + i * 0.01).toFixed(2).replace('.', ',');
              return <option key={val} value={`${val}m`}>{val} m</option>;
            })}
          </select>
          {/* Peso */}
          <select name="weight" value={profile.weight || ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Peso</option>
            {Array.from({ length: 106 }, (_, i) => {
              const val = 45 + i;
              return <option key={val} value={`${val}kg`}>{val} kg</option>;
            })}
          </select>
          {/* Filhos */}
          <select name="hasChildren" value={profile.hasChildren === true ? "Sim" : profile.hasChildren === false ? "Não" : ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Filhos?</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
          {/* Fuma */}
          <select name="smokes" value={profile.smokes === true ? "Sim" : profile.smokes === false ? "Não" : ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Fuma?</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
          {/* Bebe */}
          <select name="drinks" value={profile.drinks === true ? "Sim" : profile.drinks === false ? "Não" : ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Bebe?</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
          {/* Educação */}
          <select name="education" value={profile.education || ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Educação</option>
            <option value="Ensino Fundamental">Ensino Fundamental</option>
            <option value="Ensino Médio">Ensino Médio</option>
            <option value="Ensino Superior">Ensino Superior</option>
            <option value="Pós-graduação">Pós-graduação</option>
            <option value="Mestrado/Doutorado">Mestrado/Doutorado</option>
          </select>

          {/* Tipo de Usuário */}
          <select name="userType" value={profile.userType || ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Tipo de Usuário</option>
            <option value="sugar_baby">Sugar Baby</option>
            <option value="sugar_daddy">Sugar Daddy</option>
            <option value="sugar_mommy">Sugar Mommy</option>
            <option value="sugar_babyboy">Sugar Babyboy</option>
          </select>
          
          {/* Gênero */}
          <select name="gender" value={profile.gender || ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Gênero</option>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
          
          {/* Procuro */}
          <select name="lookingFor" value={profile.lookingFor || ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Procuro</option>
            <option value="male">Homens</option>
            <option value="female">Mulheres</option>
            <option value="both">Ambos</option>
          </select>

          {/* Disponível para viagem */}
          <select name="availableForTravel" value={profile.availableForTravel || ""} onChange={handleChange} className="rounded-lg px-4 py-2 bg-neutral-900 text-white">
            <option value="">Disponível para viagem?</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Depende">Depende</option>
          </select>
        </div>
        <button
          className="mt-8 w-full py-3 rounded-lg bg-pink-500 text-white font-bold text-lg hover:bg-pink-600 transition"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
} 