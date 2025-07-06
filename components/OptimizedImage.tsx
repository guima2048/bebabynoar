import React from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL
}) => {
  // Configurações otimizadas para diferentes tipos de imagem
  const imageProps = {
    src,
    alt,
    className,
    priority,
    quality,
    placeholder,
    blurDataURL,
    ...(fill && { fill }),
    ...(!fill && { width, height }),
    ...(sizes && { sizes })
  }

  return <Image {...imageProps} />
}

export default OptimizedImage 