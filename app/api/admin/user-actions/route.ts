import { NextRequest, NextResponse } from 'next/server'
import { UserAction } from '@prisma/client'
import {
  getUserActions,
  getAllActions,
  getRecentActions,
  cleanupOldLogs,
} from '@/lib/services/userActionLog'

// GET /api/admin/user-actions - Get user actions with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('userId')
    const action = searchParams.get('action') as UserAction | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const recent = searchParams.get('recent') === 'true'

    // If recent flag is set, return recent actions across all users
    if (recent) {
      const actions = await getRecentActions(limit)
      return NextResponse.json({ actions, total: actions.length })
    }

    // If userId is provided, get actions for specific user
    if (userId) {
      const result = await getUserActions(userId, {
        limit,
        offset,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      })
      return NextResponse.json(result)
    }

    // Otherwise, get all actions with filters (admin view)
    const result = await getAllActions({
      action: action || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching user actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user actions' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/user-actions - Cleanup old logs (retention policy)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const retentionDays = parseInt(searchParams.get('retentionDays') || '30')

    const deletedCount = await cleanupOldLogs(retentionDays)

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old action logs`,
    })
  } catch (error) {
    console.error('Error cleaning up old logs:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup old logs' },
      { status: 500 }
    )
  }
}
