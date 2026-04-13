'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, MessageCircle, Link as LinkIcon, Check } from 'lucide-react'

interface SocialShareProps {
    productUrl: string
    productName: string
    productImage?: string
}

const SocialShare = ({ productUrl, productName, productImage }: SocialShareProps) => {
    const [copied, setCopied] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${productName} on KoreaCosmetics!`)}&url=${encodeURIComponent(productUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out ${productName}: ${productUrl}`)}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&media=${encodeURIComponent(productImage || '')}&description=${encodeURIComponent(productName)}`,
    }

    const copyLink = async () => {
        await navigator.clipboard.writeText(productUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50/50 transition-all font-medium"
            >
                <Share2 size={18} />
                Share
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 sm:left-auto right-0 sm:right-auto mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 sm:p-4 z-20 min-w-[180px] sm:min-w-[200px]">
                    <div className="grid grid-cols-2 gap-2">
                        <a
                            href={shareUrls.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            <Facebook size={20} className="text-blue-600" />
                            <span className="text-xs text-slate-600">Facebook</span>
                        </a>
                        <a
                            href={shareUrls.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-sky-50 transition-colors"
                        >
                            <Twitter size={20} className="text-sky-500" />
                            <span className="text-xs text-slate-600">Twitter</span>
                        </a>
                        <a
                            href={shareUrls.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-green-50 transition-colors"
                        >
                            <MessageCircle size={20} className="text-green-600" />
                            <span className="text-xs text-slate-600">WhatsApp</span>
                        </a>
                        <button
                            onClick={copyLink}
                            className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            {copied ? (
                                <Check size={20} className="text-green-600" />
                            ) : (
                                <LinkIcon size={20} className="text-slate-600" />
                            )}
                            <span className="text-xs text-slate-600">{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SocialShare
