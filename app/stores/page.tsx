'use client'
import { Suspense, useState, useEffect } from 'react'
import { Store, Search, Filter, MapPin, Star, Package, Grid3X3Icon, LayoutGridIcon, MoveLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Store {
    id: string
    name: string
    description: string
    logo: string
    city: string
    state: string
    country: string
    customer_type: string
    featured: boolean
    ai_performance_score?: number
    product_count?: number
}

const regions = [
    { name: "All", icon: "🌍" },
    { name: "Nairobi", icon: "🏙️" },
    { name: "Lagos", icon: "🌆" },
    { name: "Cairo", icon: "🏛️" },
    { name: "Johannesburg", icon: "🏢" },
]

function StoresContent() {
    const router = useRouter()
    const [stores, setStores] = useState<Store[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRegion, setSelectedRegion] = useState("All")
    const [sortBy, setSortBy] = useState("featured")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [featuredOnly, setFeaturedOnly] = useState(false)

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true)
                setError(null)
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000'
                const response = await fetch(`${backendUrl}/api/stores?limit=50`)
                const data = await response.json()
                setStores(data.stores || [])
            } catch (err) {
                console.error('Failed to fetch stores:', err)
                setError('Failed to load stores')
            } finally {
                setLoading(false)
            }
        }
        fetchStores()
    }, [])

    const filteredStores = stores.filter(store => {
        const matchesSearch = !searchQuery || 
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRegion = selectedRegion === "All" || 
            store.city.toLowerCase().includes(selectedRegion.toLowerCase()) ||
            store.state.toLowerCase().includes(selectedRegion.toLowerCase())
        const matchesFeatured = !featuredOnly || store.featured
        return matchesSearch && matchesRegion && matchesFeatured
    })

    // Sort stores
    const sortedStores = [...filteredStores].sort((a, b) => {
        if (sortBy === 'featured') {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            return (b.ai_performance_score || 0) - (a.ai_performance_score || 0)
        } else if (sortBy === 'rating') {
            return (b.ai_performance_score || 0) - (a.ai_performance_score || 0)
        } else if (sortBy === 'products') {
            return (b.product_count || 0) - (a.product_count || 0)
        }
        return 0
    })

    const storeCount = sortedStores.length

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                        {error}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 border-b border-pink-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-800">
                                Partner Stores
                            </h1>
                            <p className="text-slate-500 text-sm sm:text-base">
                                Discover and shop from {storeCount} verified Korean cosmetics stores across Africa
                            </p>
                        </div>
                        <Link
                            href="/shop"
                            className="flex items-center gap-2 bg-white hover:bg-pink-50 border border-pink-200 text-pink-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
                        >
                            <MoveLeftIcon size={18} />
                            Shop Products
                        </Link>
                    </div>
                </div>
            </div>

            {/* Region Filter */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {regions.map((region) => (
                            <button
                                key={region.name}
                                onClick={() => setSelectedRegion(region.name)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                                    selectedRegion === region.name
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <span>{region.icon}</span>
                                {region.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search stores..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm w-64"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Filter size={18} />
                            <span className="text-sm font-medium">Sort by:</span>
                        </div>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        >
                            <option value="featured">Featured</option>
                            <option value="rating">Best Rated</option>
                            <option value="products">Most Products</option>
                        </select>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={featuredOnly}
                                onChange={(e) => setFeaturedOnly(e.target.checked)}
                                className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                            />
                            <span className="text-sm text-slate-700">Featured Only</span>
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{storeCount} stores</span>
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? 'bg-white shadow-sm text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGridIcon size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? 'bg-white shadow-sm text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Grid3X3Icon size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stores Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                {sortedStores.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏪</div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No stores found</h3>
                        <p className="text-slate-500 mb-6">
                            {searchQuery
                                ? `We couldn't find any stores matching "${searchQuery}"`
                                : "No stores available in this region"
                            }
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedRegion("All")
                                setFeaturedOnly(false)
                            }}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${
                        viewMode === "grid"
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1"
                    }`}>
                        {sortedStores.map((store) => (
                            <Link
                                key={store.id}
                                href={`/stores/${store.id}`}
                                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-pink-100 group-hover:to-rose-100 transition-colors">
                                        {store.logo ? (
                                            <img src={store.logo} alt={store.name} className="w-14 h-14 object-contain" />
                                        ) : (
                                            <Store className="w-10 h-10 text-pink-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-slate-900 truncate group-hover:text-pink-600 transition-colors">{store.name}</h3>
                                            {store.featured && (
                                                <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full flex-shrink-0">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            <span className="text-xs text-slate-500">{store.city}, {store.state}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                                                {store.customer_type}
                                            </span>
                                            {store.ai_performance_score && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-xs font-medium text-slate-700">{store.ai_performance_score.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{store.description}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Package className="w-4 h-4" />
                                        <span className="text-xs">{store.product_count || 0} products</span>
                                    </div>
                                    <span className="text-xs text-pink-600 font-medium group-hover:underline">
                                        View Store →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Stores() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading stores...</p>
                </div>
            </div>
        }>
            <StoresContent />
        </Suspense>
    );
}
