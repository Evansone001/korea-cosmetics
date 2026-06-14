'use client'
import { Suspense, useState, useMemo, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon, SearchIcon, FilterIcon, Grid3X3Icon, LayoutGridIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"

const categories = [
    { name: "All", icon: "✨", count: null },
    { name: "Skincare", icon: "🧴", count: null },
    { name: "Makeup", icon: "💄", count: null },
    { name: "Hair Care", icon: "👱‍♀️", count: null },
    { name: "Body Care", icon: "🛁", count: null },
]

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const [selectedCategory, setSelectedCategory] = useState("All")
    const [sortBy, setSortBy] = useState("featured")
    const [viewMode, setViewMode] = useState<"grid" | "compact">("grid")
    const [selectedStore, setSelectedStore] = useState("")
    const [stores, setStores] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch stores for filter
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000'
                const response = await fetch(`${backendUrl}/api/stores?limit=50`)
                const data = await response.json()
                setStores(data.stores || [])
            } catch (err) {
                console.error('Failed to fetch stores:', err)
            }
        }
        fetchStores()
    }, [])

    // Fetch products from backend
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                setError(null)

                const params: any = {
                    limit: 100
                }

                if (search) {
                    params.search = search
                }

                if (selectedCategory !== "All") {
                    params.category = selectedCategory
                }

                if (selectedStore) {
                    params.store_id = selectedStore
                }

                // Map sort values to API parameters
                const sortMap: { [key: string]: string } = {
                    'newest': 'created_at',
                    'price-low': 'price',
                    'price-high': 'price',
                    'rating': 'rating'
                }

                if (sortBy !== 'featured' && sortMap[sortBy]) {
                    params.sort_by = sortMap[sortBy]
                    params.sort_order = sortBy === 'price-high' ? 'desc' : 'asc'
                }

                const response = await apiClient.getProducts(params)
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const products = (response.products || []).map((product: any) => ({
                    ...product,
                    images: (product.images || []).map((img: string) =>
                        img.startsWith('/uploads/') ? `${backendUrl}${img}` : img
                    )
                }));
                setProducts(products)
            } catch (err) {
                console.error('Failed to fetch products:', err)
                setError('Failed to load products. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [search, selectedCategory, sortBy, selectedStore])

    const productCount = products.length;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                        {error}
                    </div>
                </div>
            )}

            {/* Content */}
            {!loading && !error && (
            <>
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 border-b border-pink-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-800">
                                {search ? 'Search Results' : 'All Products'}
                            </h1>
                            <p className="text-slate-500 text-sm sm:text-base">
                                {search
                                    ? `Found ${productCount} result${productCount !== 1 ? 's' : ''} for "${search}"`
                                    : `Discover premium Korean cosmetics - ${productCount} products available`
                                }
                            </p>
                        </div>
                        {search && (
                            <button
                                onClick={() => router.push('/shop')}
                                className="flex items-center gap-2 bg-white hover:bg-pink-50 border border-pink-200 text-pink-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
                            >
                                <MoveLeftIcon size={18} />
                                Clear Search
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                                    selectedCategory === category.name
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <span>{category.icon}</span>
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <FilterIcon size={18} />
                            <span className="text-sm font-medium">Sort by:</span>
                        </div>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        >
                            <option value="featured">Featured</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Best Rated</option>
                        </select>
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-sm font-medium">Store:</span>
                        </div>
                        <select 
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                        >
                            <option value="">All Stores</option>
                            {stores.map((store) => (
                                <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{productCount} products</span>
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? 'bg-white shadow-sm text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <LayoutGridIcon size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode("compact")}
                                className={`p-2 rounded-md transition-colors ${viewMode === "compact" ? 'bg-white shadow-sm text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Grid3X3Icon size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                {products.length > 0 ? (
                    <div className={`grid gap-6 ${
                        viewMode === "grid"
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                    }`}>
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">No products found</h3>
                        <p className="text-slate-500 mb-6">
                            {search
                                ? `We couldn't find any products matching "${search}"`
                                : "No products available in this category"
                            }
                        </p>
                        <button
                            onClick={() => {
                                setSelectedCategory("All");
                                if (search) router.push('/shop');
                            }}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-rose-600 transition-colors"
                        >
                            {search ? 'Clear Search' : 'View All Products'}
                        </button>
                    </div>
                )}
            </div>
            </>
            )}
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading products...</p>
                </div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
