import { PrismaClient } from '@prisma/client'

// Check if we should use mock client
const shouldUseMock = process.env.NODE_ENV === 'development' || 
                     process.env.NODE_ENV === undefined || // Build time
                     !process.env.DATABASE_URL || 
                     process.env.DATABASE_URL.includes('localhost') ||
                     process.env.DATABASE_URL.includes('korea-cosmetics') ||
                     process.env.DATABASE_URL?.includes('postgresql://user:password') // Default placeholder

// Mock Prisma client for development
class MockPrismaClient {
  constructor() {
    console.log(' MockPrismaClient initialized for development')
  }

  async findUnique(args?: any) { 
    console.log('[Mock] findUnique called with:', args)
    return null 
  }
  
  async findMany(args?: any) { 
    console.log('[Mock] findMany called with:', args)
    return [] 
  }
  
  async findFirst(args?: any) { 
    console.log('[Mock] findFirst called with:', args)
    return null 
  }
  
  async create(args?: any) { 
    console.log('[Mock] create called with:', args)
    return { id: 'mock-id-' + Date.now(), ...args?.data } 
  }
  
  async update(args?: any) { 
    console.log('[Mock] update called with:', args)
    return { id: 'mock-id', ...args?.data } 
  }
  
  async delete(args?: any) { 
    console.log('[Mock] delete called with:', args)
    return { count: 0 } 
  }
  
  async count(args?: any) { 
    console.log('[Mock] count called with:', args)
    return 0 
  }
  
  async deleteMany(args?: any) { 
    console.log('[Mock] deleteMany called with:', args)
    return { count: 0 } 
  }
  
  async updateMany(args?: any) { 
    console.log('[Mock] updateMany called with:', args)
    return { count: 0 } 
  }
  
  async createMany(args?: any) { 
    console.log('[Mock] createMany called with:', args)
    return { count: 0 } 
  }
  
  async upsert(args?: any) { 
    console.log('[Mock] upsert called with:', args)
    return { id: 'mock-id', ...args?.create, ...args?.update } 
  }
  
  async aggregate(args?: any) { 
    console.log('[Mock] aggregate called with:', args)
    return {} 
  }
  
  async groupBy(args?: any) { 
    console.log('[Mock] groupBy called with:', args)
    return [] 
  }
  
  async raw(args?: any) { 
    console.log('[Mock] raw called with:', args)
    return [] 
  }
  
  async queryRaw(args?: any) { 
    console.log('[Mock] queryRaw called with:', args)
    return [] 
  }
  
  async executeRaw(args?: any) { 
    console.log('[Mock] executeRaw called with:', args)
    return 0 
  }
  
  async $queryRaw(args?: any) { 
    console.log('[Mock] $queryRaw called with:', args)
    return [] 
  }
  
  async $executeRaw(args?: any) { 
    console.log('[Mock] $executeRaw called with:', args)
    return 0 
  }
  
  async $transaction(args?: any) { 
    console.log('[Mock] $transaction called with:', args)
    if (typeof args === 'function') {
      return args(this)
    }
    return [] 
  }
  
  async $connect() { 
    console.log('[Mock] $connect called')
    return 
  }
  
  async $disconnect() { 
    console.log('[Mock] $disconnect called')
    return 
  }
  
  async $on() { 
    console.log('[Mock] $on called')
    return 
  }
  
  async $use() { 
    console.log('[Mock] $use called')
    return 
  }
  
  // Add mock models for TypeScript
  product = this
  storeProduct = this
  user = this
  store = this
  order = this
  orderItem = this
  rating = this
  address = this
  coupon = this
  userActionLog = this
}

// Create a lazy-loading wrapper
let prismaInstance: any = null

const createPrismaClient = () => {
  if (shouldUseMock) {
    console.log('🔧 Using mock Prisma client for development (connecting to Flask backend)')
    return new MockPrismaClient()
  }
  
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } catch (error) {
    console.warn('Failed to create Prisma client, falling back to mock:', error)
    return new MockPrismaClient()
  }
}

const prismaClientSingleton = () => {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient()
  }
  return prismaInstance
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
