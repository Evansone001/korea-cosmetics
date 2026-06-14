'use client'
import { useEffect, useRef } from 'react'

interface LiveMapProps {
    driverLat: number
    driverLng: number
    destinationLat?: number
    destinationLng?: number
    updatedAt?: string
}

export default function LiveMap({ driverLat, driverLng, destinationLat, destinationLng, updatedAt }: LiveMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const driverMarkerRef = useRef<any>(null)

    useEffect(() => {
        let L: any
        ;(async () => {
            L = (await import('leaflet')).default
            await import('leaflet/dist/leaflet.css')

            if (!mapRef.current || mapInstanceRef.current) return

            const map = L.map(mapRef.current).setView([driverLat, driverLng], 14)
            mapInstanceRef.current = map

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map)

            const driverIcon = L.divIcon({
                html: `<div style="background:#2563eb;border:3px solid white;border-radius:50%;width:24px;height:24px;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                className: '',
            })

            driverMarkerRef.current = L.marker([driverLat, driverLng], { icon: driverIcon })
                .addTo(map)
                .bindPopup(`<b>Driver</b><br>${updatedAt ? 'Updated: ' + new Date(updatedAt).toLocaleTimeString() : ''}`)

            if (destinationLat && destinationLng) {
                const destIcon = L.divIcon({
                    html: `<div style="background:#dc2626;border:3px solid white;border-radius:4px;width:20px;height:20px;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 20],
                    className: '',
                })
                L.marker([destinationLat, destinationLng], { icon: destIcon })
                    .addTo(map)
                    .bindPopup('<b>Delivery Address</b>')

                const bounds = L.latLngBounds(
                    [driverLat, driverLng],
                    [destinationLat, destinationLng]
                )
                map.fitBounds(bounds, { padding: [40, 40] })
            }
        })()

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
                driverMarkerRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (!driverMarkerRef.current || !mapInstanceRef.current) return
        const L_mod = require('leaflet')
        driverMarkerRef.current.setLatLng([driverLat, driverLng])
        driverMarkerRef.current.setPopupContent(
            `<b>Driver</b><br>${updatedAt ? 'Updated: ' + new Date(updatedAt).toLocaleTimeString() : ''}`
        )
        mapInstanceRef.current.panTo([driverLat, driverLng], { animate: true, duration: 0.5 })
    }, [driverLat, driverLng, updatedAt])

    return <div ref={mapRef} style={{ height: '320px', width: '100%', borderRadius: '12px', zIndex: 0 }} />
}
