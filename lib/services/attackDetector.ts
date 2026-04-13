/**
 * Attack Detection & Defense Monitoring Service
 * 
 * Provides real-time detection and defense against:
 * - SQL injection attempts
 * - XSS (Cross-Site Scripting) attacks
 * - CSRF (Cross-Site Request Forgery) attempts
 * - Brute force attacks
 * - DDoS attempts
 * - Data exfiltration attempts
 * - Privilege escalation attempts
 * - API abuse
 */

import { SecurityEvent } from './types/security'

// Attack detection result
export interface AttackDetectionResult {
  isAttack: boolean
  attackType: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  confidence: number
  details: string
  payload?: any
  recommendedAction: string
  blockImmediately: boolean
}

// Rate limiting tracker
interface RateLimitEntry {
  identifier: string
  count: number
  windowStart: number
  blocked: boolean
  blockExpiry?: number
}

// Brute force tracking
interface BruteForceEntry {
  identifier: string
  failedAttempts: number
  lastAttempt: number
  locked: boolean
  lockExpiry?: number
}

// DDoS tracking
interface DDoSEntry {
  ipAddress: string
  requestCount: number
  windowStart: number
  bytesTransferred: number
  suspicious: boolean
}

// API abuse tracking
interface APIAbuseEntry {
  identifier: string
  endpoint: string
  requestCount: number
  windowStart: number
  errorCount: number
}

/**
 * Attack Detection & Defense Service
 */
export class AttackDetector {
  // Rate limiting storage
  private rateLimits: Map<string, RateLimitEntry> = new Map()
  
  // Brute force tracking
  private bruteForceAttempts: Map<string, BruteForceEntry> = new Map()
  
  // DDoS tracking
  private ddosTracking: Map<string, DDoSEntry> = new Map()
  
  // API abuse tracking
  private apiAbuseTracking: Map<string, APIAbuseEntry> = new Map()
  
  // Blocked IPs
  private blockedIPs: Map<string, { blockedAt: number; expiry: number; reason: string }> = new Map()
  
  // Configuration
  private config = {
    // Rate limiting
    rateLimit: {
      windowMs: 60000, // 1 minute
      maxRequests: 100, // per window
      blockDuration: 300000 // 5 minutes
    },
    
    // Brute force protection
    bruteForce: {
      maxAttempts: 5,
      windowMs: 300000, // 5 minutes
      lockDuration: 1800000 // 30 minutes
    },
    
    // DDoS detection
    ddos: {
      requestThreshold: 1000, // requests per minute
      bytesThreshold: 100 * 1024 * 1024, // 100MB per minute
      blockDuration: 3600000 // 1 hour
    },
    
    // API abuse
    apiAbuse: {
      maxRequests: 1000,
      windowMs: 60000, // 1 minute
      errorThreshold: 50, // 50 errors per minute
      blockDuration: 600000 // 10 minutes
    }
  }

  constructor() {
    this.startCleanupInterval()
  }

  /**
   * Start cleanup interval for old entries
   */
  private startCleanupInterval() {
    setInterval(() => {
      this.cleanupOldEntries()
    }, 60000) // Clean up every minute
  }

  /**
   * Clean up old tracking entries
   */
  private cleanupOldEntries() {
    const now = Date.now()
    
    // Clean up rate limits
    for (const [key, entry] of this.rateLimits.entries()) {
      if (now - entry.windowStart > this.config.rateLimit.windowMs) {
        this.rateLimits.delete(key)
      }
    }
    
    // Clean up brute force entries
    for (const [key, entry] of this.bruteForceAttempts.entries()) {
      if (now - entry.lastAttempt > this.config.bruteForce.windowMs) {
        this.bruteForceAttempts.delete(key)
      }
    }
    
    // Clean up DDoS tracking
    for (const [key, entry] of this.ddosTracking.entries()) {
      if (now - entry.windowStart > 60000) { // 1 minute window
        this.ddosTracking.delete(key)
      }
    }
    
    // Clean up blocked IPs
    for (const [ip, data] of this.blockedIPs.entries()) {
      if (now > data.expiry) {
        this.blockedIPs.delete(ip)
      }
    }
    
    // Clean up API abuse tracking
    for (const [key, entry] of this.apiAbuseTracking.entries()) {
      if (now - entry.windowStart > this.config.apiAbuse.windowMs) {
        this.apiAbuseTracking.delete(key)
      }
    }
  }

