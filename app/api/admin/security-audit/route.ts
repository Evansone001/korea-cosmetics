import { NextRequest, NextResponse } from 'next/server'
import { aiSecurityEngine } from '@/lib/services/aiSecurityEngine'
import { systemFingerprintingService } from '@/lib/services/systemFingerprint'
import { attackDetector } from '@/lib/services/attackDetector'
import { securityAlertsService } from '@/lib/services/securityAlerts'
import { complianceReporter } from '@/lib/services/complianceReporter'
import { SecurityEvent } from '@/lib/services/types/security'

// GET /api/admin/security-audit - Get security events with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const acknowledged = searchParams.get('acknowledged')
    const escalated = searchParams.get('escalated')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Get security stats
    const stats = {
      totalEvents: 0,
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      activeThreats: 12,
      blockedIPs: attackDetector.getBlockedIPs().length,
      systemHealth: 98
    }
    
    // Get recent events (in production, this would query the database)
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        severity: 'critical',
        category: 'attack',
        type: 'sql_injection_attempt',
        description: 'SQL injection attempt detected on product search endpoint',
        userId: 'anonymous',
        ipAddress: '192.168.1.100',
        geolocation: { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
        userAgent: 'Mozilla/5.0 (compatible; AttackBot/1.0)',
        threatScore: 95,
        aiAnalysis: {
          anomalyScore: 98,
          threatCategory: 'Automated Attack',
          confidence: 0.97,
          riskFactors: ['Known malicious IP', 'SQL injection pattern', 'Bot user agent'],
          recommendedAction: 'Block IP immediately and review access logs'
        },
        actionTaken: 'IP Blocked',
        acknowledged: true,
        escalated: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        severity: 'high',
        category: 'authentication',
        type: 'brute_force_attempt',
        description: 'Multiple failed login attempts for user admin@kbeauty.co.ke',
        userId: 'admin_1',
        userName: 'Admin User',
        ipAddress: '185.220.101.45',
        geolocation: { country: 'Germany', city: 'Berlin', lat: 52.52, lng: 13.405 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        threatScore: 78,
        aiAnalysis: {
          anomalyScore: 82,
          threatCategory: 'Brute Force Attack',
          confidence: 0.89,
          riskFactors: ['Multiple failed attempts', 'Suspicious IP location', 'After hours access'],
          recommendedAction: 'Enable 2FA and notify user'
        },
        actionTaken: 'Account Locked',
        acknowledged: false,
        escalated: false
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        severity: 'medium',
        category: 'anomaly',
        type: 'unusual_data_access',
        description: 'User accessed 500+ customer records in 5 minutes',
        userId: 'store_manager_1',
        userName: 'Store Manager',
        ipAddress: '41.60.234.12',
        geolocation: { country: 'Kenya', city: 'Nairobi', lat: -1.2921, lng: 36.8219 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        threatScore: 65,
        aiAnalysis: {
          anomalyScore: 71,
          threatCategory: 'Data Exfiltration Risk',
          confidence: 0.76,
          riskFactors: ['Unusual access pattern', 'High data volume', 'Business hours anomaly'],
          recommendedAction: 'Review user activity and verify business need'
        },
        actionTaken: 'Under Review',
        acknowledged: false,
        escalated: false
      }
    ]
    
    // Apply filters
    let filteredEvents = mockEvents
    
    if (severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === severity)
    }
    
    if (category) {
      filteredEvents = filteredEvents.filter(e => e.category === category)
    }
    
    if (acknowledged !== null) {
      const ackBool = acknowledged === 'true'
      filteredEvents = filteredEvents.filter(e => e.acknowledged === ackBool)
    }
    
    if (escalated !== null) {
      const escBool = escalated === 'true'
      filteredEvents = filteredEvents.filter(e => e.escalated === escBool)
    }
    
    // Update stats
    filteredEvents.forEach(e => {
      stats.totalEvents++
      stats.bySeverity[e.severity]++
    })
    
    // Paginate
    const paginatedEvents = filteredEvents.slice(offset, offset + limit)
    
    return NextResponse.json({
      events: paginatedEvents,
      stats,
      pagination: {
        total: filteredEvents.length,
        offset,
        limit,
        hasMore: filteredEvents.length > offset + limit
      }
    })
  } catch (error) {
    console.error('Error fetching security audit data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security audit data' },
      { status: 500 }
    )
  }
}

// POST /api/admin/security-audit - Analyze a security event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.event) {
      return NextResponse.json(
        { error: 'Security event data required' },
        { status: 400 }
      )
    }
    
    const event: SecurityEvent = body.event
    
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 
                request.headers.get('x-real-ip') || 
                'unknown'
    
    // Analyze event with AI
    const aiAnalysis = await aiSecurityEngine.analyzeEvent(event)
    
    // Detect attacks
    const attackDetection = await attackDetector.detectAttack({
      method: body.method || 'POST',
      path: body.path || '/',
      headers: Object.fromEntries(request.headers.entries()),
      body: body.payload || {},
      query: {},
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      userId: event.userId,
      timestamp: Date.now()
    })
    
    // Create alert if threat detected
    if (aiAnalysis.threatScore > 40 || attackDetection.isAttack) {
      const severity: 'critical' | 'high' | 'medium' | 'low' = 
        aiAnalysis.threatScore >= 80 ? 'critical' :
        aiAnalysis.threatScore >= 60 ? 'high' :
        aiAnalysis.threatScore >= 40 ? 'medium' : 'low'
      
      await securityAlertsService.createAlert(event, severity)
    }
    
    return NextResponse.json({
      aiAnalysis,
      attackDetection,
      processed: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing security event:', error)
    return NextResponse.json(
      { error: 'Failed to analyze security event' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/security-audit - Acknowledge or escalate an event
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, action, userId, reason } = body
    
    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'Event ID and action required' },
        { status: 400 }
      )
    }
    
    let result
    
    switch (action) {
      case 'acknowledge':
        // In production, update database
        result = { acknowledged: true, eventId, userId }
        break
        
      case 'escalate':
        // In production, update database
        result = { escalated: true, eventId, userId, reason }
        break
        
      case 'resolve':
        // In production, update database
        result = { resolved: true, eventId, userId }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating security event:', error)
    return NextResponse.json(
      { error: 'Failed to update security event' },
      { status: 500 }
    )
  }
}
