'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageTestProps {
  imageUrl: string
  title: string
}

export default function ImageTest({ imageUrl, title }: ImageTestProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Função para processar URL da imagem
  const getImageUrl = (url: string) => {
    if (!url) return null
    
    console.log('🔍 [ImageTest] Processando imagem:', url)
    
    // Se já é uma URL relativa (começa com /), retorna como está
    if (url.startsWith('/')) {
      console.log('✅ [ImageTest] URL já é relativa:', url)
      return url
    }
    
    // Se é uma URL completa, extrai o pathname
    if (url.startsWith('http')) {
      try {
        const u = new URL(url)
        const pathname = u.pathname
        console.log('✅ [ImageTest] URL completa convertida para:', pathname)
        return pathname
      } catch {
        console.log('❌ [ImageTest] Erro ao processar URL completa:', url)
        return url
      }
    }
    
    // Se não tem / no início, adiciona
    if (!url.startsWith('/')) {
      const processedUrl = `/${url}`
      console.log('✅ [ImageTest] Adicionado / no início:', processedUrl)
      return processedUrl
    }
    
    return url
  }

  const processedUrl = getImageUrl(imageUrl)

  return (
    <div className="border border-gray-300 rounded-lg p-4 m-4">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          <strong>URL Original:</strong> {imageUrl || 'Nenhuma'}
        </p>
        <p className="text-sm text-gray-600">
          <strong>URL Processada:</strong> {processedUrl || 'Nenhuma'}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Status:</strong> 
          {imageError ? (
            <span className="text-red-500"> ❌ Erro ao carregar</span>
          ) : imageLoaded ? (
            <span className="text-green-500"> ✅ Carregada com sucesso</span>
          ) : (
            <span className="text-yellow-500"> ⏳ Carregando...</span>
          )}
        </p>
      </div>
      
      <div className="mt-4">
        {processedUrl && !imageError ? (
          <div className="relative w-full h-48 border border-gray-200 rounded">
            <Image
              src={processedUrl}
              alt={title}
              fill
              className="object-cover rounded"
              onError={(e) => {
                console.error('❌ [ImageTest] Erro ao carregar imagem:', processedUrl, e)
                setImageError(true)
              }}
              onLoad={() => {
                console.log('✅ [ImageTest] Imagem carregada com sucesso:', processedUrl)
                setImageLoaded(true)
              }}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
            <span className="text-gray-500">
              {imageError ? '❌ Erro ao carregar imagem' : '📷 Sem imagem'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
} 