  /**
   * Main attack detection entry point
   */
  async detectAttack(
    request: {
      method: string
      path: string
      headers: Record<string, string>
      body: any
      query: Record<string, string>
      ipAddress: string
      userAgent: string
      userId?: string
      timestamp: number
    }
  ): Promise<AttackDetectionResult> {
    // Check if IP is already blocked
    if (this.isIPBlocked(request.ipAddress)) {
      return {
        isAttack: true,
        attackType: 'blocked_ip',
        severity: 'high',
        confidence: 1.0,
        details: 'Request from blocked IP address',
        recommendedAction: 'Continue blocking, log for review',
        blockImmediately: true
      }
    }

    // 1. Check for injection attacks
    const injectionCheck = this.detectInjectionAttacks(request)
    if (injectionCheck.isAttack) {
      this.blockIP(request.ipAddress, 'injection_attack', 3600000) // 1 hour
      return injectionCheck
    }

    // 2. Check for XSS attempts
    const xssCheck = this.detectXSSAttacks(request)
    if (xssCheck.isAttack) {
      this.blockIP(request.ipAddress, 'xss_attack', 1800000) // 30 minutes
      return xssCheck
    }

    // 3. Check for CSRF attacks
    const csrfCheck = this.detectCSRFAttack(request)
    if (csrfCheck.isAttack) {
      return csrfCheck
    }

    // 4. Check for brute force
    const bruteForceCheck = this.detectBruteForce(request)
    if (bruteForceCheck.isAttack) {
      return bruteForceCheck
    }

    // 5. Check for DDoS
    const ddosCheck = this.detectDDoS(request)
    if (ddosCheck.isAttack) {
      this.blockIP(request.ipAddress, 'ddos_attack', 7200000) // 2 hours
      return ddosCheck
    }

    // 6. Check for API abuse
    const apiAbuseCheck = this.detectAPIAbuse(request)
    if (apiAbuseCheck.isAttack) {
      return apiAbuseCheck
    }

    // 7. Check for data exfiltration
    const exfilCheck = this.detectDataExfiltration(request)
    if (exfilCheck.isAttack) {
      return exfilCheck
    }

    // 8. Check for privilege escalation
    const privEscCheck = this.detectPrivilegeEscalation(request)
    if (privEscCheck.isAttack) {
      return privEscCheck
    }

    // 9. Rate limiting check
    const rateLimitCheck = this.checkRateLimit(request)
    if (rateLimitCheck.isAttack) {
      return rateLimitCheck
    }

    // No attack detected
    return {
      isAttack: false,
      attackType: 'none',
      severity: 'low',
      confidence: 0,
      details: 'No attack patterns detected',
      recommendedAction: 'Allow request',
      blockImmediately: false
    }
  }

