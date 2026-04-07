/**
 * Security Types
 * Type definitions for AI-powered security audit system
 */

// Security Event Types
export interface SecurityEvent {
  id: string
  timestamp: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  category: 'authentication' | 'authorization' | 'data_access' | 'attack' | 'anomaly'
  type: string
  description: string
  userId?: string
  userName?: string
  ipAddress: string
  geolocation?: {
    country: string
    city: string
    region?: string
    lat: number
    lng: number
  }
  deviceFingerprint?: string
  userAgent: string
  payload?: any
  threatScore: number
  aiAnalysis?: {
    anomalyScore: number
    threatCategory: string
    confidence: number
    riskFactors: string[]
    recommendedAction: string
  }
  actionTaken?: string
  acknowledged: boolean
  escalated: boolean
  relatedEvents?: string[]
}

export interface UserBehaviorProfile {
  userId: string
  typicalLoginTimes: number[]
  typicalLocations: string[]
  commonUserAgents: string[]
  averageSessionDuration: number
  commonActions: string[]
  lastAnomalousActivity?: Date
  riskLevel: 'low' | 'medium' | 'high'
  trustScore: number
}

export interface SecurityMetrics {
  activeThreats: number
  securityScore: number
  failedLogins24h: number
  blockedAttacks: number
  criticalAlerts: number
  systemHealth: number
}

export interface SecurityAlert {
  id: string
  timestamp: Date
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  eventId: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  escalated: boolean
  escalatedBy?: string
  escalatedAt?: Date
  escalationReason?: string
  assignedTo?: string
  resolved?: boolean
  resolvedBy?: string
  resolvedAt?: Date
  resolution?: string
}

export interface AttackPattern {
  id: string
  type: string
  signature: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  countermeasures: string[]
}

export interface ComplianceReport {
  id: string
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  gdpr: {
    dataAccessEvents: number
    dataDeletionRequests: number
    consentViolations: number
    complianceScore: number
  }
  pciDss: {
    paymentCardAccessEvents: number
    encryptionViolations: number
    complianceScore: number
  }
  auditTrail: {
    totalEvents: number
    suspiciousEvents: number
    investigatedEvents: number
    storageUsed: string
  }
  incidents: {
    total: number
    resolved: number
    pending: number
    averageResolutionTime: number
  }
}

export interface DeviceFingerprint {
  id: string
  visitorId: string
  canvas: {
    hash: string
    dataURL: string
  }
  webgl: {
    vendor: string
    renderer: string
    hash: string
  }
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
    connectionType?: string
    effectiveType?: string
    downlink?: number
    rtt?: number
    isTor: boolean
    isVPN: boolean
    isProxy: boolean
    asn?: string
  }
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
    vendor?: string
    model?: string
    memory?: number
    hardwareConcurrency: number
    deviceMemory?: number
    maxTouchPoints: number
  }
  behavior: {
    firstSeen: Date
    lastSeen: Date
    visitCount: number
    averageSessionDuration: number
    pageViews: number
    mouseMovements: number
    keyPresses: number
    clicks: number
    scrollDepth: number
    referrer: string
  }
  security: {
    trustScore: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    isBot: boolean
    isSpoofed: boolean
    suspicious: boolean
    fingerprintConsistency: number
    anomalies: string[]
  }
}

export interface ThreatIntelligence {
  maliciousIPs: string[]
  botSignatures: string[]
  attackPatterns: AttackPattern[]
  countryRiskScores: Record<string, number>
  knownThreatActors: string[]
  updatedAt: Date
}

export interface SecurityPrediction {
  timeframe: string
  predictedThreats: {
    category: string
    probability: number
    severity: 'critical' | 'high' | 'medium' | 'low'
  }[]
  recommendedActions: string[]
  confidence: number
}
