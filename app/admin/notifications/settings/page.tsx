'use client'

import React, { useEffect, useState } from 'react'
import { getFirestoreDB } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

const notificationTypes = [
  { key: 'trip', label: 'Viagem para sua cidade' },
  { key: 'visit', label: 'Visita ao perfil' },
  { key: 'favorite', label: 'Favorecimento' },
  { key: 'message', label: 'Nova mensagem' },
]

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const db = getFirestoreDB()
        if (!db) {
          console.error('Firestore não está inicializado')
          return
        }
        const ref = doc(db, 'admin', 'notificationSettings')
        const snap = await getDoc(ref)
        if (snap.exists()) setSettings(snap.data())
      } catch {}
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleChange = (type: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const db = getFirestoreDB()
      if (!db) {
        console.error('Firestore não está inicializado')
        toast.error('Erro de configuração do banco de dados')
        return
      }
      const ref = doc(db, 'admin', 'notificationSettings')
      await setDoc(ref, settings, { merge: true })
      toast.success('Configurações salvas!')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Configurações de Notificações</h1>
      <div className="space-y-8">
        {notificationTypes.map(({ key, label }) => (
          <div key={key} className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">{label}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Tempo mínimo de cadastro (dias)</label>
                <input type="number" min={0} className="w-full border rounded px-2 py-1" value={settings[key]?.minSignupDays || ''} onChange={e => handleChange(key, 'minSignupDays', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Tempo máximo desde último login (dias)</label>
                <input type="number" min={0} className="w-full border rounded px-2 py-1" value={settings[key]?.maxLastLoginDays || ''} onChange={e => handleChange(key, 'maxLastLoginDays', e.target.value)} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1">Template de email</label>
              <textarea className="w-full border rounded px-2 py-1 min-h-[80px] font-mono" value={settings[key]?.emailTemplate || ''} onChange={e => handleChange(key, 'emailTemplate', e.target.value)} placeholder="Ex: Olá {{username}}, você recebeu uma nova notificação..." />
              <div className="text-xs text-gray-500 mt-1">Use variáveis: {'{{username}}'}, {'{{city}}'}, {'{{state}}'}, {'{{start}}'}, {'{{end}}'}, etc.</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end mt-8">
        <button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold shadow">
          {saving ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>
    </div>
  )
} 