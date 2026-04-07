import { NextRequest, NextResponse } from 'next/server'
import { systemFingerprintingService } from '@/lib/services/systemFingerprint'

// GET /api/admin/security-audit/fingerprints - Get device fingerprints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const riskLevel = searchParams.get('riskLevel') as 'low' | 'medium' | 'high' | 'critical' | null
    const suspicious = searchParams.get('suspicious')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let fingerprints = systemFingerprintingService.getAllFingerprints()
    
    // Apply filters
    if (riskLevel) {
      fingerprints = fingerprints.filter(fp => fp.security.riskLevel === riskLevel)
    }
    
    if (suspicious !== null) {
      const isSuspicious = suspicious === 'true'
      fingerprints = fingerprints.filter(fp => fp.security.suspicious === isSuspicious)
    }
    
    // Get analytics
    const analytics = await systemFingerprintingService.generateAnalytics()
    
    // Paginate
    const paginatedFingerprints = fingerprints.slice(0, limit)
    
    return NextResponse.json({
      fingerprints: paginatedFingerprints,
      analytics,
      total: fingerprints.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching fingerprints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fingerprint data' },
      { status: 500 }
    )
  }
}

// POST /api/admin/security-audit/fingerprints - Trust or distrust fingerprint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, fingerprintId } = body
    
    if (!fingerprintId || !action) {
      return NextResponse.json(
        { error: 'Fingerprint ID and action required' },
        { status: 400 }
      )
    }
    
    switch (action) {
      case 'trust':
        await systemFingerprintingService.trustFingerprint(fingerprintId)
        return NextResponse.json({
          success: true,
          action: 'trusted',
          fingerprintId,
          message: 'Fingerprint marked as trusted'
        })
        
      case 'distrust':
        await systemFingerprintingService.distrustFingerprint(fingerprintId)
        return NextResponse.json({
          success: true,
          action: 'distrusted',
          fingerprintId,
          message: 'Fingerprint marked as untrusted and blocked'
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "trust" or "distrust"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error managing fingerprint:', error)
    return NextResponse.json(
      { error: 'Failed to process fingerprint action' },
      { status: 500 }
    )
  }
}
