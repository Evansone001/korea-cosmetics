// AI Types and Interfaces for KoreaCosmetics' Hub AI Engine

export interface AIForecast {
    id: string
    type: 'sales' | 'revenue' | 'demand' | 'inventory'
    horizon: '7d' | '30d' | '90d'
    data: ForecastDataPoint[]
    confidence: number // 0-100
    generatedAt: string
    modelVersion: string
    accuracy?: number // Historical accuracy score
}

export interface ForecastDataPoint {
    date: string
    predicted: number
    lowerBound: number
    upperBound: number
    actual?: number // For comparing predictions vs reality
}

export interface AIInsight {
    id: string
    category: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'performance'
    title: string
    description: string
    severity: 'info' | 'low' | 'medium' | 'high'
    confidence: number
    generatedAt: string
    expiresAt?: string
    relatedMetrics: string[]
    actionable: boolean
    suggestedAction?: string
}

export interface AIAnomaly {
    id: string
    type: 'sales_spike' | 'sales_drop' | 'inventory_low' | 'inventory_high' | 'price_anomaly' | 'review_sentiment'
    severity: 'low' | 'medium' | 'high' | 'critical'
    metric: string
    expectedValue: number
    actualValue: number
    deviation: number // percentage deviation
    detectedAt: string
    description: string
    relatedEntity?: string // product id, store id, etc.
    status: 'active' | 'investigating' | 'resolved' | 'dismissed'
}

export interface AIReport {
    id: string
    type: 'daily_summary' | 'weekly_summary' | 'monthly_report' | 'custom'
    title: string
    generatedAt: string
    period: {
        start: string
        end: string
    }
    sections: ReportSection[]
    insights: AIInsight[]
    anomalies: AIAnomaly[]
    sentTo?: string[]
}

export interface ReportSection {
    title: string
    type: 'text' | 'chart' | 'table' | 'metrics'
    content: string | ChartData | TableData | MetricData
}

export interface ChartData {
    type: 'line' | 'bar' | 'pie'
    data: any[]
    labels?: string[]
}

export interface TableData {
    headers: string[]
    rows: (string | number)[][]
}

export interface MetricData {
    label: string
    value: number
    change?: number
    trend?: 'up' | 'down' | 'stable'
}

export interface AIModelConfig {
    id: string
    name: string
    type: 'sentiment' | 'forecasting' | 'anomaly' | 'recommendation'
    status: 'active' | 'training' | 'inactive' | 'error'
    version: string
    lastTrainedAt: string
    accuracy: number
    trainingDataSize: number
    config: {
        forecastHorizon?: number
        confidenceThreshold?: number
        sensitivity?: 'low' | 'medium' | 'high'
        features: string[]
    }
}

export interface SentimentAnalysis {
    id: string
    source: 'reviews' | 'feedback' | 'social'
    overall: {
        positive: number
        neutral: number
        negative: number
        score: number // -1 to 1
    }
    trends: SentimentTrendPoint[]
    keywords: {
        positive: string[]
        negative: string[]
        neutral: string[]
    }
    analyzedAt: string
    sampleSize: number
}

export interface SentimentTrendPoint {
    date: string
    score: number
    volume: number
}

export interface InventoryPrediction {
    id: string
    productId: string
    productName: string
    currentStock: number
    predictedStockout: string | null
    confidence: number
    suggestedReorderQty: number
    factors: {
        salesVelocity: number
        seasonality: number
        trend: 'increasing' | 'stable' | 'decreasing'
        daysUntilStockout?: number
    }
    updatedAt: string
}

export interface AIScheduledTask {
    id: string
    name: string
    type: 'forecast' | 'insight' | 'anomaly_check' | 'sentiment' | 'report'
    schedule: 'hourly' | 'daily' | 'weekly' | 'monthly'
    lastRun?: string
    nextRun: string
    status: 'scheduled' | 'running' | 'completed' | 'failed'
    output?: string // ID of generated insight/report
}

export interface AISettings {
    enabled: boolean
    features: {
        forecasting: boolean
        sentiment: boolean
        anomaly: boolean
        recommendations: boolean
        autoReports: boolean
    }
    thresholds: {
        confidence: number
        anomalySensitivity: 'low' | 'medium' | 'high'
        minDataPoints: number
    }
    schedules: {
        forecastUpdate: 'hourly' | 'daily'
        sentimentAnalysis: 'daily' | 'weekly'
        anomalyCheck: 'realtime' | 'hourly'
    }
    notifications: {
        email: boolean
        dashboard: boolean
        slack?: string
    }
}

export interface AIQueryRequest {
    query: string
    context?: string
    timeframe?: 'today' | 'week' | 'month' | 'quarter' | 'year'
    filters?: Record<string, string>
}

export interface AIQueryResponse {
    query: string
    intent: string
    result: {
        type: 'metric' | 'chart' | 'table' | 'text' | 'forecast'
        data: any
        explanation: string
    }
    confidence: number
    generatedAt: string
}

// Helper types for chart data
export type TimeSeriesData = {
    date: string
    value: number
    predicted?: number
}[]

export type CategoricalData = {
    category: string
    value: number
    percentage?: number
}[]
