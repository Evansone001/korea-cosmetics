'use client'

import { useState } from 'react'
import Image, { StaticImageData } from 'next/image'

interface ImageWithFallbackProps {
  src: string | StaticImageData
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: string | StaticImageData
}

export default function ImageWithFallback({
  src,
  alt,
  width = 45,
  height = 45,
  className,
  fallback = '/images/product-placeholder.png',
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallback)
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      unoptimized={hasError}
    />
  )
}
