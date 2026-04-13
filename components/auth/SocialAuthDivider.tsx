'use client'
import React from 'react'

interface SocialAuthDividerProps {
  className?: string
}

const SocialAuthDivider: React.FC<SocialAuthDividerProps> = ({ className = '' }) => {
  return (
    <div className={`relative my-6 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-500">
          OR continue with
        </span>
      </div>
    </div>
  )
}

export default SocialAuthDivider
