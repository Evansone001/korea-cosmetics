// Mock Prisma client for development
// Frontend should call backend API, not use Prisma directly
class MockPrismaClient {
  constructor() {
    console.log('[Mock] MockPrismaClient initialized - frontend should use backend API')
  }

  async findUnique(args?: any) {
    console.log('[Mock] findUnique called - use backend API instead')
    return null
  }

  async findMany(args?: any) {
    console.log('[Mock] findMany called - use backend API instead')
    return []
  }

  async findFirst(args?: any) {
    console.log('[Mock] findFirst called - use backend API instead')
    return null
  }

  async create(args?: any) {
    console.log('[Mock] create called - use backend API instead')
    return { id: 'mock-id-' + Date.now(), ...args?.data }
  }

  async update(args?: any) {
    console.log('[Mock] update called - use backend API instead')
    return { id: 'mock-id', ...args?.data }
  }

  async delete(args?: any) {
    console.log('[Mock] delete called - use backend API instead')
    return { count: 0 }
  }

  async count(args?: any) {
    console.log('[Mock] count called - use backend API instead')
    return 0
  }

  async deleteMany(args?: any) {
    console.log('[Mock] deleteMany called - use backend API instead')
    return { count: 0 }
  }

  async updateMany(args?: any) {
    console.log('[Mock] updateMany called - use backend API instead')
    return { count: 0 }
  }

  async createMany(args?: any) {
    console.log('[Mock] createMany called - use backend API instead')
    return { count: 0 }
  }

  async upsert(args?: any) {
    console.log('[Mock] upsert called - use backend API instead')
    return { id: 'mock-id', ...args?.create, ...args?.update }
  }

  async aggregate(args?: any) {
    console.log('[Mock] aggregate called - use backend API instead')
    return {}
  }

  async groupBy(args?: any) {
    console.log('[Mock] groupBy called - use backend API instead')
    return []
  }

  async raw(args?: any) {
    console.log('[Mock] raw called - use backend API instead')
    return []
  }

  async queryRaw(args?: any) {
    console.log('[Mock] queryRaw called - use backend API instead')
    return []
  }

  async executeRaw(args?: any) {
    console.log('[Mock] executeRaw called - use backend API instead')
    return 0
  }

  async $queryRaw(args?: any) {
    console.log('[Mock] $queryRaw called - use backend API instead')
    return []
  }

  async $executeRaw(args?: any) {
    console.log('[Mock] $executeRaw called - use backend API instead')
    return 0
  }

  async $transaction(args?: any) {
    console.log('[Mock] $transaction called - use backend API instead')
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

const prisma = new MockPrismaClient()

export default prisma
