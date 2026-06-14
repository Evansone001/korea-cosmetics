'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { MapPin, Navigation, CheckCircle, XCircle, AlertCircle, Truck } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const UPDATE_INTERVAL_MS = 10_000

type Status = 'idle' | 'requesting' | 'active' | 'denied' | 'error'

export default function DriverPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const orderId = params.orderId as string
    const token = searchParams.get('token') || ''

    const [status, setStatus] = useState<Status>('idle')
    const [accuracy, setAccuracy] = useState<number | null>(null)
    const [lastSent, setLastSent] = useState<Date | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [deliveredConfirmed, setDeliveredConfirmed] = useState(false)
    const watchIdRef = useRef<number | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const latestPositionRef = useRef<{ lat: number; lng: number } | null>(null)

    const sendLocation = useCallback(async (lat: number, lng: number) => {
        if (!token || !orderId) return
        try {
            await fetch(`${API_BASE}/api/orders/${orderId}/driver-location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, lat, lng }),
            })
            setLastSent(new Date())
        } catch {
            // silent — will retry on next interval
        }
    }, [token, orderId])

    const startTracking = () => {
        if (!navigator.geolocation) {
            setStatus('error')
            setErrorMsg('Your browser does not support GPS. Use Chrome on Android or Safari on iPhone.')
            return
        }
        if (!token) {
            setStatus('error')
            setErrorMsg('Invalid driver link. Please ask your dispatcher for a new link.')
            return
        }

        setStatus('requesting')

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                latestPositionRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                setAccuracy(Math.round(pos.coords.accuracy))
                setStatus('active')
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setStatus('denied')
                    setErrorMsg('Location permission denied. Please enable GPS and refresh.')
                } else {
                    setStatus('error')
                    setErrorMsg(`GPS error: ${err.message}`)
                }
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        )

        intervalRef.current = setInterval(() => {
            if (latestPositionRef.current) {
                sendLocation(latestPositionRef.current.lat, latestPositionRef.current.lng)
            }
        }, UPDATE_INTERVAL_MS)
    }

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setStatus('idle')
        latestPositionRef.current = null
    }

    useEffect(() => {
        return () => {
            stopTracking()
        }
    }, [])

    const statusConfig = {
        idle: { color: 'bg-gray-100 text-gray-700', icon: <Navigation size={20} />, label: 'Not sharing' },
        requesting: { color: 'bg-yellow-100 text-yellow-700', icon: <Navigation size={20} className="animate-pulse" />, label: 'Getting GPS…' },
        active: { color: 'bg-green-100 text-green-700', icon: <Navigation size={20} />, label: 'Sharing live location' },
        denied: { color: 'bg-red-100 text-red-700', icon: <XCircle size={20} />, label: 'Permission denied' },
        error: { color: 'bg-red-100 text-red-700', icon: <AlertCircle size={20} />, label: 'Error' },
    }

    const cfg = statusConfig[status]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Truck className="w-8 h-8 text-pink-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Driver Tracking</h1>
                    <p className="text-sm text-gray-500 mt-1">Order <span className="font-mono font-medium">{orderId}</span></p>
                </div>

                {/* Status card */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 ${cfg.color}`}>
                    {cfg.icon}
                    <span className="font-medium text-sm">{cfg.label}</span>
                    {status === 'active' && accuracy !== null && (
                        <span className="ml-auto text-xs opacity-70">±{accuracy}m</span>
                    )}
                </div>

                {/* Error message */}
                {(status === 'denied' || status === 'error') && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
                        {errorMsg}
                    </div>
                )}

                {/* Last sent */}
                {lastSent && status === 'active' && (
                    <p className="text-center text-xs text-gray-400 mb-4">
                        Last sent: {lastSent.toLocaleTimeString()} · updates every {UPDATE_INTERVAL_MS / 1000}s
                    </p>
                )}

                {/* Action button */}
                {status !== 'active' && !deliveredConfirmed ? (
                    <button
                        onClick={startTracking}
                        disabled={status === 'requesting'}
                        className="w-full py-4 bg-pink-600 text-white rounded-xl font-semibold text-base hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <MapPin size={18} />
                        {status === 'requesting' ? 'Waiting for GPS…' : 'Start Sharing Location'}
                    </button>
                ) : !deliveredConfirmed ? (
                    <button
                        onClick={stopTracking}
                        className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold text-base hover:bg-gray-300 flex items-center justify-center gap-2"
                    >
                        <XCircle size={18} />
                        Stop Sharing
                    </button>
                ) : null}

                {/* Mark as delivered */}
                {status === 'active' && !deliveredConfirmed && (
                    <button
                        onClick={() => {
                            stopTracking()
                            setDeliveredConfirmed(true)
                        }}
                        className="w-full mt-3 py-4 bg-green-600 text-white rounded-xl font-semibold text-base hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={18} />
                        Mark as Delivered
                    </button>
                )}

                {deliveredConfirmed && (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                        <h2 className="text-lg font-bold text-gray-900">Delivery Complete</h2>
                        <p className="text-sm text-gray-500 mt-1">Location sharing has stopped. Thank you!</p>
                    </div>
                )}

                <p className="text-center text-xs text-gray-400 mt-6">
                    Keep this page open while delivering. Location updates every {UPDATE_INTERVAL_MS / 1000} seconds.
                </p>
            </div>
        </div>
    )
}
