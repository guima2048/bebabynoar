'use client'

import React, { useState } from 'react';
import Image from 'next/image';

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
  className = '',
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  quality = 75
}: DynamicImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Se é uma URL completa ou caminho local, usar Image do Next.js
  if (src.startsWith('http') || src.startsWith('/')) {
    if (imageError) {
      return (
        <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
          <span className="text-gray-400 text-sm">📷</span>
        </div>
      );
    }
    
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
      />
    );
  }
  
  // Para imagens que não existem ou são placeholders, mostrar placeholder adequado
  const getPlaceholderColor = (imageName: string) => {
    const colors: Record<string, string> = {
      'hero-baby-1': 'bg-pink-200',
      'hero-baby-2': 'bg-pink-300',
      'hero-daddy-1': 'bg-blue-200',
      'hero-daddy-2': 'bg-blue-300',
      'default': 'bg-gray-200'
    };
    return colors[imageName] || colors.default;
  };
  
  return (
    <div className={`${getPlaceholderColor(src)} flex items-center justify-center ${className}`}>
      <div className="text-center">
        <span className="text-2xl mb-2 block">📷</span>
        <span className="text-xs text-gray-500 block">{alt}</span>
      </div>
    </div>
  );
} 