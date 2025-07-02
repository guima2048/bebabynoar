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
}

export default function DynamicImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  priority = false
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
    
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        onError={() => setImageError(true)}
      />
    );
  }
  
  // Se não é URL, tentar como arquivo local com múltiplos formatos
  const formats = ['webp', 'png', 'jpg', 'jpeg'];
  const currentSrc = `/landing/${src}.${formats[currentFormatIndex]}`;
  
  const handleError = () => {
    if (currentFormatIndex < formats.length - 1) {
      setCurrentFormatIndex(prev => prev + 1);
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
      onError={handleError}
    />
  );
} 