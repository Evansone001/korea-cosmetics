/**
 * System Fingerprinting Service
 * 
 * Provides device and browser fingerprinting for security monitoring:
 * - Canvas fingerprinting
 * - WebGL fingerprinting
 * - Browser plugin detection
 * - Screen and timezone analysis
 * - Network pattern analysis
 * - Geographic tracking with VPN/proxy detection
 */

// Fingerprint data interface
export interface SystemFingerprint {
  id: string
  visitorId: string // Unique visitor identifier
  
  // Canvas fingerprinting
  canvas: {
    hash: string
    dataURL: string // Canvas data URL (first 100 chars)
  }
  
  // WebGL fingerprinting
  webgl: {
    vendor: string
    renderer: string
    hash: string
  }
  
  // Browser characteristics
  browser: {
    userAgent: string
    language: string
    languages: string[]
    colorDepth: number
    pixelRatio: number
    screenResolution: string
    availableScreenResolution: string
    timezone: string
    timezoneOffset: number
    sessionStorage: boolean
    localStorage: boolean
    indexedDB: boolean
    cpuClass?: string
    platform: string
    plugins: string[]
    mimeTypes: string[]
    canvas?: boolean
    webgl: boolean
    webdriver: boolean
    adBlock: boolean
    hasLiedLanguages: boolean
    hasLiedResolution: boolean
    hasLiedOs: boolean
    hasLiedBrowser: boolean
    touchSupport: {
      maxTouchPoints: number
      touchEvent: boolean
      touchStart: boolean
    }
    fonts: string[]
  }
  
  // Network information
  network: {
    ipAddress: string
    geolocation: {
      country: string
      city: string
      region: string
      lat: number
      lng: number
    }
    isp: string
    connectionType?: string // 4g, wifi, etc
    effectiveType?: string
    downlink?: number
    rtt?: number
    isTor: boolean
    isVPN: boolean
    isProxy: boolean
    asn?: string
  }
  
  // Device information
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
    vendor?: string
    model?: string
    memory?: number // GB
    hardwareConcurrency: number // CPU cores
    deviceMemory?: number
    maxTouchPoints: number
  }
  
  // Behavioral analysis
  behavior: {
    firstSeen: Date
    lastSeen: Date
    visitCount: number
    averageSessionDuration: number // minutes
    pageViews: number
    mouseMovements: number
    keyPresses: number
    clicks: number
    scrollDepth: number
    referrer: string
  }
  
  // Security indicators
  security: {
    trustScore: number // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    isBot: boolean
    isSpoofed: boolean
    suspicious: boolean
    fingerprintConsistency: number // 0-1
    anomalies: string[]
  }
}

// Trust score calculation weights
const TRUST_WEIGHTS = {
  knownFingerprint: 30,
  consistentBehavior: 20,
  legitimateBrowser: 15,
  noTorVPN: 15,
  realDevice: 10,
  noAnomalies: 10
}

// Bot detection patterns
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /puppeteer/i,
  /selenium/i,
  /playwright/i,
  /phantomjs/i,
  /slimerjs/i,
  /zombie/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /scrapy/i,
  /aiohttp/i
]

// Suspicious browser characteristics
const SUSPICIOUS_INDICATORS = [
  'webdriver', // Selenium automation
  'phantomjs',
  'selenium',
  'headless',
  'Cypress',
  '__nightmare',
  'callPhantom',
  '_phantom'
]

/**
 * System Fingerprinting Service
 */