  /**
   * Detect injection attacks (SQL, NoSQL, Command, LDAP)
   */
  private detectInjectionAttacks(request: any): AttackDetectionResult {
    const textToCheck = JSON.stringify(request.body) + JSON.stringify(request.query) + request.path
    const textLower = textToCheck.toLowerCase()

    // SQL Injection patterns
    const sqlPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /((\%27)|(\'))union/i,
      /exec(\s|\+)+(s|x)p\w+/i,
      /UNION\s+SELECT/i,
      /INSERT\s+INTO/i,
      /DELETE\s+FROM/i,
      /DROP\s+TABLE/i,
      /ALTER\s+TABLE/i,
      /script\s*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]

    for (const pattern of sqlPatterns) {
      if (pattern.test(textToCheck)) {
        return {
          isAttack: true,
          attackType: 'sql_injection',
          severity: 'critical',
          confidence: 0.95,
          details: `SQL injection pattern detected: ${pattern.source}`,
          payload: request.body,
          recommendedAction: 'Block immediately, log attack details, alert security team',
          blockImmediately: true
        }
      }
    }

    // NoSQL Injection
    const nosqlPatterns = [
      /\$where/,
      /\$regex/,
      /\$ne/,
      /\$gt/,
      /\$lt/,
      /\$gte/,
      /\$lte/,
      /\$in\s*:\s*\[.*?\]/,
      /\{.*\$where.*\}/
    ]

    for (const pattern of nosqlPatterns) {
      if (pattern.test(textToCheck)) {
        return {
          isAttack: true,
          attackType: 'nosql_injection',
          severity: 'critical',
          confidence: 0.90,
          details: `NoSQL injection pattern detected: ${pattern.source}`,
          payload: request.body,
          recommendedAction: 'Block immediately, sanitize inputs, alert security team',
          blockImmediately: true
        }
      }
    }

    // Command Injection
    const cmdPatterns = [
      /;\s*\w+/,
      /\|\s*\w+/,
      /`\s*\w+/,
      /\$\(\s*\w+/,
      /&&\s*\w+/,
      /\|\|\s*\w+/,
      />\s*\w+/,
      /<\s*\w+/,
      /eval\s*\(/,
      /system\s*\(/,
      /exec\s*\(/,
      /passthru\s*\(/,
      /shell_exec\s*\(/,
      /proc_open\s*\(/,
      /popen\s*\(/,
      /curl\s+/,
      /wget\s+/,
      /nc\s+-/,
      /netcat\s+/
    ]

    for (const pattern of cmdPatterns) {
      if (pattern.test(textToCheck)) {
        return {
          isAttack: true,
          attackType: 'command_injection',
          severity: 'critical',
          confidence: 0.92,
          details: `Command injection pattern detected: ${pattern.source}`,
          payload: request.body,
          recommendedAction: 'Block immediately, disable shell execution, alert security team',
          blockImmediately: true
        }
      }
    }

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Detect XSS attacks
   */
  private detectXSSAttacks(request: any): AttackDetectionResult {
    const textToCheck = JSON.stringify(request.body) + JSON.stringify(request.query)
    
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=\s*["']?[^"']*["']?/i,
      /on\w+\s*=\s*[^\s>]+/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<applet/i,
      /<form[^>]*action=["']?javascript:/i,
      /<input[^>]*on\w+/i,
      /<body[^>]*on\w+/i,
      /<img[^>]*on\w+/i,
      /<svg[^>]*on\w+/i,
      /<math[^>]*on\w+/i,
      /data:text\/html/i,
      /data:text\/javascript/i,
      /expression\s*\(/i,
      /url\s*\(\s*javascript:/i,
      /\/\*\s*\/\s*>\s*\/\s*>/  // Comment injection
    ]

    for (const pattern of xssPatterns) {
      if (pattern.test(textToCheck)) {
        return {
          isAttack: true,
          attackType: 'xss',
          severity: 'high',
          confidence: 0.90,
          details: `XSS attack pattern detected: ${pattern.source}`,
          payload: request.body,
          recommendedAction: 'Block request, sanitize output, implement CSP headers',
          blockImmediately: true
        }
      }
    }

    // DOM-based XSS indicators
    const domXssPatterns = [
      /document\.write/,
      /innerHTML\s*=/,
      /outerHTML\s*=/,
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(\s*["']/,  // setTimeout with string
      /setInterval\s*\(\s*["']/   // setInterval with string
    ]

    for (const pattern of domXssPatterns) {
      if (pattern.test(textToCheck)) {
        return {
          isAttack: true,
          attackType: 'dom_xss',
          severity: 'high',
          confidence: 0.85,
          details: `DOM-based XSS pattern detected: ${pattern.source}`,
          payload: request.body,
          recommendedAction: 'Block request, review JavaScript execution, implement CSP',
          blockImmediately: true
        }
      }
    }

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Detect CSRF attacks
   */
  private detectCSRFAttack(request: any): AttackDetectionResult {
    // Check for CSRF token in headers
    const csrfToken = request.headers['x-csrf-token'] || request.headers['x-xsrf-token']
    
    // Check origin/referer for state-changing requests
    const origin = request.headers['origin']
    const referer = request.headers['referer']
    
    // For state-changing methods (POST, PUT, DELETE, PATCH)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      // Check if origin/referer is missing or different
      const allowedOrigins = [
        'http://localhost:3000',
        'https://koreacosmetics.top',
      ]
      
      if (origin && !allowedOrigins.some(allowed => origin.includes(allowed))) {
        return {
          isAttack: true,
          attackType: 'csrf',
          severity: 'high',
          confidence: 0.80,
          details: `CSRF attack detected: Invalid origin ${origin}`,
          recommendedAction: 'Block request, validate origin headers, implement CSRF tokens',
          blockImmediately: true
        }
      }
      
      // Check for missing CSRF token on sensitive operations
      if (!csrfToken && request.path.includes('/api/admin')) {
        return {
          isAttack: true,
          attackType: 'csrf',
          severity: 'medium',
          confidence: 0.70,
          details: 'CSRF token missing on admin API request',
          recommendedAction: 'Reject request, require CSRF token for admin operations',
          blockImmediately: true
        }
      }
    }

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Detect brute force attacks
   */
  private detectBruteForce(request: any): AttackDetectionResult {
    const identifier = request.userId || request.ipAddress
    
    // Only check authentication endpoints
    if (!request.path.includes('/api/auth') && !request.path.includes('/login')) {
      return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
    }

    const now = Date.now()
    let entry = this.bruteForceAttempts.get(identifier)
    
    if (!entry) {
      entry = {
        identifier,
        failedAttempts: 0,
        lastAttempt: now,
        locked: false
      }
    }

    // Reset if outside window
    if (now - entry.lastAttempt > this.config.bruteForce.windowMs) {
      entry.failedAttempts = 0
      entry.locked = false
    }

    // Check if already locked
    if (entry.locked && entry.lockExpiry && now < entry.lockExpiry) {
      return {
        isAttack: true,
        attackType: 'brute_force',
        severity: 'high',
        confidence: 0.95,
        details: `Account locked due to brute force protection. ${Math.ceil((entry.lockExpiry - now) / 60000)} minutes remaining.`,
        recommendedAction: 'Maintain lockout, log attempt, notify account owner',
        blockImmediately: true
      }
    }

    // Check failed attempts
    // Note: In production, you'd check if the authentication actually failed
    // For now, simulate based on request patterns
    const isFailedAttempt = this.isLikelyFailedAuth(request)
    
    if (isFailedAttempt) {
      entry.failedAttempts++
      entry.lastAttempt = now

      if (entry.failedAttempts >= this.config.bruteForce.maxAttempts) {
        entry.locked = true
        entry.lockExpiry = now + this.config.bruteForce.lockDuration
        
        this.bruteForceAttempts.set(identifier, entry)
        
        return {
          isAttack: true,
          attackType: 'brute_force',
          severity: 'high',
          confidence: 0.90,
          details: `Brute force attack detected: ${entry.failedAttempts} failed attempts`,
          recommendedAction: 'Lock account, require CAPTCHA, notify security team',
          blockImmediately: true
        }
      }

      this.bruteForceAttempts.set(identifier, entry)
    }

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Helper to detect likely failed authentication
   */
  private isLikelyFailedAuth(request: any): boolean {
    // In production, this would check the actual auth response
    // For now, use heuristics:
    // - Multiple rapid requests
    // - Common password patterns in body
    // - Known weak credentials
    
    const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein']
    const bodyStr = JSON.stringify(request.body).toLowerCase()
    
    return commonPasswords.some(pwd => bodyStr.includes(pwd))
  }

  /**
   * Detect DDoS attacks
   */
  private detectDDoS(request: any): AttackDetectionResult {
    const ipAddress = request.ipAddress
    const now = Date.now()
    
    let entry = this.ddosTracking.get(ipAddress)
    
    if (!entry) {
      entry = {
        ipAddress,
        requestCount: 0,
        windowStart: now,
        bytesTransferred: 0,
        suspicious: false
      }
    }

    // Reset window
    if (now - entry.windowStart > 60000) {
      entry.requestCount = 0
      entry.bytesTransferred = 0
      entry.windowStart = now
      entry.suspicious = false
    }

    // Increment counters
    entry.requestCount++
    entry.bytesTransferred += this.estimateRequestSize(request)

    this.ddosTracking.set(ipAddress, entry)

    // Check thresholds
    if (entry.requestCount > this.config.ddos.requestThreshold) {
      return {
        isAttack: true,
        attackType: 'ddos',
        severity: 'critical',
        confidence: 0.85,
        details: `DDoS attack detected: ${entry.requestCount} requests per minute`,
        recommendedAction: 'Block IP immediately, enable rate limiting, consider CDN protection',
        blockImmediately: true
      }
    }

    if (entry.bytesTransferred > this.config.ddos.bytesThreshold) {
      return {
        isAttack: true,
        attackType: 'ddos_data',
        severity: 'critical',
        confidence: 0.80,
        details: `Potential data exfiltration or DDoS: ${(entry.bytesTransferred / 1024 / 1024).toFixed(2)} MB transferred`,
        recommendedAction: 'Block IP, review data access, check for exfiltration',
        blockImmediately: true
      }
    }

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Estimate request size
   */
  private estimateRequestSize(request: any): number {
    const bodySize = JSON.stringify(request.body).length
    const headersSize = JSON.stringify(request.headers).length
    return bodySize + headersSize + 1000 // Base overhead
  }

  /**
   * Detect API abuse
   */
  private detectAPIAbuse(request: any): AttackDetectionResult {
    const identifier = `${request.ipAddress}:${request.userId || 'anon'}`
    const endpoint = request.path
    const now = Date.now()
    
    let entry = this.apiAbuseTracking.get(identifier)
    
    if (!entry) {
      entry = {
        identifier,
        endpoint,
        requestCount: 0,
        windowStart: now,
        errorCount: 0
      }
    }

    // Reset window
    if (now - entry.windowStart > this.config.apiAbuse.windowMs) {
      entry.requestCount = 0
      entry.errorCount = 0
      entry.windowStart = now
    }

    entry.requestCount++
    
    // Simulate error detection (in production, check actual response)
    const isError = this.isLikelyError(request)
    if (isError) {
      entry.errorCount++
    }

    this.apiAbuseTracking.set(identifier, entry)

    // Check abuse thresholds
    if (entry.requestCount > this.config.apiAbuse.maxRequests) {
      return {
        isAttack: true,
        attackType: 'api_abuse',
        severity: 'medium',
        confidence: 0.75,
        details: `API abuse detected: ${entry.requestCount} requests in ${this.config.apiAbuse.windowMs / 1000} seconds`,
        recommendedAction: 'Rate limit client, require authentication, review API usage',
        blockImmediately: false
      }
    }

    // Check for enumeration attacks (many errors = trying to find valid IDs)
    if (entry.errorCount > this.config.apiAbuse.errorThreshold) {
      return {
        isAttack: true,
        attackType: 'api_enumeration',
        severity: 'high',
        confidence: 0.80,
        details: `API enumeration attack: ${entry.errorCount} errors in ${this.config.apiAbuse.windowMs / 1000} seconds`,
        recommendedAction: 'Block client, implement request signing, add CAPTCHA',
        blockImmediately: true
      }
    }

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Helper to detect likely errors
   */
  private isLikelyError(request: any): boolean {
    // In production, check actual response status
    // For now, check for patterns that often cause errors
    const suspiciousPatterns = [
      /id=.*['"\\]/,  // SQL injection attempts often cause errors
      /../,           // Path traversal
      /\0/,           // Null bytes
      /\/etc\//,      // System files
      /script>/i      // Scripts
    ]
    
    const checkString = JSON.stringify(request.query) + JSON.stringify(request.body)
    return suspiciousPatterns.some(p => p.test(checkString))
  }

  /**
   * Detect data exfiltration attempts
   */
  private detectDataExfiltration(request: any): AttackDetectionResult {
    // Check for large data requests
    const isLargeExport = 
      (request.path.includes('/export') || request.path.includes('/download')) &&
      (!request.query.limit || parseInt(request.query.limit) > 10000)

    if (isLargeExport) {
      // Check user permissions
      const hasPermission = request.headers['x-user-role'] === 'admin' || 
                          request.headers['x-user-role'] === 'data_exporter'
      
      if (!hasPermission) {
        return {
          isAttack: true,
          attackType: 'data_exfiltration',
          severity: 'critical',
          confidence: 0.85,
          details: `Unauthorized bulk data export attempt`,
          recommendedAction: 'Block request, audit user access, review data governance',
          blockImmediately: true
        }
      }
    }

    // Check for unusual data access patterns
    const isUnusualAccess = 
      request.path.includes('/api/admin') &&
      request.query.includeSensitive === 'true'

    if (isUnusualAccess) {
      return {
        isAttack: true,
        attackType: 'sensitive_data_access',
        severity: 'high',
        confidence: 0.70,
        details: 'Attempt to access sensitive data fields',
        recommendedAction: 'Require additional approval, log access, notify data owner',
        blockImmediately: false
      }
    }

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Detect privilege escalation attempts
   */
  private detectPrivilegeEscalation(request: any): AttackDetectionResult {
    // Check for role manipulation attempts
    const hasRoleParam = 
      request.body?.role !== undefined ||
      request.body?.permissions !== undefined ||
      request.body?.isAdmin !== undefined ||
      request.query?.role !== undefined

    if (hasRoleParam) {
      // Check if user has permission to change roles
      const userRole = request.headers['x-user-role']
      const isAdminRequest = request.path.includes('/admin')

      if (userRole !== 'super_admin' && isAdminRequest) {
        return {
          isAttack: true,
          attackType: 'privilege_escalation',
          severity: 'critical',
          confidence: 0.90,
          details: 'Privilege escalation attempt: User tried to modify role/permissions',
          recommendedAction: 'Block immediately, lock account, conduct security audit',
          blockImmediately: true
        }
      }
    }

    // Check for endpoint access that should be restricted
    const restrictedEndpoints = [
      '/api/admin/users/create',
      '/api/admin/roles',
      '/api/admin/permissions',
      '/api/admin/config'
    ]

    const isRestricted = restrictedEndpoints.some(ep => request.path.includes(ep))
    
    if (isRestricted) {
      const userRole = request.headers['x-user-role']
      
      if (userRole !== 'super_admin' && userRole !== 'admin') {
        return {
          isAttack: true,
          attackType: 'unauthorized_admin_access',
          severity: 'high',
          confidence: 0.85,
          details: 'Attempted access to restricted admin endpoint',
          recommendedAction: 'Block request, review access controls, alert security team',
          blockImmediately: true
        }
      }
    }

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Rate limiting check
   */
  private checkRateLimit(request: any): AttackDetectionResult {
    const identifier = request.userId || request.ipAddress
    const now = Date.now()
    
    let entry = this.rateLimits.get(identifier)
    
    if (!entry) {
      entry = {
        identifier,
        count: 0,
        windowStart: now,
        blocked: false
      }
    }

    // Reset window
    if (now - entry.windowStart > this.config.rateLimit.windowMs) {
      entry.count = 0
      entry.windowStart = now
      entry.blocked = false
    }

    // Check if blocked
    if (entry.blocked && entry.blockExpiry && now < entry.blockExpiry) {
      return {
        isAttack: true,
        attackType: 'rate_limit_exceeded',
        severity: 'medium',
        confidence: 1.0,
        details: `Rate limit exceeded. Blocked until ${new Date(entry.blockExpiry).toISOString()}`,
        recommendedAction: 'Maintain block, suggest client to slow down',
        blockImmediately: true
      }
    }

    // Increment count
    entry.count++
    
    // Check limit
    if (entry.count > this.config.rateLimit.maxRequests) {
      entry.blocked = true
      entry.blockExpiry = now + this.config.rateLimit.blockDuration
      
      this.rateLimits.set(identifier, entry)
      
      return {
        isAttack: true,
        attackType: 'rate_limit_exceeded',
        severity: 'medium',
        confidence: 1.0,
        details: `Rate limit exceeded: ${entry.count} requests in ${this.config.rateLimit.windowMs / 1000} seconds`,
        recommendedAction: 'Block temporarily, implement exponential backoff',
        blockImmediately: true
      }
    }

    this.rateLimits.set(identifier, entry)

    return { isAttack: false, attackType: 'none', severity: 'low', confidence: 0, details: '', recommendedAction: '', blockImmediately: false }
  }

  /**
   * Block an IP address
   */
  async blockIP(ipAddress: string, reason: string, duration: number): Promise<void> {
    const now = Date.now()
    this.blockedIPs.set(ipAddress, {
      blockedAt: now,
      expiry: now + duration,
      reason
    })
    
    // In production, also add to firewall rules
    console.log(`[AttackDetector] Blocked IP ${ipAddress}: ${reason} for ${duration / 1000}s`)
  }

  /**
   * Unblock an IP address
   */
  async unblockIP(ipAddress: string): Promise<void> {
    this.blockedIPs.delete(ipAddress)
    console.log(`[AttackDetector] Unblocked IP ${ipAddress}`)
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ipAddress: string): boolean {
    const blocked = this.blockedIPs.get(ipAddress)
    if (!blocked) return false
    
    const now = Date.now()
    if (now > blocked.expiry) {
      this.blockedIPs.delete(ipAddress)
      return false
    }
    
    return true
  }

  /**
   * Get blocked IPs
   */
  getBlockedIPs(): Array<{ ipAddress: string; blockedAt: Date; reason: string; expiresAt: Date }> {
    const now = Date.now()
    const result: Array<{ ipAddress: string; blockedAt: Date; reason: string; expiresAt: Date }> = []
    
    for (const [ip, data] of this.blockedIPs.entries()) {
      if (now <= data.expiry) {
        result.push({
          ipAddress: ip,
          blockedAt: new Date(data.blockedAt),
          reason: data.reason,
          expiresAt: new Date(data.expiry)
        })
      }
    }
    
    return result
  }

  /**
   * Get attack statistics
   */
  getAttackStats(): {
    totalBlocked: number
    activeBlocks: number
    attackTypes: Record<string, number>
    topAttackers: Array<{ ip: string; count: number; lastAttack: Date }>
  } {
    // Calculate stats
    const attackTypes: Record<string, number> = {}
    const attackerStats: Map<string, { count: number; lastAttack: Date }> = new Map()
    
    // In production, this would query actual attack logs
    // For now, return mock stats
    return {
      totalBlocked: this.blockedIPs.size,
      activeBlocks: this.blockedIPs.size,
      attackTypes: {
        sql_injection: 45,
        xss: 32,
        brute_force: 28,
        ddos: 5,
        api_abuse: 15,
        csrf: 3,
        privilege_escalation: 2
      },
      topAttackers: []
    }
  }

  /**
   * Reset all tracking data
   */
  async reset(): Promise<void> {
    this.rateLimits.clear()
    this.bruteForceAttempts.clear()
    this.ddosTracking.clear()
    this.apiAbuseTracking.clear()
    this.blockedIPs.clear()
    
    console.log('[AttackDetector] All tracking data reset')
  }
}

// Export singleton instance
export const attackDetector = new AttackDetector()
