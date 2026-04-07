/**
 * AI Security Engine
 * 
 * Provides intelligent security analysis including:
 * - Anomaly detection for unusual patterns
 * - Threat scoring (0-100) for security events
 * - Behavioral analysis for insider threat detection
 * - Predictive analytics for security incidents
 * - Automated classification of security incidents
 */

import { SecurityEvent, DeviceFingerprint } from './types/security'

// AI Analysis Result Interface
export interface AIAnalysis {
  anomalyScore: number // 0-100
  threatCategory: string
  confidence: number // 0-1
  riskFactors: string[]
  behavioralProfile: string
  recommendedAction: string
  similarIncidents: number
  predictedOutcome: string
  threatScore: number // 0-100 composite score
}

// User Behavior Profile for anomaly detection
export interface UserBehaviorProfile {
  userId: string
  typicalLoginTimes: number[] // Hour of day (0-23)
  typicalLocations: string[]
  commonUserAgents: string[]
  averageSessionDuration: number // minutes
  commonActions: string[]
  lastAnomalousActivity?: Date
  riskLevel: 'low' | 'medium' | 'high'
  trustScore: number // 0-100
}

// Threat Intelligence Database
const THREAT_PATTERNS = {
  sqlInjection: [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION\s+SELECT/i,
    /INSERT\s+INTO/i,
    /DELETE\s+FROM/i,
    /DROP\s+TABLE/i
  ],
  xss: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i
  ],
  pathTraversal: [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%252e%252e%252f/i,
    /etc\/passwd/,
    /etc\/shadow/,
    /boot\.ini/,
    /win\.ini/
  ],
  commandInjection: [
    /;\s*\w+/,
    /\|\s*\w+/,
    /`\s*\w+/,
    /\$\(\s*\w+/,
    /&&\s*\w+/,
    /\|\|\s*\w+/
  ],
  botSignatures: [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /attack/i,
    /hack/i,
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i
  ]
}

// Known malicious IP ranges and patterns
const SUSPICIOUS_IP_PATTERNS = [
  /^10\./, // Private IP (if not internal)
  /^192\.168\./, // Private IP (if not internal)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private IP (if not internal)
  /^127\./, // Loopback
  /^0\./, // Invalid
  /^255\./, // Broadcast
  /^(::1|0:0:0:0:0:0:0:1)/ // IPv6 loopback
]

// Risk weights for scoring
const RISK_WEIGHTS = {
  knownMaliciousIP: 40,
  sqlInjection: 35,
  xss: 30,
  pathTraversal: 25,
  commandInjection: 30,
  botSignature: 20,
  unusualLocation: 25,
  unusualTime: 15,
  newDevice: 10,
  failedAttempts: 5, // per attempt
  privilegeEscalation: 35,
  dataExfiltration: 40,
  rateLimitExceeded: 20
}

/**
 * AI Security Engine Class
 */
export class AISecurityEngine {
  private userProfiles: Map<string, UserBehaviorProfile> = new Map()
  private threatHistory: SecurityEvent[] = []
  private knownMaliciousIPs: Set<string> = new Set()
  private knownGoodIPs: Set<string> = new Set()

  constructor() {
    this.initializeEngine()
  }

  private initializeEngine() {
    // Load known threat intelligence
    this.loadThreatIntelligence()
    
    // Initialize user behavior profiles from storage
    this.loadUserProfiles()
  }

  private loadThreatIntelligence() {
    // In production, this would load from threat intelligence feeds
    // For now, using mock data
    const maliciousIPs = [
      '192.168.1.100',
      '185.220.101.45',
      '45.142.212.100',
      '91.207.175.0',
      '45.9.148.123'
    ]
    maliciousIPs.forEach(ip => this.knownMaliciousIPs.add(ip))
  }

  private loadUserProfiles() {
    // Load from database/storage
    // For now, profiles are built dynamically
  }

  /**
   * Analyze a security event using AI
   */
  async analyzeEvent(event: SecurityEvent): Promise<AIAnalysis> {
    const riskFactors: string[] = []
    let threatScore = 0
    
    // 1. Check for known attack patterns
    const patternScore = this.detectAttackPatterns(event)
    threatScore += patternScore.score
    riskFactors.push(...patternScore.factors)

    // 2. Analyze IP reputation
    const ipScore = this.analyzeIPReputation(event.ipAddress)
    threatScore += ipScore.score
    riskFactors.push(...ipScore.factors)

    // 3. Check user behavior anomalies
    const behaviorScore = await this.analyzeUserBehavior(event)
    threatScore += behaviorScore.score
    riskFactors.push(...behaviorScore.factors)

    // 4. Analyze temporal patterns
    const temporalScore = this.analyzeTemporalPatterns(event)
    threatScore += temporalScore.score
    riskFactors.push(...temporalScore.factors)

    // 5. Check geographic anomalies
    const geoScore = this.analyzeGeographicRisk(event)
    threatScore += geoScore.score
    riskFactors.push(...geoScore.factors)

    // Normalize threat score (0-100)
    threatScore = Math.min(100, Math.max(0, threatScore))

    // Determine threat category
    const threatCategory = this.classifyThreat(event, threatScore, riskFactors)

    // Calculate anomaly score based on deviation from baseline
    const anomalyScore = this.calculateAnomalyScore(event, threatScore)

    // Generate recommendation
    const recommendedAction = this.generateRecommendation(threatScore, riskFactors, event)

    // Find similar incidents
    const similarIncidents = this.findSimilarIncidents(event)

    // Predict outcome
    const predictedOutcome = this.predictOutcome(event, threatScore)

    // Update user profile with this event
    await this.updateUserProfile(event)

    return {
      anomalyScore,
      threatCategory,
      confidence: this.calculateConfidence(threatScore, riskFactors.length),
      riskFactors,
      behavioralProfile: behaviorScore.profile,
      recommendedAction,
      similarIncidents,
      predictedOutcome,
      threatScore
    }
  }

  /**
   * Detect attack patterns in event data
   */
  private detectAttackPatterns(event: SecurityEvent): { score: number; factors: string[] } {
    const factors: string[] = []
    let score = 0

    // Check payload/description for attack patterns
    const textToCheck = `${event.description} ${JSON.stringify(event.payload || {})}`.toLowerCase()

    // SQL Injection detection
    for (const pattern of THREAT_PATTERNS.sqlInjection) {
      if (pattern.test(textToCheck)) {
        score += RISK_WEIGHTS.sqlInjection
        factors.push('SQL injection pattern detected')
        break
      }
    }

    // XSS detection
    for (const pattern of THREAT_PATTERNS.xss) {
      if (pattern.test(textToCheck)) {
        score += RISK_WEIGHTS.xss
        factors.push('XSS attack pattern detected')
        break
      }
    }

    // Path traversal detection
    for (const pattern of THREAT_PATTERNS.pathTraversal) {
      if (pattern.test(textToCheck)) {
        score += RISK_WEIGHTS.pathTraversal
        factors.push('Path traversal attempt detected')
        break
      }
    }

    // Command injection detection
    for (const pattern of THREAT_PATTERNS.commandInjection) {
      if (pattern.test(textToCheck)) {
        score += RISK_WEIGHTS.commandInjection
        factors.push('Command injection attempt detected')
        break
      }
    }

    // Bot signature detection
    if (event.userAgent) {
      for (const pattern of THREAT_PATTERNS.botSignatures) {
        if (pattern.test(event.userAgent)) {
          score += RISK_WEIGHTS.botSignature
          factors.push('Known bot/malicious user agent detected')
          break
        }
      }
    }

    return { score, factors }
  }

  /**
   * Analyze IP reputation
   */
  private analyzeIPReputation(ipAddress: string): { score: number; factors: string[] } {
    const factors: string[] = []
    let score = 0

    // Check if IP is in known malicious list
    if (this.knownMaliciousIPs.has(ipAddress)) {
      score += RISK_WEIGHTS.knownMaliciousIP
      factors.push('IP address is known malicious actor')
      return { score, factors }
    }

    // Check if IP is private/reserved (shouldn't be accessing from external)
    for (const pattern of SUSPICIOUS_IP_PATTERNS) {
      if (pattern.test(ipAddress)) {
        // In production, check if this is internal traffic
        // For now, flag it
        score += 15
        factors.push('Suspicious IP address pattern')
        break
      }
    }

    // Check for VPN/Proxy/Tor exit nodes
    // This would typically use a GeoIP service
    // For now, use mock logic
    if (ipAddress.startsWith('185.') || ipAddress.startsWith('45.')) {
      score += 10
      factors.push('IP potentially associated with VPN/Tor')
    }

    return { score, factors }
  }

  /**
   * Analyze user behavior for anomalies
   */
  private async analyzeUserBehavior(event: SecurityEvent): Promise<{ score: number; factors: string[]; profile: string }> {
    const factors: string[] = []
    let score = 0
    let profile = 'Normal behavior'

    if (!event.userId) {
      return { score: 0, factors: [], profile: 'Anonymous user' }
    }

    const userProfile = this.userProfiles.get(event.userId)
    
    if (!userProfile) {
      // New user - create profile
      this.createUserProfile(event.userId, event)
      score += 10 // Slightly higher risk for new users
      factors.push('New user behavior profile created')
      profile = 'New user - establishing baseline'
      return { score, factors, profile }
    }

    // Check login time anomaly
    const eventHour = new Date(event.timestamp).getHours()
    if (!userProfile.typicalLoginTimes.includes(eventHour)) {
      const isUnusualTime = eventHour < 6 || eventHour > 23
      if (isUnusualTime) {
        score += RISK_WEIGHTS.unusualTime
        factors.push('Login at unusual time (after hours)')
        profile = 'After-hours access pattern'
      }
    }

    // Check location anomaly
    if (event.geolocation && !userProfile.typicalLocations.includes(event.geolocation.country)) {
      score += RISK_WEIGHTS.unusualLocation
      factors.push('Access from unusual location')
      profile = 'Geographic anomaly detected'
    }

    // Check device fingerprint
    if (event.deviceFingerprint && !userProfile.commonUserAgents.includes(event.userAgent)) {
      score += RISK_WEIGHTS.newDevice
      factors.push('New device or browser detected')
    }

    // Check action pattern
    if (!userProfile.commonActions.includes(event.category)) {
      score += 10
      factors.push('Unusual activity category for this user')
    }

    // Update risk level based on score
    if (score > 50) {
      userProfile.riskLevel = 'high'
    } else if (score > 25) {
      userProfile.riskLevel = 'medium'
    }

    return { score, factors, profile }
  }

  /**
   * Analyze temporal patterns
   */
  private analyzeTemporalPatterns(event: SecurityEvent): { score: number; factors: string[] } {
    const factors: string[] = []
    let score = 0

    // Check if event occurred during maintenance window
    const hour = new Date(event.timestamp).getHours()
    const isMaintenanceWindow = hour >= 2 && hour <= 4

    if (isMaintenanceWindow && event.category === 'authentication') {
      score += 20
      factors.push('Activity during maintenance window')
    }

    // Check for rapid successive events
    const recentEvents = this.threatHistory.filter(
      e => e.userId === event.userId && 
           new Date(e.timestamp) > new Date(Date.now() - 60000) // Last minute
    )

    if (recentEvents.length > 5) {
      score += 15
      factors.push('High frequency activity detected')
    }

    return { score, factors }
  }

  /**
   * Analyze geographic risk
   */
  private analyzeGeographicRisk(event: SecurityEvent): { score: number; factors: string[] } {
    const factors: string[] = []
    let score = 0

    if (!event.geolocation) {
      return { score: 0, factors: [] }
    }

    // Check for high-risk countries (sanctioned or known for cyber attacks)
    const highRiskCountries = ['Russia', 'China', 'North Korea', 'Iran', 'Syria']
    if (highRiskCountries.includes(event.geolocation.country)) {
      score += 30
      factors.push(`Access from high-risk geographic region (${event.geolocation.country})`)
    }

    // Check for impossible travel (user in different locations within short time)
    // This requires history tracking
    const userEvents = this.threatHistory.filter(
      e => e.userId === event.userId && 
           new Date(e.timestamp) > new Date(Date.now() - 3600000) // Last hour
    )

    if (userEvents.length > 0) {
      const lastEvent = userEvents[userEvents.length - 1]
      if (lastEvent.geolocation && 
          lastEvent.geolocation.country !== event.geolocation.country) {
        // Check time difference
        const timeDiff = new Date(event.timestamp).getTime() - 
                        new Date(lastEvent.timestamp).getTime()
        const minTravelTime = 3600000 // 1 hour minimum for international travel
        
        if (timeDiff < minTravelTime) {
          score += 45
          factors.push('Impossible travel pattern detected')
        }
      }
    }

    return { score, factors }
  }

  /**
   * Calculate anomaly score based on deviation from baseline
   */
  private calculateAnomalyScore(event: SecurityEvent, threatScore: number): number {
    // Combine multiple factors for anomaly score
    let anomalyScore = threatScore * 0.6 // 60% from threat score

    // Add randomness for ML simulation (in production, this would be actual ML model output)
    const mlComponent = Math.random() * 20 + (threatScore > 50 ? 20 : 0)
    anomalyScore += mlComponent * 0.4 // 40% from ML model

    return Math.min(100, Math.round(anomalyScore))
  }

  /**
   * Classify the threat based on event data and score
   */
  private classifyThreat(
    event: SecurityEvent, 
    threatScore: number, 
    riskFactors: string[]
  ): string {
    // Determine primary threat category
    if (threatScore >= 80) {
      if (riskFactors.some(f => f.includes('SQL'))) return 'SQL Injection Attack'
      if (riskFactors.some(f => f.includes('XSS'))) return 'Cross-Site Scripting Attack'
      if (riskFactors.some(f => f.includes('bot'))) return 'Automated Bot Attack'
      return 'Critical Security Threat'
    } else if (threatScore >= 60) {
      if (riskFactors.some(f => f.includes('brute'))) return 'Brute Force Attack'
      if (riskFactors.some(f => f.includes('impossible'))) return 'Account Takeover Attempt'
      return 'High-Risk Security Event'
    } else if (threatScore >= 40) {
      if (riskFactors.some(f => f.includes('unusual'))) return 'Suspicious Activity'
      if (riskFactors.some(f => f.includes('new device'))) return 'New Device Login'
      return 'Medium-Risk Security Event'
    } else {
      return 'Low-Risk Security Event'
    }
  }

  /**
   * Calculate confidence level based on available data
   */
  private calculateConfidence(threatScore: number, factorCount: number): number {
    // More factors and higher scores increase confidence
    const baseConfidence = 0.5
    const factorBonus = Math.min(factorCount * 0.05, 0.2)
    const scoreBonus = (threatScore / 100) * 0.3
    
    return Math.min(0.98, baseConfidence + factorBonus + scoreBonus)
  }

  /**
   * Generate recommendation based on analysis
   */
  private generateRecommendation(
    threatScore: number, 
    riskFactors: string[], 
    event: SecurityEvent
  ): string {
    if (threatScore >= 80) {
      if (riskFactors.some(f => f.includes('malicious IP'))) {
        return 'Immediately block IP address and review all associated sessions. Consider IP range ban.'
      }
      if (riskFactors.some(f => f.includes('SQL') || f.includes('XSS'))) {
        return 'Block request, log details for forensic analysis, and notify security team immediately.'
      }
      return 'Immediate escalation required. Block user/IP and initiate incident response protocol.'
    } else if (threatScore >= 60) {
      if (riskFactors.some(f => f.includes('brute'))) {
        return 'Implement rate limiting, require CAPTCHA, and consider temporary account lockout.'
      }
      return 'Monitor closely, enable enhanced logging, and prepare for potential escalation.'
    } else if (threatScore >= 40) {
      return 'Review activity, verify user identity, and document for compliance records.'
    } else {
      return 'Standard monitoring. No immediate action required.'
    }
  }

  /**
   * Find similar past incidents
   */
  private findSimilarIncidents(event: SecurityEvent): number {
    return this.threatHistory.filter(
      e => e.category === event.category &&
           e.severity === event.severity &&
           new Date(e.timestamp) > new Date(Date.now() - 30 * 24 * 3600000) // Last 30 days
    ).length
  }

  /**
   * Predict likely outcome based on event characteristics
   */
  private predictOutcome(event: SecurityEvent, threatScore: number): string {
    if (threatScore >= 80) {
      return 'High probability of successful attack if not blocked immediately'
    } else if (threatScore >= 60) {
      return 'Moderate risk - attacker may persist with different vectors'
    } else if (threatScore >= 40) {
      return 'Low immediate risk but warrants monitoring'
    } else {
      return 'Minimal risk - routine security event'
    }
  }

  /**
   * Create user behavior profile
   */
  private createUserProfile(userId: string, event: SecurityEvent): void {
    const profile: UserBehaviorProfile = {
      userId,
      typicalLoginTimes: [new Date(event.timestamp).getHours()],
      typicalLocations: event.geolocation ? [event.geolocation.country] : [],
      commonUserAgents: [event.userAgent],
      averageSessionDuration: 30, // Default 30 minutes
      commonActions: [event.category],
      riskLevel: 'low',
      trustScore: 70 // Start with moderate trust
    }
    
    this.userProfiles.set(userId, profile)
  }

  /**
   * Update user profile with new event data
   */
  private async updateUserProfile(event: SecurityEvent): Promise<void> {
    if (!event.userId) return

    const profile = this.userProfiles.get(event.userId)
    if (!profile) return

    // Update typical login times
    const hour = new Date(event.timestamp).getHours()
    if (!profile.typicalLoginTimes.includes(hour)) {
      profile.typicalLoginTimes.push(hour)
    }

    // Update locations
    if (event.geolocation && !profile.typicalLocations.includes(event.geolocation.country)) {
      profile.typicalLocations.push(event.geolocation.country)
    }

    // Update user agents
    if (!profile.commonUserAgents.includes(event.userAgent)) {
      profile.commonUserAgents.push(event.userAgent)
    }

    // Update actions
    if (!profile.commonActions.includes(event.category)) {
      profile.commonActions.push(event.category)
    }

    // Recalculate trust score based on history
    const userEvents = this.threatHistory.filter(e => e.userId === event.userId)
    const highRiskEvents = userEvents.filter(e => e.threatScore > 60).length
    
    profile.trustScore = Math.max(0, 100 - (highRiskEvents * 10))
    
    // Mark anomalous activity
    if (event.threatScore > 50) {
      profile.lastAnomalousActivity = new Date(event.timestamp)
    }

    // Save to storage
    await this.saveUserProfile(profile)
  }

  /**
   * Save user profile to persistent storage
   */
  private async saveUserProfile(profile: UserBehaviorProfile): Promise<void> {
    // In production, save to database
    // For now, profiles stay in memory
    this.userProfiles.set(profile.userId, profile)
  }

  /**
   * Get user behavior profile
   */
  getUserProfile(userId: string): UserBehaviorProfile | undefined {
    return this.userProfiles.get(userId)
  }

  /**
   * Get all user profiles
   */
  getAllUserProfiles(): UserBehaviorProfile[] {
    return Array.from(this.userProfiles.values())
  }

  /**
   * Add event to threat history
   */
  addToThreatHistory(event: SecurityEvent): void {
    this.threatHistory.push(event)
    
    // Keep only last 30 days of history in memory
    const cutoff = new Date(Date.now() - 30 * 24 * 3600000)
    this.threatHistory = this.threatHistory.filter(
      e => new Date(e.timestamp) > cutoff
    )
  }

  /**
   * Get threat history
   */
  getThreatHistory(): SecurityEvent[] {
    return [...this.threatHistory]
  }

  /**
   * Predict future threats based on patterns
   */
  async predictFutureThreats(): Promise<{
    prediction: string
    confidence: number
    recommendedActions: string[]
  }> {
    const recentAttacks = this.threatHistory.filter(
      e => new Date(e.timestamp) > new Date(Date.now() - 7 * 24 * 3600000) &&
           e.threatScore > 60
    )

    if (recentAttacks.length > 10) {
      return {
        prediction: 'High probability of sustained attack campaign in next 48 hours',
        confidence: 0.82,
        recommendedActions: [
          'Increase monitoring frequency',
          'Enable additional authentication requirements',
          'Alert security team to standby',
          'Review and strengthen WAF rules'
        ]
      }
    } else if (recentAttacks.length > 5) {
      return {
        prediction: 'Elevated threat level - isolated attacks may continue',
        confidence: 0.65,
        recommendedActions: [
          'Monitor for patterns',
          'Review access controls',
          'Update threat intelligence'
        ]
      }
    } else {
      return {
        prediction: 'Normal threat levels expected',
        confidence: 0.78,
        recommendedActions: [
          'Maintain standard security posture',
          'Continue routine monitoring'
        ]
      }
    }
  }

  /**
   * Batch analyze multiple events
   */
  async batchAnalyze(events: SecurityEvent[]): Promise<AIAnalysis[]> {
    return Promise.all(events.map(event => this.analyzeEvent(event)))
  }
}

// Export singleton instance
export const aiSecurityEngine = new AISecurityEngine()
