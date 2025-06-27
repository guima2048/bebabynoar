'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface PhotoGalleryProps {
  photos: string[];
  userId: string;
  isOwner: boolean;
  onPhotoDelete?: (photoUrl: string) => void;
}

export default function PhotoGallery({ photos, userId, isOwner, onPhotoDelete }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!isOwner) { return }

    setIsDeleting(photoUrl);
    
    try {
      const response = await fetch(`/api/upload-photo?userId=${userId}&photoUrl=${encodeURIComponent(photoUrl)}&type=gallery`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Foto removida com sucesso');
        if (onPhotoDelete) {
          onPhotoDelete(photoUrl);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao remover foto');
      }
    } catch (error) {
      toast.error('Erro ao remover foto');
    } finally {
      setIsDeleting(null);
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma foto ainda</h3>
        <p className="text-gray-500">
          {isOwner ? 'Adicione fotos para mostrar mais sobre você' : 'Este usuário ainda não adicionou fotos'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Grid de fotos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photoUrl, index) => (
          <div
            key={index}
            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          >
            <Image
              src={photoUrl}
              alt={`Foto ${index + 1}`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              onClick={() => setSelectedPhoto(photoUrl)}
            />
            
            {/* Overlay com ações */}
            {isOwner && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photoUrl);
                  }}
                  disabled={isDeleting === photoUrl}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                >
                  {isDeleting === photoUrl ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de visualização */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <Image
              src={selectedPhoto}
              alt="Foto ampliada"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
} 