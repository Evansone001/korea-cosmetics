// Master Admin Types for KoreaBeauty Hub Control Center

export interface StorePerformance {
    id: string
    name: string
    owner: string
    status: 'active' | 'suspended' | 'pending' | 'inactive'
    location: string
    metrics: {
        revenue: number
        orders: number
        customers: number
        products: number
        conversionRate: number
        avgOrderValue: number
        rating?: number
        reviews?: number
        revenueGrowth?: number
        orderGrowth?: number
        customerGrowth?: number
    }
    trends: {
        revenueChange: number // percentage
        ordersChange: number
        isPositive: boolean
        revenueGrowth?: number
        orderGrowth?: number
        customerGrowth?: number
    }
    healthScore: number // 0-100 AI-calculated
    lastActivity: string
    createdAt: string
}

export interface PlatformMetrics {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    totalProducts: number
    activeStores: number
    suspendedStores: number
    pendingApprovals: number
    avgStoreRevenue: number
    platformGrowth: number // percentage
    topPerformingStore: string
    recentSignups: number
}

export interface AuditLogEntry {
    id: string
    timestamp: string
    userId: string
    userName: string
    userRole: 'admin' | 'seller' | 'customer'
    action: string
    entityType: 'store' | 'product' | 'order' | 'user' | 'coupon' | 'setting'
    entityId: string
    entityName: string
    storeId?: string
    storeName?: string
    details: {
        before?: any
        after?: any
        changes?: string[]
    }
    detailsString?: string // For backward compatibility
    severity: 'info' | 'warning' | 'critical'
    ipAddress?: string
    userAgent?: string
    success?: boolean
}

export interface StoreHealthScore {
    storeId: string
    storeName: string
    overallScore: number // 0-100
    components: {
        salesPerformance: number
        customerSatisfaction: number
        inventoryHealth: number
        orderFulfillment: number
        compliance: number
    }
    aiInsights: string[]
    recommendations: string[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    lastCalculated: string
}

export interface CrossStoreComparison {
    metric: 'revenue' | 'orders' | 'customers' | 'conversion' | 'growth'
    timeRange: string
    stores: {
        storeId: string
        storeName: string
        value: number
        rank: number
        change: number
        trend: 'up' | 'down' | 'stable'
    }[]
    platformAverage: number
    topPerformer: string
    aiAnalysis: string
}

export interface AnomalyEvent {
    id: string
    type: 'performance_drop' | 'unusual_activity' | 'suspicious_action' | 'bulk_operation' | 'compliance_violation'
    severity: 'low' | 'medium' | 'high' | 'critical'
    storeId?: string
    storeName?: string
    detectedAt: string
    description: string
    expectedValue?: number
    actualValue?: number
    deviation: number // percentage
    aiConfidence: number
    relatedEntity?: string
    status: 'active' | 'investigating' | 'resolved' | 'dismissed'
    resolvedAt?: string
    resolution?: string
}

export interface ComplianceReport {
    id: string
    generatedAt: string
    period: {
        start: string
        end: string
    }
    summary: {
        totalActions: number
        criticalEvents: number
        suspiciousActivities: number
        storesAudited: number
    }
    entries: AuditLogEntry[]
    violations: AnomalyEvent[]
    exportFormat: 'pdf' | 'csv' | 'json'
}

export interface MasterDashboardFilters {
    timeRange: 'today' | '7d' | '30d' | '90d' | 'custom'
    storeStatus: 'all' | 'active' | 'suspended' | 'pending'
    location?: string
    minHealthScore?: number
    sortBy: 'revenue' | 'orders' | 'growth' | 'health' | 'name'
    sortOrder: 'asc' | 'desc'
}

export interface StoreCohort {
    id: string
    name: string
    criteria: string
    stores: string[]
    aggregateMetrics: {
        totalRevenue: number
        avgOrderValue: number
        conversionRate: number
    }
    aiCharacteristics: string[]
}

export interface PlatformAlert {
    id: string
    type: 'store_issue' | 'inventory_alert' | 'compliance_warning' | 'performance_drop' | 'security'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    title: string
    message: string
    storeId?: string
    storeName?: string
    createdAt: string
    acknowledged: boolean
    acknowledgedBy?: string
    acknowledgedAt?: string
}

export interface MasterAdminQuery {
    entity: 'stores' | 'audit' | 'anomalies' | 'metrics'
    filters: Record<string, any>
    pagination: {
        page: number
        limit: number
    }
    sort?: {
        field: string
        order: 'asc' | 'desc'
    }
}

// Audit Action Types for consistent logging
export type AuditActionType = 
    | 'store_created' | 'store_approved' | 'store_suspended' | 'store_reactivated' | 'store_deleted'
    | 'product_created' | 'product_updated' | 'product_deleted' | 'product_approved'
    | 'order_created' | 'order_updated' | 'order_cancelled' | 'order_refunded'
    | 'user_created' | 'user_updated' | 'user_deleted' | 'user_role_changed'
    | 'coupon_created' | 'coupon_updated' | 'coupon_deleted'
    | 'settings_updated' | 'price_changed' | 'inventory_adjusted'
    | 'login' | 'logout' | 'password_changed' | 'permission_changed'

// Supporting Types for AI Analysis
export interface Recommendation {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    impact: string
}

export interface PerformanceDataPoint {
    date: string
    revenue: number
}

export interface TopPerformer {
    storeName: string
    score: number
}

export interface AtRiskStore {
    storeName: string
    risk: string
}

// AI Analysis Types
export interface StoreAIAnalysis {
    storeId: string
    patterns: {
        salesTrend: string
        customerBehavior: string
        seasonality: string
    }
    strengths: string[]
    weaknesses: string[]
    recommendations: Recommendation[]
    performanceTrend: PerformanceDataPoint[]
    predictions: {
        nextMonthRevenue: number
        riskOfDecline: number
        recommendedActions: string[]
        revenue: number // percentage change
        orders: number // percentage change
        customers: number // percentage change
    }
    comparative: {
        vsPlatformAverage: number
        vsTopPerformer: number
        peerGroup: string
    }
}

export interface PlatformAIInsights {
    generatedAt: string
    overview: string
    keyFindings: string[]
    storeInsights: StoreAIAnalysis[]
    recommendations: string[]
    anomalies: AnomalyEvent[]
    topPerformers?: TopPerformer[]
    atRiskStores?: AtRiskStore[]
}
