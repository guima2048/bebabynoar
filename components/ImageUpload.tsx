'use client'

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (url: string) => void;
  onImageRemove?: () => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  label = "Upload de Imagem",
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de arquivo não suportado: ${file.type}. Use JPEG, PNG ou WebP.`);
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 5MB.`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log('📤 Iniciando upload do arquivo:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-landing-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro na resposta da API:', result);
        throw new Error(result.details || result.error || 'Erro desconhecido no upload');
      }

      if (!result.success) {
        console.error('❌ Upload falhou:', result);
        throw new Error(result.error || 'Upload falhou');
      }

      console.log('✅ Upload realizado com sucesso:', result.url);
      onImageUpload(result.url);
      setError(null);
      
    } catch (error: any) {
      console.error('💥 Erro no upload:', error);
      
      let errorMessage = 'Erro ao fazer upload da imagem';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.code === 'storage/unauthorized') {
        errorMessage = 'Erro de autorização. Verifique as configurações do Firebase.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Limite de armazenamento excedido.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'Erro desconhecido no armazenamento. Verifique as configurações.';
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (onImageRemove) {
      onImageRemove();
    }
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {currentImageUrl ? (
          <div className="relative">
            <Image
              src={currentImageUrl}
              alt="Imagem atual"
              width={100}
              height={100}
              className="rounded-lg object-cover"
            />
            {onImageRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Selecionar Imagem</span>
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG ou WebP • Máximo 5MB
          </p>
        </div>
      </div>
    </div>
  );
} 