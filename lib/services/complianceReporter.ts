/**
 * Compliance & Reporting Service
 * 
 * Provides compliance monitoring and reporting features:
 * - GDPR compliance tracking
 * - PCI DSS compliance monitoring
 * - Audit trail management
 * - Security incident reporting
 * - Regulatory compliance tracking
 * - Forensic data preservation
 */

import { ComplianceReport, SecurityEvent } from './types/security'

// GDPR compliance tracking
interface GDPRTracking {
  dataAccessEvents: Array<{
    userId: string
    dataSubject: string
    dataTypes: string[]
    purpose: string
    legalBasis: string
    timestamp: Date
    retentionPeriod?: number
  }>
  
  dataDeletionRequests: Array<{
    requestId: string
    dataSubject: string
    requestedAt: Date
    completedAt?: Date
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    affectedRecords: number
  }>
  
  consentViolations: Array<{
    userId: string
    violationType: string
    description: string
    timestamp: Date
    severity: 'high' | 'medium' | 'low'
    resolved: boolean
  }>
  
  dataBreachIncidents: Array<{
    incidentId: string
    discoveredAt: Date
    reportedAt?: Date
    affectedSubjects: number
    dataTypes: string[]
    severity: 'critical' | 'high' | 'medium' | 'low'
    status: 'investigating' | 'contained' | 'resolved'
    supervisoryAuthorityNotified: boolean
    subjectsNotified: boolean
  }>
}

// PCI DSS compliance tracking
interface PCIDSTracking {
  paymentCardAccessEvents: Array<{
    userId: string
    cardDataType: 'full_pan' | 'truncated_pan' | 'cvv' | 'expiry' | 'token'
    accessType: 'read' | 'write' | 'delete'
    timestamp: Date
    encrypted: boolean
    tokenized: boolean
    authorized: boolean
  }>
  
  encryptionViolations: Array<{
    violationId: string
    description: string
    timestamp: Date
    severity: 'critical' | 'high' | 'medium'
    resolved: boolean
    resolution?: string
  }>
  
  accessControlViolations: Array<{
    userId: string
    attemptedAction: string
    requiredRole: string
    actualRole: string
    timestamp: Date
    blocked: boolean
  }>
  
  securityScans: Array<{
    scanId: string
    scanType: 'vulnerability' | 'penetration' | 'compliance'
    completedAt: Date
    findings: number
    criticalFindings: number
    status: 'passed' | 'failed' | 'warning'
  }>
}

// Audit trail entry
interface AuditTrailEntry {
  id: string
  timestamp: Date
  action: string
  actor: {
    userId: string
    userName: string
    role: string
    ipAddress: string
  }
  resource: {
    type: string
    id: string
    name: string
  }
  details: {
    before?: any
    after?: any
    changes?: string[]
    reason?: string
  }
  integrity: {
    hash: string
    previousHash: string
    signature: string
  }
}

// Forensic evidence
interface ForensicEvidence {
  id: string
  incidentId: string
  evidenceType: 'log' | 'network_capture' | 'memory_dump' | 'disk_image' | 'screenshot' | 'testimony'
  collectedAt: Date
  collector: string
  source: string
  hash: string
  size: number
  metadata: Record<string, any>
  chainOfCustody: Array<{
    transferredAt: Date
    from: string
    to: string
    reason: string
  }>
  retentionUntil: Date
}

/**
 * Compliance & Reporting Service
 */
export class ComplianceReporter {
  private gdprTracking: GDPRTracking = {
    dataAccessEvents: [],
    dataDeletionRequests: [],
    consentViolations: [],
    dataBreachIncidents: []
  }
  
  private pciTracking: PCIDSTracking = {
    paymentCardAccessEvents: [],
    encryptionViolations: [],
    accessControlViolations: [],
    securityScans: []
  }
  
