import { NextRequest, NextResponse } from 'next/server'
import { masterAdminService } from '@/lib/services/masterAdmin'

// GET /api/admin/master/alerts - Get platform alerts
export async function GET() {
    try {
        const alerts = await masterAdminService.getPlatformAlerts()
        return NextResponse.json(alerts)
    } catch (error) {
        console.error('Error fetching alerts:', error)
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/master/alerts/acknowledge - Acknowledge alert
export async function PUT(
    request: NextRequest
) {
    try {
        const body = await request.json().catch(() => ({}))
        const id = body.id || body.alertId
        const userId = request.headers.get('X-User-Id') || 'unknown'
        
        await masterAdminService.acknowledgeAlert(id, userId)
        
        return NextResponse.json(
            { message: 'Alert acknowledged successfully' }
        )
    } catch (error) {
        console.error('Error acknowledging alert:', error)
        return NextResponse.json(
            { error: 'Failed to acknowledge alert' },
            { status: 500 }
        )
    }
}