export class SystemFingerprintingService {
  private fingerprints: Map<string, SystemFingerprint> = new Map()
  private visitorIdMap: Map<string, string> = new Map() // IP -> fingerprint ID
  private knownGoodFingerprints: Set<string> = new Set()
  private knownBadFingerprints: Set<string> = new Set()

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    // Load known fingerprints from storage
    this.loadFingerprints()
  }

  private loadFingerprints() {
    // In production, load from database
    // For now, initialize empty
  }

  /**
   * Generate a new fingerprint from client data
   */
  async generateFingerprint(
    clientData: Partial<SystemFingerprint>,
    ipAddress: string
  ): Promise<SystemFingerprint> {
    // Generate unique visitor ID based on fingerprint components
    const visitorId = this.generateVisitorId(clientData)
    
    // Check if fingerprint exists
    const existingId = this.visitorIdMap.get(ipAddress)
    if (existingId) {
      const existing = this.fingerprints.get(existingId)
      if (existing && existing.visitorId === visitorId) {
        // Update existing fingerprint
        return this.updateFingerprint(existingId, clientData)
      }
    }

    // Create new fingerprint
    const fingerprint: SystemFingerprint = {
      id: `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      visitorId,
      
      canvas: clientData.canvas || { hash: '', dataURL: '' },
      
      webgl: clientData.webgl || { vendor: '', renderer: '', hash: '' },
      
      browser: {
        userAgent: clientData.browser?.userAgent || '',
        language: clientData.browser?.language || 'en-US',
        languages: clientData.browser?.languages || ['en-US'],
        colorDepth: clientData.browser?.colorDepth || 24,
        pixelRatio: clientData.browser?.pixelRatio || 1,
        screenResolution: clientData.browser?.screenResolution || '1920x1080',
        availableScreenResolution: clientData.browser?.availableScreenResolution || '1920x1080',
        timezone: clientData.browser?.timezone || 'UTC',
        timezoneOffset: clientData.browser?.timezoneOffset || 0,
        sessionStorage: clientData.browser?.sessionStorage ?? true,
        localStorage: clientData.browser?.localStorage ?? true,
        indexedDB: clientData.browser?.indexedDB ?? true,
        cpuClass: clientData.browser?.cpuClass,
        platform: clientData.browser?.platform || 'unknown',
        plugins: clientData.browser?.plugins || [],
        mimeTypes: clientData.browser?.mimeTypes || [],
        canvas: clientData.browser?.canvas ?? true,
        webgl: clientData.browser?.webgl ?? true,
        webdriver: clientData.browser?.webdriver ?? false,
        adBlock: clientData.browser?.adBlock ?? false,
        hasLiedLanguages: clientData.browser?.hasLiedLanguages ?? false,
        hasLiedResolution: clientData.browser?.hasLiedResolution ?? false,
        hasLiedOs: clientData.browser?.hasLiedOs ?? false,
        hasLiedBrowser: clientData.browser?.hasLiedBrowser ?? false,
        touchSupport: clientData.browser?.touchSupport || {
          maxTouchPoints: 0,
          touchEvent: false,
          touchStart: false
        },
        fonts: clientData.browser?.fonts || []
      },
      
      network: {
        ipAddress,
        geolocation: clientData.network?.geolocation || {
          country: 'Unknown',
          city: 'Unknown',
          region: 'Unknown',
          lat: 0,
          lng: 0
        },
        isp: clientData.network?.isp || 'Unknown',
        connectionType: clientData.network?.connectionType,
        effectiveType: clientData.network?.effectiveType,
        downlink: clientData.network?.downlink,
        rtt: clientData.network?.rtt,
        isTor: clientData.network?.isTor ?? false,
        isVPN: clientData.network?.isVPN ?? false,
        isProxy: clientData.network?.isProxy ?? false,
        asn: clientData.network?.asn
      },
      
      device: {
        type: this.detectDeviceType(clientData.browser?.userAgent || ''),
        vendor: clientData.device?.vendor,
        model: clientData.device?.model,
        memory: clientData.device?.memory,
        hardwareConcurrency: clientData.device?.hardwareConcurrency || 1,
        deviceMemory: clientData.device?.deviceMemory,
        maxTouchPoints: clientData.device?.maxTouchPoints || 0
      },
      
      behavior: {
        firstSeen: new Date(),
        lastSeen: new Date(),
        visitCount: 1,
        averageSessionDuration: 0,
        pageViews: 1,
        mouseMovements: clientData.behavior?.mouseMovements || 0,
        keyPresses: clientData.behavior?.keyPresses || 0,
        clicks: clientData.behavior?.clicks || 0,
        scrollDepth: clientData.behavior?.scrollDepth || 0,
        referrer: clientData.behavior?.referrer || 'direct'
      },
      
      security: {
        trustScore: 0, // Will be calculated
        riskLevel: 'low',
        isBot: false,
        isSpoofed: false,
        suspicious: false,
        fingerprintConsistency: 1.0,
        anomalies: []
      }
    }

    // Analyze security indicators
    this.analyzeSecurityIndicators(fingerprint)
    
    // Calculate trust score
    fingerprint.security.trustScore = this.calculateTrustScore(fingerprint)
    
    // Determine risk level
    fingerprint.security.riskLevel = this.determineRiskLevel(fingerprint)

    // Store fingerprint
    this.fingerprints.set(fingerprint.id, fingerprint)
    this.visitorIdMap.set(ipAddress, fingerprint.id)

    // Save to persistent storage
    await this.saveFingerprint(fingerprint)

    return fingerprint
  }

  /**
   * Update existing fingerprint with new data
   */
  private async updateFingerprint(
    fingerprintId: string,
    clientData: Partial<SystemFingerprint>
  ): Promise<SystemFingerprint> {
    const existing = this.fingerprints.get(fingerprintId)
    if (!existing) {
      throw new Error('Fingerprint not found')
    }

    // Update behavior metrics
    existing.behavior.lastSeen = new Date()
    existing.behavior.visitCount++
    
    // Update page views
    if (clientData.behavior?.pageViews) {
      existing.behavior.pageViews += clientData.behavior.pageViews
    }

    // Update interaction metrics
    if (clientData.behavior) {
      existing.behavior.mouseMovements += clientData.behavior.mouseMovements || 0
      existing.behavior.keyPresses += clientData.behavior.keyPresses || 0
      existing.behavior.clicks += clientData.behavior.clicks || 0
      
      // Calculate average session duration
      const sessionDuration = clientData.behavior.averageSessionDuration || 0
      const totalSessions = existing.behavior.visitCount
      existing.behavior.averageSessionDuration = 
        ((existing.behavior.averageSessionDuration * (totalSessions - 1)) + sessionDuration) / totalSessions
    }

    // Check for anomalies by comparing with stored fingerprint
    const anomalies = this.detectAnomalies(existing, clientData)
    existing.security.anomalies = anomalies
    
    // Update trust score based on consistency
    if (anomalies.length > 0) {
      existing.security.fingerprintConsistency -= (anomalies.length * 0.1)
      existing.security.trustScore = this.calculateTrustScore(existing)
      existing.security.riskLevel = this.determineRiskLevel(existing)
    }

    // Save updates
    await this.saveFingerprint(existing)

    return existing
  }

  /**
   * Generate unique visitor ID from fingerprint components
   */
  private generateVisitorId(clientData: Partial<SystemFingerprint>): string {
    // Combine multiple factors for visitor ID
    const components = [
      clientData.browser?.userAgent,
      clientData.browser?.language,
      clientData.browser?.screenResolution,
      clientData.browser?.timezone,
      clientData.browser?.platform,
      clientData.webgl?.vendor,
      clientData.webgl?.renderer,
      clientData.canvas?.hash
    ].filter(Boolean)

    // Create hash from components
    const hash = this.hashString(components.join('|'))
    return `v_${hash}`
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
    const ua = userAgent.toLowerCase()
    
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      return 'tablet'
    }
    
    if (/mobile|iphone|ipod|android.*mobile|windows.*phone/i.test(ua)) {
      return 'mobile'
    }
    
    if (/desktop|windows|macintosh|linux/i.test(ua)) {
      return 'desktop'
    }
    
    return 'unknown'
  }

  /**
   * Analyze security indicators
   */
  private analyzeSecurityIndicators(fingerprint: SystemFingerprint): void {
    const anomalies: string[] = []
    
    // Check for bot signatures
    if (this.isBot(fingerprint.browser.userAgent)) {
      fingerprint.security.isBot = true
      anomalies.push('Bot user agent detected')
    }

    // Check for automation tools
    if (fingerprint.browser.webdriver) {
      anomalies.push('Browser automation detected (webdriver)')
    }

    // Check for incognito/private mode
    if (!fingerprint.browser.sessionStorage || !fingerprint.browser.localStorage) {
      anomalies.push('Storage disabled (possible private mode)')
    }

    // Check for lying browser characteristics
    if (fingerprint.browser.hasLiedLanguages || 
        fingerprint.browser.hasLiedResolution ||
        fingerprint.browser.hasLiedOs ||
        fingerprint.browser.hasLiedBrowser) {
      fingerprint.security.isSpoofed = true
      anomalies.push('Inconsistent browser characteristics detected')
    }

    // Check for Tor/VPN/Proxy
    if (fingerprint.network.isTor) {
      anomalies.push('Tor network detected')
    }
    if (fingerprint.network.isVPN) {
      anomalies.push('VPN usage detected')
    }
    if (fingerprint.network.isProxy) {
      anomalies.push('Proxy server detected')
    }

    // Check for unusual screen resolution
    const [width, height] = fingerprint.browser.screenResolution.split('x').map(Number)
    if (width < 800 || height < 600) {
      anomalies.push('Unusual screen resolution')
    }

    // Check for headless browser
    if (this.isHeadlessBrowser(fingerprint)) {
      anomalies.push('Headless browser detected')
    }

    fingerprint.security.anomalies = anomalies
  }

  /**
   * Check if user agent indicates a bot
   */
  private isBot(userAgent: string): boolean {
    const ua = userAgent.toLowerCase()
    return BOT_PATTERNS.some(pattern => pattern.test(ua))
  }

  /**
   * Check for headless browser indicators
   */
  private isHeadlessBrowser(fingerprint: SystemFingerprint): boolean {
    const indicators = []
    
    // Check plugins (headless browsers usually have no plugins)
    if (fingerprint.browser.plugins.length === 0) {
      indicators.push('no_plugins')
    }

    // Check for webdriver
    if (fingerprint.browser.webdriver) {
      indicators.push('webdriver')
    }

    // Check for unusual WebGL
    if (fingerprint.webgl.vendor === 'Google Inc.' && fingerprint.webgl.renderer.includes('SwiftShader')) {
      indicators.push('swiftshader') // Software rendering
    }

    // Check window size vs screen size (headless often differs)
    const [screenWidth] = fingerprint.browser.screenResolution.split('x').map(Number)
    if (screenWidth > 0 && fingerprint.browser.pixelRatio === 1) {
      // Additional checks could go here
    }

    return indicators.length >= 2
  }

  /**
   * Calculate trust score for fingerprint
   */
  private calculateTrustScore(fingerprint: SystemFingerprint): number {
    let score = 50 // Start at neutral

    // Known good fingerprint bonus
    if (this.knownGoodFingerprints.has(fingerprint.id)) {
      score += TRUST_WEIGHTS.knownFingerprint
    }

    // Known bad fingerprint penalty
    if (this.knownBadFingerprints.has(fingerprint.id)) {
      score -= TRUST_WEIGHTS.knownFingerprint
    }

    // Consistency check
    if (fingerprint.security.fingerprintConsistency > 0.9) {
      score += TRUST_WEIGHTS.consistentBehavior
    }

    // Legitimate browser check
    if (!fingerprint.security.isBot && !fingerprint.security.isSpoofed) {
      score += TRUST_WEIGHTS.legitimateBrowser
    }

    // No Tor/VPN bonus
    if (!fingerprint.network.isTor && !fingerprint.network.isVPN && !fingerprint.network.isProxy) {
      score += TRUST_WEIGHTS.noTorVPN
    }

    // Real device check
    if (fingerprint.device.type !== 'unknown' && !this.isHeadlessBrowser(fingerprint)) {
      score += TRUST_WEIGHTS.realDevice
    }

    // No anomalies bonus
    if (fingerprint.security.anomalies.length === 0) {
      score += TRUST_WEIGHTS.noAnomalies
    } else {
      score -= (fingerprint.security.anomalies.length * 5)
    }

    // Penalize bots heavily
    if (fingerprint.security.isBot) {
      score -= 40
    }

    // Penalize spoofing heavily
    if (fingerprint.security.isSpoofed) {
      score -= 30
    }

    // Normalize to 0-100 range
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Determine risk level based on trust score and anomalies
   */
  private determineRiskLevel(fingerprint: SystemFingerprint): 'low' | 'medium' | 'high' | 'critical' {
    const trustScore = fingerprint.security.trustScore
    const anomalyCount = fingerprint.security.anomalies.length

    if (trustScore >= 80 && anomalyCount === 0) {
      return 'low'
    } else if (trustScore >= 60 && anomalyCount <= 2) {
      return 'medium'
    } else if (trustScore >= 40 && anomalyCount <= 4) {
      return 'high'
    } else {
      return 'critical'
    }
  }

  /**
   * Detect anomalies by comparing current data with stored fingerprint
   */
  private detectAnomalies(
    existing: SystemFingerprint,
    newData: Partial<SystemFingerprint>
  ): string[] {
    const anomalies: string[] = []

    // Check for user agent change
    if (newData.browser?.userAgent && 
        newData.browser.userAgent !== existing.browser.userAgent) {
      anomalies.push('User agent changed')
    }

    // Check for screen resolution change
    if (newData.browser?.screenResolution && 
        newData.browser.screenResolution !== existing.browser.screenResolution) {
      anomalies.push('Screen resolution changed')
    }

    // Check for timezone change
    if (newData.browser?.timezone && 
        newData.browser.timezone !== existing.browser.timezone) {
      anomalies.push('Timezone changed')
    }

    // Check for language change
    if (newData.browser?.language && 
        newData.browser.language !== existing.browser.language) {
      anomalies.push('Browser language changed')
    }

    // Check for location change (impossible travel)
    if (newData.network?.geolocation) {
      const lastLat = existing.network.geolocation.lat
      const lastLng = existing.network.geolocation.lng
      const newLat = newData.network.geolocation.lat
      const newLng = newData.network.geolocation.lng

      if (lastLat !== 0 && lastLng !== 0) {
        const distance = this.calculateDistance(lastLat, lastLng, newLat, newLng)
        const timeDiff = (new Date().getTime() - existing.behavior.lastSeen.getTime()) / 1000 / 60 // minutes

        // If distance > 500km and time < 60 minutes, flag as impossible travel
        if (distance > 500 && timeDiff < 60) {
          anomalies.push('Impossible travel detected')
        }
      }
    }

    return anomalies
  }

  /**
   * Calculate distance between two coordinates in km
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLng = this.deg2rad(lng2 - lng1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  /**
   * Save fingerprint to persistent storage
   */
  private async saveFingerprint(fingerprint: SystemFingerprint): Promise<void> {
    // In production, save to database
    // For now, store in memory
    this.fingerprints.set(fingerprint.id, fingerprint)
  }

  /**
   * Get fingerprint by ID
   */
  getFingerprint(id: string): SystemFingerprint | undefined {
    return this.fingerprints.get(id)
  }

  /**
   * Get fingerprint by IP address
   */
  getFingerprintByIP(ipAddress: string): SystemFingerprint | undefined {
    const fingerprintId = this.visitorIdMap.get(ipAddress)
    if (fingerprintId) {
      return this.fingerprints.get(fingerprintId)
    }
    return undefined
  }

  /**
   * Get all fingerprints
   */
  getAllFingerprints(): SystemFingerprint[] {
    return Array.from(this.fingerprints.values())
  }

  /**
   * Mark fingerprint as trusted
   */
  async trustFingerprint(fingerprintId: string): Promise<void> {
    this.knownGoodFingerprints.add(fingerprintId)
    const fingerprint = this.fingerprints.get(fingerprintId)
    if (fingerprint) {
      fingerprint.security.trustScore = Math.min(100, fingerprint.security.trustScore + 20)
      fingerprint.security.riskLevel = 'low'
      await this.saveFingerprint(fingerprint)
    }
  }

  /**
   * Mark fingerprint as untrusted
   */
  async distrustFingerprint(fingerprintId: string): Promise<void> {
    this.knownBadFingerprints.add(fingerprintId)
    const fingerprint = this.fingerprints.get(fingerprintId)
    if (fingerprint) {
      fingerprint.security.trustScore = Math.max(0, fingerprint.security.trustScore - 40)
      fingerprint.security.riskLevel = 'critical'
      await this.saveFingerprint(fingerprint)
    }
  }

  /**
   * Get suspicious fingerprints
   */
  getSuspiciousFingerprints(): SystemFingerprint[] {
    return Array.from(this.fingerprints.values()).filter(
      fp => fp.security.riskLevel === 'high' || fp.security.riskLevel === 'critical'
    )
  }

  /**
   * Get fingerprints by risk level
   */
  getFingerprintsByRisk(level: 'low' | 'medium' | 'high' | 'critical'): SystemFingerprint[] {
    return Array.from(this.fingerprints.values()).filter(
      fp => fp.security.riskLevel === level
    )
  }

  /**
   * Generate fingerprint analytics
   */
  async generateAnalytics(): Promise<{
    totalFingerprints: number
    uniqueVisitors: number
    botCount: number
    vpnCount: number
    torCount: number
    averageTrustScore: number
    riskDistribution: { low: number; medium: number; high: number; critical: number }
    deviceDistribution: { desktop: number; mobile: number; tablet: number; unknown: number }
    topCountries: { country: string; count: number }[]
  }> {
    const allFingerprints = Array.from(this.fingerprints.values())
    
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    }
    
    const deviceDistribution = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
      unknown: 0
    }

    const countryCounts = new Map<string, number>()
    let totalTrustScore = 0
    let botCount = 0
    let vpnCount = 0
    let torCount = 0

    for (const fp of allFingerprints) {
      riskDistribution[fp.security.riskLevel]++
      deviceDistribution[fp.device.type]++
      totalTrustScore += fp.security.trustScore
      
      if (fp.security.isBot) botCount++
      if (fp.network.isVPN) vpnCount++
      if (fp.network.isTor) torCount++

      const country = fp.network.geolocation.country
      countryCounts.set(country, (countryCounts.get(country) || 0) + 1)
    }

    const topCountries = Array.from(countryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))

    return {
      totalFingerprints: allFingerprints.length,
      uniqueVisitors: new Set(allFingerprints.map(fp => fp.visitorId)).size,
      botCount,
      vpnCount,
      torCount,
      averageTrustScore: allFingerprints.length > 0 ? totalTrustScore / allFingerprints.length : 0,
      riskDistribution,
      deviceDistribution,
      topCountries
    }
  }
}

// Export singleton instance
export const systemFingerprintingService = new SystemFingerprintingService()
