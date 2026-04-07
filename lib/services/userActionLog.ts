// User Action Logging Service
// Supports both demo mode (mock data) and production mode (Prisma database)

// Demo mode - returns mock data instead of hitting database
const DEMO_MODE = process.env.DEMO_MODE === 'true' || 
                  !process.env.DATABASE_URL || 
                  process.env.DATABASE_URL === 'postgresql://user:password@localhost:5432/korea-cosmetics'

// Type definition for UserAction (mirror of Prisma enum)
export type UserAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ORDER_PLACED'
  | 'ORDER_CANCELLED'
  | 'PROFILE_UPDATE'
  | 'ADDRESS_ADDED'
  | 'ADDRESS_UPDATED'
  | 'ADDRESS_DELETED'
  | 'STORE_CREATED'
  | 'STORE_UPDATED'
  | 'PRODUCT_ADDED'
  | 'PRODUCT_UPDATED'

// Mock user action data for demo mode
const mockUserActions: any[] = [
  {
    id: '1',
    userId: 'user_1',
    userName: 'Demo User',
    userEmail: 'demo@example.com',
    action: 'LOGIN',
    entityType: null,
    entityId: null,
    details: null,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date().toISOString(),
  },
]

export interface UserActionLogEntry {
  userId: string
  userName: string
  userEmail: string
  action: UserAction
  entityType?: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export interface UserActionQuery {
  userId?: string
  action?: UserAction
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

// Lazy-load prisma client only when needed
async function getPrisma() {
  const prismaModule = await import('@/lib/prisma')
  return prismaModule.default
}

/**
 * Log a user action
 */
export async function logUserAction(entry: UserActionLogEntry): Promise<void> {
  if (DEMO_MODE) {
    console.log('[DEMO] User action logged:', entry)
    return
  }
  
  try {
    const prisma = await getPrisma()
    await prisma.userActionLog.create({
      data: {
        userId: entry.userId,
        userName: entry.userName,
        userEmail: entry.userEmail,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to log user action:', error)
  }
}

/**
 * Get actions for a specific user
 */
export async function getUserActions(
  userId: string,
  options: { limit?: number; offset?: number; startDate?: Date; endDate?: Date } = {}
): Promise<{ actions: any[]; total: number }> {
  if (DEMO_MODE) {
    const { limit = 50, offset = 0 } = options
    const filtered = mockUserActions.filter(a => a.userId === userId)
    return { 
      actions: filtered.slice(offset, offset + limit),
      total: filtered.length 
    }
  }

  const { limit = 50, offset = 0, startDate, endDate } = options
  const where: any = { userId }
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const prisma = await getPrisma()
  const [actions, total] = await Promise.all([
    prisma.userActionLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
    prisma.userActionLog.count({ where }),
  ])
  return { actions, total }
}

/**
 * Get all actions with filtering
 */
export async function getAllActions(filters: UserActionQuery = {}): Promise<{ actions: any[]; total: number }> {
  if (DEMO_MODE) {
    const { limit = 50, offset = 0 } = filters
    return { actions: mockUserActions.slice(offset, offset + limit), total: mockUserActions.length }
  }

  const { userId, action, startDate, endDate, limit = 50, offset = 0 } = filters
  const where: any = {}
  if (userId) where.userId = userId
  if (action) where.action = action
  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) where.createdAt.gte = startDate
    if (endDate) where.createdAt.lte = endDate
  }

  const prisma = await getPrisma()
  const [actions, total] = await Promise.all([
    prisma.userActionLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
    prisma.userActionLog.count({ where }),
  ])
  return { actions, total }
}

/**
 * Get recent actions
 */
export async function getRecentActions(limit: number = 100): Promise<any[]> {
  if (DEMO_MODE) return mockUserActions.slice(0, limit)
  const prisma = await getPrisma()
  return prisma.userActionLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
}

/**
 * Get action statistics
 */
export async function getUserActionStats(userId: string): Promise<{ totalActions: number; actionCounts: Record<string, number>; firstSeen: Date | null; lastSeen: Date | null }> {
  if (DEMO_MODE) {
    const actions = mockUserActions.filter(a => a.userId === userId)
    const actionCounts: Record<string, number> = {}
    for (const action of actions) {
      actionCounts[action.action] = (actionCounts[action.action] || 0) + 1
    }
    return {
      totalActions: actions.length,
      actionCounts,
      firstSeen: actions.length > 0 ? new Date(actions[0].createdAt) : null,
      lastSeen: actions.length > 0 ? new Date(actions[actions.length - 1].createdAt) : null,
    }
  }

  const prisma = await getPrisma()
  const actions = await prisma.userActionLog.findMany({
    where: { userId },
    select: { action: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const actionCounts: Record<string, number> = {}
  for (const action of actions) {
    actionCounts[action.action] = (actionCounts[action.action] || 0) + 1
  }

  return {
    totalActions: actions.length,
    actionCounts,
    firstSeen: actions.length > 0 ? actions[0].createdAt : null,
    lastSeen: actions.length > 0 ? actions[actions.length - 1].createdAt : null,
  }
}

/**
 * Cleanup old logs
 */
export async function cleanupOldLogs(retentionDays: number = 30): Promise<number> {
  if (DEMO_MODE) {
    console.log('[DEMO] Skipping cleanup in demo mode')
    return 0
  }
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const prisma = await getPrisma()
  const result = await prisma.userActionLog.deleteMany({ where: { createdAt: { lt: cutoffDate } } })
  console.log(`Cleaned up ${result.count} old user action logs`)
  return result.count
}

/**
 * Search actions by entity
 */
export async function getActionsByEntity(entityType: string, entityId: string): Promise<any[]> {
  if (DEMO_MODE) {
    return mockUserActions.filter(a => a.entityType === entityType && a.entityId === entityId)
  }
  const prisma = await getPrisma()
  return prisma.userActionLog.findMany({ where: { entityType, entityId }, orderBy: { createdAt: 'desc' } })
}
