'use client'

import React, { useState, useEffect } from 'react'
import { 
  Upload, 
  Save, 
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ImageUpload from '@/components/ImageUpload'

interface Testimonial {
  id: string;
  name: string;
  location: string;
  story: string;
  rating: number;
  photo: string; // Agora será uma URL do Firebase Storage
  isActive: boolean;
}

interface ProfileCard {
  id: string;
  name: string;
  location: string;
  profession: string;
  photo: string; // Agora será uma URL do Firebase Storage
  isActive: boolean;
}

interface LandingSettings {
  bannerImageURL: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerDescription: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  testimonials: Testimonial[];
  sugarBabies: ProfileCard[];
  sugarDaddies: ProfileCard[];
  heroBaby1Image?: string;
  heroDaddy1Image?: string;
  heroBaby2Image?: string;
  heroDaddy2Image?: string;
}

export default function LandingSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('banner')
  
  const [formData, setFormData] = useState<LandingSettings>({
    bannerImageURL: '',
    bannerTitle: 'A Maior Rede Sugar do Brasil',
    bannerSubtitle: 'Mulheres Lindas, Homens Ricos',
    bannerDescription: 'Encontre sua conexão perfeita no Bebaby App. A plataforma mais confiável e segura para Sugar Babies e Sugar Daddies encontrarem relacionamentos genuínos.',
    primaryButtonText: 'Cadastre-se Grátis',
    primaryButtonLink: '/register',
    secondaryButtonText: 'Explorar Perfis',
    secondaryButtonLink: '/explore',
    testimonials: [],
    sugarBabies: [],
    sugarDaddies: [],
    heroBaby1Image: '',
    heroDaddy1Image: '',
    heroBaby2Image: '',
    heroDaddy2Image: ''
  })

  // Carregar configurações do Firebase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/landing-settings')
        if (response.ok) {
          const data = await response.json()
          setFormData({
            ...data,
            testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
            sugarBabies: Array.isArray(data.sugarBabies) ? data.sugarBabies : [],
            sugarDaddies: Array.isArray(data.sugarDaddies) ? data.sugarDaddies : [],
          })
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    if (saving) {
      return
    }
    
    try {
      setSaving(true)
      
      const response = await fetch('/api/landing-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        alert('Configurações salvas com sucesso!')
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert(`Erro ao salvar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setSaving(false)
    }
  }

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: `testimonial-${Date.now()}`,
      name: '',
      location: '',
      story: '',
      rating: 5,
      photo: '',
      isActive: true
    }
    setFormData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, newTestimonial]
    }))
  }

  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeTestimonial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }))
  }

  const addSugarBaby = () => {
    const newBaby: ProfileCard = {
      id: `baby-${Date.now()}`,
      name: '',
      location: '',
      profession: '',
      photo: '',
      isActive: true
    }
    setFormData(prev => ({
      ...prev,
      sugarBabies: [...prev.sugarBabies, newBaby]
    }))
  }

  const updateSugarBaby = (index: number, field: keyof ProfileCard, value: any) => {
    setFormData(prev => ({
      ...prev,
      sugarBabies: prev.sugarBabies.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeSugarBaby = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sugarBabies: prev.sugarBabies.filter((_, i) => i !== index)
    }))
  }

  const addSugarDaddy = () => {
    const newDaddy: ProfileCard = {
      id: `daddy-${Date.now()}`,
      name: '',
      location: '',
      profession: '',
      photo: '',
      isActive: true
    }
    setFormData(prev => ({
      ...prev,
      sugarDaddies: [...prev.sugarDaddies, newDaddy]
    }))
  }

  const updateSugarDaddy = (index: number, field: keyof ProfileCard, value: any) => {
    setFormData(prev => ({
      ...prev,
      sugarDaddies: prev.sugarDaddies.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removeSugarDaddy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sugarDaddies: prev.sugarDaddies.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/dashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao Dashboard
        </Link>
        <div className="h-6 w-px bg-gray-300"></div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Landing Page</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        {[
          { id: 'banner', label: 'Banner Principal' },
          { id: 'testimonials', label: 'Depoimentos' },
          { id: 'sugar-babies', label: 'Sugar Babies' },
          { id: 'sugar-daddies', label: 'Sugar Daddies' },
          { id: 'fotos', label: 'Fotos dos Cards' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Principal */}
          {activeTab === 'banner' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações do Banner</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={formData.bannerTitle}
                    onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Título do banner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formData.bannerSubtitle}
                    onChange={(e) => setFormData({ ...formData, bannerSubtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Subtítulo do banner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.bannerDescription}
                    onChange={(e) => setFormData({ ...formData, bannerDescription: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Descrição do banner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Botão Primário - Texto
                    </label>
                    <input
                      type="text"
                      value={formData.primaryButtonText}
                      onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Texto do botão"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Botão Primário - Link
                    </label>
                    <input
                      type="text"
                      value={formData.primaryButtonLink}
                      onChange={(e) => setFormData({ ...formData, primaryButtonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="/register"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Botão Secundário - Texto
                    </label>
                    <input
                      type="text"
                      value={formData.secondaryButtonText}
                      onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Texto do botão"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Botão Secundário - Link
                    </label>
                    <input
                      type="text"
                      value={formData.secondaryButtonLink}
                      onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="/explore"
                    />
                  </div>
                </div>

                <div>
                  <ImageUpload
                    currentImageUrl={formData.bannerImageURL}
                    onImageUpload={(url) => setFormData({ ...formData, bannerImageURL: url })}
                    onImageRemove={() => setFormData({ ...formData, bannerImageURL: '' })}
                    label="Imagem do Banner"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <ImageUpload
                      currentImageUrl={formData.heroBaby1Image}
                      onImageUpload={url => setFormData(prev => ({ ...prev, heroBaby1Image: url }))}
                      onImageRemove={() => setFormData(prev => ({ ...prev, heroBaby1Image: '' }))}
                      label="Hero Sugar Baby 1"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      currentImageUrl={formData.heroDaddy1Image}
                      onImageUpload={url => setFormData(prev => ({ ...prev, heroDaddy1Image: url }))}
                      onImageRemove={() => setFormData(prev => ({ ...prev, heroDaddy1Image: '' }))}
                      label="Hero Sugar Daddy 1"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      currentImageUrl={formData.heroBaby2Image}
                      onImageUpload={url => setFormData(prev => ({ ...prev, heroBaby2Image: url }))}
                      onImageRemove={() => setFormData(prev => ({ ...prev, heroBaby2Image: '' }))}
                      label="Hero Sugar Baby 2"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      currentImageUrl={formData.heroDaddy2Image}
                      onImageUpload={url => setFormData(prev => ({ ...prev, heroDaddy2Image: url }))}
                      onImageRemove={() => setFormData(prev => ({ ...prev, heroDaddy2Image: '' }))}
                      label="Hero Sugar Daddy 2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Testimonials */}
          {activeTab === 'testimonials' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Depoimentos</h2>
                <button
                  onClick={addTestimonial}
                  className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              
              <div className="space-y-6">
                {formData.testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Depoimento {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateTestimonial(index, 'isActive', !testimonial.isActive)}
                          className={`p-1 rounded ${
                            testimonial.isActive ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {testimonial.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => removeTestimonial(index)}
                          className="p-1 text-red-600 hover:text-red-800 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                        <input
                          type="text"
                          value={testimonial.location}
                          onChange={(e) => updateTestimonial(index, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Depoimento</label>
                      <textarea
                        value={testimonial.story}
                        onChange={(e) => updateTestimonial(index, 'story', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação (1-5)</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={testimonial.rating}
                          onChange={(e) => updateTestimonial(index, 'rating', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <ImageUpload
                        currentImageUrl={testimonial.photo}
                        onImageUpload={(url) => updateTestimonial(index, 'photo', url)}
                        onImageRemove={() => updateTestimonial(index, 'photo', '')}
                        label="Foto do Depoimento"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugar Babies */}
          {activeTab === 'sugar-babies' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Sugar Babies</h2>
                <button
                  onClick={addSugarBaby}
                  className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              
              <div className="space-y-6">
                {formData.sugarBabies.map((baby, index) => (
                  <div key={baby.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Sugar Baby {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSugarBaby(index, 'isActive', !baby.isActive)}
                          className={`p-1 rounded ${
                            baby.isActive ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {baby.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => removeSugarBaby(index)}
                          className="p-1 text-red-600 hover:text-red-800 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={baby.name}
                          onChange={(e) => updateSugarBaby(index, 'name', e.target.value)}
                          placeholder="Nome (opcional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                        <input
                          type="text"
                          value={baby.location}
                          onChange={(e) => updateSugarBaby(index, 'location', e.target.value)}
                          placeholder="Localização (opcional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <ImageUpload
                        currentImageUrl={baby.photo}
                        onImageUpload={(url) => updateSugarBaby(index, 'photo', url)}
                        onImageRemove={() => updateSugarBaby(index, 'photo', '')}
                        label="Foto da Sugar Baby"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugar Daddies */}
          {activeTab === 'sugar-daddies' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Sugar Daddies</h2>
                <button
                  onClick={addSugarDaddy}
                  className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              
              <div className="space-y-6">
                {formData.sugarDaddies.map((daddy, index) => (
                  <div key={daddy.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Sugar Daddy {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSugarDaddy(index, 'isActive', !daddy.isActive)}
                          className={`p-1 rounded ${
                            daddy.isActive ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {daddy.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => removeSugarDaddy(index)}
                          className="p-1 text-red-600 hover:text-red-800 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                          type="text"
                          value={daddy.name}
                          onChange={(e) => updateSugarDaddy(index, 'name', e.target.value)}
                          placeholder="Nome (opcional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                        <input
                          type="text"
                          value={daddy.location}
                          onChange={(e) => updateSugarDaddy(index, 'location', e.target.value)}
                          placeholder="Localização (opcional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <ImageUpload
                        currentImageUrl={daddy.photo}
                        onImageUpload={(url) => updateSugarDaddy(index, 'photo', url)}
                        onImageRemove={() => updateSugarDaddy(index, 'photo', '')}
                        label="Foto do Sugar Daddy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fotos dos Cards */}
          {activeTab === 'fotos' && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Fotos dos Cards</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...formData.sugarBabies, ...formData.sugarDaddies].map((card, i) => (
                  <div key={card.id} className="flex flex-col items-center bg-gray-50 rounded-lg p-4 shadow-sm">
                    <ImageUpload
                      currentImageUrl={card.photo}
                      onImageUpload={url => {
                        if (i < formData.sugarBabies.length) {
                          updateSugarBaby(i, 'photo', url)
                        } else {
                          updateSugarDaddy(i - formData.sugarBabies.length, 'photo', url)
                        }
                      }}
                      onImageRemove={() => {
                        if (i < formData.sugarBabies.length) {
                          updateSugarBaby(i, 'photo', '')
                        } else {
                          updateSugarDaddy(i - formData.sugarBabies.length, 'photo', '')
                        }
                      }}
                      label={i < formData.sugarBabies.length ? 'Sugar Baby' : 'Sugar Daddy'}
                    />
                    {card.name && <span className="mt-2 text-sm text-gray-700 font-medium">{card.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão Salvar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Todas as Configurações
              </>
            )}
          </button>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preview da Landing Page</h2>
            
            <div className="space-y-4">
              {/* Banner Preview */}
              <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-lg overflow-hidden">
                {formData.bannerImageURL && (
                  <div className="absolute inset-0">
                    <Image
                      src={formData.bannerImageURL}
                      alt="Banner preview"
                      fill
                      className="object-cover opacity-20"
                    />
                  </div>
                )}
                
                <div className="relative z-10 p-6 text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {formData.bannerTitle}
                  </h1>
                  <h2 className="text-lg text-gray-700 mb-3">
                    {formData.bannerSubtitle}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {formData.bannerDescription}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <button className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      {formData.primaryButtonText}
                    </button>
                    <button className="border-2 border-pink-600 text-pink-600 px-4 py-2 rounded-lg text-sm font-semibold">
                      {formData.secondaryButtonText}
                    </button>
                  </div>
                </div>
              </div>

              {/* Testimonials Preview */}
              {activeTab === 'testimonials' && formData.testimonials.filter(t => t.isActive).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Depoimentos Ativos</h3>
                  <div className="space-y-2">
                    {formData.testimonials.filter(t => t.isActive).slice(0, 2).map((testimonial, index) => (
                      <div key={index} className="bg-white rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{testimonial.name}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{testimonial.location}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">"{testimonial.story}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar Babies Preview */}
              {activeTab === 'sugar-babies' && formData.sugarBabies.filter(b => b.isActive).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Sugar Babies Ativas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.sugarBabies.filter(b => b.isActive).slice(0, 4).map((baby, index) => (
                      <div key={index} className="bg-white rounded p-2 text-center">
                        <div className="w-8 h-8 bg-pink-100 rounded-full mx-auto mb-1"></div>
                        {baby.name && <p className="text-xs font-medium">{baby.name}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugar Daddies Preview */}
              {activeTab === 'sugar-daddies' && formData.sugarDaddies.filter(d => d.isActive).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Sugar Daddies Ativos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.sugarDaddies.filter(d => d.isActive).slice(0, 4).map((daddy, index) => (
                      <div key={index} className="bg-white rounded p-2 text-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1"></div>
                        {daddy.name && <p className="text-xs font-medium">{daddy.name}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Informações</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Todas as alterações são salvas no Firebase</li>
              <li>• Use o ícone de olho para ativar/desativar itens</li>
              <li>• As imagens devem estar na pasta <code>public/landing/</code></li>
              <li>• Formatos suportados: WebP, PNG, JPG, JPEG</li>
              <li>• Apenas itens ativos aparecem na landing page</li>
              <li>• Clique em "Salvar" para aplicar as mudanças</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 