import { NextRequest, NextResponse } from 'next/server'
import { masterAdminService } from '@/lib/services/masterAdmin'

// GET /api/admin/master/anomalies - Get detected anomalies
export async function GET() {
    try {
        const anomalies = await masterAdminService.detectAnomalies()
        return NextResponse.json(anomalies)
    } catch (error) {
        console.error('Error fetching anomalies:', error)
        return NextResponse.json(
            { error: 'Failed to fetch anomalies' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/master/anomalies/[id] - Update anomaly status
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status } = body
        
        if (!['resolved', 'ignored', 'investigating'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            )
        }
        
        await masterAdminService.updateAnomalyStatus(id, status)
        
        return NextResponse.json(
            { message: 'Anomaly status updated successfully' }
        )
    } catch (error) {
        console.error('Error updating anomaly status:', error)
        return NextResponse.json(
            { error: 'Failed to update anomaly status' },
            { status: 500 }
        )
    }
}
