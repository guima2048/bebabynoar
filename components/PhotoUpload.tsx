'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';

interface PhotoUploadProps {
  userId: string;
  type: 'profile' | 'gallery';
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
        // Criar referência no Storage
        const timestamp = Date.now();
        const fileName = `${timestamp}_${fileData.file.name}`;
        const storageRef = ref(storage, `users/${userId}/${type}/${fileName}`);
        
        // Upload do arquivo
        const snapshot = await uploadBytes(storageRef, fileData.file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Atualizar progresso
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, progress: 100, status: 'success', url: downloadURL }
            : f
        ));
        
        return downloadURL;
      } catch (error) {
        // Removido console.error de produção
        toast.error('Erro no upload de arquivo');
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
      // Atualizar documento do usuário no Firestore
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const updateData: any = {};
          
          if (type === 'profile') {
            updateData.profilePhoto = successfulUrls[0];
          } else if (type === 'gallery') {
            // Buscar fotos existentes e adicionar as novas
            const existingPhotos = userDoc.data()?.photos || [];
            updateData.photos = [...existingPhotos, ...successfulUrls];
          }
          
          await updateDoc(userRef, updateData);
          toast.success(`${successfulUrls.length} foto(s) enviada(s) com sucesso!`);
          
          if (onUploadComplete) {
            onUploadComplete(successfulUrls);
          }
        }
      } catch (error) {
        // Removido console.error de produção
        toast.error('Erro ao atualizar perfil');
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
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-pink-500 bg-pink-50' 
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="text-sm text-gray-500">
              Formatos aceitos: JPEG, PNG, WebP • Máximo: {formatFileSize(maxSize)} por arquivo
            </p>
          </div>
        </div>
      </div>

      {/* Lista de arquivos */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Arquivos ({uploadedFiles.length}/{maxFiles})
          </h4>
          
          <div className="space-y-3">
            {uploadedFiles.map((fileData) => (
              <div
                key={fileData.id}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                {/* Preview */}
                <div className="flex-shrink-0">
                  <Image
                    src={fileData.preview}
                    alt={fileData.file.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded-lg"
                    loading="lazy"
                    placeholder="empty"
                    unoptimized
                  />
                </div>
                
                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileData.file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(fileData.file.size)}
                  </p>
                </div>
                
                {/* Status e Progresso */}
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {fileData.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">{fileData.progress}%</span>
                    </div>
                  )}
                  
                  {fileData.status === 'success' && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-600">Enviado</span>
                    </div>
                  )}
                  
                  {fileData.status === 'error' && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-red-600">Erro</span>
                    </div>
                  )}
                  
                  {/* Botão remover */}
                  <button
                    onClick={() => removeFile(fileData.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={fileData.status === 'uploading'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading global */}
      {isUploading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700">Enviando fotos...</span>
          </div>
        </div>
      )}
    </div>
  );
} 