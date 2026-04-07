import { NextRequest, NextResponse } from 'next/server'
import { aiSecurityEngine } from '@/lib/services/aiSecurityEngine'
import { systemFingerprintingService } from '@/lib/services/systemFingerprint'
import { securityAlertsService } from '@/lib/services/securityAlerts'

// GET /api/admin/security-audit/analytics - Get security analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const timeframe = searchParams.get('timeframe') || '24h' // 1h, 24h, 7d, 30d, 90d
    
    // Calculate time range
    const now = Date.now()
    let startTime = now
    
    switch (timeframe) {
      case '1h':
        startTime = now - 60 * 60 * 1000
        break
      case '24h':
        startTime = now - 24 * 60 * 60 * 1000
        break
      case '7d':
        startTime = now - 7 * 24 * 60 * 60 * 1000
        break
      case '30d':
        startTime = now - 30 * 24 * 60 * 60 * 1000
        break
      case '90d':
        startTime = now - 90 * 24 * 60 * 60 * 1000
        break
      default:
        startTime = now - 24 * 60 * 60 * 1000
    }
    
    // Get threat intelligence prediction
    const prediction = await aiSecurityEngine.predictFutureThreats()
    
    // Get fingerprint analytics
    const fingerprintAnalytics = await systemFingerprintingService.generateAnalytics()
    
    // Get alert statistics
    const alertStats = securityAlertsService.getAlertStats()
    
    // Generate attack trend data
    const attackTrends = generateAttackTrends(startTime, now)
    
    // Generate geographic distribution
    const geoDistribution = generateGeographicDistribution()
    
    // Generate severity distribution
    const severityDistribution = {
      critical: 12,
      high: 45,
      medium: 123,
      low: 289,
      info: 567
    }
    
    // Generate category distribution
    const categoryDistribution = {
      attack: 89,
      authentication: 234,
      authorization: 45,
      data_access: 123,
      anomaly: 67
    }
    
    return NextResponse.json({
      timeframe,
      period: {
        start: new Date(startTime).toISOString(),
        end: new Date(now).toISOString()
      },
      summary: {
        totalEvents: 1036,
        blockedAttacks: 89,
        activeThreats: 12,
        averageThreatScore: 42.5,
        systemHealth: 98
      },
      trends: {
        events: attackTrends,
        severity: severityDistribution,
        category: categoryDistribution,
        geographic: geoDistribution
      },
      prediction,
      fingerprintAnalytics,
      alertStats,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating analytics:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

// Generate mock attack trend data
function generateAttackTrends(startTime: number, endTime: number): Array<{ timestamp: string; count: number; blocked: number }> {
  const trends: Array<{ timestamp: string; count: number; blocked: number }> = []
  const interval = (endTime - startTime) / 24 // 24 data points
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(startTime + i * interval)
    const baseCount = 20 + Math.sin(i / 3) * 10 // Some variation
    const randomFactor = Math.random() * 15
    const count = Math.round(baseCount + randomFactor)
    const blocked = Math.round(count * (0.3 + Math.random() * 0.4))
    
    trends.push({
      timestamp: timestamp.toISOString(),
      count,
      blocked
    })
  }
  
  return trends
}

// Generate mock geographic distribution
function generateGeographicDistribution(): Array<{ country: string; count: number; percentage: number; risk: 'high' | 'medium' | 'low' }> {
  const countries = [
    { country: 'Russia', count: 234, risk: 'high' as const },
    { country: 'China', count: 189, risk: 'high' as const },
    { country: 'United States', count: 156, risk: 'medium' as const },
    { country: 'Germany', count: 98, risk: 'medium' as const },
    { country: 'Brazil', count: 67, risk: 'medium' as const },
    { country: 'India', count: 54, risk: 'medium' as const },
    { country: 'Kenya', count: 45, risk: 'low' as const },
    { country: 'United Kingdom', count: 38, risk: 'low' as const },
    { country: 'France', count: 32, risk: 'low' as const },
    { country: 'Other', count: 123, risk: 'medium' as const }
  ]
  
  const total = countries.reduce((sum, c) => sum + c.count, 0)
  
  return countries.map(c => ({
    ...c,
    percentage: Math.round((c.count / total) * 100)
  }))
}
