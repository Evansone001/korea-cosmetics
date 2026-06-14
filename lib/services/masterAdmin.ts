import type {
    StorePerformance,
    PlatformMetrics,
    StoreHealthScore,
    PlatformAlert
} from "@/lib/types/masterAdmin"
import axiosInstance from "@/lib/axios"

export const masterAdminService = {
    // ==================== STORE PERFORMANCE ====================
    async getAllStorePerformance(): Promise<StorePerformance[]> {
        try {
            const { data } = await axiosInstance.get('/api/admin/metrics/stores/performance')

            if (!data || !data.stores || !Array.isArray(data.stores)) {
                console.warn('Invalid response structure for store performance:', data)
                return mockStores
            }

            return data.stores.map((store: any) => ({
                id: store.id,
                name: store.name,
                owner: store.user_id || 'Unknown',
                status:
                    store.status === 'active'
                        ? 'active'
                        : store.status === 'suspended'
                        ? 'suspended'
                        : 'pending',
                location: `${store.city || ''}, ${store.country || ''}`,
                metrics: {
                    revenue: store.revenue || 0,
                    orders: store.orders || 0,
                    customers: store.customers || 0,
                    products: store.products || 0,
                    conversionRate: store.conversion_rate || 0,
                    avgOrderValue: store.orders > 0 ? (store.revenue || 0) / store.orders : 0,
                    rating: store.rating || 0,
                    reviews: store.reviews || 0,
                    revenueGrowth: store.revenue_growth || 0,
                    orderGrowth: store.order_growth || 0,
                    customerGrowth: store.customer_growth || 0
                },
                trends: {
                    revenueChange: store.revenue_growth || 0,
                    ordersChange: store.order_growth || 0,
                    isPositive: (store.revenue_growth || 0) >= 0,
                    revenueGrowth: store.revenue_growth || 0,
                    orderGrowth: store.order_growth || 0,
                    customerGrowth: store.customer_growth || 0
                },
                healthScore: store.health_score || 75,
                lastActivity: store.updated_at || store.created_at,
                createdAt: store.created_at
            }))
        } catch (error) {
            console.error('Failed to fetch store performance data:', error)
            return mockStores
        }
    },

    // ==================== PLATFORM METRICS ====================
    async getPlatformMetrics(): Promise<PlatformMetrics> {
        try {
            const { data } = await axiosInstance.get('/api/admin/metrics/platform')

            if (!data || typeof data !== 'object') {
                console.warn('Invalid response structure for platform metrics:', data)
                return mockPlatformMetrics
            }

            // Check if backend returned an error
            if (data.error) {
                console.error('Backend returned error for platform metrics:', data.error)
                return mockPlatformMetrics
            }

            // Log successful response for debugging
            console.log('Platform metrics fetched:', { totalRevenue: data.totalRevenue, totalOrders: data.totalOrders })

            return data
        } catch (error: any) {
            console.error('Failed to fetch platform metrics:', error)
            console.error('Error response:', error.response?.data)
            console.error('Error status:', error.response?.status)
            return mockPlatformMetrics
        }
    },

    // ==================== HEALTH & ALERTS ====================
    async getStoreHealthScores(): Promise<StoreHealthScore[]> {
        try {
            const { data } = await axiosInstance.get('/api/admin/metrics/stores/health-scores')

            // Backend returns { stores: [...] } shape
            const arr = Array.isArray(data) ? data : (data?.stores || [])
            if (!Array.isArray(arr)) {
                console.warn('Invalid response structure for health scores:', data)
                return mockHealthScores
            }

            return arr
        } catch (error) {
            console.error('Failed to fetch health scores:', error)
            return mockHealthScores
        }
    },

    async getPlatformAlerts(): Promise<PlatformAlert[]> {
        try {
            const { data } = await axiosInstance.get('/api/admin/metrics/platform/alerts')

            // Backend returns { alerts: [...] } shape
            const arr = Array.isArray(data) ? data : (data?.alerts || [])
            if (!Array.isArray(arr)) {
                console.warn('Invalid response structure for platform alerts:', data)
                return mockAlerts
            }

            return arr
        } catch (error) {
            console.error('Failed to fetch platform alerts:', error)
            return mockAlerts
        }
    },

    // ==================== DAILY TREND ====================
    async getDailyTrend(days = 7, granularity = 'daily'): Promise<{ date: string; b2cRevenue: number; b2bRevenue: number; b2cOrders: number; b2bOrders: number }[]> {
        try {
            const { data } = await axiosInstance.get(`/api/admin/metrics/platform/daily-trend?days=${days}&granularity=${granularity}`)
            return Array.isArray(data?.trend) ? data.trend : []
        } catch (error) {
            console.error('Failed to fetch daily trend:', error)
            return []
        }
    },

    // ==================== STORE ACTIONS ====================
    async suspendStore(storeId: string, reason: string): Promise<boolean> {
        try {
            await fetch(`/api/stores/${storeId}/suspend`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            })
            return true
        } catch {
            return false
        }
    },

    async approveStore(storeId: string): Promise<boolean> {
        try {
            await fetch(`/api/stores/${storeId}/approve`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
            return true
        } catch {
            return false
        }
    },

    // ==================== STORE LOOKUP ====================
    async getStoreById(storeId: string): Promise<StorePerformance | null> {
        const stores = await this.getAllStorePerformance()
        return stores.find(store => store.id === storeId) || null
    },

    // ==================== ALERTS ====================
    async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
        try {
            await fetch(`/api/admin/master/alerts/${alertId}/acknowledge`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId
                }
            })
            return true
        } catch {
            return false
        }
    },

    // ==================== AI STORE ANALYSIS ====================
    async getStoreAIAnalysis(storeId: string): Promise<any> {
        try {
            const response = await fetch(`/api/admin/master/ai-analysis?store_id=${storeId}`, {
                credentials: 'include',
            })
            const data = await response.json()

            if (!data || typeof data !== 'object') {
                console.warn('Invalid response structure for AI analysis:', data)
                throw new Error('Invalid AI analysis response')
            }

            return data
        } catch {
            // fallback to mock logic
            const store = await this.getStoreById(storeId)
            const healthScore = mockHealthScores.find(h => h.storeId === storeId)

            if (!store) throw new Error('Store not found')

            return {
                storeId,
                storeName: store.name,
                analysis: {
                    performanceTrend: store.trends.isPositive ? 'improving' : 'declining',
                    keyMetrics: store.metrics,
                    aiInsights: healthScore?.aiInsights || [],
                    recommendations: healthScore?.recommendations || [],
                    riskLevel: healthScore?.riskLevel || 'unknown'
                },
                generatedAt: new Date().toISOString()
            }
        }
    },

    // ==================== AI PLATFORM ====================
    async getPlatformAIInsights(): Promise<any> {
        try {
            const response = await fetch('/api/admin/ai', {
                credentials: 'include',
            })
            const data = await response.json()

            if (!data || typeof data !== 'object') {
                console.warn('Invalid response structure for platform AI insights:', data)
                throw new Error('Invalid platform AI insights response')
            }

            return data
        } catch {
            const stores = await this.getAllStorePerformance()
            const healthScores = await this.getStoreHealthScores()

            return {
                platformOverview: {
                    totalStores: stores.length,
                    activeStores: stores.filter(s => s.status === 'active').length,
                    avgHealthScore:
                        healthScores.reduce((sum, h) => sum + h.overallScore, 0) /
                        healthScores.length,
                    platformTrend: 'growing'
                },
                insights: [],
                recommendations: [],
                riskAnalysis: {
                    highRiskStores: healthScores.filter(h => h.riskLevel === 'high').length,
                    mediumRiskStores: healthScores.filter(h => h.riskLevel === 'medium').length,
                    lowRiskStores: healthScores.filter(h => h.riskLevel === 'low').length
                },
                generatedAt: new Date().toISOString()
            }
        }
    },

    // ==================== AUDIT LOGS ====================
    async getAuditLogs(filters: any = {}): Promise<any[]> {
        try {
            const query = new URLSearchParams(filters).toString()
            const response = await fetch(`/api/admin/master/audit-logs?${query}`, {
                credentials: 'include',
            })
            const data = await response.json()

            if (!data || !Array.isArray(data)) {
                console.warn('Invalid response structure for audit logs:', data)
                return mockAuditLogs
            }

            return data
        } catch {
            await new Promise(resolve => setTimeout(resolve, 300))
            return mockAuditLogs
        }
    },

    async addAuditLog(logEntry: any): Promise<any> {
        try {
            const response = await fetch('/api/admin/master/audit-logs', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            })
            const data = await response.json()
            return data
        } catch {
            const newLog = {
                id: (mockAuditLogs.length + 1).toString(),
                ...logEntry,
                createdAt: new Date().toISOString()
            }
            mockAuditLogs.push(newLog)
            return newLog
        }
    },

    // ==================== ANOMALIES ====================
    async detectAnomalies(): Promise<any[]> {
        try {
            const response = await fetch('/api/admin/master/anomalies', {
                credentials: 'include',
            })
            const data = await response.json()

            if (!data || !Array.isArray(data)) {
                console.warn('Invalid response structure for anomalies:', data)
                return []
            }

            return data
        } catch {
            await new Promise(resolve => setTimeout(resolve, 400))
            return []
        }
    },

    async updateAnomalyStatus(anomalyId: string, status: string): Promise<boolean> {
        try {
            await fetch(`/api/admin/master/anomalies/${anomalyId}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            return true
        } catch {
            return false
        }
    }
}

// Mock data for fallback when API calls fail
const mockStores: StorePerformance[] = []

const mockPlatformMetrics: PlatformMetrics = {
    totalRevenue: 0,
    totalOrders: 0,
    b2cRevenue: 0,
    b2bRevenue: 0,
    b2cOrders: 0,
    b2bOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activeStores: 0,
    suspendedStores: 0,
    pendingApprovals: 0,
    avgStoreRevenue: 0,
    platformGrowth: 0,
    topPerformingStore: '',
    recentSignups: 0
}

const mockHealthScores: StoreHealthScore[] = []

const mockAlerts: PlatformAlert[] = []

const mockAuditLogs: any[] = []