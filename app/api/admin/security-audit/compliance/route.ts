import { NextRequest, NextResponse } from 'next/server'
import { complianceReporter } from '@/lib/services/complianceReporter'

// GET /api/admin/security-audit/compliance - Get compliance status and reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const reportId = searchParams.get('reportId')
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }
    
    // If specific report requested, return it
    if (reportId) {
      const reports = complianceReporter.getComplianceHistory()
      const report = reports.find(r => r.id === reportId)
      
      if (!report) {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ report })
    }
    
    // Generate new report for period
    const report = await complianceReporter.generateComplianceReport(startDate, endDate)
    
    // Get compliance checks
    const gdprCompliance = await complianceReporter.checkGDPRCompliance()
    const pciCompliance = await complianceReporter.checkPCIDSSCompliance()
    
    // Get audit trail integrity
    const auditIntegrity = await complianceReporter.verifyAuditTrailIntegrity()
    
    return NextResponse.json({
      report,
      compliance: {
        gdpr: gdprCompliance,
        pci: pciCompliance
      },
      auditIntegrity,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating compliance report:', error)
    return NextResponse.json(
      { error: 'Failed to generate compliance report' },
      { status: 500 }
    )
  }
}

// POST /api/admin/security-audit/compliance - Export report or perform action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, reportId, format } = body
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action required' },
        { status: 400 }
      )
    }
    
    switch (action) {
      case 'export':
        if (!reportId || !format) {
          return NextResponse.json(
            { error: 'Report ID and format required' },
            { status: 400 }
          )
        }
        
        const filename = await complianceReporter.exportReport(
          reportId, 
          format as 'pdf' | 'json' | 'csv'
        )
        
        return NextResponse.json({
          success: true,
          filename,
          downloadUrl: `/api/download/${filename}`,
          format
        })
        
      case 'cleanup':
        const retentionDays = body.retentionDays || 2555 // 7 years default
        const removed = await complianceReporter.cleanupOldData(retentionDays)
        
        return NextResponse.json({
          success: true,
          removed,
          retentionDays,
          message: `Cleaned up ${removed} old records`
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing compliance action:', error)
    return NextResponse.json(
      { error: 'Failed to process compliance action' },
      { status: 500 }
    )
  }
}
