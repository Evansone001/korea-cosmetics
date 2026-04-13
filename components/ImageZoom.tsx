'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, X } from 'lucide-react'
import type { StaticImageData } from 'next/image'

interface ImageZoomProps {
    src: string | StaticImageData
    alt: string
    width?: number
    height?: number
}

const ImageZoom = ({ src, alt, width = 500, height = 500 }: ImageZoomProps) => {
    const [isZoomed, setIsZoomed] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [showLightbox, setShowLightbox] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMousePosition({ x, y })
    }

    return (
        <>
            <div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 cursor-zoom-in group w-full max-w-full aspect-square"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setShowLightbox(true)}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'}`}
                    style={{
                        transformOrigin: isZoomed ? `${mousePosition.x}% ${mousePosition.y}%` : 'center'
                    }}
                />
                {isZoomed && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                            <ZoomIn size={16} className="text-pink-600" />
                        </div>
                    </div>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        Click to zoom
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {showLightbox && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowLightbox(false)}
                >
                    <button
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowLightbox(false)
                        }}
                    >
                        <X size={24} className="text-white" />
                    </button>
                    <div className="relative max-w-5xl max-h-[90vh]">
                        <Image
                            src={src}
                            alt={alt}
                            width={1200}
                            height={1200}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    )
}

export default ImageZoom
