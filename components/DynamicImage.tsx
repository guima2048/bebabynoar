'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';

interface DynamicImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export default function DynamicImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  quality = 75
}: DynamicImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentFormatIndex, setCurrentFormatIndex] = useState(0);
  
  // Se é uma URL completa (começa com http), usar diretamente
  if (src.startsWith('http')) {
    if (imageError) {
      return (
        <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
          <Camera className="w-6 h-6 text-gray-400" />
        </div>
      );
    }
    
    // Verificar se é uma imagem do Firebase Storage
    const isFirebaseImage = src.includes('firebasestorage.googleapis.com') || src.includes('storage.googleapis.com');
    
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        quality={quality}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setImageError(true)}
        {...(isFirebaseImage && {
          unoptimized: false
        })}
      />
    );
  }
  
  // Se não é URL, tentar como arquivo local com múltiplos formatos
  const formats = ['webp', 'png', 'jpg', 'jpeg'];
  const currentSrc = `/landing/${src}.${formats[currentFormatIndex]}`;
  
  const handleError = () => {
    if (currentFormatIndex < formats.length - 1) {
      setCurrentFormatIndex((prev: number) => prev + 1);
    } else {
      setImageError(true);
    }
  };
  
  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <Camera className="w-6 h-6 text-gray-400" />
      </div>
    );
  }
  
  return (
    <Image
      src={currentSrc}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      quality={quality}
      loading={priority ? 'eager' : 'lazy'}
      onError={handleError}
    />
  );
} 