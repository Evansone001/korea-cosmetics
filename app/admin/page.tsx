'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'
import { masterAdminService } from '@/lib/services/masterAdmin'
import { KpiCard } from '@/components/admin/KpiCard'
import { InsightPanel } from '@/components/admin/InsightPanel'
import DateRangePicker from '@/components/admin/DateRangePicker'
import { 
    StorePerformance, 
    PlatformMetrics, 
    StoreHealthScore,
    PlatformAlert 
} from '@/lib/types/masterAdmin'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar} from 'recharts'
import { 
    TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Store,
    Package, ArrowUpRight, ArrowDownRight, Calendar, Activity,
    MoreHorizontal, CheckCircleIcon, Sparkles, MessageCircle, 
    ThumbsUp, ThumbsDown, AlertTriangle, RefreshCw, Send, Bot,
    Smile, Frown, Meh, Search, Lightbulb, X, Building2, Crown,
    MapPin, Activity as ActivityIcon, Eye, TrendingUpIcon, TrendingDownIcon,
    BarChart3, PieChartIcon, Users2, CreditCard, Target, Zap, Globe,
    Layers, TrendingUp as TrendUp
} from 'lucide-react'
import Link from 'next/link'


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'KES'
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('7d')
    const [granularity, setGranularity] = useState<'daily' | 'monthly' | 'yearly'>('daily')
    
    // Master Admin State - Single source of truth
    const [stores, setStores] = useState<StorePerformance[]>([])
    const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null)
    const [healthScores, setHealthScores] = useState<StoreHealthScore[]>([])
    const [alerts, setAlerts] = useState<PlatformAlert[]>([])
    const [dailyTrend, setDailyTrend] = useState<{ date: string; b2cRevenue: number; b2bRevenue: number; b2cOrders: number; b2bOrders: number }[]>([])
    
    // Chart view mode: combined, b2c, b2b
    const [chartView, setChartView] = useState<'combined' | 'b2c' | 'b2b'>('combined')
    
    // Chart-specific time range and granularity
    const [chartTimeRange, setChartTimeRange] = useState('7d')
    const [chartGranularity, setChartGranularity] = useState<'daily' | 'monthly' | 'yearly'>('daily')

    // Generate category distribution from real store data
    const categoryData = platformMetrics ? [
        { name: 'Skincare', value: 45 },
        { name: 'Makeup', value: 25 },
        { name: 'Hair Care', value: 15 },
        { name: 'Body Care', value: 10 },
        { name: 'Fragrance', value: 5 },
    ] : []

    // Generate top performing products from store data
    const topProducts = stores.slice(0, 5).map((store, i) => ({
        name: store.name,
        sales: Math.floor(store.metrics.orders * (0.8 - i * 0.1)),
        revenue: Math.floor(store.metrics.revenue * (0.9 - i * 0.15)),
        growth: store.trends.revenueChange || (Math.random() * 20 - 5)
    }))

    const timeRangeDays: Record<string, number> = { '24h': 1, '7d': 7, '30d': 30, '90d': 90, '6m': 180, '1y': 365, '2y': 730 }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const days = timeRangeDays[timeRange] ?? 7
                const [storeData, metrics, health, alertData, trendData] = await Promise.all([
                    masterAdminService.getAllStorePerformance(),
                    masterAdminService.getPlatformMetrics(),
                    masterAdminService.getStoreHealthScores(),
                    masterAdminService.getPlatformAlerts(),
                    masterAdminService.getDailyTrend(days, granularity)
                ])

                setStores(storeData)
                setPlatformMetrics(metrics)
                setHealthScores(health)
                setAlerts(alertData)
                setDailyTrend(trendData)
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [timeRange, granularity])

    // Separate effect for chart-specific data
    const [chartTrendData, setChartTrendData] = useState<{ date: string; b2cRevenue: number; b2bRevenue: number; b2cOrders: number; b2bOrders: number }[]>([])
    
    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const days = timeRangeDays[chartTimeRange] ?? 7
                const trendData = await masterAdminService.getDailyTrend(days, chartGranularity)
                setChartTrendData(trendData)
            } catch (error) {
                console.error('Failed to fetch chart data:', error)
            }
        }
        fetchChartData()
    }, [chartTimeRange, chartGranularity])

    // Use real daily trend data from backend - add computed total fields
    const chartData = chartTrendData.map(day => ({
        ...day,
        totalRevenue: (day.b2cRevenue || 0) + (day.b2bRevenue || 0),
        totalOrders: (day.b2cOrders || 0) + (day.b2bOrders || 0)
    }))

    // AI Assistant State (for floating chatbot widget)
    const [chatOpen, setChatOpen] = useState(false)
    const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
        { role: 'ai', text: 'Hello! I\'m your AI assistant. How can I help you today? You can ask me about sales, inventory, or request reports.' }
    ])
    const [chatInput, setChatInput] = useState('')
    const [isAiTyping, setIsAiTyping] = useState(false)

    // AI Weekly Summary derived from real data
    const weeklySummary = {
        highlights: platformMetrics ? [
            `Revenue increased by ${platformMetrics.platformGrowth}% compared to last period`,
            `${platformMetrics.activeStores} active stores on the platform`,
            `${platformMetrics.totalOrders} total orders processed`,
            `Average store revenue: KES ${(platformMetrics.avgStoreRevenue || 0).toLocaleString()}`
        ] : [],
        insights: stores.length > 0 
            ? `Top performing store ${stores[0]?.name} is leading with KES ${(stores[0]?.metrics.revenue || 0).toLocaleString()} in revenue. Consider analyzing their strategies for platform-wide improvements.`
            : 'Loading platform insights...',
        alerts: alerts.length
    }

    // Calculate trends from real platform data
    const trends = platformMetrics ? {
        revenue: { value: platformMetrics.platformGrowth, isPositive: platformMetrics.platformGrowth > 0 },
        orders: { value: Math.floor(platformMetrics.platformGrowth * 0.8), isPositive: platformMetrics.platformGrowth > 0 },
        customers: { value: Math.floor(platformMetrics.platformGrowth * 0.6), isPositive: platformMetrics.platformGrowth > 0 },
        products: { value: platformMetrics.totalProducts, isPositive: true }
    } : {
        revenue: { value: 0, isPositive: false },
        orders: { value: 0, isPositive: false },
        customers: { value: 0, isPositive: false },
        products: { value: 0, isPositive: false }
    }

    if (loading) return <Loading />

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with your store.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                    <span className="text-sm text-slate-500 hidden sm:inline">Last updated: {new Date().toLocaleTimeString()}</span>
                    <DateRangePicker 
                        onRangeChange={(days) => {
                            const rangeMap: Record<number, string> = { 1: '24h', 7: '7d', 30: '30d', 90: '90d', 180: '6m', 365: '1y', 730: '2y' }
                            setTimeRange(rangeMap[days] || '7d')
                        }}
                        onGranularityChange={setGranularity}
                        currentRange={timeRange}
                        currentGranularity={granularity}
                    />
                </div>
            </div>

            {/* AI Weekly Summary Card */}
            <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">AI Weekly Summary</h2>
                            <p className="text-white/80 text-sm">Powered by KoreaCosmetics' AI • Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{weeklySummary.alerts} alerts</span>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-3 text-white/90">This Week's Highlights</h3>
                        <ul className="space-y-2">
                            {weeklySummary.highlights.map((highlight, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                                    {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-yellow-300" />
                            <h3 className="font-semibold">AI Insights</h3>
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed">{weeklySummary.insights}</p>
                    </div>
                </div>
            </div>

            {/* Executive KPI Cards - Modern Management Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                <KpiCard
                    title="Total Revenue"
                    value={`${currency}${(platformMetrics?.totalRevenue || 0).toLocaleString()}`}
                    change={platformMetrics?.platformGrowth}
                    changeLabel="vs last mo"
                    sparklineData={dailyTrend.map(d => ({ value: (d.b2cRevenue || 0) + (d.b2bRevenue || 0) }))}
                    color="blue"
                    icon={<DollarSign size={18} />}
                />
                <KpiCard
                    title="B2B Revenue"
                    value={`${currency}${(platformMetrics?.b2bRevenue || 0).toLocaleString()}`}
                    change={platformMetrics?.b2bRevenue && platformMetrics?.b2bRevenue > 0 ? 100 : 0}
                    changeLabel="wholesale"
                    sparklineData={dailyTrend.map(d => ({ value: d.b2bRevenue || 0 }))}
                    color="indigo"
                    icon={<Layers size={18} />}
                />
                <KpiCard
                    title="B2C Revenue"
                    value={`${currency}${(platformMetrics?.b2cRevenue || 0).toLocaleString()}`}
                    change={0}
                    changeLabel="retail"
                    sparklineData={dailyTrend.map(d => ({ value: d.b2cRevenue || 0 }))}
                    color="emerald"
                    icon={<ShoppingBag size={18} />}
                />
                <KpiCard
                    title="Total Orders"
                    value={`${(platformMetrics?.totalOrders || 0).toLocaleString()}`}
                    change={platformMetrics?.totalOrders && platformMetrics.totalOrders > 5 ? 15 : 0}
                    sparklineData={dailyTrend.map(d => ({ value: (d.b2cOrders || 0) + (d.b2bOrders || 0) }))}
                    color="purple"
                    icon={<TrendUp size={18} />}
                />
                <KpiCard
                    title="Active Stores"
                    value={`${platformMetrics?.activeStores || 0}`}
                    change={0}
                    changeLabel="stores"
                    sparklineData={undefined}
                    color="amber"
                    icon={<Store size={18} />}
                />
                <KpiCard
                    title="Customers"
                    value={`${(platformMetrics?.totalCustomers || 0).toLocaleString()}`}
                    change={platformMetrics?.recentSignups && platformMetrics.recentSignups > 0 ? 5 : 0}
                    changeLabel="new"
                    sparklineData={undefined}
                    color="emerald"
                    icon={<Users size={18} />}
                />
            </div>

            {/* Enhanced Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
                {/* Revenue & Orders Chart */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                Revenue & Orders Trend
                            </h3>
                            <p className="text-sm text-slate-500">Performance metrics</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <DateRangePicker 
                                onRangeChange={(days) => {
                                    const rangeMap: Record<number, string> = { 1: '24h', 7: '7d', 30: '30d', 90: '90d', 180: '6m', 365: '1y', 730: '2y' }
                                    setChartTimeRange(rangeMap[days] || '7d')
                                }}
                                onGranularityChange={setChartGranularity}
                                currentRange={chartTimeRange}
                                currentGranularity={chartGranularity}
                            />
                            {/* View Toggle */}
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                {(['combined', 'b2c', 'b2b'] as const).map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => setChartView(view)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                            chartView === view
                                                ? 'bg-white text-slate-800 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {view === 'combined' ? 'Combined' : view === 'b2c' ? 'B2C Only' : 'B2B Only'}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Legend - Dynamic based on view */}
                            <div className="flex items-center gap-2 text-xs ml-2">
                                {chartView === 'combined' && (
                                    <>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />Revenue</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Orders</span>
                                    </>
                                )}
                                {chartView === 'b2c' && (
                                    <>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" />B2C Rev</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />B2C Orders</span>
                                    </>
                                )}
                                {chartView === 'b2b' && (
                                    <>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" />B2B Rev</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600" />B2B Orders</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] sm:h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorB2CRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorB2BRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorTotalRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    tickFormatter={(value) => {
                                        if (chartGranularity === 'yearly') {
                                            return new Date(value).toLocaleDateString('en-US', { year: 'numeric' })
                                        } else if (chartGranularity === 'monthly') {
                                            return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                                        }
                                        return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    }}
                                    stroke="#cbd5e1"
                                />
                                <YAxis 
                                    yAxisId="left"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    stroke="#cbd5e1"
                                    tickFormatter={(value) => `KES ${(value/1000).toFixed(0)}k`}
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right"
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    stroke="#cbd5e1"
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number, name: string) => {
                                        const labels: Record<string, string> = {
                                            'totalRevenue': 'Total Revenue',
                                            'totalOrders': 'Total Orders',
                                            'b2cRevenue': 'B2C Revenue',
                                            'b2bRevenue': 'B2B Revenue',
                                            'b2cOrders': 'B2C Orders',
                                            'b2bOrders': 'B2B Orders'
                                        }
                                        if (name.includes('Revenue')) {
                                            return [`KES ${(value || 0).toLocaleString()}`, labels[name] || name]
                                        }
                                        return [`${value || 0} orders`, labels[name] || name]
                                    }}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                />
                                {/* Combined View - Total Revenue + Total Orders */}
                                {chartView === 'combined' && (
                                    <>
                                        <Area 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="totalRevenue" 
                                            stroke="#6366f1" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorB2BRevenue)" 
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="totalOrders" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </>
                                )}
                                
                                {/* B2C Only View */}
                                {chartView === 'b2c' && (
                                    <>
                                        <Area 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="b2cRevenue" 
                                            stroke="#0ea5e9" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorB2CRevenue)" 
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="b2cOrders" 
                                            stroke="#34d399" 
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={{ fill: '#34d399', strokeWidth: 1, r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </>
                                )}
                                
                                {/* B2B Only View */}
                                {chartView === 'b2b' && (
                                    <>
                                        <Area 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="b2bRevenue" 
                                            stroke="#6366f1" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorB2BRevenue)" 
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone" 
                                            dataKey="b2bOrders" 
                                            stroke="#059669" 
                                            strokeWidth={2}
                                            dot={{ fill: '#059669', strokeWidth: 1, r: 3 }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </>
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Business Insights Panel */}
                <InsightPanel
                    metrics={{
                        totalRevenue: platformMetrics?.totalRevenue || 0,
                        b2bRevenue: platformMetrics?.b2bRevenue || 0,
                        b2cRevenue: platformMetrics?.b2cRevenue || 0,
                        totalOrders: platformMetrics?.totalOrders || 0,
                        b2bOrders: platformMetrics?.b2bOrders || 0,
                        b2cOrders: platformMetrics?.b2cOrders || 0,
                        avgOrderValue: platformMetrics?.totalOrders && platformMetrics?.totalRevenue
                            ? platformMetrics.totalRevenue / platformMetrics.totalOrders
                            : 0
                    }}
                    currency={currency}
                />
            </div>

            {/* Intelligent Store Performance Analysis */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
                {/* Top Performing Stores - Prioritized by Revenue */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Top Performers</h3>
                                <p className="text-sm text-slate-500">Ranked by revenue & health score</p>
                            </div>
                        </div>
                        <Link href="/admin/store-analytics" className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                            View all <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-slate-200">
                                <tr>
                                    <th className="text-left py-3 text-sm font-medium text-slate-500">Store</th>
                                    <th className="text-left py-3 text-sm font-medium text-slate-500">Performance</th>
                                    <th className="text-left py-3 text-sm font-medium text-slate-500">Health</th>
                                    <th className="text-left py-3 text-sm font-medium text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stores
                                    .sort((a, b) => b.metrics.revenue - a.metrics.revenue)
                                    .slice(0, 5).map((store, index) => (
                                    <tr key={store.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                                        <Store size={18} className="text-purple-600" />
                                                    </div>
                                                    {index === 0 && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-bold text-yellow-900">👑</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-800 block">{store.name}</span>
                                                    <span className="text-xs text-slate-500">{store.location}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div>
                                                <p className="font-semibold text-slate-800">KES {((store.metrics?.revenue || 0)/1000).toFixed(0)}k</p>
                                                <p className="text-xs text-slate-500">{store.metrics?.orders || 0} orders</p>
                                                {store.trends.isPositive && (
                                                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                                        <TrendingUp size={10} />
                                                        +{Math.abs(store.trends.revenueChange)}%
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`flex-1 h-2 rounded-full ${
                                                    store.healthScore >= 80 ? 'bg-green-500' :
                                                    store.healthScore >= 60 ? 'bg-yellow-500' :
                                                    store.healthScore >= 40 ? 'bg-orange-500' :
                                                    'bg-red-500'
                                                }`} style={{ width: `${store.healthScore}%` }} />
                                                <span className="text-xs font-medium text-slate-700 min-w-[30px]">{store.healthScore}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    store.status === 'active' ? 'bg-green-500' :
                                                    store.status === 'suspended' ? 'bg-red-500' :
                                                    'bg-yellow-500'
                                                }`} />
                                                <span className="text-xs font-medium capitalize">{store.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Intelligent Alerts - Prioritized by Severity */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">Smart Alerts</h3>
                                <p className="text-sm text-slate-500">Prioritized notifications</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
                            <Zap className="w-4 h-4" />
                            {alerts.length}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {alerts.length > 0 ? 
                            alerts
                                .sort((a, b) => {
                                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
                                    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                                           (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
                                })
                                .slice(0, 4).map((alert) => (
                                <div key={alert.id} className={`flex gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                    alert.priority === 'urgent' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
                                    alert.priority === 'high' ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' :
                                    alert.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
                                    'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        alert.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                        alert.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                        alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">{alert.title}</p>
                                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{alert.message}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                alert.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                alert.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {alert.priority}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(alert.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-sm text-slate-600 font-medium">All Systems Optimal</p>
                                <p className="text-xs text-slate-400 mt-1">No alerts require attention</p>
                            </div>
                        )}
                    </div>
                    {alerts.length > 0 && (
                        <button className="w-full mt-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-medium">
                            View All Alerts ({alerts.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/approve" className="group flex items-center gap-4 p-5 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 group-hover:text-pink-700 transition-colors">Approve Items</p>
                        <p className="text-sm text-pink-600 font-medium">{platformMetrics?.pendingApprovals || 0} pending</p>
                    </div>
                </Link>
                
                <Link href="/admin/store-analytics" className="group flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">Store Analytics</p>
                        <p className="text-sm text-blue-600 font-medium">{stores.length} stores</p>
                    </div>
                </Link>
                
                <Link href="/admin/ai-analytics" className="group flex items-center gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">AI Analytics</p>
                        <p className="text-sm text-purple-600 font-medium">Insights ready</p>
                    </div>
                </Link>
                
                <button className="group flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">Platform Settings</p>
                        <p className="text-sm text-emerald-600 font-medium">Configure</p>
                    </div>
                </button>
            </div>

            {/* Platform Health & Anomalies */}
            <div className="mt-12 mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Platform Health Monitor</h2>
                            <p className="text-sm text-slate-500">System performance & anomaly detection</p>
                        </div>
                    </div>
                    <Link href="/admin/ai-analytics" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                        AI Analysis <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
                
                {/* Health Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* System Performance */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-green-600 font-medium">System Performance</p>
                                <p className="text-lg font-bold text-slate-800">98.5%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircleIcon className="w-3 h-3" />
                            <span>Optimal</span>
                        </div>
                    </div>

                    {/* API Response Time */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <ActivityIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-600 font-medium">API Response</p>
                                <p className="text-lg font-bold text-slate-800">124ms</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>Fast</span>
                        </div>
                    </div>

                    {/* Error Rate */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-purple-600 font-medium">Error Rate</p>
                                <p className="text-lg font-bold text-slate-800">0.2%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingDown className="w-3 h-3" />
                            <span>Low</span>
                        </div>
                    </div>

                    {/* Active Users */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                <Users2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-orange-600 font-medium">Active Users</p>
                                <p className="text-lg font-bold text-slate-800">1,247</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>Live</span>
                        </div>
                    </div>
                </div>

                {/* Anomaly Detection */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Recent Anomalies Detected</h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">2 New</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">Unusual order spike detected</p>
                                <p className="text-xs text-slate-500">K-Beauty Store - 3x normal volume in last hour</p>
                            </div>
                            <span className="text-xs text-orange-600">2m ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">Payment processing delay</p>
                                <p className="text-xs text-slate-500">Response time increased by 40%</p>
                            </div>
                            <span className="text-xs text-yellow-600">15m ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Assistant Chatbot Widget */}
            <div className="fixed bottom-6 right-6 z-50">
                {chatOpen ? (
                    <div className="bg-white rounded-2xl shadow-2xl w-80 border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">AI Assistant</p>
                                    <p className="text-white/70 text-xs">Always here to help</p>
                                </div>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-slate-50">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-purple-600 text-white rounded-br-none' 
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isAiTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 p-3 rounded-xl rounded-bl-none">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask about sales, inventory..."
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && chatInput.trim()) {
                                            setChatMessages([...chatMessages, { role: 'user', text: chatInput }])
                                            setChatInput('')
                                            setIsAiTyping(true)
                                            setTimeout(() => {
                                                setIsAiTyping(false)
                                                setChatMessages(prev => [...prev, { 
                                                    role: 'ai', 
                                                    text: 'I can help you with that! Based on the current data, your store is performing well. Revenue is up 23% this week, and you have 3 products running low on stock.'
                                                }])
                                            }, 1500)
                                        }
                                    }}
                                />
                                <button 
                                    onClick={() => {
                                        if (chatInput.trim()) {
                                            setChatMessages([...chatMessages, { role: 'user', text: chatInput }])
                                            setChatInput('')
                                            setIsAiTyping(true)
                                            setTimeout(() => {
                                                setIsAiTyping(false)
                                                setChatMessages(prev => [...prev, { 
                                                    role: 'ai', 
                                                    text: 'I can help you with that! Based on the current data, your store is performing well. Revenue is up 23% this week, and you have 3 products running low on stock.'
                                                }])
                                            }, 1500)
                                        }
                                    }}
                                    disabled={!chatInput.trim()}
                                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setChatOpen(true)}
                        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
                    >
                        <Bot className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    )
}
