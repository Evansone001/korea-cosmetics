'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

interface SearchParamsHandlerProps {
    onOrderNumber: (orderNumber: string | null) => void
}

export default function SearchParamsHandler({ onOrderNumber }: SearchParamsHandlerProps) {
    const searchParams = useSearchParams()
    
    useEffect(() => {
        const orderNumberFromUrl = searchParams.get('order') || searchParams.get('tracking')
        onOrderNumber(orderNumberFromUrl)
    }, [searchParams, onOrderNumber])
    
    return null
}
