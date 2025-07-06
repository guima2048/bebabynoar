'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';

interface PhotoUploadProps {
  userId: string;
  type: 'profile' | 'gallery' | 'private';
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // em bytes
  acceptedTypes?: string[];
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
}

export default function PhotoUpload({
  userId,
  type,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: PhotoUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Compressão client-side
    const compressedFiles = await Promise.all(acceptedFiles.map(async (file) => {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressed = await imageCompression(file, options);
        return compressed;
      } catch (e) {
        return file;
      }
    }));
    const newFiles: UploadedFile[] = compressedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading'
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    handleUpload(newFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
    multiple: true
  });

  const handleUpload = async (files: UploadedFile[]) => {
    setIsUploading(true);
    const uploadPromises = files.map(async (fileData) => {
      try {
        // Usar API backend
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('isPrivate', type === 'private' ? 'true' : 'false');
        
        console.log('📸 [PhotoUpload] Enviando para API backend...');
        
        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('📸 [PhotoUpload] Erro da API:', errorText);
          throw new Error(errorText);
        }
        
        const result = await response.json();
        console.log('📸 [PhotoUpload] Resposta da API:', result);
        
        if (result.success && result.photo?.url) {
          // Atualizar progresso
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress: 100, status: 'success', url: result.photo.url }
              : f
          ));
          
          return result.photo.url;
        } else {
          throw new Error(result.error || 'Upload falhou');
        }
        
      } catch (error: any) {
        console.error('📸 [PhotoUpload] Erro no upload:', error);
        
        let errorMessage = 'Erro no upload de arquivo';
        if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error' }
            : f
        ));
        return null;
      }
    });

    const urls = await Promise.all(uploadPromises);
    const successfulUrls = urls.filter(url => url !== null) as string[];
    
    if (successfulUrls.length > 0) {
      toast.success(`${successfulUrls.length} foto(s) enviada(s) com sucesso!`);
      
      if (onUploadComplete) {
        onUploadComplete(successfulUrls);
      }
    }
    
    setIsUploading(false);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) { return '0 Bytes' }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Área de Drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-pink-500 bg-pink-50 scale-105 shadow-lg' 
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Solte as fotos aqui' : 'Arraste e solte suas fotos'}
            </h3>
            <p className="text-gray-600 mb-4">
              ou clique para selecionar arquivos
            </p>
            <p className="text-xs text-gray-500">
              Formatos aceitos: <span className="font-semibold">JPEG, PNG, WebP</span> • Máximo: <span className="font-semibold">{formatFileSize(maxSize)}</span> por arquivo
            </p>
          </div>
        </div>
      </div>

      {/* Lista de arquivos */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Arquivos enviados ({uploadedFiles.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {uploadedFiles.map((fileData) => (
              <div key={fileData.id} className="relative bg-white rounded-lg border p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={fileData.preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileData.file.size)}
                    </p>
                    <div className="mt-1">
                      {fileData.status === 'uploading' && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${fileData.progress}%` }}
                          />
                        </div>
                      )}
                      {fileData.status === 'success' && (
                        <span className="text-green-600 text-xs font-medium">✓ Enviado</span>
                      )}
                      {fileData.status === 'error' && (
                        <span className="text-red-600 text-xs font-medium">✗ Erro</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 