import { NextRequest, NextResponse } from 'next/server'
import { attackDetector } from '@/lib/services/attackDetector'

// GET /api/admin/security-audit/threats - Get active threats and blocked IPs
export async function GET(request: NextRequest) {
  try {
    // Get blocked IPs
    const blockedIPs = attackDetector.getBlockedIPs()
    
    // Get attack statistics
    const attackStats = attackDetector.getAttackStats()
    
    // Mock active threats
    const activeThreats = [
      {
        id: 'threat_1',
        type: 'sql_injection',
        source: '192.168.1.100',
        country: 'Russia',
        severity: 'critical',
        detectedAt: new Date(Date.now() - 2 * 60000).toISOString(),
        status: 'blocked',
        attempts: 45,
        targetEndpoints: ['/api/products/search', '/api/admin/users'],
        pattern: " UNION SELECT * FROM users --",
        confidence: 0.97
      },
      {
        id: 'threat_2',
        type: 'brute_force',
        source: '185.220.101.45',
        country: 'Germany',
        severity: 'high',
        detectedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'monitoring',
        attempts: 23,
        targetAccounts: ['admin@kbeauty.co.ke', 'support@kbeauty.co.ke'],
        pattern: 'Sequential password attempts',
        confidence: 0.89
      },
      {
        id: 'threat_3',
        type: 'ddos',
        source: '103.25.44.0/24',
        country: 'China',
        severity: 'critical',
        detectedAt: new Date(Date.now() - 5 * 60000).toISOString(),
        status: 'mitigating',
        attempts: 15000,
        targetEndpoints: ['/api/public/catalog', '/'],
        pattern: 'Distributed SYN flood',
        confidence: 0.94,
        mitigationApplied: {
          rateLimiting: true,
          ipBlocking: true,
          cdnProtection: true
        }
      }
    ]
    
    // Calculate threat trends
    const threatTrends = {
      last24h: { increase: 12, count: 89 },
      last7d: { increase: -5, count: 456 },
      last30d: { increase: 23, count: 1890 }
    }
    
    return NextResponse.json({
      activeThreats,
      blockedIPs,
      attackStats,
      trends: threatTrends,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching threats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch threat data' },
      { status: 500 }
    )
  }
}

// POST /api/admin/security-audit/threats - Block or unblock IP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ipAddress, duration, reason } = body
    
    if (!ipAddress || !action) {
      return NextResponse.json(
        { error: 'IP address and action required' },
        { status: 400 }
      )
    }
    
    switch (action) {
      case 'block':
        await attackDetector.blockIP(
          ipAddress, 
          reason || 'manual_block', 
          duration || 3600000 // 1 hour default
        )
        return NextResponse.json({
          success: true,
          action: 'blocked',
          ipAddress,
          duration: duration || 3600000,
          expiresAt: new Date(Date.now() + (duration || 3600000)).toISOString()
        })
        
      case 'unblock':
        await attackDetector.unblockIP(ipAddress)
        return NextResponse.json({
          success: true,
          action: 'unblocked',
          ipAddress
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "block" or "unblock"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error managing threat:', error)
    return NextResponse.json(
      { error: 'Failed to process threat action' },
      { status: 500 }
    )
  }
}