  private auditTrail: AuditTrailEntry[] = []
  private forensicEvidence: ForensicEvidence[] = []
  private complianceReports: ComplianceReport[] = []

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    // Schedule periodic compliance checks
    this.scheduleComplianceChecks()
  }

  /**
   * Schedule periodic compliance verification
   */
  private scheduleComplianceChecks() {
    // Daily compliance check
    setInterval(() => {
      this.performComplianceCheck()
    }, 24 * 60 * 60 * 1000)
  }

  /**
   * Perform comprehensive compliance check
   */
  private async performComplianceCheck(): Promise<void> {
    console.log('[ComplianceReporter] Performing daily compliance check...')
    
    // Check GDPR compliance
    await this.checkGDPRCompliance()
    
    // Check PCI DSS compliance
    await this.checkPCIDSSCompliance()
    
    // Verify audit trail integrity
    await this.verifyAuditTrailIntegrity()
    
    console.log('[ComplianceReporter] Compliance check completed')
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate GDPR metrics
    const gdprMetrics = this.calculateGDPRMetrics(startDate, endDate)
    
    // Calculate PCI DSS metrics
    const pciMetrics = this.calculatePCIDSSMetrics(startDate, endDate)
    
    // Calculate audit trail metrics
    const auditMetrics = this.calculateAuditMetrics(startDate, endDate)
    
    // Calculate incident metrics
    const incidentMetrics = this.calculateIncidentMetrics(startDate, endDate)

    const report: ComplianceReport = {
      id: reportId,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      gdpr: gdprMetrics,
      pciDss: pciMetrics,
      auditTrail: auditMetrics,
      incidents: incidentMetrics
    }

    this.complianceReports.push(report)
    
    return report
  }

  /**
   * Calculate GDPR compliance metrics
   */
  private calculateGDPRMetrics(startDate: Date, endDate: Date) {
    const accessEvents = this.gdprTracking.dataAccessEvents.filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate
    )

    const deletionRequests = this.gdprTracking.dataDeletionRequests.filter(
      r => r.requestedAt >= startDate && r.requestedAt <= endDate
    )

    const violations = this.gdprTracking.consentViolations.filter(
      v => v.timestamp >= startDate && v.timestamp <= endDate
    )

    const completedDeletions = deletionRequests.filter(r => r.status === 'completed')
    const avgProcessingTime = completedDeletions.length > 0
      ? completedDeletions.reduce((sum, r) => {
          if (r.completedAt) {
            return sum + (r.completedAt.getTime() - r.requestedAt.getTime())
          }
          return sum
        }, 0) / completedDeletions.length / (1000 * 60 * 60 * 24) // days
      : 0

    // Calculate compliance score
    const totalDataActivities = accessEvents.length + deletionRequests.length
    const violationRate = totalDataActivities > 0 
      ? violations.length / totalDataActivities 
      : 0
    
    const complianceScore = Math.max(0, Math.min(100, 100 - (violationRate * 100)))

    return {
      dataAccessEvents: accessEvents.length,
      dataDeletionRequests: deletionRequests.length,
      consentViolations: violations.length,
      complianceScore: Math.round(complianceScore),
      avgDeletionProcessingTime: Math.round(avgProcessingTime * 100) / 100,
      pendingDeletions: deletionRequests.filter(r => r.status === 'pending').length
    }
  }

  /**
   * Calculate PCI DSS compliance metrics
   */
  private calculatePCIDSSMetrics(startDate: Date, endDate: Date) {
    const accessEvents = this.pciTracking.paymentCardAccessEvents.filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate
    )

    const encryptionViolations = this.pciTracking.encryptionViolations.filter(
      v => v.timestamp >= startDate && v.timestamp <= endDate && !v.resolved
    )

    const accessViolations = this.pciTracking.accessControlViolations.filter(
      v => v.timestamp >= startDate && v.timestamp <= endDate
    )

    const recentScans = this.pciTracking.securityScans.filter(
      s => s.completedAt >= startDate && s.completedAt <= endDate
    )

    // Calculate compliance score
    const totalViolations = encryptionViolations.length + accessViolations.length
    const totalActivities = accessEvents.length + recentScans.length
    
    let complianceScore = 100
    
    if (totalActivities > 0) {
      complianceScore -= (totalViolations / totalActivities) * 100
    }
    
    // Penalize for unresolved encryption violations heavily
    complianceScore -= encryptionViolations.filter(v => v.severity === 'critical').length * 20
    complianceScore -= encryptionViolations.filter(v => v.severity === 'high').length * 10

    return {
      paymentCardAccessEvents: accessEvents.length,
      encryptionViolations: encryptionViolations.length,
      accessControlViolations: accessViolations.length,
      securityScans: recentScans.length,
      failedScans: recentScans.filter(s => s.status === 'failed').length,
      complianceScore: Math.max(0, Math.round(complianceScore)),
      unauthorizedAccessAttempts: accessViolations.filter(v => !v.blocked).length
    }
  }

  /**
   * Calculate audit trail metrics
   */
  private calculateAuditMetrics(startDate: Date, endDate: Date) {
    const relevantEntries = this.auditTrail.filter(
      e => e.timestamp >= startDate && e.timestamp <= endDate
    )

    const suspiciousEntries = relevantEntries.filter(e => {
      // Flag suspicious activities
      return e.action.includes('delete') || 
             e.action.includes('modify') ||
             e.action.includes('export') ||
             e.details.changes?.some(c => c.includes('permission'))
    })

    const investigatedEntries = suspiciousEntries.filter(e => {
      // In production, this would check if entry was marked as investigated
      return false
    })

    // Calculate storage size
    const storageBytes = relevantEntries.reduce((sum, e) => {
      return sum + JSON.stringify(e).length * 2 // UTF-16 encoding
    }, 0)

    return {
      totalEvents: relevantEntries.length,
      suspiciousEvents: suspiciousEntries.length,
      investigatedEvents: investigatedEntries.length,
      storageUsed: this.formatBytes(storageBytes)
    }
  }

  /**
   * Calculate incident metrics
   */
  private calculateIncidentMetrics(startDate: Date, endDate: Date) {
    // In production, this would query incident database
    // For now, return mock data based on the tracking data
    
    const gdprBreaches = this.gdprTracking.dataBreachIncidents.filter(
      i => i.discoveredAt >= startDate && i.discoveredAt <= endDate
    )

    const totalIncidents = gdprBreaches.length
    const resolvedIncidents = gdprBreaches.filter(i => i.status === 'resolved').length
    const pendingIncidents = gdprBreaches.filter(i => i.status !== 'resolved').length

    // Calculate average resolution time
    const resolvedWithTime = gdprBreaches.filter(
      i => i.status === 'resolved' && i.reportedAt
    )
    
    const avgResolutionTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, i) => {
          if (i.reportedAt) {
            return sum + (i.reportedAt.getTime() - i.discoveredAt.getTime())
          }
          return sum
        }, 0) / resolvedWithTime.length / (1000 * 60 * 60) // hours
      : 0

    return {
      total: totalIncidents,
      resolved: resolvedIncidents,
      pending: pendingIncidents,
      averageResolutionTime: Math.round(avgResolutionTime * 100) / 100
    }
  }

  /**
   * Track data access for GDPR
   */
  async trackDataAccess(
    userId: string,
    dataSubject: string,
    dataTypes: string[],
    purpose: string,
    legalBasis: string,
    retentionPeriod?: number
  ): Promise<void> {
    this.gdprTracking.dataAccessEvents.push({
      userId,
      dataSubject,
      dataTypes,
      purpose,
      legalBasis,
      timestamp: new Date(),
      retentionPeriod
    })
  }

  /**
   * Record data deletion request
   */
  async recordDeletionRequest(
    requestId: string,
    dataSubject: string
  ): Promise<void> {
    this.gdprTracking.dataDeletionRequests.push({
      requestId,
      dataSubject,
      requestedAt: new Date(),
      status: 'pending',
      affectedRecords: 0
    })
  }

  /**
   * Update deletion request status
   */
  async updateDeletionRequest(
    requestId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed',
    affectedRecords?: number
  ): Promise<void> {
    const request = this.gdprTracking.dataDeletionRequests.find(
      r => r.requestId === requestId
    )
    
    if (request) {
      request.status = status
      if (affectedRecords !== undefined) {
        request.affectedRecords = affectedRecords
      }
      if (status === 'completed' || status === 'failed') {
        request.completedAt = new Date()
      }
    }
  }

  /**
   * Record consent violation
   */
  async recordConsentViolation(
    userId: string,
    violationType: string,
    description: string,
    severity: 'high' | 'medium' | 'low'
  ): Promise<void> {
    this.gdprTracking.consentViolations.push({
      userId,
      violationType,
      description,
      timestamp: new Date(),
      severity,
      resolved: false
    })
  }

  /**
   * Resolve consent violation
   */
  async resolveConsentViolation(userId: string, timestamp: Date): Promise<void> {
    const violation = this.gdprTracking.consentViolations.find(
      v => v.userId === userId && 
           v.timestamp.getTime() === timestamp.getTime() &&
           !v.resolved
    )
    
    if (violation) {
      violation.resolved = true
    }
  }

  /**
   * Record data breach incident
   */
  async recordDataBreach(
    incidentId: string,
    affectedSubjects: number,
    dataTypes: string[],
    severity: 'critical' | 'high' | 'medium' | 'low'
  ): Promise<void> {
    this.gdprTracking.dataBreachIncidents.push({
      incidentId,
      discoveredAt: new Date(),
      affectedSubjects,
      dataTypes,
      severity,
      status: 'investigating',
      supervisoryAuthorityNotified: false,
      subjectsNotified: false
    })
  }

  /**
   * Update breach status
   */
  async updateBreachStatus(
    incidentId: string,
    updates: {
      status?: 'investigating' | 'contained' | 'resolved'
      reportedAt?: Date
      supervisoryAuthorityNotified?: boolean
      subjectsNotified?: boolean
    }
  ): Promise<void> {
    const incident = this.gdprTracking.dataBreachIncidents.find(
      i => i.incidentId === incidentId
    )
    
    if (incident) {
      Object.assign(incident, updates)
    }
  }

  /**
   * Track payment card access for PCI DSS
   */
  async trackCardDataAccess(
    userId: string,
    cardDataType: 'full_pan' | 'truncated_pan' | 'cvv' | 'expiry' | 'token',
    accessType: 'read' | 'write' | 'delete',
    encrypted: boolean,
    tokenized: boolean,
    authorized: boolean
  ): Promise<void> {
    this.pciTracking.paymentCardAccessEvents.push({
      userId,
      cardDataType,
      accessType,
      timestamp: new Date(),
      encrypted,
      tokenized,
      authorized
    })
  }

  /**
   * Record encryption violation
   */
  async recordEncryptionViolation(
    violationId: string,
    description: string,
    severity: 'critical' | 'high' | 'medium'
  ): Promise<void> {
    this.pciTracking.encryptionViolations.push({
      violationId,
      description,
      timestamp: new Date(),
      severity,
      resolved: false
    })
  }

  /**
   * Resolve encryption violation
   */
  async resolveEncryptionViolation(
    violationId: string,
    resolution: string
  ): Promise<void> {
    const violation = this.pciTracking.encryptionViolations.find(
      v => v.violationId === violationId && !v.resolved
    )
    
    if (violation) {
      violation.resolved = true
      violation.resolution = resolution
    }
  }

  /**
   * Add audit trail entry
   */
  async addAuditTrailEntry(entry: Omit<AuditTrailEntry, 'id' | 'integrity'>): Promise<AuditTrailEntry> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate hash for integrity
    const previousHash = this.auditTrail.length > 0
      ? this.auditTrail[this.auditTrail.length - 1].integrity.hash
      : '0'
    
    const dataToHash = JSON.stringify({ ...entry, previousHash })
    const hash = this.calculateHash(dataToHash)
    
    const auditEntry: AuditTrailEntry = {
      ...entry,
      id,
      integrity: {
        hash,
        previousHash,
        signature: this.signHash(hash)
      }
    }

    this.auditTrail.push(auditEntry)
    
    return auditEntry
  }

  /**
   * Verify audit trail integrity
   */
  async verifyAuditTrailIntegrity(): Promise<{
    valid: boolean
    tamperedEntries: number
    lastValidEntry: string
  }> {
    let tamperedCount = 0
    let lastValidId = ''

    for (let i = 0; i < this.auditTrail.length; i++) {
      const entry = this.auditTrail[i]
      const expectedPreviousHash = i > 0 ? this.auditTrail[i - 1].integrity.hash : '0'
      
      if (entry.integrity.previousHash !== expectedPreviousHash) {
        tamperedCount++
        continue
      }

      // Verify entry hash
      const dataToHash = JSON.stringify({
        timestamp: entry.timestamp,
        action: entry.action,
        actor: entry.actor,
        resource: entry.resource,
        details: entry.details,
        previousHash: entry.integrity.previousHash
      })
      
      const calculatedHash = this.calculateHash(dataToHash)
      if (calculatedHash !== entry.integrity.hash) {
        tamperedCount++
        continue
      }

      lastValidId = entry.id
    }

    return {
      valid: tamperedCount === 0,
      tamperedEntries: tamperedCount,
      lastValidEntry: lastValidId
    }
  }

  /**
   * Calculate hash for integrity
   */
  private calculateHash(data: string): string {
    // In production, use proper cryptographic hash
    // For demo, using simple hash simulation
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36).padStart(16, '0')
  }

  /**
   * Sign hash for integrity
   */
  private signHash(hash: string): string {
    // In production, use proper digital signatures
    // For demo, return a simulated signature
    return `sig_${hash.substring(0, 8)}_${Date.now().toString(36)}`
  }

  /**
   * Collect forensic evidence
   */
  async collectEvidence(
    incidentId: string,
    evidenceType: 'log' | 'network_capture' | 'memory_dump' | 'disk_image' | 'screenshot' | 'testimony',
    source: string,
    metadata: Record<string, any>,
    collector: string
  ): Promise<ForensicEvidence> {
    const evidence: ForensicEvidence = {
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      incidentId,
      evidenceType,
      collectedAt: new Date(),
      collector,
      source,
      hash: '', // Calculated after collection
      size: 0, // Calculated after collection
      metadata,
      chainOfCustody: [{
        transferredAt: new Date(),
        from: 'system',
        to: collector,
        reason: 'Initial collection'
      }],
      retentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000) // 7 years
    }

    // Calculate hash and size
    const evidenceData = JSON.stringify(evidence)
    evidence.hash = this.calculateHash(evidenceData)
    evidence.size = evidenceData.length * 2

    this.forensicEvidence.push(evidence)

    return evidence
  }

  /**
   * Transfer evidence custody
   */
  async transferEvidence(
    evidenceId: string,
    from: string,
    to: string,
    reason: string
  ): Promise<void> {
    const evidence = this.forensicEvidence.find(e => e.id === evidenceId)
    
    if (evidence) {
      evidence.chainOfCustody.push({
        transferredAt: new Date(),
        from,
        to,
        reason
      })
    }
  }

  /**
   * Get forensic evidence by incident
   */
  getEvidenceByIncident(incidentId: string): ForensicEvidence[] {
    return this.forensicEvidence.filter(e => e.incidentId === incidentId)
  }

  /**
   * Check GDPR compliance
   */
  async checkGDPRCompliance(): Promise<{
    compliant: boolean
    score: number
    violations: string[]
    recommendations: string[]
  }> {
    const violations: string[] = []
    const recommendations: string[] = []

    // Check for unresolved consent violations
    const unresolvedViolations = this.gdprTracking.consentViolations.filter(v => !v.resolved)
    if (unresolvedViolations.length > 0) {
      violations.push(`${unresolvedViolations.length} unresolved consent violations`)
      recommendations.push('Resolve outstanding consent violations immediately')
    }

    // Check for overdue deletion requests
    const pendingDeletions = this.gdprTracking.dataDeletionRequests.filter(
      r => r.status === 'pending' && 
           (new Date().getTime() - r.requestedAt.getTime()) > 30 * 24 * 60 * 60 * 1000 // 30 days
    )
    if (pendingDeletions.length > 0) {
      violations.push(`${pendingDeletions.length} deletion requests overdue (30+ days)`)
      recommendations.push('Process overdue data deletion requests immediately')
    }

    // Check for unreported data breaches
    const unreportedBreaches = this.gdprTracking.dataBreachIncidents.filter(
      i => !i.supervisoryAuthorityNotified && 
           (new Date().getTime() - i.discoveredAt.getTime()) > 72 * 60 * 60 * 1000 // 72 hours
    )
    if (unreportedBreaches.length > 0) {
      violations.push(`${unreportedBreaches.length} data breaches not reported to supervisory authority within 72 hours`)
      recommendations.push('Report all data breaches to supervisory authority immediately')
    }

    // Calculate score
    const score = Math.max(0, 100 - (violations.length * 20))

    return {
      compliant: violations.length === 0,
      score,
      violations,
      recommendations
    }
  }

  /**
   * Check PCI DSS compliance
   */
  async checkPCIDSSCompliance(): Promise<{
    compliant: boolean
    score: number
    violations: string[]
    recommendations: string[]
  }> {
    const violations: string[] = []
    const recommendations: string[] = []

    // Check for unresolved encryption violations
    const unresolvedEncryption = this.pciTracking.encryptionViolations.filter(v => !v.resolved)
    if (unresolvedEncryption.length > 0) {
      violations.push(`${unresolvedEncryption.length} unresolved encryption violations`)
      recommendations.push('Resolve all encryption violations immediately')
    }

    // Check for unauthorized access attempts
    const unauthorized = this.pciTracking.accessControlViolations.filter(v => !v.blocked)
    if (unauthorized.length > 0) {
      violations.push(`${unauthorized.length} unauthorized card data access attempts`)
      recommendations.push('Review and strengthen access controls')
    }

    // Check for unencrypted full PAN access
    const unencryptedPan = this.pciTracking.paymentCardAccessEvents.filter(
      e => e.cardDataType === 'full_pan' && !e.encrypted && !e.tokenized
    )
    if (unencryptedPan.length > 0) {
      violations.push(`${unencryptedPan.length} instances of unencrypted full PAN access`)
      recommendations.push('Implement encryption for all full PAN access')
    }

    // Calculate score
    const score = Math.max(0, 100 - (violations.length * 25))

    return {
      compliant: violations.length === 0,
      score,
      violations,
      recommendations
    }
  }

  /**
   * Get compliance history
   */
  getComplianceHistory(): ComplianceReport[] {
    return [...this.complianceReports].sort(
      (a, b) => b.generatedAt.getTime() - a.generatedAt.getTime()
    )
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Export compliance report
   */
  async exportReport(reportId: string, format: 'pdf' | 'json' | 'csv'): Promise<string> {
    const report = this.complianceReports.find(r => r.id === reportId)
    
    if (!report) {
      throw new Error('Report not found')
    }

    // In production, generate actual file
    // For demo, return a placeholder path
    const filename = `compliance_report_${reportId}.${format}`
    console.log(`[ComplianceReporter] Exported report to ${filename}`)
    
    return filename
  }

  /**
   * Cleanup old compliance data
   */
  async cleanupOldData(retentionDays: number = 2555): Promise<number> {
    // 2555 days = 7 years (legal retention requirement)
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
    let removed = 0

    // Cleanup old audit entries
    const initialAuditCount = this.auditTrail.length
    this.auditTrail = this.auditTrail.filter(e => e.timestamp >= cutoff)
    removed += initialAuditCount - this.auditTrail.length

    // Cleanup old GDPR data
    this.gdprTracking.dataAccessEvents = this.gdprTracking.dataAccessEvents.filter(
      e => e.timestamp >= cutoff
    )

    // Cleanup old PCI data
    this.pciTracking.paymentCardAccessEvents = this.pciTracking.paymentCardAccessEvents.filter(
      e => e.timestamp >= cutoff
    )

    // Cleanup old forensic evidence
    const initialEvidenceCount = this.forensicEvidence.length
    this.forensicEvidence = this.forensicEvidence.filter(
      e => e.retentionUntil >= cutoff
    )
    removed += initialEvidenceCount - this.forensicEvidence.length

    return removed
  }
}

// Export singleton instance
export const complianceReporter = new ComplianceReporter()
