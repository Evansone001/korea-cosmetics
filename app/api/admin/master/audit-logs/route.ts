import { NextRequest, NextResponse } from 'next/server'
import { masterAdminService } from '@/lib/services/masterAdmin'

// GET /api/admin/master/audit-logs - Get audit logs with filtering
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const userId = searchParams.get('userId')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const limit = parseInt(searchParams.get('limit') || '100')
        
        const filters: any = {}
        if (action) filters.action = action
        if (userId) filters.userId = userId
        if (startDate) filters.startDate = startDate
        if (endDate) filters.endDate = endDate
        if (limit) filters.limit = limit
        
        const logs = await masterAdminService.getAuditLogs(filters)
        return NextResponse.json(logs)
    } catch (error) {
        console.error('Error fetching audit logs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch audit logs' },
            { status: 500 }
        )
    }
}

// POST /api/admin/master/audit-logs - Add new audit log entry
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        // Get client IP from headers or fallback
        const forwarded = request.headers.get('x-forwarded-for')
        const ip = forwarded ? forwarded.split(',')[0] : 
                  request.headers.get('x-real-ip') || 
                  'unknown'
        
        const logEntry = {
            action: body.action,
            userId: body.userId,
            userName: body.userName || 'Unknown User',
            userRole: body.userRole || 'user',
            entityType: body.entityType,
            entityId: body.entityId,
            entityName: body.entityName,
            details: body.details,
            ipAddress: body.ipAddress || ip,
            userAgent: request.headers.get('user-agent') || 'unknown',
            success: body.success !== false,
            severity: body.severity || 'info',
            storeId: body.storeId,
            storeName: body.storeName
        }
        
        await masterAdminService.addAuditLog(logEntry)
        
        return NextResponse.json(
            { message: 'Audit log entry created successfully' },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating audit log entry:', error)
        return NextResponse.json(
            { error: 'Failed to create audit log entry' },
            { status: 500 }
        )
    }
}
